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

    let reply = response?.choices?.[0]?.message?.content;
    if (reply && typeof reply === 'string' && reply.trim().length > 0) {
      return reply.trim();
    }

    // Fallback GLM-4.7-Flash : si content est vide, le modèle peut avoir
    // besoin d un appel sans le paramètre thinking (le SDK l ajoute par défaut).
    // Retry via fetch direct pour contourner le paramètre thinking du SDK.
    try {
      const config = zai?.config || {};
      const retryRes = await fetch(`${config.baseUrl}/chat/completions`, {
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
      if (retryRes.ok) {
        const retryData = await retryRes.json();
        reply = retryData?.choices?.[0]?.message?.content;
        if (reply && typeof reply === 'string' && reply.trim().length > 0) {
          return reply.trim();
        }
      }
    } catch (retryError: any) {
      console.error('[assistant/llm] Retry sans thinking échoué:', retryError?.message || retryError);
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
