// ============================================================================
// ASSISTANT — Permissions serveur + assemblage prompt + anti-injection
// ============================================================================

import type { AssistantMode, AssistantBehaviorData } from '../types';
import { SYSTEM_SAFETY_RULES } from '../instructions/system-safety';
import { INSTITUTIONAL_CONTEXT } from '../instructions/institutional-context';
import { EDU_LARA_01 } from '../instructions/edu-lara-01';
import { EDU_LARA_02 } from '../instructions/edu-lara-02';
import { EDU_LARA_03 } from '../instructions/edu-lara-03';
import { EDU_LARA_04 } from '../instructions/edu-lara-04';
import { EDU_LARA_05 } from '../instructions/edu-lara-05';

// --- Résolution sécurisée du mode (jamais trust le client) ---
export function resolveMode(
  isAuthenticated: boolean,
  userRole: 'user' | 'admin' | null,
  config: { commercialEnabled: boolean; userEnabled: boolean; adminEnabled: boolean }
): AssistantMode {
  if (isAuthenticated && userRole === 'admin' && config.adminEnabled) return 'admin';
  if (isAuthenticated && userRole === 'user' && config.userEnabled) return 'user';
  if (isAuthenticated && userRole === 'user' && !config.userEnabled && config.commercialEnabled) return 'commercial';
  return 'commercial';
}

export function isAssistantEnabled(config: { enabled: boolean }): boolean {
  return config.enabled === true;
}

// === LIMITE READ-ONLY ABSOLUE ===
export type ActionType =
  | 'create_user' | 'delete_user' | 'modify_profile'
  | 'create_enrollment' | 'modify_enrollment'
  | 'create_payment' | 'validate_payment' | 'reject_payment'
  | 'issue_attestation' | 'revoke_attestation'
  | 'modify_formation' | 'modify_course' | 'modify_article'
  | 'modify_settings' | 'admin_action' | 'call_write_api';

// PHASE 1+2 : whitelist VIDE → toujours false. L'assistant ne peut JAMAIS écrire.
const ACTION_WHITELIST: ActionType[] = [];

export function canActOn(action: ActionType): boolean {
  return ACTION_WHITELIST.includes(action);
}

// === Assemblage du prompt système (hiérarchie immuable) ===
// [1] SYSTEM SAFETY → [2] GENERAL → [3] MODE → [4] LIMITS → [5] BEHAVIOR → [6] CONTEXT
export function buildSystemPrompt(params: {
  mode: AssistantMode;
  generalInstructions: string;
  modeInstructions: string;
  limitsInstructions?: string;
  behavior?: AssistantBehaviorData | null;
  userContext?: string;
  knowledgeSources?: string;
  responseConfig?: {
    mode: string;
    maxWords: number;
  };
}): string {
  const sections: string[] = [
    // [1] SYSTEM SAFETY — TOUJOURS EN PREMIER, IMMUABLE
    SYSTEM_SAFETY_RULES,
    '', '---', '',
    // [2] CONTEXTE INSTITUTIONNEL OFFICIEL — primauté sur connaissances générales du modèle
    INSTITUTIONAL_CONTEXT,
    '', '---', '',
    // [3] GENERAL
    params.generalInstructions,
    '', '---', '',
    // [3.5] EDU LARA N°01 — Comportement conversationnel (couche additive)
    EDU_LARA_01,
    '', '---', '',
    // [3.6] EDU LARA N°02 — Qualification + orientation commerciale (couche additive)
    EDU_LARA_02,
    '', '---', '',
    // [3.7] EDU LARA N°03 — Inscription et accompagnement du prospect (couche additive)
    EDU_LARA_03,
    '', '---', '',
    // [3.8] EDU LARA N°04 — Mémoire prospect + collecte + transmission (couche additive)
    EDU_LARA_04,
    '', '---', '',
    // [3.9] EDU LARA N°05 — Transmission réelle des prospects (couche additive)
    EDU_LARA_05,
    '', '---', '',
    // [4] MODE
    params.modeInstructions,
  ];

  if (params.limitsInstructions && params.limitsInstructions.trim().length > 0) {
    sections.push('', '---', '', params.limitsInstructions);
  }

  // [4.5] RESPONSE LIMITS — configurable word limit + conciseness + language
  if (params.responseConfig) {
    const modeLabel = params.responseConfig.mode === 'simple' ? 'Simple'
      : params.responseConfig.mode === 'detailed' ? 'Détaillée'
      : 'Normale';
    sections.push('', '---', '',
      `# LIMITES DE RÉPONSE (mode ${modeLabel})`,
      '',
      `Tes réponses doivent faire AU MAXIMUM ${params.responseConfig.maxWords} mots.`,
      'RÈGLES DE CONCISION :',
      '- Sois DIRECT. Pas d\'introduction longue. Pas de formules de politesse excessives.',
      '- Une question simple = une réponse simple (1-2 phrases).',
      '- Ne répète pas la question dans ta réponse.',
      '- Réponds dans la langue utilisée par l\'utilisateur (français, arabe, darija, anglais, etc.).',
      '- Si l\'utilisateur écrit en arabe, réponds en arabe. Si en français, en français. Etc.',
    );
  }

  if (params.behavior) {
    sections.push('', '---', '', '# Personnalité et comportement', '', behaviorToPromptSection(params.behavior));
  }

  // [Phase 3.3] Sources de connaissance PUBLIQUES — section dédiée, SÉPARÉE du contexte user
  // Critique : si les sources sont noyées dans le contexte user, le LLM les confond
  // avec des données personnelles et peut les ignorer ou les contester.
  if (params.knowledgeSources && params.knowledgeSources.trim().length > 0) {
    sections.push('', '---', '',
      '# Sources de connaissance publique (catalogue HSE Academy)',
      '',
      'Les éléments ci-dessous constituent le catalogue officiel HSE Academy pour cette conversation.',
      'RÈGLES ABSOLUES concernant ces sources :',
      '1. Les formations listées ci-dessous EXISTENT dans le catalogue. Ne jamais affirmer',
      '   qu\'une formation listée n\'existe pas ou ne fait pas partie du catalogue.',
      '2. Ne jamais inventer une formation, un cours ou un article qui n\'apparaît pas',
      '   explicitement dans les sources ci-dessous.',
      '3. Si l\'utilisateur demande une formation qui n\'apparaît pas dans les sources,',
      '   répondre : "Je ne trouve pas cette formation dans le catalogue actuel."',
      '4. Utiliser les informations ci-dessous (niveau, type, durée, mode, tarifs, objectifs)',
      '   pour répondre aux questions sur les formations.',
      '',
      params.knowledgeSources);
  }

  // [6] Contexte utilisateur autorisé (données personnelles READ-ONLY)
  if (params.userContext && params.userContext.trim().length > 0) {
    sections.push('', '---', '', '# Contexte utilisateur autorisé (lecture seule)', '', params.userContext);
  }

  return sections.join('\n');
}

// === Sérialisation des paramètres de personnalité en texte de prompt ===
function behaviorToPromptSection(b: AssistantBehaviorData): string {
  const styleLabels: Record<string, string> = {
    professional: 'Professionnel — clair, factuel, sobre',
    commercial: 'Commercial — orienté conversion, bienveillant',
    friendly: 'Amical — accessible, chaleureux',
    pedagogical: 'Pédagogique — explicatif, structuré',
    concise: 'Concis — direct, sans détour',
  };
  const toneLabels: Record<string, string> = {
    formal: 'Formel — vouvoiement, registre institutionnel',
    natural: 'Naturel — conversationnel mais correct',
    dynamic: 'Dynamique — énergique, engageant',
    institutional: 'Institutionnel — registre officiel IICP',
  };
  const lengthLabels: Record<string, string> = {
    short: 'Courte — 1 à 3 phrases maximum',
    normal: 'Normale — paragraphe court structuré',
    detailed: 'Détaillée — explication complète avec exemples',
  };

  const lines: string[] = [
    `Style de communication : ${styleLabels[b.style] || b.style}`,
    `Ton : ${toneLabels[b.tone] || b.tone}`,
    `Longueur des réponses : ${lengthLabels[b.responseLength] || b.responseLength}`,
  ];

  if (b.customGuidelines && b.customGuidelines.trim().length > 0) {
    lines.push('', 'Consignes personnalisées :', b.customGuidelines);
  }

  return lines.join('\n');
}

// === Détecteur de prompt injection (heuristique basique) ===
export function detectPromptInjection(message: string): { suspicious: boolean; reason?: string } {
  const lower = message.toLowerCase().trim();
  const suspiciousPatterns = [
    /ignore (the |all |previous )?instructions?/i,
    /ignore (the |all )?(system |safety )?rules?/i,
    /you are now (an? )?admin/i,
    /disregard (all )?(previous |the )?(prompts?|instructions?)/i,
    /reveal (your |the )?(system |safety )?(prompt|instructions?|rules?)/i,
    /show me your (system )?prompt/i,
    /act as (root|admin|developer|system)/i,
    /jailbreak/i,
    /DAN mode/i,
  ];
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(lower)) {
      return { suspicious: true, reason: 'Tentative manifeste de contournement des règles de sécurité' };
    }
  }
  // NOTE: la limite de longueur du message est enforceée côté chat/route.ts
  // via `config.maxUserMessageLength` (vérification serveur BEFORE detectPromptInjection).
  // Ne pas dupliquer cette vérification ici avec une valeur hardcodée —
  // cela rendrait maxUserMessageLength inopérant au-dessus de 5000.
  return { suspicious: false };
}
