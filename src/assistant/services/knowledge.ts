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

    // Détection des requêtes "catalogue" génériques — quand l'utilisateur demande
    // à voir TOUTES les formations/cours, on retourne tout sans filtrage par pertinence
    // (sinon l'heuristique isRelevant() filtre la plupart des résultats)
    const isCatalogQuery = isCatalogRequest(query);

    // Pour chaque catégorie activée, lire les données publiques
    for (const category of enabledCategories) {
      const items = await readSourceData(category, query, isCatalogQuery);
      sources.push(...items);
    }

    // Trier par pertinence décroissante puis limiter
    // Si c'est une requête catalogue, on trie par ordre alphabétique pour avoir une liste stable
    if (isCatalogQuery) {
      return sources.sort((a, b) => a.title.localeCompare(b.title)).slice(0, 20);
    }
    const sorted = sortByRelevance(sources, query);
    return sorted.slice(0, 10);
  } catch (error) {
    console.error('[assistant/knowledge] getRelevantSources error:', error);
    return []; // graceful degradation
  }
}

// === Détecte si la question demande explicitement la liste/catalogue complet ===
// Ces patterns déclenchent le mode "catalogue" qui retourne toutes les formations
// sans filtrage par pertinence (sinon l'heuristique enlève la plupart des résultats)
function isCatalogRequest(query: string): boolean {
  const q = query.toLowerCase().trim();
  const catalogPatterns = [
    // "liste-moi/montre-moi/affiche toutes les/vos formations/cours"
    /list[eè]?[- ]?(moi|nous)?\s+(toutes?\s+)?(les|vos|des|mes)?\s*(formations?|cours|dipl[ôo]mantes?|certifiantes?)/,
    /montrez?[- ]?(moi|nous)?\s+(tout(?:es?|s)\s+)?(les|vos|des|mes)?\s*(formations?|cours)/,
    /affichez?\s+(toutes?\s+)?(les|vos|des|mes)?\s*(formations?|cours)/,
    // "quelles sont toutes les formations" / "quelles formations proposez-vous"
    /(quelles?|quels?)\s+((sont\s+)?(les|vos)\s+)?(toutes?\s+)?(formations?|cours|dipl[ôo]mantes?|certifiantes?)/,
    // "toutes les/vos formations disponibles/proposées"
    /(toutes?\s+)?(les|vos)\s+(formations?|cours)\s+(disponibles?|propose[ée]s?|existants?|en\s+ligne)/,
    // "catalogue des formations"
    /catalogue\s+(de\s+|des\s+)?(formations?|cours)/,
    // "que proposez-vous" / "qu'est-ce que vous proposez"
    /qu['e ]est[- ]?ce\s+(que\s+)?vous\s+propos(ez|er)/,
    /que\s+propos(ez|er)[- ]?vous/,
    /vous\s+propos(ez|er)\s+(des?|des?\s+formations?|des?\s+cours)/,
    // "formations QHSE" / "cours QHSE" — mentionne les formations/cours avec le domaine
    /(formations?|cours)\s+(q?hse|propos|disponibles?|existants?)/,
    // "liste complète"
    /liste\s+compl[èe]te/,
    // "voir les formations" / "voir tous les cours"
    /voir\s+(toutes?\s+)?(les|vos)\s+(formations?|cours)/,
    // "parler de vos formations" / "parler des formations"
    /parler\s+(de\s+)?(vos|les|des)\s+(formations?|cours)/,
  ];
  return catalogPatterns.some(p => p.test(q));
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
  query: string,
  isCatalogQuery: boolean = false
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
            objectives: true, prerequisites: true,
          },
          take: 20,
        });
        for (const f of formations) {
          // Inclure plus de texte pour le matching (title + shortDesc + fullDesc + objectives)
          const objectives = safeJsonParse(f.objectives, []);
          const text = `${f.title} ${f.shortDescription || ''} ${f.fullDescription || ''} ${objectives.join(' ')}`.toLowerCase();
          // Si requête catalogue → inclure toutes les formations sans filtrage
          // Sinon → filtrer par pertinence
          if (isCatalogQuery || isRelevant(text, queryLower)) {
            // Format lisible avec type en préfixe pour que le LLM distingue
            // formations diplômantes (longues, hybride) vs certifiantes (courtes, présentiel)
            // NB : AUCUN prix n'est exposé à Lara — les tarifs sont "Sur demande"
            // (communiqués par l'équipe après étude de la demande). Lara doit orienter
            // les utilisateurs vers le formulaire d'inscription plutôt que d'inventer
            // des prix. Voir instructions/edu-lara-01.ts et defaults.ts.
            const typeLabel = f.type === 'diplomante' ? 'DIPLÔMANTE' : 'CERTIFIANTE';
            const levelLabel = f.level || 'N/A';
            const prereqInfo = f.prerequisites ? ` | Prérequis: ${f.prerequisites}` : '';
            const objInfo = objectives.length > 0 ? ` | Objectifs: ${objectives.slice(0, 3).join(', ')}` : '';
            sources.push({
              category: 'formations',
              refId: f.slug || f.id,
              title: `[${typeLabel}] ${f.title}`,
              content: `${f.shortDescription || ''} | Niveau: ${levelLabel} | Durée: ${f.duration} | Mode: ${f.mode}${prereqInfo}${objInfo} | Tarif: Sur demande`,
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
          if (isCatalogQuery || isRelevant(text, queryLower)) {
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
          if (isCatalogQuery || isRelevant(text, queryLower)) {
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
// FORMAT OPTIMISÉ : regroupe les sources par catégorie avec un résumé structuré
// en tête, pour que le LLM ait une vision claire du catalogue (diplômantes vs
// certifiantes vs cours gratuits) au lieu d'une liste plate et technique.
export function serializeSourcesForPrompt(sources: KnowledgeSource[]): string {
  if (sources.length === 0) return '';

  // Grouper par catégorie
  const byCategory: Record<string, KnowledgeSource[]> = {};
  for (const s of sources) {
    if (!byCategory[s.category]) byCategory[s.category] = [];
    byCategory[s.category].push(s);
  }

  const sections: string[] = [];

  // Pour chaque catégorie, ajouter un en-tête + les items
  for (const cat of ALL_CATEGORIES) {
    const items = byCategory[cat];
    if (!items || items.length === 0) continue;

    const catLabel = SOURCE_CATEGORY_LABELS[cat] || cat;
    sections.push(`### ${catLabel} (${items.length} au total)`);

    for (const s of items) {
      let line = `- ${s.title}`;
      if (s.publicUrl) line += ` (URL: ${s.publicUrl})`;
      line += `\n  ${s.content.replace(/\n/g, '\n  ')}`;
      sections.push(line);
    }
    sections.push(''); // ligne vide entre catégories
  }

  return sections.join('\n').trim();
}

// Labels lisibles pour chaque catégorie (utilisé dans la sérialisation)
const SOURCE_CATEGORY_LABELS: Record<string, string> = {
  formations: 'FORMATIONS DIPLÔMANTES ET CERTIFIANTES',
  courses: 'COURS EN LIGNE GRATUITS',
  promotions: 'PROMOTIONS',
  faq: 'FAQ',
  public_pages: 'PAGES PUBLIQUES',
  institutional: 'INFORMATIONS INSTITUTIONNELLES',
};

// === Stub conservé pour compatibilité (syncAllSources) ===
export async function syncAllSources(): Promise<{ total: number; updated: number; unchanged: number }> {
  return { total: 0, updated: 0, unchanged: 0 };
}
