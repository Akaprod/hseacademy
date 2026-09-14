// ============================================================================
// Z.ai Provider Adapter — Native API (not strict OpenAI-compatible)
// ============================================================================
// Endpoint: POST https://api.z.ai/api/paas/v4/chat/completions
// Headers : Authorization: Bearer <key>, X-Z-AI-From: Z
// Body    : { model, messages, stream:false, thinking:{type:'disabled'}, max_tokens }
//
// Spécificité Z.ai : le paramètre `thinking: { type: 'disabled' }` est REQUIS
// pour `glm-4.7-flash` (sinon le content revient vide car la réponse va dans
// `reasoning_content` au lieu de `content`).
//
// Code erreurs observés en production (audit précédent) :
//   - 1113 : "Insufficient balance or no resource package. Please recharge."
//            → quota_exhausted (compte sans solde pour modèles payants)
//   - 1302 : "Rate limit reached for requests"
//            → rate_limited
//   - 1305 : "The service may be temporarily overloaded"
//            → rate_limited (throttling free tier)
//   - 1210 : "This model always engages in thinking and cannot be disabled"
//            → client_error (config modèle incompat avec thinking:disabled)
//
// Pour préserver l'existant : ce adapter reprend la logique qui était dans
// src/assistant/services/llm.ts (callLLMDirect), sans modification de
// comportement. Le fichier .z-ai-config reste lu par le SDK / callLLMDirect
// comme avant. Ce adapter est utilisé UNIQUEMENT quand Z.ai est configuré
// comme provider en DB (avec clé API stockée en DB).
// ============================================================================

import type { LLMProviderAdapter, LLMCallRequest, LLMCallResult, LLMCallStatus } from './types';
import { extractOpenAICompatibleContent } from './types';

function classifyZaiError(httpStatus: number, body: string): { status: LLMCallStatus; errorCode?: string; errorMessage?: string } {
  let errorCode: string | undefined;
  let errorMessage: string | undefined;
  try {
    const data = JSON.parse(body);
    if (data?.error?.code) errorCode = String(data.error.code);
    if (data?.error?.message) errorMessage = String(data.error.message).slice(0, 250);
  } catch {
    errorMessage = body.slice(0, 250);
  }

  // Z.ai-specific error codes (audit Sep 13)
  if (errorCode === '1113') return { status: 'quota_exhausted', errorCode, errorMessage };
  if (errorCode === '1302' || errorCode === '1305') return { status: 'rate_limited', errorCode, errorMessage };
  if (errorCode === '1210') return { status: 'client_error', errorCode, errorMessage };

  if (httpStatus === 429) return { status: 'rate_limited', errorCode, errorMessage };
  if (httpStatus === 401 || httpStatus === 403) return { status: 'auth_error', errorCode, errorMessage };
  if (httpStatus === 402) return { status: 'quota_exhausted', errorCode, errorMessage };
  if (httpStatus >= 500) return { status: 'server_error', errorCode, errorMessage };
  // model_not_found detection (same pattern as groq.ts for consistency)
  if (errorCode === 'model_not_found' || httpStatus === 404) return { status: 'model_not_found', errorCode, errorMessage };
  if (httpStatus >= 400) return { status: 'client_error', errorCode, errorMessage };
  return { status: 'unknown_error', errorCode, errorMessage };
}

export const zaiAdapter: LLMProviderAdapter = {
  code: 'zai',

  async call(req: LLMCallRequest): Promise<LLMCallResult> {
    const start = Date.now();
    const timeoutMs = req.timeoutMs ?? 60000; // Z.ai free tier takes 40-78s, allow 60s

    const body = JSON.stringify({
      model: req.model,
      messages: req.messages,
      stream: false,
      thinking: { type: 'disabled' }, // requis pour glm-4.7-flash
      max_tokens: req.maxTokens,
    });

    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(`${req.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${req.apiKey}`,
          'X-Z-AI-From': 'Z',
        },
        body,
        signal: controller.signal,
      });

      const responseText = await res.text();
      const latencyMs = Date.now() - start;
      clearTimeout(timeoutHandle);

      if (!res.ok) {
        const err = classifyZaiError(res.status, responseText);
        return {
          status: err.status,
          content: null,
          httpStatus: res.status,
          errorCode: err.errorCode,
          errorMessage: err.errorMessage,
          latencyMs,
        };
      }

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
          errorMessage: 'Empty content (Z.ai may have thinking enabled by default)',
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

// ============================================================================
// Legacy Z.ai via .z-ai-config file (kept for backward compatibility)
// ============================================================================
// Tant que la table `assistant_llm_api_key` n'a pas de clé Z.ai configurée,
// le manager peut encore utiliser l'ancien path qui lit .z-ai-config via
// readFileSync. Cette fonction préserve le comportement pré-MultiLLM.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

export function readZaiConfigFile(): { baseUrl: string; apiKey: string } | null {
  const configPaths = [
    join(process.cwd(), '.z-ai-config'),
    join(homedir(), '.z-ai-config'),
    '/etc/.z-ai-config',
  ];
  for (const filePath of configPaths) {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const config = JSON.parse(content);
      if (config.baseUrl && config.apiKey) {
        return { baseUrl: config.baseUrl, apiKey: config.apiKey };
      }
    } catch {
      // continue to next path
    }
  }
  return null;
}
