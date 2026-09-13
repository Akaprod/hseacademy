// ============================================================================
// GET /api/assistant/llm/providers   — list all providers (admin only)
// POST /api/assistant/llm/providers  — create a new provider
// ============================================================================
// Sécurité :
//   - requireAdmin() sur les 2 méthodes
//   - JAMAIS exposer le champ apiKey depuis cette route (les clés sont dans
//     une autre route /api/assistant/llm/api-keys)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { getProviderAdapter } from '@/assistant/providers/registry';
import type { LLMProviderAdapter } from '@/assistant/providers/types';

// Whitelist des codes de provider autorisés (doivent exister dans le registry)
const ALLOWED_ADAPTERS = ['openai_compatible', 'zai_native'];

// Catalogue de providers pré-configurés (l'admin peut soit utiliser un preset,
// soit saisir manuellement). Voir section "Ajouter provider" du dashboard.
export const PROVIDER_PRESETS = [
  {
    code: 'groq',
    displayName: 'Groq',
    adapter: 'openai_compatible',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    availableModels: JSON.stringify([
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'llama-3.2-1b-preview',
      'llama-3.2-3b-preview',
      'mixtral-8x7b-32768',
      'gemma2-9b-it',
    ]),
  },
  {
    code: 'zai',
    displayName: 'Z.ai',
    adapter: 'zai_native',
    baseUrl: 'https://api.z.ai/api/paas/v4',
    defaultModel: 'glm-4.7-flash',
    availableModels: JSON.stringify([
      'glm-4.5', 'glm-4.5-air', 'glm-4.6', 'glm-4.7', 'glm-4.7-flash',
      'glm-5', 'glm-5-turbo', 'glm-5.1', 'glm-5.2', 'glm-5.3', 'glm-5.3-flash',
    ]),
  },
  {
    code: 'openai',
    displayName: 'OpenAI',
    adapter: 'openai_compatible',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    availableModels: JSON.stringify([
      'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo',
    ]),
  },
  {
    code: 'deepseek',
    displayName: 'DeepSeek',
    adapter: 'openai_compatible',
    baseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    availableModels: JSON.stringify([
      'deepseek-chat', 'deepseek-reasoner',
    ]),
  },
  {
    code: 'mistral',
    displayName: 'Mistral',
    adapter: 'openai_compatible',
    baseUrl: 'https://api.mistral.ai/v1',
    defaultModel: 'mistral-small-latest',
    availableModels: JSON.stringify([
      'mistral-small-latest', 'mistral-large-latest', 'open-mistral-7b',
    ]),
  },
];

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const providers = await db.assistantLlmProvider.findMany({
      orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
      include: {
        _count: { select: { apiKeys: true } },
      },
    });
    // Compute health status per provider (count of active / rate_limited / etc.)
    const enriched = await Promise.all(providers.map(async (p) => {
      const keys = await db.assistantLlmApiKey.findMany({
        where: { providerId: p.id },
        select: { status: true, enabled: true },
      });
      const stats = {
        total: keys.length,
        enabled: keys.filter(k => k.enabled).length,
        active: keys.filter(k => k.status === 'active').length,
        rateLimited: keys.filter(k => k.status === 'rate_limited').length,
        authError: keys.filter(k => k.status === 'auth_error').length,
        invalid: keys.filter(k => k.status === 'invalid').length,
        neverUsed: keys.filter(k => k.status === 'never_used').length,
      };
      return {
        id: p.id,
        code: p.code,
        displayName: p.displayName,
        adapter: p.adapter,
        baseUrl: p.baseUrl,
        enabled: p.enabled,
        priority: p.priority,
        defaultModel: p.defaultModel,
        availableModels: (() => { try { return JSON.parse(p.availableModels || '[]'); } catch { return []; } })(),
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        keyCount: stats.total,
        keyStats: stats,
        health: computeProviderHealth(stats),
      };
    }));
    return NextResponse.json({ providers: enriched, presets: PROVIDER_PRESETS, registeredAdapters: Object.keys(getProviderAdapterRegistry()) });
  } catch (error: any) {
    console.error('GET /api/assistant/llm/providers error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Helper: returns the registered adapters by importing the registry module
function getProviderAdapterRegistry(): Record<string, LLMProviderAdapter> {
  // Imported dynamically to avoid circular deps at module load
  // We just need the keys here for the dashboard
  // (the actual lookup happens in the manager via getProviderAdapter)
  // For the dashboard, we expose the same data via listRegisteredProviders()
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const reg = require('@/assistant/providers/registry');
  const out: Record<string, any> = {};
  for (const code of reg.listRegisteredProviders()) {
    out[code] = true;
  }
  return out;
}

function computeProviderHealth(stats: { enabled: number; active: number; rateLimited: number; authError: number; invalid: number; total: number }): 'healthy' | 'degraded' | 'down' | 'unknown' {
  if (stats.total === 0) return 'unknown';
  if (stats.active > 0) return 'healthy';
  if (stats.rateLimited > 0 && stats.authError === 0 && stats.invalid === 0) return 'degraded';
  if (stats.enabled === 0) return 'down';
  return 'degraded';
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await req.json();
    const { code, displayName, adapter, baseUrl, defaultModel, availableModels, priority, enabled } = body;

    // Validation
    if (!code || typeof code !== 'string' || !/^[a-z][a-z0-9_]{0,30}$/.test(code)) {
      return NextResponse.json({ error: 'code invalide (lettres minuscules + chiffres + underscore, max 31 chars)' }, { status: 400 });
    }
    if (!displayName || typeof displayName !== 'string' || displayName.length > 50) {
      return NextResponse.json({ error: 'displayName requis (max 50 chars)' }, { status: 400 });
    }
    if (!ALLOWED_ADAPTERS.includes(adapter)) {
      return NextResponse.json({ error: `adapter invalide (autorisés: ${ALLOWED_ADAPTERS.join(', ')})` }, { status: 400 });
    }
    if (!baseUrl || typeof baseUrl !== 'string' || !baseUrl.startsWith('http')) {
      return NextResponse.json({ error: 'baseUrl invalide (doit commencer par http(s)://)' }, { status: 400 });
    }
    if (!defaultModel || typeof defaultModel !== 'string' || defaultModel.length > 100) {
      return NextResponse.json({ error: 'defaultModel requis (max 100 chars)' }, { status: 400 });
    }

    // Check for duplicate code
    const existing = await db.assistantLlmProvider.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ error: `Provider avec code "${code}" existe déjà` }, { status: 400 });
    }

    // Validate availableModels is JSON-serializable array of strings
    let modelsJson = '[]';
    if (availableModels) {
      if (Array.isArray(availableModels)) {
        if (!availableModels.every(m => typeof m === 'string' && m.length > 0 && m.length < 100)) {
          return NextResponse.json({ error: 'availableModels doit être un tableau de strings' }, { status: 400 });
        }
        modelsJson = JSON.stringify(availableModels);
      } else if (typeof availableModels === 'string') {
        try {
          const parsed = JSON.parse(availableModels);
          if (Array.isArray(parsed)) {
            modelsJson = JSON.stringify(parsed);
          }
        } catch {
          return NextResponse.json({ error: 'availableModels JSON invalide' }, { status: 400 });
        }
      }
    }

    const provider = await db.assistantLlmProvider.create({
      data: {
        code,
        displayName,
        adapter,
        baseUrl,
        defaultModel,
        availableModels: modelsJson,
        enabled: typeof enabled === 'boolean' ? enabled : true,
        priority: typeof priority === 'number' && priority > 0 ? priority : 10,
      },
    });
    return NextResponse.json({ provider: { id: provider.id, code: provider.code } });
  } catch (error: any) {
    console.error('POST /api/assistant/llm/providers error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
