// ============================================================================
// Provider Registry — centralise l'enregistrement des adapters
// ============================================================================
// Le manager interroge ce registry par `code` provider (qui doit matcher
// la colonne `code` en DB). Pour ajouter un nouveau provider à l'avenir
// (OpenAI, Anthropic, DeepSeek, Mistral), il suffit de :
//   1. Créer src/assistant/providers/<code>.ts (implémente LLMProviderAdapter)
//   2. L'importer ici et l'ajouter au registry
// Aucune modification du manager ou de la DB n'est nécessaire (l'admin peut
// déjà ajouter le provider depuis le dashboard une fois le code livré).
// ============================================================================

import type { LLMProviderAdapter } from './types';
import { groqAdapter } from './groq';
import { zaiAdapter } from './zai';

const REGISTRY: Record<string, LLMProviderAdapter> = {
  groq: groqAdapter,
  zai: zaiAdapter,
  // Future providers — uncomment when implemented:
  // openai: openaiAdapter,
  // anthropic: anthropicAdapter,
  // deepseek: deepseekAdapter,
  // mistral: mistralAdapter,
};

export function getProviderAdapter(code: string): LLMProviderAdapter | null {
  return REGISTRY[code] || null;
}

export function listRegisteredProviders(): string[] {
  return Object.keys(REGISTRY);
}
