// ============================================================================
// LLM Manager — Orchestrateur multi-provider + multi-key + failover
// ============================================================================
// Rôle :
//   1. Lire la liste des providers actifs (DB, triés par priorité asc)
//   2. Pour chaque provider actif:
//      - Lire la liste des clés actives (DB, triées par priorité asc)
//      - Pour chaque clé : appeler l'adapter du provider
//      - Si succès : retourner le content + updater status=active
//      - Si erreur temporaire (rate_limited/network_error/server_error) :
//        updater status, essayer la clé suivante
//      - Si erreur auth_error : marquer clé invalid + essayer suivante
//      - Si erreur empty_content : essayer clé suivante (config modèle ?
//        modèle thinking mal configuré)
//   3. Si tous providers échouent :
//      - Fallback Z.ai via .z-ai-config (legacy path — preserve existing)
//      - Si legacy also fails → return null (route shows LLM_FALLBACK_REPLY)
//
// La signature publique `callLLM(systemPrompt, conversationMessages, maxTokens)`
// est PRÉSERVÉE — aucun changement côté `chat/route.ts`.
// ============================================================================

import { db } from '@/lib/db';
import { getProviderAdapter } from '../providers/registry';
import { zaiAdapter, readZaiConfigFile } from '../providers/zai';
import { openrouterAdapter, OPENROUTER_PRIMARY_MODEL, OPENROUTER_FALLBACK_MODEL } from '../providers/openrouter';
import type { LLMMessage } from './llm';
import type { LLMCallResult, LLMCallStatus } from '../providers/types';

// ============================================================================
// Types internes
// ============================================================================
interface ProviderRow {
  id: string;
  code: string;
  displayName: string;
  adapter: string;
  baseUrl: string;
  defaultModel: string;
  availableModels: string;
  priority: number;
}

interface ApiKeyRow {
  id: string;
  providerId: string;
  label: string;
  apiKey: string;
  priority: number;
}

// ============================================================================
// Lecture des providers actifs en DB
// ============================================================================
async function getActiveProviders(): Promise<ProviderRow[]> {
  try {
    const rows = await db.assistantLlmProvider.findMany({
      where: { enabled: true },
      orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true, code: true, displayName: true, adapter: true,
        baseUrl: true, defaultModel: true, availableModels: true, priority: true,
      },
    });
    return rows.map(r => ({ ...r }));
  } catch (error: any) {
    console.error('[llm-manager] Failed to load providers from DB:', error?.message || error);
    return [];
  }
}

// ============================================================================
// Lecture des clés actives pour un provider
// ============================================================================
async function getActiveKeysForProvider(providerId: string): Promise<ApiKeyRow[]> {
  try {
    const rows = await db.assistantLlmApiKey.findMany({
      where: {
        providerId,
        enabled: true,
        // Exclure les clés marquées invalid (mais garder rate_limited qui peuvent reset)
        status: { not: 'invalid' },
      },
      orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, providerId: true, label: true, apiKey: true, priority: true },
    });
    return rows.map(r => ({ ...r }));
  } catch (error: any) {
    console.error(`[llm-manager] Failed to load API keys for provider ${providerId}:`, error?.message || error);
    return [];
  }
}

// ============================================================================
// Update key status après un appel
// ============================================================================
async function updateKeyStatus(
  keyId: string,
  result: LLMCallResult
): Promise<void> {
  const now = new Date();
  const status = mapCallStatusToKeyStatus(result.status);

  // Don't override 'invalid' or 'disabled' once set (admin-controlled)
  // unless the new status is success (which clears rate_limited/quota_exhausted)
  const data: any = {
    lastUsedAt: now,
    lastErrorCode: result.errorCode || null,
  };

  if (result.status === 'success') {
    data.status = 'active';
    data.lastSuccessAt = now;
    data.failureCount = 0;
  } else {
    data.lastErrorAt = now;
    // Only update status if current is not invalid/disabled
    if (status !== 'invalid' && status !== 'disabled') {
      data.status = status;
    }
    // Increment failure count
    data.failureCount = { increment: 1 };
  }

  try {
    await db.assistantLlmApiKey.update({
      where: { id: keyId },
      data,
    });
  } catch (error: any) {
    console.error(`[llm-manager] Failed to update key ${keyId} status:`, error?.message || error);
  }
}

function mapCallStatusToKeyStatus(callStatus: LLMCallStatus): string {
  switch (callStatus) {
    case 'success': return 'active';
    case 'rate_limited': return 'rate_limited';
    case 'auth_error': return 'auth_error';
    case 'quota_exhausted': return 'quota_exhausted';
    case 'network_error': return 'network_error';
    case 'model_not_found': return 'active'; // model issue, NOT key issue — don't penalize the key
    case 'empty_content': return 'active'; // model config issue, not key issue
    case 'server_error':
    case 'client_error':
    case 'unknown_error':
    default:
      return 'active'; // keep key active, transient error
  }
}

// ============================================================================
// Tentative d'appel à un provider avec rotation des clés
// ============================================================================
function buildModelList(provider: ProviderRow): string[] {
  const models: string[] = [];
  if (provider.defaultModel) models.push(provider.defaultModel);
  try {
    const available = JSON.parse(provider.availableModels || '[]');
    if (Array.isArray(available)) {
      for (const m of available) {
        if (typeof m === 'string' && m && !models.includes(m)) {
          models.push(m);
        }
      }
    }
  } catch { /* invalid JSON */ }
  return models.length > 0 ? models : [provider.defaultModel];
}

async function tryProvider(
  provider: ProviderRow,
  messages: LLMMessage[],
  maxTokens: number
): Promise<{ content: string | null; lastResult: LLMCallResult | null }> {
  const adapter = getProviderAdapter(provider.code);
  if (!adapter) {
    console.error(`[llm-manager] No adapter registered for provider code "${provider.code}"`);
    return { content: null, lastResult: null };
  }

  const keys = await getActiveKeysForProvider(provider.id);
  if (keys.length === 0) {
    console.warn(`[llm-manager] Provider ${provider.code} has no active API keys — skipping`);
    return { content: null, lastResult: null };
  }

  const models = buildModelList(provider);
  console.log(`[llm-manager] Provider ${provider.code}: ${keys.length} key(s), ${models.length} model(s) [${models.join(', ')}]`);

  let lastResult: LLMCallResult | null = null;

  for (const key of keys) {
    const failedModels = new Set<string>();
    let keySucceeded = false;

    for (const model of models) {
      if (failedModels.has(model)) continue;

      const result = await adapter.call({
        baseUrl: provider.baseUrl,
        apiKey: key.apiKey,
        model,
        messages,
        maxTokens,
      });
      lastResult = result;

      if (result.status === 'success' && result.content) {
        console.log(`[llm-manager] Provider ${provider.code} key "${key.label}" model "${model}" succeeded (${result.latencyMs}ms)`);
        await updateKeyStatus(key.id, result).catch(() => {});
        keySucceeded = true;
        return { content: result.content, lastResult: result };
      }

      if (result.status === 'model_not_found') {
        console.warn(`[llm-manager] Provider ${provider.code} model "${model}" not found — skipping to next model`);
        failedModels.add(model);
        continue;
      }

      console.warn(`[llm-manager] Provider ${provider.code} key "${key.label}" model "${model}" failed: ${result.status} (${result.httpStatus || 'n/a'}) ${result.errorCode || ''}`);
      await updateKeyStatus(key.id, result).catch(() => {});
      break;
    }

    if (!keySucceeded && failedModels.size > 0 && failedModels.size === models.length) {
      console.error(`[llm-manager] Provider ${provider.code}: ALL models returned model_not_found`);
    }
  }

  return { content: null, lastResult };
}

// ============================================================================
// Legacy fallback — Z.ai via .z-ai-config (preserve existing behavior)
// ============================================================================
async function tryZaiLegacy(messages: LLMMessage[], maxTokens: number): Promise<string | null> {
  const config = readZaiConfigFile();
  if (!config) {
    console.error('[llm-manager] No .z-ai-config file found (legacy path exhausted)');
    return null;
  }

  console.log('[llm-manager] Falling back to .z-ai-config legacy path');
  const result = await zaiAdapter.call({
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
    model: 'glm-4.7-flash', // hardcoded model for legacy path (preserve old behavior)
    messages,
    maxTokens,
    timeoutMs: 90000, // Z.ai free tier can take 40-78s
  });

  if (result.status === 'success' && result.content) {
    console.log(`[llm-manager] Legacy Z.ai path succeeded (${result.latencyMs}ms)`);
    return result.content;
  }

  console.error(`[llm-manager] Legacy Z.ai path failed: ${result.status} (${result.httpStatus || 'n/a'}) ${result.errorCode || ''}`);
  return null;
}

// ============================================================================
// OpenRouter fallback — via OPENROUTER_API_KEY env var
// ============================================================================
// Flow à 2 étapes (règle "1 SEULE TENTATIVE INTELLIGENTE" par modèle) :
//
//   ÉTAPE 1 : Gemini 2.5 Flash-Lite (modèle PRIMAIRE — payant, exception autorisée)
//             1 SEULE tentative. Si succès → retour content.
//             Si échec (429, 500, timeout, etc.) → passe à l'étape 2.
//
//   ÉTAPE 2 : nvidia/nemotron-3-super-120b-a12b:free (FALLBACK GRATUIT)
//             1 SEULE tentative. Si succès → retour content.
//             Si échec → retour null (le manager continuera vers legacy .z-ai-config).
//
// PAS de retry, PAS de boucle, PAS de rotation entre les deux modèles.
// Au maximum 2 appels OpenRouter par requête utilisateur.
//
// SAFETY : la whitelist stricte dans openrouter.ts garantit qu'AUCUN autre
// modèle (payant ou gratuit) ne peut être utilisé via cette adapter.
// ============================================================================
async function tryOpenRouterFromEnv(messages: LLMMessage[], maxTokens: number): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.trim().length < 10) {
    console.log('[llm-manager] OPENROUTER_API_KEY not set or empty — skipping OpenRouter fallback');
    return null;
  }

  // ========================================================================
  // ÉTAPE 1 — Gemini 2.5 Flash-Lite (PRIMAIRE, 1 seule tentative)
  // ========================================================================
  console.log(`[llm-manager] Trying OpenRouter PRIMARY model: ${OPENROUTER_PRIMARY_MODEL}`);
  const primaryResult = await openrouterAdapter.call({
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey,
    model: OPENROUTER_PRIMARY_MODEL,
    messages,
    maxTokens,
    timeoutMs: 30000, // Gemini est rapide (~1s), 30s est large
  });

  if (primaryResult.status === 'success' && primaryResult.content) {
    console.log(`[llm-manager] OpenRouter PRIMARY succeeded (${primaryResult.latencyMs}ms) — model: ${OPENROUTER_PRIMARY_MODEL}`);
    return primaryResult.content;
  }

  // Si Gemini a échoué sur model_not_whitelisted ou auth_error → ne pas essayer le fallback
  // (le fallback Nemotron aurait les mêmes problèmes de clé/whitelist)
  if (primaryResult.errorCode === 'model_not_whitelisted' || primaryResult.status === 'auth_error') {
    console.warn(`[llm-manager] OpenRouter PRIMARY critical failure: ${primaryResult.status} (${primaryResult.errorCode}) — skipping fallback (same key/whitelist would fail)`);
    return null;
  }

  console.warn(`[llm-manager] OpenRouter PRIMARY failed: ${primaryResult.status} (${primaryResult.httpStatus || 'n/a'}) ${primaryResult.errorCode || ''} — falling back to FREE model`);

  // ========================================================================
  // ÉTAPE 2 — nvidia/nemotron-3-super-120b-a12b:free (FALLBACK, 1 seule tentative)
  // ========================================================================
  console.log(`[llm-manager] Trying OpenRouter FALLBACK model: ${OPENROUTER_FALLBACK_MODEL}`);
  const fallbackResult = await openrouterAdapter.call({
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey,
    model: OPENROUTER_FALLBACK_MODEL,
    messages,
    maxTokens,
    timeoutMs: 60000, // Nemotron free peut être lent (reasoning model)
  });

  if (fallbackResult.status === 'success' && fallbackResult.content) {
    console.log(`[llm-manager] OpenRouter FALLBACK succeeded (${fallbackResult.latencyMs}ms) — model: ${OPENROUTER_FALLBACK_MODEL}`);
    return fallbackResult.content;
  }

  console.warn(`[llm-manager] OpenRouter FALLBACK also failed: ${fallbackResult.status} (${fallbackResult.httpStatus || 'n/a'}) ${fallbackResult.errorCode || ''} — NO more OpenRouter models to try`);
  return null;
}

// ============================================================================
// PUBLIC ENTRY POINT — signature preserved from old callLLM
// ============================================================================
export async function callLLMViaManager(
  systemPrompt: string,
  conversationMessages: LLMMessage[],
  maxTokens: number = 1000
): Promise<string | null> {
  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationMessages,
  ];

  // 1. Try each active provider in DB order (priority asc)
  const providers = await getActiveProviders();
  if (providers.length === 0) {
    console.log('[llm-manager] No active providers in DB — trying OpenRouter fallback (Gemini primary, Nemotron free fallback)');
  } else {
    console.log(`[llm-manager] Trying ${providers.length} provider(s): ${providers.map(p => p.code).join(', ')}`);
    for (const provider of providers) {
      const { content, lastResult } = await tryProvider(provider, messages, maxTokens);
      if (content) {
        return content;
      }
      // If provider had keys but all failed, try next provider
      if (lastResult) {
        console.warn(`[llm-manager] Provider ${provider.code} exhausted, trying next`);
      }
    }
    console.warn('[llm-manager] All DB providers exhausted — trying OpenRouter fallback (Gemini primary, Nemotron free fallback)');
  }

  // 2. OpenRouter fallback — env-based (Gemini primary + Nemotron free fallback, no DB row required)
  // Tries OpenRouter using OPENROUTER_API_KEY env var. Tries Gemini first, then Nemotron free.
  // The whitelist in openrouter.ts ensures NO other model can be used.
  const openrouterContent = await tryOpenRouterFromEnv(messages, maxTokens);
  if (openrouterContent) {
    return openrouterContent;
  }

  // 3. Legacy fallback: Z.ai via .z-ai-config file (preserve existing behavior)
  return await tryZaiLegacy(messages, maxTokens);
}
