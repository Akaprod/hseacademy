// ============================================================================
// Service — LLM Wrapper (z-ai-web-dev-sdk) avec error handling robuste
// ============================================================================
// ⚠️ z-ai-web-dev-sdk MUST be used in backend code only.
// Le config /etc/.z-ai-config est lu automatiquement par le SDK.
// Aucune clé API n'est stockée dans le code.
// ============================================================================

import ZAI from 'z-ai-web-dev-sdk';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

// Singleton — on crée l'instance ZAI une seule fois
let zaiInstance: any = null;

async function getZAI(): Promise<any> {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

// ============================================================================
// readConfigDirect — lit .z-ai-config via readFileSync (sync, fiable en CageFS)
// ============================================================================
// Le SDK utilise fs/promises.readFile (async) qui peut échouer en CageFS.
// Cette fonction utilise readFileSync (sync) — même approche que
// checkAiProviderConfigured() dans config.ts — qui fonctionne en CageFS.
// ============================================================================
function readConfigDirect(): { baseUrl: string; apiKey: string } | null {
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
      // Fichier absent ou invalide — passer au suivant
    }
  }
  return null;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// === Appel direct via fetch (contourne le SDK) ===
async function callLLMDirect(
  config: { baseUrl: string; apiKey: string },
  messages: LLMMessage[],
  maxTokens: number
): Promise<string | null> {
  try {
    const res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'X-Z-AI-From': 'Z',
      },
      body: JSON.stringify({
        model: 'glm-4.7-flash',
        messages,
        stream: false,
        max_tokens: maxTokens,
      }),
    });
    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`[assistant/llm] Direct call failed: ${res.status}: ${errorBody.slice(0, 200)}`);
      return null;
    }
    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (reply && typeof reply === 'string' && reply.trim().length > 0) {
      return reply.trim();
    }
    console.error('[assistant/llm] Direct call: réponse vide');
    return null;
  } catch (error: any) {
    console.error('[assistant/llm] Direct call error:', error?.message || error);
    return null;
  }
}

// === Appel principal au LLM ===
// En cas d'erreur (timeout, provider indisponible, etc.), renvoie null
// → l'appelant doit fournir un message de fallback.
export async function callLLM(
  systemPrompt: string,
  conversationMessages: LLMMessage[],
  maxTokens: number = 1000
): Promise<string | null> {
  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationMessages,
  ];

  // --- Tentative 1: via SDK z-ai-web-dev-sdk ---
  try {
    const zai = await getZAI();
    const response = await zai.chat.completions.create({
      messages,
      stream: false,
      thinking: { type: 'disabled' },
      max_tokens: maxTokens,
    });

    const reply = response?.choices?.[0]?.message?.content;
    if (reply && typeof reply === 'string' && reply.trim().length > 0) {
      return reply.trim();
    }
    // Si content vide, passer à la tentative 2
  } catch (sdkError: any) {
    // SDK a échoué (probablement loadConfig en CageFS) — passer à la tentative 2
    console.error('[assistant/llm] SDK failed:', sdkError?.message?.slice(0, 150) || sdkError);
  }

  // --- Tentative 2: via fetch direct (contourne le SDK) ---
  const config = readConfigDirect();
  if (config) {
    const directReply = await callLLMDirect(config, messages, maxTokens);
    if (directReply) {
      return directReply;
    }
  } else {
    console.error('[assistant/llm] No config found via readFileSync either');
  }

  return null;
}

// === Message de fallback quand le LLM échoue ===
export const LLM_FALLBACK_REPLY =
  "L'Assistant IA est momentanément indisponible. Veuillez réessayer dans quelques instants ou nous contacter via le formulaire de contact.";
