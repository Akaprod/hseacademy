// ============================================================================
// Service — LLM Wrapper (multi-provider + multi-key + failover)
// ============================================================================
// ⚠️ z-ai-web-dev-sdk MUST be used in backend code only.
// Le config /etc/.z-ai-config est lu automatiquement par le SDK.
// Aucune clé API n'est stockée dans le code.
// ============================================================================
//
// ARCHITECTURE MULTI-LLM (commit <TBD>):
//
// Avant cette version : llm.ts contenait toute la logique Z.ai (SDK + fetch
// direct hardcodé glm-4.7-flash). Aucune extensibilité.
//
// Après : llm.ts est un simple facade qui délègue au LLM Manager. Le manager
// lit les providers + API keys en DB, essaie chaque provider actif (priority
// asc), chaque clé active (priority asc), avec failover automatique. En cas
// d'échec de tous les providers DB, il retombe sur le path legacy Z.ai via
// .z-ai-config (comportement d'origine préservé).
//
// Pour ajouter un provider : créer src/assistant/providers/<code>.ts,
// l'enregistrer dans registry.ts, puis l'admin peut l'activer depuis le
// dashboard (table assistant_llm_provider). Aucun changement de code requis
// pour changer de provider/modèle/ordre — tout est en DB.
//
// La signature publique `callLLM(systemPrompt, conversationMessages, maxTokens)`
// est PRÉSERVÉE — aucun changement côté chat/route.ts.
// ============================================================================

import { callLLMViaManager } from './llm-manager';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// === Appel principal au LLM ===
// En cas d'erreur (timeout, provider indisponible, etc.), renvoie null
// → l'appelant doit fournir un message de fallback.
//
// L'implémentation délègue à callLLMViaManager (multi-provider + multi-key +
// failover). Voir src/assistant/services/llm-manager.ts pour les détails.
export async function callLLM(
  systemPrompt: string,
  conversationMessages: LLMMessage[],
  maxTokens: number = 1000
): Promise<string | null> {
  return await callLLMViaManager(systemPrompt, conversationMessages, maxTokens);
}

// === Message de fallback quand le LLM échoue ===
export const LLM_FALLBACK_REPLY =
  "L'Assistant IA est momentanément indisponible. Veuillez réessayer dans quelques instants ou nous contacter via le formulaire de contact.";
