// ============================================================================
// Provider Adapter Interface — Contrat commun à tous les LLM providers
// ============================================================================
// Chaque adapter (groq.ts, zai.ts, future openai.ts, anthropic.ts, etc.)
// implémente cette interface. Le LLM Manager les appelle uniformément.
//
// Un adapter est RESPONSABLE de :
//   - Construire la requête HTTP (body + headers) adaptée au provider
//   - Effectuer l'appel via fetch
//   - Extraire le contenu de la réponse (choices[0].message.content)
//   - Retourner un résultat typé (LLMCallResult) pour que le manager
//     puisse décider du failover
//
// Un adapter NE GÈRE PAS :
//   - La sélection de la clé API (le manager passe la clé à utiliser)
//   - Le retry / failover (responsabilité du manager)
//   - La persistance en DB (responsabilité du manager)
// ============================================================================

import type { LLMMessage } from '../services/llm';

export type LLMCallStatus =
  | 'success'              // 200 + content non vide
  | 'rate_limited'         // HTTP 429 — quota temporaire
  | 'auth_error'           // HTTP 401/403 — clé invalide ou révoquée
  | 'quota_exhausted'      // HTTP 402 ou code erreur provider spécifique (1113 Z.ai)
  | 'network_error'        // timeout, ECONNRESET, fetch throws
  | 'server_error'         // HTTP 5xx
  | 'model_not_found'      // HTTP 404 ou errorCode 'model_not_found' — le modèle n'existe pas
  | 'client_error'         // HTTP 4xx autre que 401/403/429/404
  | 'empty_content'        // 200 mais content vide (modèle "thinking" mal configuré)
  | 'unknown_error';       // autre

export interface LLMCallResult {
  status: LLMCallStatus;
  content: string | null;          // la réponse si succès, sinon null
  httpStatus?: number;            // code HTTP si applicable
  errorCode?: string;             // code d'erreur provider (ex: "1113", "1305", "rate_limit_exceeded")
  errorMessage?: string;          // message court (jamais la clé API)
  latencyMs: number;              // durée de l'appel
}

export interface LLMCallRequest {
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: LLMMessage[];
  maxTokens: number;
  timeoutMs?: number;             // default: 30000
}

// ============================================================================
// LLMProviderAdapter — interface contractuelle
// ============================================================================
export interface LLMProviderAdapter {
  // Code court du provider (doit matcher `code` en DB)
  readonly code: string;

  // Effectue un appel unique au LLM. Ne lance JAMAIS d'exception —
  // toute erreur est capturée et retournée dans LLMCallResult.
  call(req: LLMCallRequest): Promise<LLMCallResult>;
}

// ============================================================================
// Helper partagé — extraction du content d'une réponse OpenAI-compatible
// ============================================================================
// Utilisé par groq.ts, future openai.ts, deepseek.ts, mistral.ts
// (tous les providers compatibles OpenAI ont la même structure de réponse)
export function extractOpenAICompatibleContent(data: any): string | null {
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === 'string' && content.trim().length > 0) {
    return content.trim();
  }
  return null;
}
