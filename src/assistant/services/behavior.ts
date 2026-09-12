// ============================================================================
// Service — Personnalité et comportement (singleton DB — Phase 2)
// ============================================================================
// Stocke les préférences de communication : style, ton, longueur, consignes.
// ⚠️ Ces paramètres contrôlent UNIQUEMENT la manière de communiquer.
// Ils ne modifient JAMAIS les permissions (READ-ONLY reste absolu).
// ============================================================================

import { db } from '@/lib/db';
import type { AssistantBehaviorData, CommunicationStyle, CommunicationTone, ResponseLength } from '../types';

const SINGLETON_ID = 'default';

const DEFAULT_BEHAVIOR: AssistantBehaviorData = {
  style: 'professional',
  tone: 'formal',
  responseLength: 'normal',
  customGuidelines: '',
  updatedAt: new Date().toISOString(),
  updatedBy: null,
};

export async function getBehavior(): Promise<AssistantBehaviorData> {
  const row = await db.assistantBehavior.findUnique({ where: { id: SINGLETON_ID } });
  if (!row) {
    const created = await db.assistantBehavior.create({ data: { id: SINGLETON_ID, ...DEFAULT_BEHAVIOR } });
    return rowToBehavior(created);
  }
  return rowToBehavior(row);
}

export async function updateBehavior(
  updates: Partial<Pick<AssistantBehaviorData, 'style' | 'tone' | 'responseLength' | 'customGuidelines'>>,
  updatedByUserId: string
): Promise<AssistantBehaviorData> {
  await getBehavior();
  const updated = await db.assistantBehavior.update({
    where: { id: SINGLETON_ID },
    data: { ...updates, updatedBy: updatedByUserId },
  });
  return rowToBehavior(updated);
}

function rowToBehavior(row: any): AssistantBehaviorData {
  return {
    style: row.style as CommunicationStyle,
    tone: row.tone as CommunicationTone,
    responseLength: row.responseLength as ResponseLength,
    customGuidelines: row.customGuidelines,
    updatedAt: row.updatedAt?.toISOString?.() ?? row.updatedAt,
    updatedBy: row.updatedBy,
  };
}

// === Options disponibles pour le dropdown admin ===
export const STYLE_OPTIONS: Array<{ value: CommunicationStyle; label: string; description: string }> = [
  { value: 'professional', label: 'Professionnel', description: 'Clair, factuel, sobre' },
  { value: 'commercial', label: 'Commercial', description: 'Orienté conversion, bienveillant' },
  { value: 'friendly', label: 'Amical', description: 'Accessible, chaleureux' },
  { value: 'pedagogical', label: 'Pédagogique', description: 'Explicatif, structuré' },
  { value: 'concise', label: 'Concis', description: 'Direct, sans détour' },
];

export const TONE_OPTIONS: Array<{ value: CommunicationTone; label: string; description: string }> = [
  { value: 'formal', label: 'Formel', description: 'Vouvoiement, registre institutionnel' },
  { value: 'natural', label: 'Naturel', description: 'Conversationnel mais correct' },
  { value: 'dynamic', label: 'Dynamique', description: 'Énergique, engageant' },
  { value: 'institutional', label: 'Institutionnel', description: 'Registre officiel IICP' },
];

export const LENGTH_OPTIONS: Array<{ value: ResponseLength; label: string; description: string }> = [
  { value: 'short', label: 'Courte', description: '1 à 3 phrases maximum' },
  { value: 'normal', label: 'Normale', description: 'Paragraphe court structuré' },
  { value: 'detailed', label: 'Détaillée', description: 'Explication complète avec exemples' },
];
