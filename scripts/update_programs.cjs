// ============================================================================
// IICP QHSE — Mise à jour des "Programmes détaillés" des 6 diplômes
// ============================================================================
// Ce script met à jour UNIQUEMENT le champ `program` (et aucun autre champ)
// pour les 6 formations diplômantes. Les programmes ont été calibrés pour
// correspondre aux durées corrigées et aux standards QHSE internationaux
// (ISO 9001, ISO 14001, ISO 45001, ISO 19011, ILO-OSH 2001, OHSAS 18001).
//
// DURÉES ACTUELLES (déjà appliquées en production) :
//   1. Diplôme Qualifié QHSE        : 2 ans
//   2. Technicien QHSE              : 2 ans
//   3. Technicien Supérieur QHSE    : 2 ans
//   4. Licence Professionnelle QHSE : 1 an
//   5. Master Professionnel QHSE   : 2 ans
//   6. VAE Expertise QHSE           : 6-12 mois
//
// UTILISATION :
//   cd ~/institut-qhse && node scripts/update_programs.cjs
// (CommonJS car Prisma client n'est pas bundlé en ESM sur le serveur)
// ============================================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Programmes (format : tableau de chaînes, indentation 2 espaces pour sous-items)
// ---------------------------------------------------------------------------

// 1. Diplôme Qualifié QHSE — 2 ans (niveau 3ème année collège)
//    Formation qualifiante de base, orientée pratique opérationnelle
const PROGRAM_DIPLOME_QUALIFIE = [
  'Année 1 : Fondamentaux QHSE',
  '  - Semestre 1 : Introduction au management QHSE, vocabulaire et concepts',
  '  - Semestre 1 : Bases réglementaires du travail au Maroc et internationally (ILO standards)',
  '  - Semestre 1 : Hygiène au travail et prévention des risques de base',
  '  - Semestre 2 : Qualité et norme ISO 9001 — principes et exigences essentielles',
  '  - Semestre 2 : Sécurité au travail : EPI, signalétique, permis de travail simples',
  '  - Semestre 2 : Initiation à la gestion documentaire QHSE',
  'Année 2 : Application pratique',
  '  - Semestre 3 : Environnement et norme ISO 14001 — aspects et impacts',
  '  - Semestre 3 : Santé et sécurité au travail selon ISO 45001',
  '  - Semestre 3 : Techniques d\'audit interne — préparation et conduite',
  '  - Semestre 4 : Gestion des risques professionnels — méthodologie simplifiée',
  '  - Semestre 4 : Communication et sensibilisation QHSE en entreprise',
  '  - Semestre 4 : Stage pratique en milieu professionnel et présentation de fin de cycle',
];

// 2. Technicien QHSE — 2 ans (niveau 3ème année bac)
//    Technicien opérationnel appliquant les procédures QHSE
const PROGRAM_TECHNICIEN = [
  'Année 1 : Bases techniques QHSE',
  '  - Semestre 1 : Fondamentaux QHSE et système de management intégré (SMI)',
  '  - Semestre 1 : Normes internationales : ISO 9001, ISO 14001, ISO 45001',
  '  - Semestre 1 : Législation du travail et réglementation marocaine QHSE',
  '  - Semestre 2 : Identification et évaluation des risques professionnels (IPR, APER, ARLV)',
  '  - Semestre 2 : Équipements de protection individuelle (EPI) et collective',
  '  - Semestre 2 : Méthodes d\'audit interne selon ISO 19011',
  'Année 2 : Pratique et expertise terrain',
  '  - Semestre 3 : Systèmes de management QHSE : documentation et procédures',
  '  - Semestre 3 : Indicateurs et tableaux de bord QHSE opérationnels',
  '  - Semestre 3 : Gestion des non-conformités et actions correctives',
  '  - Semestre 4 : Investigation des accidents et incidents du travail',
  '  - Semestre 4 : Procédures d\'urgence et plan d\'évacuation',
  '  - Semestre 4 : Stage pratique en entreprise et rapport technique',
];

// 3. Technicien Supérieur QHSE — 2 ans (Bac ou équivalent)
//    Coordinateur QHSE capable de superviser un système de management
const PROGRAM_TECHNICIEN_SUPERIEUR = [
  'Année 1 : Management QHSE avancé',
  '  - Semestre 1 : Management de la Qualité selon ISO 9001 (SMQ complet)',
  '  - Semestre 1 : Santé et Sécurité au Travail selon ISO 45001',
  '  - Semestre 1 : Réglementation avancée et conformité QHSE',
  '  - Semestre 2 : Management Environnemental selon ISO 14001',
  '  - Semestre 2 : Audit QSE intégré selon ISO 19011',
  '  - Semestre 2 : Gestion des non-conformités et revue de direction',
  'Année 2 : Pilotage et expertise',
  '  - Semestre 3 : Analyse avancée des risques : HAZOP, LOPA, arbre des causes',
  '  - Semestre 3 : Culture sécurité et accompagnement au changement',
  '  - Semestre 3 : Indicateurs avancés et performance QHSE (KPI leading/lagging)',
  '  - Semestre 4 : Gestion de projet QHSE et planning',
  '  - Semestre 4 : Communication institutionnelle et formation du personnel',
  '  - Semestre 4 : Stage professionnel et mémoire de fin de cycle',
];

// 4. Licence Professionnelle QHSE — 1 an (niveau Bac+2)
//    Responsable QHSE opérationnel, pilotage de SMI intégré
const PROGRAM_LICENCE = [
  'Semestre 1 : Management QSE intégré et expertise technique',
  '  - Systèmes de management intégré QSE : ISO 9001, ISO 14001, ISO 45001 (approche intégrée)',
  '  - Audit interne et techniques d\'investigation selon ISO 19011',
  '  - Droit du travail, réglementation marocaine et conformité internationale',
  '  - Évaluation des risques professionnels : méthodes avancées (Hazard ID, EBI, RAM)',
  '  - Management de la qualité totale et amélioration continue (Kaizen, 5S, Lean)',
  'Semestre 2 : Pilotage, projet et professionnalisation',
  '  - Indicateurs et tableaux de bord QHSE ( Balanced Scorecard QHSE )',
  '  - Gestion de projet QHSE et conduite du changement',
  '  - RSE, développement durable et reporting extra-financier (GRI, ISO 26000)',
  '  - Gestion des situations d\'urgence et continuité d\'activité',
  '  - Stage professionnel (4-6 mois) et soutenance de mémoire',
];

// 5. Master Professionnel QHSE — 2 ans (post-Licence)
//    Cadre expert, stratège, dirigeant de département QHSE
const PROGRAM_MASTER = [
  'Année 1 : Stratégie et conception de systèmes de management',
  '  - Semestre 1 : Stratégie QHSE et vision dirigeante (alignement ODD/SDG)',
  '  - Semestre 1 : Conception de systèmes de management intégrés (SMI)',
  '  - Semestre 1 : Normalisation internationale et processus de certification',
  '  - Semestre 1 : Recherche appliquée en QHSE et méthodologie scientifique',
  '  - Semestre 2 : Audit de certification et audits externes (3e partie)',
  '  - Semestre 2 : Analyse des risques avancée : HAZOP, LOPA, Bow-tie, ALARP',
  '  - Semestre 2 : RSE, ESG et développement durable (ISO 26000, GRI, SASB)',
  '  - Semestre 2 : Intelligence réglementaire et veille normative',
  'Année 2 : Pilotage, leadership et transformation',
  '  - Semestre 3 : Leadership QHSE et gestion du changement',
  '  - Semestre 3 : Gestion de crise et Business Continuity (ISO 22301)',
  '  - Semestre 3 : Performance QHSE et tableaux de bord stratégiques',
  '  - Semestre 3 : Gestion financière des risques et assurance qualité',
  '  - Semestre 4 : Thèse professionnelle et projet de recherche appliquée',
  '  - Semestre 4 : Soutenance devant un jury de professionnels et académiques',
];

// 6. VAE Expertise QHSE — 6-12 mois
//    Validation des acquis de l'expérience pour l'obtention d'un diplôme QHSE
const PROGRAM_VAE = [
  'Phase 1 : Éligibilité et orientation (Mois 1)',
  '  - Bilan de carrière et identification du diplôme visé (Licence ou Master)',
  '  - Vérification de la recevabilité administrative (durée d\'activité minimum)',
  '  - Entretien d\'orientation avec un conseiller VAE',
  'Phase 2 : Accompagnement à la constitution du dossier (Mois 2-4)',
  '  - Collecte des preuves d\'expérience (certificats de travail, missions, projets)',
  '  - Description détaillée des activités QHSE exercées',
  '  - Cartographie des compétences acquises vs. référentiel du diplôme',
  'Phase 3 : Rédaction du livret de compétences (Mois 5-9)',
  '  - Structuration du livret selon le référentiel QHSE',
  '  - Rédaction des dossiers par compétence (qualité, sécurité, environnement)',
  '  - Revue et validation par le conseiller VAE',
  'Phase 4 : Préparation à la soutenance (Mois 10-11)',
  '  - Préparation de la présentation orale (15-20 min)',
  '  - Anticipation des questions du jury',
  '  - Répétitions et ajustements',
  'Phase 5 : Présentation devant le jury (Mois 12)',
  '  - Soutenance devant un jury de professionnels QHSE',
  '  - Entretien avec le jury et délibération',
  '  - Notification de la décision et obtention du diplôme',
];

// ---------------------------------------------------------------------------
// Mapping : slug -> nouveau programme
// ---------------------------------------------------------------------------

const updates = [
  { slug: 'diplome-qualifie-qhse', program: PROGRAM_DIPLOME_QUALIFIE },
  { slug: 'technicien-qhse', program: PROGRAM_TECHNICIEN },
  { slug: 'technicien-superieur-qhse', program: PROGRAM_TECHNICIEN_SUPERIEUR },
  { slug: 'licence-professionnelle-qhse', program: PROGRAM_LICENCE },
  { slug: 'master-professionnel-qhse', program: PROGRAM_MASTER },
  { slug: 'vae-expertise-qhse', program: PROGRAM_VAE },
];

// ---------------------------------------------------------------------------
// Application
// ---------------------------------------------------------------------------

async function main() {
  console.log('Mise à jour des programmes détaillés des 6 diplômes QHSE...\n');
  let success = 0;
  let failed = 0;

  for (const u of updates) {
    try {
      const existing = await prisma.formation.findUnique({ where: { slug: u.slug } });
      if (!existing) {
        console.log(`  ❌ Introuvable : ${u.slug}`);
        failed++;
        continue;
      }

      // Mettre à jour UNIQUEMENT le champ program — ne rien toucher d'autre
      const updated = await prisma.formation.update({
        where: { slug: u.slug },
        data: { program: JSON.stringify(u.program) },
      });

      const programItems = u.program.length;
      console.log(`  ✓ ${updated.title} — ${programItems} entrées de programme`);
      success++;
    } catch (e) {
      console.error(`  ❌ Erreur pour ${u.slug}:`, e.message);
      failed++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Résumé : ${success} réussis, ${failed} échoués`);
  console.log(`${'='.repeat(60)}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Erreur fatale:', e);
  process.exit(1);
});
