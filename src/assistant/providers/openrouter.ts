// ============================================================================
// OpenRouter Provider Adapter — OpenAI-compatible API
// ============================================================================
// Endpoint: POST https://openrouter.ai/api/v1/chat/completions
// Headers : Authorization: Bearer <key>
//           Content-Type: application/json
//           HTTP-Referer: <site URL>     (recommandé — OpenRouter l'utilise pour
//                                         le classement dans leur marketplace)
//           X-Title: <site name>          (recommandé — affiché dans le dashboard
//                                          OpenRouter)
// Body    : { model, messages, stream:false, max_tokens, temperature }
//
// ============================================================================
// WHITELIST STRICTE — 2 MODÈLES AUTORISÉS UNIQUEMENT
// ============================================================================
// Suite à autorisation explicite utilisateur (Sep 14, 2026), cette adapter
// accepte EXACTEMENT deux modèles OpenRouter :
//
//   1. google/gemini-2.5-flash-lite (PRIMAIRE — modèle PAYANT exceptionnel)
//      - Pricing vérifié : $0.10 / M tokens prompt, $0.40 / M tokens completion
//      - Test API direct depuis serveur Hostinger production : HTTP 200 + réponse propre
//      - Latence observée : < 1s pour 50 tokens
//      - reasoning_tokens = 0 (pas de raisonnement exposé dans content)
//      - Autorisé exceptionnellement car serveur Hostinger hors UE → pas de geo-block
//      - Coût typique par requête Lara (~500 tokens) : ~$0.0001 = négligeable
//
//   2. nvidia/nemotron-3-super-120b-a12b:free (FALLBACK — modèle GRATUIT)
//      - Pricing vérifié : $0 prompt + $0 completion (100% gratuit)
//      - Test API direct : HTTP 200 + content non vide
//      - ⚠️ Reasoning model : expose son raisonnement dans `content` (bug visuel)
//      - Utilisé UNIQUEMENT si Gemini échoue (429, 500, etc.)
//
// AUCUN AUTRE MODÈLE N'EST AUTORISÉ. Tout autre model ID sera refusé AVANT
// tout appel réseau (errorCode: 'model_not_whitelisted').
//
// Cette whitelist est codée en dur dans le source. Aucune configuration DB,
// env, frontend ou admin ne peut la contourner.
// ============================================================================

import type { LLMProviderAdapter, LLMCallRequest, LLMCallResult, LLMCallStatus } from './types';
import { extractOpenAICompatibleContent } from './types';

// ============================================================================
// CONSTANTES — Whitelist stricte des 2 seuls modèles autorisés
// ============================================================================
export const OPENROUTER_PRIMARY_MODEL = 'google/gemini-2.5-flash-lite';
export const OPENROUTER_FALLBACK_MODEL = 'nvidia/nemotron-3-super-120b-a12b:free';

// Set immutable de whitelist (vérification runtime)
const ALLOWED_OPENROUTER_MODELS: ReadonlySet<string> = new Set([
  OPENROUTER_PRIMARY_MODEL,
  OPENROUTER_FALLBACK_MODEL,
]);

// Safety check au chargement du module — on s'assure que les constantes n'ont
// pas été modifiées par erreur vers des modèles non autorisés.
// - Le modèle fallback DOIT finir par ':free' (garde-fou anti-coût)
// - Le modèle primaire est une exception payante explicitement autorisée
if (!OPENROUTER_FALLBACK_MODEL.endsWith(':free')) {
  throw new Error(
    `[openrouter] SAFETY CHECK FAILED: OPENROUTER_FALLBACK_MODEL must end with ':free' ` +
    `(current: "${OPENROUTER_FALLBACK_MODEL}"). A paid fallback model would violate the project policy.`
  );
}
if (!ALLOWED_OPENROUTER_MODELS.has(OPENROUTER_PRIMARY_MODEL)) {
  throw new Error(
    `[openrouter] SAFETY CHECK FAILED: OPENROUTER_PRIMARY_MODEL must be in ALLOWED_OPENROUTER_MODELS whitelist.`
  );
}

// Backward-compat export (ancien code qui importait OPENROUTER_FREE_MODEL)
// Toujours pointé vers le fallback gratuit pour ne pas casser les imports existants.
export const OPENROUTER_FREE_MODEL = OPENROUTER_FALLBACK_MODEL;

function classifyOpenRouterError(httpStatus: number, body: string): { status: LLMCallStatus; errorCode?: string; errorMessage?: string } {
  // Parse error body (OpenRouter returns JSON: { error: { message, code, ... } })
  let errorCode: string | undefined;
  let errorMessage: string | undefined;
  try {
    const data = JSON.parse(body);
    if (data?.error?.code) errorCode = String(data.error.code);
    if (data?.error?.message) errorMessage = String(data.error.message).slice(0, 250);
  } catch {
    errorMessage = body.slice(0, 250);
  }

  // OpenRouter uses standard HTTP status codes similar to OpenAI
  if (httpStatus === 429) return { status: 'rate_limited', errorCode, errorMessage };
  if (httpStatus === 401 || httpStatus === 403) return { status: 'auth_error', errorCode, errorMessage };
  if (httpStatus === 402) return { status: 'quota_exhausted', errorCode, errorMessage };
  if (httpStatus >= 500) return { status: 'server_error', errorCode, errorMessage };
  // model_not_found detection (HTTP 404 or errorCode 'model_not_found')
  if (errorCode === 'model_not_found' || httpStatus === 404) return { status: 'model_not_found', errorCode, errorMessage };
  if (httpStatus >= 400) return { status: 'client_error', errorCode, errorMessage };
  return { status: 'unknown_error', errorCode, errorMessage };
}

export const openrouterAdapter: LLMProviderAdapter = {
  code: 'openrouter',

  async call(req: LLMCallRequest): Promise<LLMCallResult> {
    const start = Date.now();
    const timeoutMs = req.timeoutMs ?? 60000; // OpenRouter models peuvent être lents

    // ============================================================================
    // SAFETY CHECK — Refuse ANY model not in the strict whitelist
    // ============================================================================
    // Cette vérification empêche quiconque (admin DB, env, frontend, requête
    // utilisateur) de faire appel à un modèle OpenRouter non autorisé.
    // Seuls OPENROUTER_PRIMARY_MODEL et OPENROUTER_FALLBACK_MODEL peuvent passer.
    if (!ALLOWED_OPENROUTER_MODELS.has(req.model)) {
      return {
        status: 'client_error',
        content: null,
        errorCode: 'model_not_whitelisted',
        errorMessage: `OpenRouter adapter refuses non-whitelisted model "${req.model}". Only "${OPENROUTER_PRIMARY_MODEL}" and "${OPENROUTER_FALLBACK_MODEL}" are allowed.`,
        latencyMs: Date.now() - start,
      };
    }

    // Build the request body — OpenAI-compatible
    // Le modèle est pris tel quel depuis req.model (qui a passé la whitelist)
    const body = JSON.stringify({
      model: req.model,
      messages: req.messages,
      stream: false,
      max_tokens: req.maxTokens,
      temperature: 0.7,
    });

    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(`${req.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${req.apiKey}`,
          // OpenRouter recommande HTTP-Referer + X-Title pour le classement marketplace
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://hseacademy.online',
          'X-Title': 'HSE Academy Lara',
        },
        body,
        signal: controller.signal,
      });

      const responseText = await res.text();
      const latencyMs = Date.now() - start;
      clearTimeout(timeoutHandle);

      if (!res.ok) {
        const err = classifyOpenRouterError(res.status, responseText);
        return {
          status: err.status,
          content: null,
          httpStatus: res.status,
          errorCode: err.errorCode,
          errorMessage: err.errorMessage,
          latencyMs,
        };
      }

      // 200 — extract content
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (e: any) {
        return {
          status: 'client_error',
          content: null,
          httpStatus: 200,
          errorMessage: `JSON parse error: ${e?.message || 'unknown'}`,
          latencyMs,
        };
      }

      const content = extractOpenAICompatibleContent(data);
      if (content === null) {
        return {
          status: 'empty_content',
          content: null,
          httpStatus: 200,
          errorMessage: 'Empty content from OpenRouter (model may be overloaded)',
          latencyMs,
        };
      }

      return {
        status: 'success',
        content,
        httpStatus: 200,
        latencyMs,
      };
    } catch (error: any) {
      const latencyMs = Date.now() - start;
      clearTimeout(timeoutHandle);

      if (error?.name === 'AbortError') {
        return {
          status: 'network_error',
          content: null,
          errorCode: 'timeout',
          errorMessage: `Request timed out after ${timeoutMs}ms`,
          latencyMs,
        };
      }
      return {
        status: 'network_error',
        content: null,
        errorCode: error?.code || error?.name,
        errorMessage: (error?.message || String(error)).slice(0, 250),
        latencyMs,
      };
    }
  },
};
