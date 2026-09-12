// ============================================================================
// Service — Sources de connaissance (Phase 3.2 — pertinence améliorée)
// ============================================================================
// Lit les données PUBLIQUES depuis les tables existantes (sans duplication
// manuelle). Pas de RAG vectoriel — on fetch les enregistrements pertinents
// et les inclut dans le contexte du LLM.
//
// ⚠️ Sources privées JAMAIS indexées : .env, passwords, tokens, payment proofs,
// private uploads, internal logs, server config, etc.
// ============================================================================

import { db } from '@/lib/db';
import type { KnowledgeSource, KnowledgeSourceCategory } from '../types';

// === Catégories valides (whitelist stricte — sources publiques uniquement) ===
const ALL_CATEGORIES: KnowledgeSourceCategory[] = [
  'formations', 'courses', 'promotions',
  'faq', 'public_pages', 'institutional',
];

// === Récupérer les sources pertinentes pour une question ===
export async function getRelevantSources(
  query: string,
  _categories?: KnowledgeSourceCategory[],
  _limit: number = 5
): Promise<KnowledgeSource[]> {
  const sources: KnowledgeSource[] = [];

  try {
    // S'assurer que les configs de source existent (init si table vide)
    await ensureSourceConfigsExist();

    // Récupérer les catégories activées
    const sourceConfigs = await db.assistantSourceConfig.findMany({
      where: { enabled: true },
    });

    if (sourceConfigs.length === 0) return [];

    const enabledCategories = sourceConfigs.map(s => s.category as KnowledgeSourceCategory);

    // Pour chaque catégorie activée, lire les données publiques
    for (const category of enabledCategories) {
      const items = await readSourceData(category, query);
      sources.push(...items);
    }

    // Trier par pertinence décroissante puis limiter
    const sorted = sortByRelevance(sources, query);
    return sorted.slice(0, 10);
  } catch (error) {
    console.error('[assistant/knowledge] getRelevantSources error:', error);
    return []; // graceful degradation
  }
}

// === Initialise les configs de source si la table est vide ===
// (équivalent au pattern singleton de getConfig — appelé automatiquement
// à la première utilisation sans intervention admin)
async function ensureSourceConfigsExist(): Promise<void> {
  const count = await db.assistantSourceConfig.count();
  if (count > 0) return;

  // Initialise les 7 catégories avec enabled=true, isPublic=true
  await db.$transaction(
    ALL_CATEGORIES.map(cat =>
      db.assistantSourceConfig.create({
        data: { category: cat, enabled: true, isPublic: true },
      })
    )
  );
  console.log('[assistant/knowledge] Initialized 7 source configs');
}

// === Lire les données publiques depuis la DB pour une catégorie ===
async function readSourceData(
  category: KnowledgeSourceCategory,
  query: string
): Promise<KnowledgeSource[]> {
  const queryLower = query.toLowerCase();
  const now = new Date().toISOString();
  const sources: KnowledgeSource[] = [];

  try {
    switch (category) {
      case 'formations': {
        const formations = await db.formation.findMany({
          where: { archived: false },
          select: {
            id: true, title: true, slug: true,
            shortDescription: true, fullDescription: true,
            level: true, type: true, duration: true, mode: true,
            priceIndividual: true, priceGroup: true, priceEnterprise: true,
            objectives: true,
          },
          take: 20,
        });
        for (const f of formations) {
          // Inclure plus de texte pour le matching (title + shortDesc + fullDesc + objectives)
          const objectives = safeJsonParse(f.objectives, []);
          const text = `${f.title} ${f.shortDescription || ''} ${f.fullDescription || ''} ${objectives.join(' ')}`.toLowerCase();
          if (isRelevant(text, queryLower)) {
            sources.push({
              category: 'formations',
              refId: f.slug || f.id,
              title: f.title,
              content: `${f.title} — ${f.shortDescription || ''}\nNiveau: ${f.level} | Type: ${f.type} | Durée: ${f.duration} | Mode: ${f.mode}\nTarifs: Individuel ${f.priceIndividual || 'N/A'} | Groupe ${f.priceGroup || 'N/A'} | Entreprise ${f.priceEnterprise || 'N/A'}${objectives.length > 0 ? '\nObjectifs: ' + objectives.join(', ') : ''}`,
              publicUrl: f.slug ? `/formations?f=${f.slug}` : undefined,
              contentHash: '',
              syncedAt: now,
            });
          }
        }
        break;
      }

      case 'courses': {
        const courses = await db.onlineCourse.findMany({
          select: {
            id: true, title: true, slug: true, description: true,
            shortDescription: true, level: true, totalHours: true,
            isFree: true,
          },
          take: 20,
        });
        for (const c of courses) {
          const text = `${c.title} ${c.description || ''} ${c.shortDescription || ''}`.toLowerCase();
          if (isRelevant(text, queryLower)) {
            sources.push({
              category: 'courses',
              refId: c.slug || c.id,
              title: c.title,
              content: `${c.title} — ${c.description || c.shortDescription || ''}\nNiveau: ${c.level} | Durée: ${c.totalHours || 'N/A'}${c.isFree ? ' | Gratuit' : ''}`,
              publicUrl: c.slug ? `/f/${c.slug}` : undefined,
              contentHash: '',
              syncedAt: now,
            });
          }
        }
        break;
      }

      // 'articles' retiré Étape 3.5 — le blog SEO n'est plus une source du bot

      case 'public_pages': {
        const pages = await db.page.findMany({
          where: { published: true },
          select: { id: true, title: true, slug: true, content: true },
          take: 10,
        });
        for (const p of pages) {
          const text = `${p.title} ${(p.content || '').substring(0, 200)}`.toLowerCase();
          if (isRelevant(text, queryLower)) {
            sources.push({
              category: 'public_pages',
              refId: p.slug || p.id,
              title: p.title,
              content: `${p.title}\n${(p.content || '').substring(0, 500)}`,
              publicUrl: p.slug ? `/pages/${p.slug}` : undefined,
              contentHash: '',
              syncedAt: now,
            });
          }
        }
        break;
      }

      case 'institutional': {
        const legal = await db.legalSettings.findUnique({
          where: { id: 'default' },
          select: {
            legalName: true, commercialName: true, address: true,
            city: true, country: true, phone: true, email: true, website: true,
          },
        });
        if (legal) {
          sources.push({
            category: 'institutional',
            refId: 'legal-settings',
            title: 'Informations institutionnelles',
            content: `${legal.legalName} (${legal.commercialName})\nAdresse: ${legal.address}, ${legal.city}, ${legal.country}\nTél: ${legal.phone}\nEmail: ${legal.email}\nSite web: ${legal.website}`,
            publicUrl: undefined,
            contentHash: '',
            syncedAt: now,
          });
        }
        break;
      }

      case 'promotions':
      case 'faq':
        break;
    }
  } catch (error) {
    console.error(`[assistant/knowledge] readSourceData(${category}) error:`, error);
  }

  return sources;
}

// === Heuristique de pertinence améliorée ===
// Stratégie :
//   1. Extraire les mots significatifs de la question (≥ 3 chars, hors stop-words)
//   2. Compter combien de mots apparaissent dans le texte (score de pertinence)
//   3. Inclure si score ≥ 1 (au moins un mot match)
//   4. Trier par score décroissant pour prioriser les meilleurs matches
const STOP_WORDS = new Set([
  'les', 'des', 'une', 'qui', 'que', 'dans', 'pour', 'sur', 'avec', 'mais',
  'donne', 'moi', 'peux', 'tu', 'voir', 'aussi', 'cela', 'ces', 'cette',
  'est', 'sont', 'ont', 'avais', 'avait', 'avoir', 'plus', 'comme', 'dont',
  'fait', 'font', 'leurs', 'notre', 'votre', 'quel', 'quelle', 'quels',
  'quelles', 'comment', 'pourquoi', 'quand', 'tout', 'tous', 'toute',
  'toutes', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses',
  'nos', 'vos', 'the', 'and', 'for', 'are', 'you', 'can', 'how', 'what',
  'when', 'where', 'why', 'who', 'all', 'any', 'but', 'not', 'out', 'has',
  'have', 'was', 'will', 'your', 'from', 'they', 'them', 'this', 'that',
  'these', 'those',
]);

function extractQueryWords(query: string): string[] {
  return query
    .split(/[\s,;.!?'""()]+/)
    .map(w => w.trim())
    .filter(w => w.length >= 3 && !STOP_WORDS.has(w));
}

function isRelevant(text: string, query: string): boolean {
  const words = extractQueryWords(query);
  if (words.length === 0) return true;
  return words.some(word => text.includes(word));
}

// === Score de pertinence (plus le score est élevé, plus c'est pertinent) ===
function relevanceScore(text: string, query: string): number {
  const words = extractQueryWords(query);
  if (words.length === 0) return 0;
  let score = 0;
  for (const word of words) {
    if (text.includes(word)) {
      // Plus le mot est long, plus il est spécifique → score plus élevé
      score += word.length >= 6 ? 3 : 1;
    }
  }
  return score;
}

// === Trier les sources par score de pertinence décroissant ===
function sortByRelevance<T extends { title: string; content: string }>(
  items: T[],
  query: string
): T[] {
  const queryLower = query.toLowerCase();
  return items
    .map(item => ({
      item,
      score: relevanceScore(`${item.title} ${item.content}`.toLowerCase(), queryLower),
    }))
    .sort((a, b) => b.score - a.score)
    .map(x => x.item);
}

// === Helper : parse JSON safely ===
function safeJsonParse(str: string | null, fallback: any): any {
  if (!str) return fallback;
  try { return JSON.parse(str); } catch { return fallback; }
}

// === Sérialiser les sources pour le prompt LLM ===
export function serializeSourcesForPrompt(sources: KnowledgeSource[]): string {
  if (sources.length === 0) return '';
  const sections = sources.map(s => {
    let line = `## ${s.title}`;
    if (s.publicUrl) line += ` (URL: ${s.publicUrl})`;
    line += `\n${s.content}`;
    return line;
  });
  return sections.join('\n\n---\n\n');
}

// === Stub conservé pour compatibilité (syncAllSources) ===
export async function syncAllSources(): Promise<{ total: number; updated: number; unchanged: number }> {
  return { total: 0, updated: 0, unchanged: 0 };
}
