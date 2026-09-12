// ============================================================================
// Service — LLM Wrapper (z-ai-web-dev-sdk) avec error handling robuste
// ============================================================================
// ⚠️ z-ai-web-dev-sdk MUST be used in backend code only.
// Le config /etc/.z-ai-config est lu automatiquement par le SDK.
// Aucune clé API n'est stockée dans le code.
// ============================================================================

import ZAI from 'z-ai-web-dev-sdk';

// Singleton — on crée l'instance ZAI une seule fois
let zaiInstance: any = null;

async function getZAI(): Promise<any> {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// === Appel principal au LLM ===
// En cas d'erreur (timeout, provider indisponible, etc.), renvoie null
// → l'appelant doit fournir un message de fallback.
export async function callLLM(
  systemPrompt: string,
  conversationMessages: LLMMessage[],
  maxTokens: number = 1000
): Promise<string | null> {
  try {
    const zai = await getZAI();

    // Construction des messages : system d'abord, puis conversation
    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationMessages,
    ];

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

    console.error('[assistant/llm] Réponse vide ou malformée du LLM');
    return null;
  } catch (error: any) {
    // Ne JAMAIS exposer l'erreur interne au client
    console.error('[assistant/llm] Erreur LLM:', error?.message || error);
    return null;
  }
}

// === Message de fallback quand le LLM échoue ===
export const LLM_FALLBACK_REPLY =
  "L'Assistant IA est momentanément indisponible. Veuillez réessayer dans quelques instants ou nous contacter via le formulaire de contact.";
