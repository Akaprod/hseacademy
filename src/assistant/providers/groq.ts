// ============================================================================
// Groq Provider Adapter — OpenAI-compatible API
// ============================================================================
// Endpoint: POST https://api.groq.com/openai/v1/chat/completions
// Headers : Authorization: Bearer <key>
// Body    : { model, messages, stream:false, max_tokens, temperature, ... }
//
// Groq ne supporte PAS le champ `thinking` (qui est spécifique à Z.ai).
// On ne l'envoie donc pas.
//
// Documentation officielle : https://console.groq.com/docs/api
// ============================================================================

import type { LLMProviderAdapter, LLMCallRequest, LLMCallResult, LLMCallStatus } from './types';
import { extractOpenAICompatibleContent } from './types';

function classifyError(httpStatus: number, body: string): { status: LLMCallStatus; errorCode?: string; errorMessage?: string } {
  // Parse error body (Groq returns JSON: { error: { message, type, code, ... } })
  let errorCode: string | undefined;
  let errorMessage: string | undefined;
  try {
    const data = JSON.parse(body);
    if (data?.error?.code) errorCode = String(data.error.code);
    if (data?.error?.message) errorMessage = String(data.error.message).slice(0, 250);
    // Groq renvoie parfois { error: { type: "tokens", ... } } pour les limites de tokens
    if (!errorCode && data?.error?.type) errorCode = String(data.error.type);
  } catch {
    errorMessage = body.slice(0, 250);
  }

  if (httpStatus === 429) return { status: 'rate_limited', errorCode, errorMessage };
  if (httpStatus === 401 || httpStatus === 403) return { status: 'auth_error', errorCode, errorMessage };
  if (httpStatus === 402) return { status: 'quota_exhausted', errorCode, errorMessage };
  if (httpStatus >= 500) return { status: 'server_error', errorCode, errorMessage };
  if (httpStatus >= 400) return { status: 'client_error', errorCode, errorMessage };
  return { status: 'unknown_error', errorCode, errorMessage };
}

export const groqAdapter: LLMProviderAdapter = {
  code: 'groq',

  async call(req: LLMCallRequest): Promise<LLMCallResult> {
    const start = Date.now();
    const timeoutMs = req.timeoutMs ?? 30000;

    // Build the request body — OpenAI-compatible
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
        },
        body,
        signal: controller.signal,
      });

      const responseText = await res.text();
      const latencyMs = Date.now() - start;
      clearTimeout(timeoutHandle);

      if (!res.ok) {
        const err = classifyError(res.status, responseText);
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
          errorMessage: 'Empty content (possibly a "thinking" model — check defaultModel)',
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

      // Distinguish timeout from other network errors
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
