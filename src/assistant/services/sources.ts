// ============================================================================
// Service — Sources de connaissance (activation on/off par catégorie — Phase 2)
// ============================================================================
// Permet à l'admin d'activer/désactiver chaque catégorie de source.
// La synchronisation automatique du contenu sera implémentée en Phase 3.
//
// ⚠️ SÉPARATION PUBLIC/PRIVÉ :
// Ce service ne gère QUE des sources PUBLIQUES (visibles sur le site public).
// Les sources privées (mots de passe, secrets, paiements, preuves, .env,
// infos admin sensibles) ne sont JAMAIS incluses — la liste blanche ci-dessous
// restreint strictement aux catégories publiques.
// ============================================================================

import { db } from '@/lib/db';
import type { AssistantSourceConfigData, KnowledgeSourceCategory } from '../types';

// Liste blanche stricte — uniquement des catégories PUBLIQUES
const ALL_CATEGORIES: KnowledgeSourceCategory[] = [
  'formations',
  'courses',
  'promotions',
  'faq',
  'public_pages',
  'institutional',
];

// Métadonnées d'affichage pour le dashboard admin
export const SOURCE_METADATA: Record<KnowledgeSourceCategory, { label: string; description: string }> = {
  formations: { label: 'Formations', description: 'Formations diplômantes et certifiantes QHSE (publiées sur /formations)' },
  courses: { label: 'Cours en ligne', description: 'Catalogue des cours en ligne HSE Academy (catalogue /training)' },
  promotions: { label: 'Promotions', description: 'Promotions tarifaires en cours (ex: 50% sur une formation)' },
  faq: { label: 'FAQ', description: 'Questions fréquentes (à créer en Phase 3)' },
  public_pages: { label: 'Pages publiques', description: 'Pages statiques (privacy, terms, refund, about, contact)' },
  institutional: { label: 'Informations institutionnelles', description: 'LegalSettings publiques (nom commercial, etc.)' },
};

export async function getAllSources(): Promise<AssistantSourceConfigData[]> {
  const rows = await db.assistantSourceConfig.findMany();
  const missing = ALL_CATEGORIES.filter(cat => !rows.some(r => r.category === cat));
  if (missing.length > 0) {
    await db.$transaction(missing.map(cat => db.assistantSourceConfig.create({
      data: { category: cat, enabled: true, isPublic: true },
    })));
    return getAllSources();
  }
  return rows.map(rowToSource);
}

export async function updateSource(
  category: KnowledgeSourceCategory,
  updates: Partial<Pick<AssistantSourceConfigData, 'enabled'>>,
  updatedByUserId: string
): Promise<AssistantSourceConfigData> {
  // Validate category is in whitelist (anti-injection)
  if (!ALL_CATEGORIES.includes(category)) {
    throw new Error('Catégorie de source invalide');
  }
  // S'assure que la ligne existe
  await getAllSources();
  const updated = await db.assistantSourceConfig.update({
    where: { category },
    data: { ...updates, updatedBy: updatedByUserId },
  });
  return rowToSource(updated);
}

function rowToSource(row: any): AssistantSourceConfigData {
  return {
    id: row.id,
    category: row.category as KnowledgeSourceCategory,
    enabled: row.enabled,
    isPublic: row.isPublic,
    lastSyncAt: row.lastSyncAt?.toISOString?.() ?? null,
    documentCount: row.documentCount,
    updatedAt: row.updatedAt?.toISOString?.() ?? row.updatedAt,
  };
}
