// ============================================================================
// Seed — Base de connaissances SEO HSE / QHSE (12 fiches)
// ============================================================================
// Crée 12 pages SEO distinctes, avec intentions de recherche uniques,
// contenus originaux en markdown, méta-données complètes (Title SEO,
// meta description, mot-clé principal, mots-clés secondaires) et FAQ
// structurée (FAQPage schema.org).
//
// RÈGLES DE RÉDACTION (conformes au brief HSE Academy) :
//   - Aucune invention de loi, d'article, de norme, de statistique ou de source
//   - Références internationales (OIT/ILO, ISO, OMS) et contexte marocain
//     lorsqu'il est pertinent et vérifiable
//   - Maillage interne entre fiches via /pages/<slug>
//   - CTA naturel vers les formations HSE Academy
//   - Aucune cannibalisation : 1 sujet = 1 intention de recherche distincte
//
// Exécution : DATABASE_URL="file:/home/z/my-project/db/custom.db" bunx tsx prisma/seed-seo-pages.ts
// ============================================================================

import { db } from '../src/lib/db';

type SeoPage = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  keywords: string;
  excerpt: string;
  coverImage: string | null;
  content: string;
  faqJson: string;
  order: number;
  showInMenu: boolean;
};

const seoPages: SeoPage[] = [
  // ==========================================================================
  // 1 — HSE : DÉFINITION
  // ==========================================================================
  {
    slug: 'hse',
    title: 'HSE : définition, signification et champs d\'application',
    metaTitle: 'HSE : définition, signification et champs d\'application',
    metaDescription: 'Le HSE (Hygiène, Sécurité, Environnement) est une démarche d\'entreprise qui protège la santé des travailleurs, prévient les accidents et limite l\'impact environnemental.',
    primaryKeyword: 'HSE définition',
    keywords: 'HSE signification, hygiène sécurité environnement, démarche HSE, qu\'est-ce que HSE, responsable HSE, culture sécurité',
    excerpt: 'Le HSE (Hygiène, Sécurité, Environnement) est une démarche d\'entreprise qui vise à protéger la santé des travailleurs, prévenir les accidents et limiter l\'impact environnemental des activités.',
    coverImage: null,
    order: 1,
    showInMenu: true,
    content: `# HSE : définition, signification et champs d'application

**HSE** est l'acronyme de **Hygiène, Sécurité, Environnement**. Il désigne à la fois une fonction organisationnelle, une démarche et un champ de compétences au sein des entreprises, dont l'objectif est de protéger la santé des travailleurs, de prévenir les accidents du travail et les maladies professionnelles, et de réduire l'impact des activités sur l'environnement. Le HSE est aujourd'hui présent dans presque tous les secteurs : industrie, BTP, énergie, transport, santé, agriculture, services.

## Définition : que veut dire HSE ?

Les trois lettres du sigle couvrent trois dimensions complémentaires :

- **H — Hygiène** : conditions de propreté, salubrité et confort au poste de travail (qualité de l'air, de l'eau, des locaux, ergonomie de base).
- **S — Sécurité** : prévention des accidents (chutes, chocs, incendie, électrocution, accidents de machine) et des situations dangereuses.
- **E — Environnement** : maîtrise des impacts de l'activité sur l'air, l'eau, les sols, la biodiversité et la consommation d'énergie et de matières.

Concrètement, la démarche HSE combine des **actions techniques** (protections collectives, équipements de protection individuelle, maintenances préventives), des **actions organisationnelles** (procédures, consignes, formations, analyse des risques) et des **actions humaines** (sensibilisation, culture de la sécurité, leadership managérial). Pour aller plus loin sur les outils de protection, voir [EPI](/pages/epi) et [EPC](/pages/epc).

## Pourquoi la démarche HSE est-elle importante ?

La démarche HSE répond à un triple impératif. **Humain d'abord** : chaque année, des millions d'accidents du travail et de maladies professionnelles surviennent dans le monde ; l'Organisation internationale du Travail (OIT) rappelle que la sécurité et la santé au travail sont un droit fondamental. **Économique ensuite** : un accident coûte à l'entreprise (arrêts, soins, réparation, perte de production, réputation), et la prévention est presque toujours moins chère que la réparation. **Légal enfin** : la plupart des pays imposent des obligations de sécurité et d'environnement aux employeurs.

Au-delà des obligations, la démarche HSE contribue à la **performance globale** : un site où le risque est maîtrisé est aussi un site plus fiable, plus productif et plus attractif pour ses collaborateurs et ses clients.

## Le rôle du responsable HSE

Le pilotage de la démarche HSE est assuré par un **responsable HSE** (ou ingénieur QHSE selon la taille de l'organisation). Ses missions principales sont l'identification et l'évaluation des [risques professionnels](/pages/risques-professionnels), la mise en place d'actions de prévention, la veille réglementaire, la formation des équipes, la préparation aux audits et le suivi des indicateurs d'accidentabilité. Le poste exige des compétences techniques (mécanique, chimie, électrique, environnement) et comportementales (communication, pédagogie, fermeté). Voir la fiche dédiée [Responsable HSE](/pages/responsable-hse).

## Réglementation et références internationales

La démarche HSE s'appuie sur des **principes internationaux de prévention** reconnus, notamment ceux portés par l'Organisation internationale du Travail (OIT) et formalisés dans les conventions internationales sur la sécurité et la santé au travail. Plusieurs normes ISO structurent les systèmes de management :

- **ISO 45001** — Systèmes de management de la santé et de la sécurité au travail.
- **ISO 14001** — Systèmes de management environnemental.
- **ISO 9001** — Systèmes de management de la qualité (intégré au QHSE, voir [QHSE](/pages/qhse)).

Au Maroc, comme dans la plupart des pays, les obligations précises en matière de sécurité et de santé au travail dépendent de la **réglementation nationale**. Les obligations légales peuvent varier selon les pays et les juridictions ; il est recommandé de consulter la réglementation nationale applicable et les autorités compétentes. HSE Academy présente le Maroc comme un contexte national spécifique, sans jamais inventer d'obligation légale.

## FAQ

**Quelle est la différence entre HSE et QHSE ?**
Le HSE couvre Hygiène, Sécurité et Environnement. Le QHSE ajoute la **Qualité** à cette triade et s'appuie sur un système de management intégré (SMQ + SMS + SMI). Voir [QHSE](/pages/qhse).

**Le HSE est-il obligatoire pour toutes les entreprises ?**
La plupart des pays imposent des obligations minimales de sécurité et de santé au travail. La portée exacte dépend du pays, du secteur et de la taille de l'entreprise. Vérifiez la réglementation nationale applicable.

**Où se former au HSE ?**
HSE Academy propose des parcours diplômants en HSE / QHSE (Technicien, Licence, Master, VAE). Découvrez nos formations en bas de page.

## Approfondir avec HSE Academy

Vous souhaitez développer vos compétences en HSE ou vous préparer au métier de responsable HSE ? Découvrez les **parcours de formation QHSE** de HSE Academy : Technicien QHSE, Licence Professionnelle QHSE, Master Professionnel QHSE et VAE Expertise QHSE. Chaque formation combine théorie, cas pratiques et préparation aux réalités du terrain, à distance ou en présentiel.
`,
    faqJson: JSON.stringify([
      { q: 'Quelle est la différence entre HSE et QHSE ?', a: "Le HSE couvre Hygiène, Sécurité et Environnement. Le QHSE ajoute la Qualité à cette triade et s'appuie sur un système de management intégré (SMQ + SMS + SMI)." },
      { q: 'Le HSE est-il obligatoire pour toutes les entreprises ?', a: "La plupart des pays imposent des obligations minimales de sécurité et de santé au travail. La portée exacte dépend du pays, du secteur et de la taille de l'entreprise. Vérifiez la réglementation nationale applicable." },
      { q: 'Où se former au HSE ?', a: "HSE Academy propose des parcours diplômants en HSE / QHSE : Technicien, Licence Professionnelle, Master Professionnel et VAE Expertise." },
    ]),
  },

  // ==========================================================================
  // 2 — QHSE : DÉFINITION ET DIFFÉRENCE AVEC HSE
  // ==========================================================================
  {
    slug: 'qhse',
    title: 'QHSE : signification et différence avec HSE',
    metaTitle: 'QHSE : définition, signification et différence avec HSE',
    metaDescription: 'Le QHSE (Qualité, Hygiène, Sécurité, Environnement) ajoute la Qualité à la triade HSE. Comprendre la différence, le système de management intégré et les normes ISO associées.',
    primaryKeyword: 'QHSE définition',
    keywords: 'QHSE signification, différence HSE QHSE, système de management intégré, SMI, ISO 9001, ISO 14001, ISO 45001',
    excerpt: 'Le QHSE intègre la Qualité à la triade HSE (Hygiène, Sécurité, Environnement). Il fonde une approche globale de la performance par un système de management intégré.',
    coverImage: null,
    order: 2,
    showInMenu: true,
    content: `# QHSE : signification et différence avec HSE

**QHSE** signifie **Qualité, Hygiène, Sécurité, Environnement**. L'ajout du **Q** de Qualité distingue le QHSE du [HSE](/pages/hse) : il s'agit d'une démarche intégrée qui combine la satisfaction client (Qualité), la protection des travailleurs (Hygiène & Sécurité) et la maîtrise des impacts environnementaux (Environnement). Cette intégration se concrétise par un **système de management intégré (SMI)**, généralement structuré autour des trois normes ISO de référence.

## Définition : qu'est-ce que le QHSE ?

Le QHSE n'est pas une simple juxtaposition de quatre disciplines. C'est une **démarche d'amélioration continue** qui s'applique à l'ensemble des processus d'une organisation :

- **Q — Qualité** : capacité à délivrer un produit ou service conforme aux exigences clients et réglementaires (ISO 9001).
- **H — Hygiène** : conditions de travail saines et adaptées (propreté, salubrité, ergonomie).
- **S — Sécurité** : prévention des accidents et des maladies professionnelles (ISO 45001).
- **E — Environnement** : maîtrise des impacts environnementaux de l'activité (ISO 14001).

L'approche intégrée évite les cloisonnements entre la qualité, la sécurité et l'environnement, et permet de mobiliser des **méthodes communes** (audit, analyse des risques, indicateurs, revue de direction) au service d'une politique cohérente.

## Différence entre HSE et QHSE

| Dimension | HSE | QHSE |
|---|---|---|
| Périmètre | Hygiène + Sécurité + Environnement | Qualité + Hygiène + Sécurité + Environnement |
| Référentiel principal | ISO 45001, ISO 14001 | ISO 9001 + ISO 14001 + ISO 45001 |
| Finalité principale | Protéger les personnes et l'environnement | Protéger les personnes, l'environnement **et** satisfaire le client |
| Outils typiques | Document unique, analyse de risques, audits sécurité | Système de management intégré (SMI), audits combinés, revues de direction unifiées |

En pratique, **le QHSE englobe le HSE**. Une organisation qui met en place un système QHSE déploie nécessairement les composantes HSE, mais y ajoute une dimension Qualité et cherche à les piloter de façon cohérente.

## Le système de management intégré (SMI)

Le SMI est la traduction opérationnelle du QHSE. Il consiste à structurer les exigences des normes **ISO 9001** (Qualité), **ISO 14001** (Environnement) et **ISO 45001** (Santé-Sécurité au travail) dans un **système unique** partagé :

- une **politique** globale QHSE ;
- des **procédures** communes (maîtrise documentaire, audits internes, actions correctives, revues de direction) ;
- des **indicateurs** transversaux (taux d'accidents, non-conformités qualité, incidents environnementaux) ;
- un **schéma d'amélioration** commun (PDCA — Plan-Do-Check-Act).

L'intérêt du SMI est triple : éviter les doublons, harmoniser la culture d'amélioration continue et faciliter les audits combinés. Le **responsable QHSE** joue alors un rôle de chef d'orchestre entre les différentes fonctions de l'entreprise.

## Pourquoi passer du HSE au QHSE ?

Plusieurs raisons poussent une organisation à élargir sa démarche HSE en démarche QHSE :

1. **Cohérence** : qualité, sécurité et environnement partagent les mêmes méthodes (analyse des risques, audit, indicateurs).
2. **Efficacité** : un système unique évite les redondances et réduit les coûts de fonctionnement.
3. **Image** : la certification QHSE est un argument commercial et un gage de fiabilité pour les clients.
4. **Culture** : une démarche unifiée favorise une culture d'amélioration partagée par tous les collaborateurs.

## Réglementation et références

Le QHSE combine un socle **volontaire** (normes ISO) et des **obligations légales** nationales. Les normes ISO sont éditées par l'Organisation internationale de normalisation et sont reconnues mondialement ; elles ne remplacent pas la réglementation nationale, mais la complètent. Au Maroc, les exigences précises dépendent de la réglementation nationale en vigueur ; consultez les autorités compétentes pour toute obligation spécifique. HSE Academy ne formule aucune affirmation qui ne soit vérifiable.

## FAQ

**QHSE et HSE, c'est la même chose ?**
Non. Le QHSE ajoute la **Qualité** (satisfaction client, conformité produit/service) au triptyque HSE. Le QHSE englobe donc le HSE.

**Faut-il être certifié ISO pour faire du QHSE ?**
Non. La certification ISO 9001 / 14001 / 45001 est volontaire. On peut appliquer les principes du QHSE sans certification, mais celle-ci apporte une reconnaissance externe.

**Quelles compétences pour un responsable QHSE ?**
Voir la fiche dédiée [Responsable HSE](/pages/responsable-hse) — les compétences QHSE couvrent à la fois la qualité, la sécurité et l'environnement.

## Approfondir avec HSE Academy

HSE Academy propose des **formations diplômantes QHSE** (Technicien, Licence, Master, VAE) qui couvrent l'ensemble des composantes QHSE et préparent à la mise en place d'un système de management intégré en entreprise.
`,
    faqJson: JSON.stringify([
      { q: 'QHSE et HSE, c\'est la même chose ?', a: 'Non. Le QHSE ajoute la Qualité (satisfaction client, conformité produit/service) au triptyque HSE. Le QHSE englobe donc le HSE.' },
      { q: 'Faut-il être certifié ISO pour faire du QHSE ?', a: 'Non. La certification ISO 9001 / 14001 / 45001 est volontaire. On peut appliquer les principes du QHSE sans certification, mais celle-ci apporte une reconnaissance externe.' },
      { q: 'Quelles compétences pour un responsable QHSE ?', a: "Les compétences QHSE couvrent à la fois la qualité, la sécurité et l'environnement, avec une maîtrise des méthodes d'audit, d'analyse de risques et de pilotage d'un système de management intégré." },
    ]),
  },

  // ==========================================================================
  // 3 — RESPONSABLE HSE
  // ==========================================================================
  {
    slug: 'responsable-hse',
    title: 'Responsable HSE : missions, compétences et formation',
    metaTitle: 'Responsable HSE : missions, compétences et formation requise',
    metaDescription: 'Découvrez les missions du responsable HSE, les compétences techniques et comportementales attendues, le parcours de formation et les perspectives de carrière.',
    primaryKeyword: 'responsable HSE',
    keywords: 'responsable HSE missions, métier HSE, formation responsable HSE, compétence HSE, ingénieur QHSE, technicien HSE, carrière HSE',
    excerpt: 'Le responsable HSE pilote la politique de prévention d\'une organisation : identification des risques, formation des équipes, conformité réglementaire et culture de la sécurité.',
    coverImage: null,
    order: 3,
    showInMenu: true,
    content: `# Responsable HSE : missions, compétences et formation

Le **responsable HSE** (parfois appelé ingénieur HSE, responsable QHSE ou EHS manager selon les contextes) pilote la politique de prévention des [risques professionnels](/pages/risques-professionnels) d'une organisation. Il est l'interface entre la direction, les opérationnels et les partenaires externes (autorités, organismes de certification, clients, sous-traitants). Son objectif est double : protéger les personnes et l'environnement, et garantir la conformité réglementaire.

## Définition du poste

Le responsable HSE conçoit, déploie et fait vivre la démarche [HSE](/pages/hse) de l'organisation. Il travaille en transverse avec toutes les directions (production, maintenance, RH, achats, juridique) et rapporte généralement à la direction générale ou à la direction industrielle. Dans les grandes organisations, il peut être secondé par un réseau de **correspondants HSE** ou d'**animateurs sécurité** sur les sites.

## Missions principales

Les missions du responsable HSE s'organisent autour de quatre grands axes :

- **Évaluation des risques** : identification et analyse des [risques professionnels](/pages/risques-professionnels), élaboration du document d'évaluation des risques (DUERP en France, équivalent national ailleurs), planification des actions de prévention.
- **Mise en place des mesures de prévention** : [EPI](/pages/epi) et [EPC](/pages/epc), [plan de prévention](/pages/plan-de-prevention) avec les entreprises extérieures, [permis de travail](/pages/permis-de-travail) pour les interventions à haut risque, consignes de sécurité.
- **Animation et formation** : sensibilisation des nouveaux embauchés, formations sécurité (gestes et postures, [travail en hauteur](/pages/travail-en-hauteur), [espaces confinés](/pages/espaces-confines), [prévention incendie](/pages/prevention-incendie)), pilotage des campagnes de prévention.
- **Veille réglementaire et conformité** : suivi des évolutions légales et normatives, audits internes, gestion des non-conformités, relations avec l'inspection du travail et les organismes de certification.

## Compétences techniques attendues

Un responsable HSE doit maîtriser :

- les **méthodes d'analyse des risques** (voir [Analyse des risques](/pages/analyse-des-risques)) ;
- les **principes internationaux de prévention** (OIT, normes ISO 45001, 14001, 9001) ;
- les **risques spécifiques** au secteur d'activité (chimique, électrique, mécanique, biologique, etc.) ;
- les **outils qualité** (audit, PDCA, indicateurs, résolution de problèmes) ;
- la **réglementation nationale** applicable en matière de santé, sécurité et environnement.

## Compétences comportementales

Le poste exige aussi de fortes compétences humaines :

- **Communication** : savoir adapter le discours à des publics variés (ouvriers, encadrants, direction) ;
- **Pédagogie** : faire comprendre une règle plutôt que la subir ;
- **Fermeté et diplomatie** : savoir dire non à une opération non conforme tout en conservant la confiance ;
- **Leadership d'influence** : la fonction HSE n'a pas toujours d'autorité hiérarchique directe, elle convainc ;
- **Capacité d'analyse** et **gestion du stress** en situation d'incident.

## Formation et parcours

Il n'existe pas un seul chemin pour devenir responsable HSE, mais plusieurs profils :

- **Technicien HSE** (bac+2) — entrée directe sur des postes d'animateur sécurité sur site.
- **Licence Professionnelle QHSE** (bac+3) — accès à des postes de responsable HSE en PME.
- **Master Professionnel QHSE** (bac+5) — accès à des postes de responsable HSE en grande entreprise ou sur sites complexes.
- **VAE (Validation des Acquis de l'Expérience)** — pour des professionnels confirmés souhaitant officialiser leur expérience par un diplôme.

HSE Academy propose ces quatre parcours, à distance ou en présentiel.

## Carrière et perspectives

Le responsable HSE peut évoluer vers des fonctions de **directeur QHSE** (groupe), de **directeur des opérations**, de **consultant** ou d'**auditeur** indépendant. Les profils QHSE sont recherchés dans tous les secteurs industriels et de services, et la demande reste soutenue à l'international, en particulier sur les grands chantiers et les sites à haut risque.

## Réglementation et contexte international

Les missions du responsable HSE s'inscrivent dans un cadre **international** (principes OIT, normes ISO) et **national** (réglementation du pays d'implantation). Au Maroc, comme dans la plupart des pays, les obligations précises dépendent de la législation nationale. HSE Academy recommande de toujours se référer à la réglementation applicable et aux autorités compétentes.

## FAQ

**Quel bac pour devenir responsable HSE ?**
Aucun bac spécifique n'est exigé, mais les profils scientifiques et technologiques (sciences industrielles, chimie, génie civil) sont fréquents. L'essentiel se joue au niveau post-bac : Technicien, Licence ou Master QHSE.

**Quelle différence entre technicien HSE et responsable HSE ?**
Le technicien HSE est un opérationnel de terrain qui anime la sécurité au quotidien. Le responsable HSE a un rôle de pilotage plus stratégique : il conçoit la politique HSE et la fait vivre à l'échelle de l'organisation.

**Combien gagne un responsable HSE ?**
Les rémunérations varient fortement selon le pays, le secteur et l'expérience. HSE Academy ne publie pas de chiffres non sourcés ; nous recommandons de consulter les barèmes professionnels nationaux ou les salaires publiés par les organismes officiels.

## Approfondir avec HSE Academy

Vous visez un poste de responsable HSE ? HSE Academy vous accompagne avec des **parcours diplômants** (Technicien QHSE, Licence Professionnelle QHSE, Master Professionnel QHSE, VAE Expertise QHSE) qui combinent apports théoriques, cas pratiques et préparation aux réalités du métier.
`,
    faqJson: JSON.stringify([
      { q: 'Quel bac pour devenir responsable HSE ?', a: "Aucun bac spécifique n'est exigé, mais les profils scientifiques et technologiques (sciences industrielles, chimie, génie civil) sont fréquents. L'essentiel se joue au niveau post-bac : Technicien, Licence ou Master QHSE." },
      { q: 'Quelle différence entre technicien HSE et responsable HSE ?', a: "Le technicien HSE est un opérationnel de terrain qui anime la sécurité au quotidien. Le responsable HSE a un rôle de pilotage plus stratégique : il conçoit la politique HSE et la fait vivre à l'échelle de l'organisation." },
      { q: 'Combien gagne un responsable HSE ?', a: "Les rémunérations varient fortement selon le pays, le secteur et l'expérience. HSE Academy ne publie pas de chiffres non sourcés ; nous recommandons de consulter les barèmes professionnels nationaux ou les salaires publiés par les organismes officiels." },
    ]),
  },

  // ==========================================================================
  // 4 — RISQUES PROFESSIONNELS
  // ==========================================================================
  {
    slug: 'risques-professionnels',
    title: 'Risques professionnels : typologie et identification',
    metaTitle: 'Risques professionnels : typologie et méthodes d\'identification',
    metaDescription: 'Définition des risques professionnels : physiques, chimiques, biologiques, ergonomiques, psychosociaux. Méthodes d\'identification et d\'évaluation pour la prévention.',
    primaryKeyword: 'risques professionnels',
    keywords: 'risques professionnels, identification des risques, évaluation des risques, typologie des risques, classes de risques, danger et risque, DUERP',
    excerpt: 'Les risques professionnels regroupent les situations pouvant causer un dommage au travailleur. Ils se classent en cinq grandes familles : physiques, chimiques, biologiques, ergonomiques et psychosociaux.',
    coverImage: null,
    order: 4,
    showInMenu: true,
    content: `# Risques professionnels : typologie et identification

Un **risque professionnel** est la probabilité qu'un danger présent dans l'environnement de travail provoque un dommage (blessure, maladie, atteinte à la santé) au travailleur. La distinction entre **danger** (source potentielle de dommage) et **risque** (combinaison de la probabilité et de la gravité du dommage) est fondamentale : elle oriente les actions de prévention. Cette fiche présente les grandes familles de risques et les méthodes d'identification.

## Définitions : danger, risque, dommage

- **Danger** : source ou situation avec potentiel de causer un dommage (ex. une substance toxique, une machine en mouvement, une hauteur).
- **Risque** : probabilité qu'un dommage se produise, combinée à sa gravité. Le risque dépend de l'exposition (fréquence, durée) et des mesures de prévention en place.
- **Dommage** : blessure, maladie ou atteinte à la santé qui résulte de la matérialisation du risque.

L'évaluation des [risques professionnels](/pages/risques-professionnels) cherche donc à **estimer** ces deux dimensions (probabilité et gravité) pour hiérarchiser les actions. Voir [Analyse des risques](/pages/analyse-des-risques).

## Typologie des risques professionnels

On distingue généralement cinq grandes familles de risques professionnels.

### Risques physiques

Liés à l'environnement physique du travail : bruit, vibrations, températures extrêmes, rayonnements (UV, ionisants), électricité, pression atmosphérique. Exemples : surdité professionnelle liée au bruit, troubles musculosquelettiques liés aux vibrations, brûlures par contact.

### Risques chimiques

Liés à l'exposition à des produits chimiques (solvants, acides, bases, poussières, gaz). Les effets peuvent être aigus (intoxication immédiate) ou chroniques (cancers, dermatoses, maladies respiratoires). La prévention repose sur la substitution des produits dangereux, la ventilation, les [EPI](/pages/epi) et le respect des fiches de données de sécurité (FDS).

### Risques biologiques

Liés à l'exposition à des micro-organismes (bactéries, virus, champignons, parasites) ou à des déchets biologiques. Secteurs particulièrement exposés : santé, agriculture, agroalimentaire, traitement des eaux et des déchets. La prévention combine hygiène, équipements de protection et vaccination lorsque recommandée par les autorités.

### Risques ergonomiques

Liés à la conception du poste, aux gestes répétitifs, aux postures forcées, aux manutentions manuelles et au travail sur écran. Conséquences : troubles musculosquelettiques (TMS), lombalgies, fatigue visuelle. La prévention passe par l'aménagement du poste, la rotation des tâches et la formation aux gestes et postures.

### Risques psychosociaux (RPS)

Liés à l'organisation du travail, aux relations de travail, aux exigences émotionnelles et à l'intensité du travail : stress, harcèlement, burn-out, violences externes. Les RPS sont aujourd'hui reconnus comme des risques à part entière et nécessitent une prévention spécifique (formation des managers, dialogues sociaux, enquêtes de climat).

## Méthodes d'identification des risques

Plusieurs méthodes existent, à choisir selon le contexte :

- **Observation du poste de travail** : analyser les situations réelles, en lien avec les opérateurs.
- **Analyse historique des incidents** : exploiter les retours d'expérience, les accidents passés et les presque-accidents.
- **Méthode ARP** (Analyse des Risques par le Poste) : méthode structurée par famille de risques (voir [Analyse des risques](/pages/analyse-des-risques)).
- **HAZOP** (Hazard and Operability Study) : analyse systématique des écarts de conception dans les procédés industriels.
- **Brainstorming** d'équipe pluridisciplinaire (opérateurs, maintenance, HSE).

## Hiérarchisation et plan d'action

Une fois les risques identifiés et évalués, on les hiérarchise (matrice probabilité × gravité) et on définit un **plan d'action** qui suit la **hiérarchie des contrôles** :

1. **Élimination** du danger (le plus efficace).
2. **Substitution** par un produit ou procédé moins dangereux.
3. **Protections collectives** ([EPC](/pages/epc)).
4. **Protections individuelles** ([EPI](/pages/epi)).
5. **Mesures organisationnelles** (formation, consignes, signalisation).

L'objectif est toujours d'agir le plus en amont possible dans la hiérarchie.

## Réglementation et références

L'identification et l'évaluation des risques sont des exigences internationales portées par l'Organisation internationale du Travail (OIT) et formalisées dans la norme **ISO 45001**. La plupart des pays imposent également un **document d'évaluation des risques** (DUERP en France, équivalent national ailleurs). Au Maroc, les obligations précises dépendent de la réglementation nationale : consultez les autorités compétentes.

## FAQ

**Quelle différence entre un danger et un risque ?**
Le danger est la source potentielle de dommage. Le risque est la probabilité que ce danger provoque un dommage, combinée à la gravité de ce dommage.

**Que contient un document d'évaluation des risques ?**
Il identifie les dangers, évalue les risques, classe les actions de prévention par priorité et prévoit des échéances de mise en œuvre. Il est tenu à disposition des travailleurs et de l'inspection.

**Combien de familles de risques professionnels ?**
On distingue généralement cinq grandes familles : physiques, chimiques, biologiques, ergonomiques et psychosociaux. Certaines classifications ajoutent les risques liés à la sécurité (incendie, chute) en sixième famille.

## Approfondir avec HSE Academy

Maîtriser l'évaluation des risques est une compétence centrale du [responsable HSE](/pages/responsable-hse). HSE Academy forme à ces méthodes dans tous ses parcours diplômants QHSE, du Technicien au Master Professionnel.
`,
    faqJson: JSON.stringify([
      { q: 'Quelle différence entre un danger et un risque ?', a: "Le danger est la source potentielle de dommage. Le risque est la probabilité que ce danger provoque un dommage, combinée à la gravité de ce dommage." },
      { q: 'Que contient un document d\'évaluation des risques ?', a: "Il identifie les dangers, évalue les risques, classe les actions de prévention par priorité et prévoit des échéances de mise en œuvre. Il est tenu à disposition des travailleurs et de l'inspection." },
      { q: 'Combien de familles de risques professionnels ?', a: "On distingue généralement cinq grandes familles : physiques, chimiques, biologiques, ergonomiques et psychosociaux. Certaines classifications ajoutent les risques liés à la sécurité (incendie, chute) en sixième famille." },
    ]),
  },
  // ==========================================================================
  // 5 — EPI : ÉQUIPEMENTS DE PROTECTION INDIVIDUELLE
  // ==========================================================================
  {
    slug: 'epi',
    title: 'EPI : Équipements de Protection Individuelle',
    metaTitle: 'EPI : définition, catégories et obligations de l\'employeur',
    metaDescription: 'EPI (Équipement de Protection Individuelle) : définition, catégories (tête, yeux, mains, pieds, antichute), obligations de l\'employeur et bonne utilisation.',
    primaryKeyword: 'EPI définition',
    keywords: 'EPI, équipement de protection individuelle, protection travailleur, harnais, casque, gants, obligation EPI, protection individuelle',
    excerpt: 'Un EPI (Équipement de Protection Individuelle) est un moyen de protection porté par le travailleur pour le protéger contre un risque résiduel que les protections collectives ne peuvent éliminer.',
    coverImage: null,
    order: 5,
    showInMenu: true,
    content: `# EPI : Équipements de Protection Individuelle

Un **EPI** (Équipement de Protection Individuelle) est un dispositif ou moyen individuel porté ou utilisé par un travailleur pour le protéger contre un risque susceptible de menacer sa santé ou sa sécurité. L'EPI n'élimine pas le danger lui-même : il protège le travailleur lorsque le risque ne peut pas être totalement supprimé à la source. Il s'agit donc du **dernier niveau de défense** dans la hiérarchie des contrôles de prévention.

## Définition : qu'est-ce qu'un EPI ?

Un EPI est défini par opposition aux **EPC** (Équipements de Protection Collective). Un EPC protège simultanément **tous les travailleurs** exposés (garde-corps, ventilation, écran anti-projection), tandis qu'un EPI ne protège que **la personne qui le porte** (casque, gants, harnais). Selon les principes internationaux de prévention, l'EPC est **prioritaire** sur l'EPI : on commence toujours par supprimer ou réduire le danger à la source, avant de protéger individuellement. Voir [EPC](/pages/epc).

Les EPI concernent tous les secteurs : BTP, industrie, chimie, électricité, santé, agroalimentaire, logistique, espaces verts.

## Catégories d'EPI

On classe généralement les EPI selon la zone du corps protégée.

### Protection de la tête

- **Casque de chantier** (anti-choc) ;
- **Casque anti-bruit** (ou bouchons d'oreilles, voir ci-dessous).

### Protection des yeux et du visage

- **Lunettes de protection** (chimie, éblouissement, projections) ;
- **Masques faciaux** (projections thermiques ou chimiques) ;
- **Écrans de soudage** (rayonnement intense).

### Protection de l'ouïe

- **Bouchons d'oreilles** (jetables ou moulés sur mesure) ;
- **Casques antibruit** (environnement industriel bruyant).

### Protection des voies respiratoires

- **Masques FFP** (poussières, aérosols) ;
- **Demi-masques et masques complets** avec filtres (gaz, vapeurs) ;
- **Appareils respiratoires isolants** (intervention en [espaces confinés](/pages/espaces-confines) ou atmosphère non respirable).

### Protection des mains

- **Gants anti-coupure, thermiques, chimiques, électriques** selon le risque ;
- choix en fonction de la fiche de données de sécurité (FDS) du produit manipulé.

### Protection des pieds

- **Chaussures de sécurité** avec coque, semelle anti-perforation, semelle isolante, etc.

### Protection antichute

- **Harnais**, **longe**, **absorbeur de choc**, **ancrage** ;
- utilisé en complément des protections collectives dans le [travail en hauteur](/pages/travail-en-hauteur).

### Protection du corps

- **Vêtements de travail haute visibilité** (chantier, rail, route) ;
- **Vêtements ignifugés** ou contre les produits chimiques ;
- **Tabliers de soudage**.

## Obligations de l'employeur

L'employeur doit :

1. **Identifier les EPI nécessaires** à partir de l'évaluation des [risques professionnels](/pages/risques-professionnels).
2. **Fournir les EPI gratuitement** aux travailleurs (ils ne peuvent pas être laissés à leur charge).
3. **Veiller à leur bonne utilisation** (formation, information, consignes).
4. **Assurer l'entretien, le stockage et le remplacement** des EPI défectueux.
5. **Vérifier la conformité** des EPI aux exigences réglementaires et normatives en vigueur.

À l'inverse, le travailleur a l'**obligation d'utiliser les EPI** mis à sa disposition et de signaler toute défectuosité.

## Bonnes pratiques

- Toujours **vérifier l'état de l'EPI** avant utilisation (déchirure, usure, date de péremption).
- Respecter les **dates de remplacement** (un EPI a une durée de vie).
- Adapter l'EPI à la **taille** du travailleur (un harnais mal ajusté ne protège pas).
- Ne jamais modifier un EPI (perforation du casque, retrait d'éléments).
- Stocker à l'abri des **rayonnements UV**, de l'humidité et des produits chimiques.
- Tenir un **registre des vérifications** pour les EPI antichute et les appareils respiratoires.

## Hiérarchie des contrôles : où se situe l'EPI ?

La hiérarchie des contrôles (de la mesure la plus efficace à la moins efficace) :

1. **Élimination** du danger ;
2. **Substitution** ;
3. **Protections collectives** ([EPC](/pages/epc)) ;
4. **Protections individuelles** (EPI) ;
5. **Mesures organisationnelles**.

L'EPI ne doit jamais être la seule mesure de prévention lorsque des solutions plus en amont existent. Voir [Analyse des risques](/pages/analyse-des-risques).

## Réglementation et références

Les EPI font l'objet de **normes internationales** précises (normes ISO et normes régionales comme les normes EN en Europe) qui définissent les exigences de chaque catégorie. L'Organisation internationale du Travail (OIT) rappelle que la fourniture d'EPI adaptés fait partie des obligations de l'employeur. Au Maroc, les obligations précises dépendent de la réglementation nationale : consultez les autorités compétentes.

## FAQ

**Qui paie les EPI ?**
Les EPI sont à la charge de l'employeur. Ils ne peuvent jamais être laissés à la charge financière du travailleur.

**Faut-il former les travailleurs aux EPI ?**
Oui. L'employeur doit informer et former les travailleurs à l'utilisation, l'entretien et les limites de l'EPI.

**Les EPI remplacent-ils les protections collectives ?**
Non. Les [EPC](/pages/epc) sont prioritaires. L'EPI complète les protections collectives, il ne s'y substitue pas.

## Approfondir avec HSE Academy

HSE Academy intègre la maîtrise des EPI dans ses formations sécurité ([travail en hauteur](/pages/travail-en-hauteur), [espaces confinés](/pages/espaces-confines), [prévention incendie](/pages/prevention-incendie)) et dans ses parcours diplômants QHSE.
`,
    faqJson: JSON.stringify([
      { q: 'Qui paie les EPI ?', a: "Les EPI sont à la charge de l'employeur. Ils ne peuvent jamais être laissés à la charge financière du travailleur." },
      { q: 'Faut-il former les travailleurs aux EPI ?', a: "Oui. L'employeur doit informer et former les travailleurs à l'utilisation, l'entretien et les limites de l'EPI." },
      { q: 'Les EPI remplacent-ils les protections collectives ?', a: "Non. Les EPC sont prioritaires. L'EPI complète les protections collectives, il ne s'y substitue pas." },
    ]),
  },

  // ==========================================================================
  // 6 — EPC : ÉQUIPEMENTS DE PROTECTION COLLECTIVE
  // ==========================================================================
  {
    slug: 'epc',
    title: 'EPC : Équipements de Protection Collective',
    metaTitle: 'EPC : définition, exemples et priorité sur les EPI',
    metaDescription: 'EPC (Équipement de Protection Collective) : définition, exemples (garde-corps, ventilation, écrans), priorité sur les EPI selon les principes de prévention.',
    primaryKeyword: 'EPC définition',
    keywords: 'EPC, équipement de protection collective, protection collective, garde-corps, ventilation, hiérarchie des contrôles, protection simultanée',
    excerpt: 'Un EPC (Équipement de Protection Collective) protège simultanément tous les travailleurs exposés à un risque. Il est prioritaire sur les EPI selon les principes internationaux de prévention.',
    coverImage: null,
    order: 6,
    showInMenu: true,
    content: `# EPC : Équipements de Protection Collective

Un **EPC** (Équipement de Protection Collective) est un dispositif technique ou organisationnel conçu pour protéger **simultanément tous les travailleurs** exposés à un même risque, sans qu'ils aient à porter un équipement individuel. Selon les principes internationaux de prévention, l'EPC est **prioritaire sur l'EPI** : la protection collective agit à la source et ne dépend pas d'un comportement individuel.

## Définition : qu'est-ce qu'un EPC ?

Contrairement à l'[EPI](/pages/epi) qui protège **la personne qui le porte**, l'EPC protège **toutes les personnes présentes** dans une zone, en supprimant ou en réduisant le danger à la source. Il est par nature plus fiable car il ne nécessite pas d'action individuelle pour être efficace. La distinction est essentielle dans la hiérarchie des contrôles de prévention.

## Exemples d'EPC par famille de risque

### Chute de hauteur

- **Garde-corps** (cf. [travail en hauteur](/pages/travail-en-hauteur)) ;
- **Filets de sécurité** ;
- **Planchers et passerelles sécurisés** ;
- **Échafaudages** conformes (garde-corps, plinthes) ;
- **Écrans anti-chute**.

### Risque chimique et atmosphère

- **Ventilation** et **aspiration localisée** (cf. [espaces confinés](/pages/espaces-confines)) ;
- **Capsulage** des sources d'émission ;
- **Mise en dépression** des zones sensibles ;
- **Séparation** des stockages par cloisons résistant au feu.

### Risque mécanique et électrique

- **Carters de protection** sur machines (interdiction d'accès aux zones mobiles) ;
- **Barrières immatérielles** (détecteurs de présence) ;
- **Verrouillages** des accès en fonctionnement ;
- **Écrans anti-projection** ;
- **Isolement électrique** par éloignement ou obstacle.

### Risque incendie

- **Détecteurs automatiques** et **désenfumage** (cf. [prévention incendie](/pages/prevention-incendie)) ;
- **Portes coupe-feu** ;
- **Rideaux d'eau** et **sprinklers** ;
- **Évacuation des produits dangereux** vers des zones protégées.

### Risque biologique

- **Sas sanitaires** ;
- **Confinement** par pression négative ;
- **Filtres HEPA** sur les extractions.

## Pourquoi l'EPC est-il prioritaire sur l'EPI ?

La hiérarchie des contrôles classe les mesures de prévention de la **plus efficace** (élimination du danger) à la **moins efficace** (protection individuelle). L'EPC arrive **avant l'EPI** car :

- il protège **tous les travailleurs** exposés, sans action individuelle ;
- il est **moins dépendant d'un comportement humain** (oubli, mauvaise utilisation) ;
- il agit à la **source** du risque plutôt qu'au niveau du travailleur ;
- il est **plus fiable dans le temps** (entretien planifié).

Cela ne signifie pas que l'EPI est inutile : un EPC ne supprime jamais 100 % du risque. L'EPI reste souvent nécessaire en **complément** de l'EPC, en particulier pour les interventions ponctuelles (maintenance, nettoyage) où l'EPC doit être temporairement neutralisé.

## Exemples concrets : EPC puis EPI

| Risque | EPC | EPI complémentaire |
|---|---|---|
| Chute de hauteur | Garde-corps, plateforme sécurisée | Harnais antichute (intervention ponctuelle) |
| Poussières de bois | Aspiration localisée à la source | Masque FFP3 (nettoyage des filtres) |
| Risque chimique | Sorbonne, ventilation | Gants et lunettes (manipulation de produits) |
| Risque électrique | Mise hors tension, balisage | Gants isolants (intervention sous tension) |
| Bruit | Capotage de machine, isolation | Bouchons d'oreilles (entretien de la machine) |

## Entretien et vérification des EPC

Les EPC nécessitent eux aussi un **entretien régulier** :

- vérification périodique (annuelle, semestrielle) ;
- enregistrement dans un **registre de sécurité** ;
- maintenance préventive et corrective ;
- test des dispositifs de sécurité (détection, verrouillage) ;
- formation des opérateurs à ne jamais neutraliser un EPC.

Un EPC neutralisé (cartier retiré, garde-corps démonté) doit être accompagné d'un **permis de travail** (cf. [permis de travail](/pages/permis-de-travail)) et d'EPI renforcés le temps de l'intervention.

## Réglementation et références

L'Organisation internationale du Travail (OIT) et la norme **ISO 45001** rappellent la priorité de la prévention collective sur la prévention individuelle. Les EPC doivent respecter les **normes techniques** internationales (normes ISO) et régionales correspondantes. Au Maroc, les obligations précises dépendent de la réglementation nationale : consultez les autorités compétentes.

## FAQ

**Pourquoi l'EPC est-il prioritaire sur l'EPI ?**
Parce qu'il agit à la source et protège tous les travailleurs exposés, sans dépendre d'un comportement individuel. Il est plus fiable dans le temps.

**L'EPI est-il encore nécessaire si un EPC est en place ?**
Oui, en complément. Un EPC ne supprime jamais 100 % du risque. L'EPI reste nécessaire, notamment lors des interventions de maintenance où l'EPC doit être neutralisé.

**Qui entretient les EPC ?**
L'employeur est responsable de l'entretien, de la vérification périodique et de la traçabilité des EPC. Les travailleurs doivent signaler toute défectuosité.

## Approfondir avec HSE Academy

La distinction EPC / EPI est un fondement de la prévention enseigné dans tous les parcours HSE Academy. Nos formations [travail en hauteur](/pages/travail-en-hauteur) et [espaces confinés](/pages/espaces-confines) détaillent les EPC spécifiques à chaque risque.
`,
    faqJson: JSON.stringify([
      { q: 'Pourquoi l\'EPC est-il prioritaire sur l\'EPI ?', a: "Parce qu'il agit à la source et protège tous les travailleurs exposés, sans dépendre d'un comportement individuel. Il est plus fiable dans le temps." },
      { q: 'L\'EPI est-il encore nécessaire si un EPC est en place ?', a: "Oui, en complément. Un EPC ne supprime jamais 100% du risque. L'EPI reste nécessaire, notamment lors des interventions de maintenance où l'EPC doit être neutralisé." },
      { q: 'Qui entretient les EPC ?', a: "L'employeur est responsable de l'entretien, de la vérification périodique et de la traçabilité des EPC. Les travailleurs doivent signaler toute défectuosité." },
    ]),
  },

  // ==========================================================================
  // 7 — TRAVAIL EN HAUTEUR
  // ==========================================================================
  {
    slug: 'travail-en-hauteur',
    title: 'Travail en hauteur : prévention et réglementation',
    metaTitle: 'Travail en hauteur : définition, risques et prévention',
    metaDescription: 'Travail en hauteur (plus de 2 m) : définition, risques de chute, hiérarchie de prévention, EPI antichute, EPC et obligations de l\'employeur.',
    primaryKeyword: 'travail en hauteur',
    keywords: 'travail en hauteur, prévention chute, harnais antichute, échafaudage, garde-corps, permis de travail hauteur, protection antichute',
    excerpt: 'Le travail en hauteur désigne toute activité effectuée à plus de 2 mètres, exposant le travailleur à un risque de chute. La prévention repose sur la hiérarchie des contrôles.',
    coverImage: null,
    order: 7,
    showInMenu: true,
    content: `# Travail en hauteur : prévention et réglementation

Le **travail en hauteur** désigne toute activité professionnelle réalisée à une hauteur suffisante pour qu'une chute puisse provoquer un dommage corporel. On considère généralement qu'il y a travail en hauteur dès lors que la **différence de niveau est supérieure à 2 mètres**, mais ce seuil peut varier selon les pays : dans certains contextes, tout travail en hauteur, quelle que soit la dénivellation, est encadré. Le risque de chute de hauteur est l'un des risques les plus graves et les plus fréquents en milieu professionnel, en particulier dans le BTP, l'industrie, la maintenance et les travaux publics.

## Définition : qu'est-ce qu'un travail en hauteur ?

Sont considérés comme travaux en hauteur :

- le travail sur **échafaudages**, **plateformes élévatrices**, **nacelles** ;
- le travail sur **toitures**, **terrasses**, **versants** ;
- le travail sur **échelles** et **escabeaux** (usage limité) ;
- le travail en **fasceaux** ou **poutres** ;
- le travail près de **trous** ou de **baies** (risque de chute dans le vide) ;
- le travail en **espaces confinés** verticaux (fosses, cuves — voir [espaces confinés](/pages/espaces-confines)).

La définition repose sur la **différence de niveau** et le **risque de chute**, indépendamment du type d'équipement utilisé.

## Risques liés au travail en hauteur

Le risque principal est la **chute de hauteur**, qui peut entraîner :

- **traumatismes** graves (fractures, lésions internes) ;
- **traumatismes crâniens** en cas de choc ;
- dans certains cas, le **décès**.

D'autres risques sont associés :

- **chute d'objets** depuis la hauteur (sur les travailleurs en contre-bas) ;
- **conditions météo** (vent, pluie, gel) qui aggravent le risque ;
- **risque électrique** à proximité de lignes ;
- **fatigue et trouble musculosquelettique** liés au maintien de postures.

## Hiérarchie de prévention

La prévention suit la **hiérarchie des contrôles** (voir [Analyse des risques](/pages/analyse-des-risques)) :

1. **Élimination** : éviter le travail en hauteur, par exemple en assemblant au sol puis en hissant.
2. **Protection collective** ([EPC](/pages/epc)) : garde-corps, plinthes, filets, plateformes sécurisées, échafaudages complets.
3. **Protection individuelle** ([EPI](/pages/epi)) : harnais antichute avec longe et point d'ancrage, lorsque l'EPC n'est pas possible.

L'EPI antichute n'est jamais la première solution. Il intervient lorsque l'EPC est techniquement impossible ou temporairement neutralisé.

## EPC pour le travail en hauteur

- **Garde-corps** (lisse supérieure ~1 m, lisse intermédiaire, plinthe) ;
- **Échafaudages** conformes (assemblage par personnel compétent, vérification avant mise en service) ;
- **Plateformes élévatrices mobiles de personnes (PEMP)** ;
- **Nacelles** avec contrôle d'accès ;
- **Filets de sécurité** sous les zones de travail ;
- **Recouvrement des ouvertures** dans les planchers.

Tout EPC doit faire l'objet d'une **vérification** avant mise en service et d'une **vérification périodique**.

## EPI antichute

Lorsque l'EPC est insuffisant, on a recours à un **système d'arrêt de chute** :

- **Harnais antichute** complet (anches, sangles, point d'ancrage dorsal) ;
- **Longe** avec **absorbeur de choc** ;
- **Point d'ancrage** structurel (résistance minimale définie par les normes applicables) ;
- éventuellement un **antichute mobile** sur ligne de vie rigide.

L'ensemble doit être **adapté à la taille** du travailleur, **vérifié avant chaque utilisation** et **remplacé après toute chute** (l'absorbeur est à usage unique). Les travailleurs doivent être **formés** à l'utilisation du harnais et au secours en cas de suspension (traumatisme de suspension).

## Cadre réglementaire

Le travail en hauteur est encadré par des **principes internationaux de prévention** (OIT, ISO 45001) et des **réglementations nationales** :

- Dans la plupart des pays, l'employeur doit **évaluer le risque** avant toute intervention.
- Le travail en hauteur doit faire l'objet d'un **permis de travail** (cf. [permis de travail](/pages/permis-de-travail)) lorsque l'opération présente un risque élevé.
- Les travailleurs doivent être **formés** au travail en hauteur et au secours.
- En cas de co-activité avec une entreprise extérieure, un **plan de prévention** (cf. [plan de prévention](/pages/plan-de-prevention)) est requis.

Au Maroc, les obligations précises dépendent de la réglementation nationale. HSE Academy recommande de consulter la réglementation applicable et les autorités compétentes.

## Bonnes pratiques

- **Toujours privilégier l'EPC** à l'EPI.
- **Inspecter les équipements** avant chaque utilisation.
- **Vérifier la météo** : vent fort, pluie, gel = arrêt du travail en hauteur.
- **Barrer les accès** aux zones de danger.
- **Prévoir un plan de secours** (sauvetage en cas de chute).
- **Sécuriser les outils** : attacher tout outil pour éviter la chute d'objets.
- **Maintenir une formation à jour** des équipes.

## FAQ

**À partir de quelle hauteur parle-t-on de travail en hauteur ?**
Le seuil de 2 mètres est couramment retenu, mais il peut varier selon les pays. Certains contextes encadrent tout travail en hauteur, quelle que soit la dénivellation.

**Harnais ou garde-corps : lequel choisir ?**
Toujours privilégier le **garde-corps** (protection collective). Le harnais est un complément, à utiliser lorsque l'EPC est techniquement impossible ou temporairement neutralisé.

**Le travail en hauteur nécessite-t-il un permis de travail ?**
Pour les opérations à risque élevé, oui. Voir [permis de travail](/pages/permis-de-travail). L'employeur doit évaluer le risque et encadrer l'opération.

## Approfondir avec HSE Academy

La prévention du travail en hauteur est l'une des **formations à la carte** de HSE Academy, intégrée à nos parcours QHSE. Vous pouvez la suivre seule ou dans le cadre d'un diplôme QHSE complet.
`,
    faqJson: JSON.stringify([
      { q: 'À partir de quelle hauteur parle-t-on de travail en hauteur ?', a: "Le seuil de 2 mètres est couramment retenu, mais il peut varier selon les pays. Certains contextes encadrent tout travail en hauteur, quelle que soit la dénivellation." },
      { q: 'Harnais ou garde-corps : lequel choisir ?', a: "Toujours privilégier le garde-corps (protection collective). Le harnais est un complément, à utiliser lorsque l'EPC est techniquement impossible ou temporairement neutralisé." },
      { q: 'Le travail en hauteur nécessite-t-il un permis de travail ?', a: "Pour les opérations à risque élevé, oui. L'employeur doit évaluer le risque et encadrer l'opération par un permis de travail." },
    ]),
  },

  // ==========================================================================
  // 8 — ESPACES CONFINÉS
  // ==========================================================================
  {
    slug: 'espaces-confines',
    title: 'Espaces confinés : risques et sécurité',
    metaTitle: 'Espaces confinés : définition, risques et sécurité au travail',
    metaDescription: 'Espaces confinés : définition (fosse, cuve, silo), risques (asphyxie, toxicité, explosion), permis d\'intervention, ventilation et EPI. Fiche pratique HSE Academy.',
    primaryKeyword: 'espaces confinés',
    keywords: 'espace confiné, travail en espace confiné, permis d\'intervention, asphyxie, atmosphère confinée, ventilation, cuve, fosse, silo',
    excerpt: 'Un espace confiné est un volume fermé ou partiellement fermé, conçu pour être occupé de façon intermittente, dans lequel l\'atmosphère peut présenter un danger pour la santé du travailleur.',
    coverImage: null,
    order: 8,
    showInMenu: true,
    content: `# Espaces confinés : risques et sécurité

Un **espace confiné** (ou espace clos) est un volume fermé ou partiellement fermé, conçu pour être occupé de façon intermittente, dans lequel l'atmosphère peut présenter un danger pour la santé et la sécurité du travailleur. Le travail en espace confiné est l'une des activités les plus dangereuses : il concentre plusieurs risques (asphyxie, intoxication, incendie, explosion, ensevelissement) dans un environnement où l'intervention de secours est difficile. Cette fiche présente la définition, les risques et la méthode de prévention.

## Définition : qu'est-ce qu'un espace confiné ?

Sont généralement considérés comme espaces confinés :

- **cuves, réservoirs, citernes** ;
- **fosses, puisards, regards** ;
- **silo, bunker, trémies** ;
- **tunnels, galeries, conduites** ;
- **locaux techniques** clos et peu ventilés ;
- **cales de navires, conteneurs** fermés.

Trois caractéristiques définissent typiquement un espace confiné :

1. **volume fermé ou partiellement fermé**, non conçu pour une occupation continue ;
2. **accès difficile** (souvent par écoutille, trappe, trou d'homme) ;
3. **ventilation naturelle insuffisante**, ce qui permet l'accumulation de gaz, vapeurs ou poussières dangereux.

## Risques en espace confiné

Les risques en espace confiné sont multiples et souvent combinés.

### Risque d'asphyxie

L'air normal contient ~21 % d'oxygène. En dessous de 19 %, on parle d'atmosphère déficiente en oxygène. En dessous de 6 %, le risque est immédiatement mortel. Les baisses d'oxygène peuvent résulter :

- de la **densité d'un gaz** qui chasse l'oxygène (azote, argon, CO2) ;
- d'une **consommation** par corrosion, fermentation ou activité biologique ;
- d'une **combustion** ou d'une **réaction chimique**.

### Risque toxique

Présence de gaz ou vapeurs toxiques : monoxyde de carbone (CO), sulfure d'hydrogène (H2S), ammoniac, solvants. Les effets peuvent être immédiats (perte de conscience, arrêt respiratoire) ou différés (lésions pulmonaires).

### Risque d'incendie ou d'explosion

Présence d'une **atmosphère explosive** (gaz, vapeurs ou poussières inflammables) dans l'espace confiné. Une étincelle, une source de chaleur, ou même un équipement non conforme peut déclencher l'explosion (cf. [prévention incendie](/pages/prevention-incendie)).

### Risque d'ensevelissement

Travail dans un silo de matières en vrac (céréales, poudres) : l'effondrement du contenu peut ensevelir le travailleur en quelques secondes.

### Risques physiques

- **noyade** (présence d'eau) ;
- **électrocution** (matériels non conformes en ambiance humide) ;
- **chaleur** (températures élevées dans un volume confiné) ;
- **difficulté d'évacuation et de secours**.

## Prévention : permis d'intervention

Le travail en espace confiné exige une **procédure formalisée** (souvent appelée **permis d'intervention** ou **permit to work**) qui s'inscrit dans le cadre plus large du [permis de travail](/pages/permis-de-travail). Les étapes types :

1. **Analyse préalable** des risques (atmosphère, accessibilité, équipements).
2. **Purge, lavage, dégazage** de l'espace avant intervention.
3. **Ventilation** forcée pour maintenir une atmosphère saine.
4. **Mesures atmosphériques** (O2, gaz explosibles, gaz toxiques) avant et pendant l'intervention.
5. **Balisage** de la zone et interdiction d'accès.
6. **Équipements de protection** adaptés (voir ci-dessous).
7. **Surveillance** permanente depuis l'extérieur par un **assistant** formé.
8. **Plan de secours** pré-établi (extraction, oxygénothérapie, alerte).
9. **Coupure des énergies** (électrique, fluides, mécanique) et consignation.

## EPI et équipements

- **Détecteur multicanaux** (O2, explosibilité, CO, H2S) porté par le travailleur ;
- **harnais antichute** avec ligne de vie pour extraction verticale ;
- **appareil respiratoire isolant** si l'atmosphère est non respirable ou non mesurable ;
- **lampe de sécurité** antidéflagrante (ATEX) ;
- **vêtements** adaptés au risque chimique éventuel ;
- **lignes de communication** radio ;
- **moyen d'extraction** (trépied, treuil) à poste fixe.

La surveillance extérieure est **obligatoire** : l'assistant doit pouvoir déclencher le plan de secours sans pénétrer lui-même dans l'espace.

## Réglementation et références

Le travail en espace confiné est encadré par des **principes internationaux** (OIT, ISO 45001) et des **réglementations nationales**. Dans la plupart des pays, l'employeur doit évaluer le risque, mettre en place une procédure formalisée et former les intervenants. Au Maroc, les obligations précises dépendent de la réglementation nationale : consultez les autorités compétentes.

## FAQ

**Quand parle-t-on d'espace confiné ?**
Un espace confiné est un volume fermé ou partiellement fermé, conçu pour une occupation intermittente, à accès difficile et à ventilation naturelle insuffisante.

**Qui peut intervenir en espace confiné ?**
Un travailleur formé spécifiquement, encadré par un assistant formé, dans le cadre d'un permis d'intervention. Une intervention spontanée sans procédure est extrêmement dangereuse et cause encore de nombreux accidents.

**Le harnais est-il obligatoire en espace confiné ?**
Pour les espaces verticaux, oui. Le harnais doit être relié à un point d'ancrage et permettre une extraction rapide.

## Approfondir avec HSE Academy

La sécurité en espace confiné est une **formation spécialisée** de HSE Academy, proposée à la carte ou intégrée au parcours QHSE. Elle couvre les risques, le permis d'intervention, les mesures atmosphériques et le plan de secours.
`,
    faqJson: JSON.stringify([
      { q: 'Quand parle-t-on d\'espace confiné ?', a: "Un espace confiné est un volume fermé ou partiellement fermé, conçu pour une occupation intermittente, à accès difficile et à ventilation naturelle insuffisante." },
      { q: 'Qui peut intervenir en espace confiné ?', a: "Un travailleur formé spécifiquement, encadré par un assistant formé, dans le cadre d'un permis d'intervention. Une intervention spontanée sans procédure est extrêmement dangereuse et cause encore de nombreux accidents." },
      { q: 'Le harnais est-il obligatoire en espace confiné ?', a: "Pour les espaces verticaux, oui. Le harnais doit être relié à un point d'ancrage et permettre une extraction rapide." },
    ]),
  },
  // ==========================================================================
  // 9 — PRÉVENTION INCENDIE
  // ==========================================================================
  {
    slug: 'prevention-incendie',
    title: 'Prévention incendie en milieu professionnel',
    metaTitle: 'Prévention incendie en entreprise : principes et sécurité',
    metaDescription: 'Prévention incendie : triangle du feu, mesures de prévention, détection, désenfumage, extincteurs, plans d\'évacuation et formation des équipes. Fiche HSE Academy.',
    primaryKeyword: 'prévention incendie',
    keywords: 'prévention incendie, sécurité incendie, triangle du feu, extincteur, plan d\'évacuation, désenfumage, équipe première intervention',
    excerpt: 'La prévention incendie vise à réduire le risque d\'éclosion et de propagation d\'un incendie en entreprise par des mesures techniques, organisationnelles et humaines.',
    coverImage: null,
    order: 9,
    showInMenu: true,
    content: `# Prévention incendie en milieu professionnel

La **prévention incendie** est l'ensemble des mesures techniques, organisationnelles et humaines mises en œuvre pour empêcher l'éclosion d'un incendie, limiter sa propagation et permettre l'évacuation des personnes en sécurité. En milieu professionnel, c'est un champ central du [HSE](/pages/hse), souvent structuré autour d'un **plan d'évacuation** et de la formation des équipes à l'intervention.

## Définition : le triangle du feu

Pour qu'un incendie se déclenche et se maintienne, **trois éléments** doivent être simultanément présents. C'est ce qu'on appelle le **triangle du feu** :

1. **Un combustible** : matière pouvant brûler (bois, papier, hydrocarbures, solvants, poussières organiques).
2. **Un comburant** : élément qui entretient la combustion (oxygène de l'air, peroxydes, nitrates).
3. **Une source d'énergie** (ou d'ignition) : flamme, étincelle, chaleur, arc électrique, frottement, source chimique.

La **suppression d'un seul** des trois éléments suffit à empêcher ou à éteindre l'incendie. C'est sur ce principe que reposent toutes les mesures de prévention et d'extinction.

## Étapes de la prévention incendie

### 1. Éviter l'éclosion

Actions pour supprimer la source d'ignition ou éloigner le combustible :

- **maîtriser les sources de chaleur** (postes à souder, chalumeaux) avec **permis de feu** (cf. [permis de travail](/pages/permis-de-travail)) ;
- **interdiction de fumer** dans les zones à risque ;
- **conformité électrique** (cablage protégé, armoires étanches, pas de surcharges) ;
- **stockage sécurisé** des produits inflammables en locaux ventilés dédiés ;
- **entretien préventif** des installations techniques (cf. [EPC](/pages/epc)).

### 2. Limiter la propagation

Si l'incendie démarre, limiter son extension :

- **cloisonnement** des locaux par des parois coupe-feu ;
- **portes coupe-feu** à fermeture automatique ;
- **désenfumage** (extraction des fumées pour éviter l'asphyxie et la surpression explosive) ;
- **séparation** des stockages dangereux ;
- **réduction** de la charge calorifique au minimum nécessaire.

### 3. Détecter et alerter

Détecter l'incendie le plus tôt possible :

- **détecteurs de fumée** et **détecteurs de chaleur** dans les locaux à risque ;
- **système d'alarme** audible dans tout le bâtiment, avec répétiteurs visuels en zone bruyante ;
- **déclenchement automatique** des portes coupe-feu, du désenfumage et de l'extinction automatique (sprinklers) si installés.

### 4. Intervenir

Deux niveaux d'intervention coexistent en entreprise :

- **Équipe de Première Intervention (EPI)** — formée à l'extinction naissante avec extincteurs et RIA (robinets incendie armés).
- **Équipe de Seconde Intervention (ESI)** — formée à l'extinction avancée, souvent avec moyens plus importants (à défaut, intervention des pompiers publics).

Le **permis de feu** est obligatoire pour toute opération par point chaud (soudure, meulage) hors zone dédiée. Voir [permis de travail](/pages/permis-de-travail).

### 5. Évacuer

L'évacuation est la priorité absolue. Elle doit être préparée :

- **plan d'évacuation** affiché dans chaque local ;
- **issues de secours** dégagées, non verrouillées de l'intérieur, signalées ;
- **éclairage de sécurité** et **balisage** lumineux ;
- **exercices d'évacuation** réguliers (au moins annuels, plus souvent dans les ERP et IGH) ;
- **points de rassemblement** identifiés à l'extérieur ;
- **responsables d'évacuation** formés et identifiés (comptage, recherche des absents).

## Extincteurs : types et usage

On distingue plusieurs types d'extincteurs selon la classe de feu :

| Classe | Type de feu | Agent extincteur typique |
|---|---|---|
| A | Solides (bois, papier) | Eau pulvérisée, poudre ABC |
| B | Liquides (hydrocarbures, solvants) | Mousse, poudre ABC, CO2 |
| C | Gaz | Poudre ABC |
| F | Huiles et graisses alimentaires | Mousse spéciale (F) |
| Électrique | Origine électrique | CO2, poudre (hors tension idéalement) |

Les extincteurs doivent être **visibles**, **accessibles**, **vérifiés annuellement** et **remplacés** après usage ou péremption.

## Réglementation et références

La prévention incendie est encadrée par des **principes internationaux** (OIT) et des **réglementations nationales** très détaillées (codes de la construction, réglementation des ERP et des IGH, code du travail). La plupart des pays imposent :

- un **plan d'évacuation** et des exercices réguliers ;
- des **extincteurs** en nombre suffisant et vérifiés ;
- une **formation** des travailleurs à la sécurité incendie ;
- un **registre de sécurité**.

Au Maroc, les obligations précises dépendent de la réglementation nationale : consultez les autorités compétentes (autorités de sécurité civile, inspection du travail). HSE Academy ne publie aucune obligation non sourcée.

## FAQ

**Combien d'extincteurs faut-il en entreprise ?**
Le nombre et la capacité des extincteurs dépendent de la surface, de la classe de risque et de la réglementation nationale applicable. La règle générale est d'en avoir au moins un par niveau et un tous les 200 m² environ, mais cela varie.

**À quand remonte la dernière obligation d'exercice d'évacuation ?**
La plupart des réglementations nationales imposent au moins un exercice par an, parfois plus. Vérifiez la réglementation applicable à votre pays et à votre type d'établissement.

**Qui forme les équipes de première intervention ?**
Des organismes de formation habilités selon le pays (parfois les pompiers eux-mêmes). HSE Academy propose des modules de prévention incendie intégrés à ses parcours QHSE.

## Approfondir avec HSE Academy

HSE Academy propose des **formations à la carte** en prévention incendie, extincteurs, plan d'évacuation et gestion d'urgence, intégrées à ses parcours diplômants QHSE pour les [responsables HSE](/pages/responsable-hse).
`,
    faqJson: JSON.stringify([
      { q: 'Combien d\'extincteurs faut-il en entreprise ?', a: "Le nombre et la capacité des extincteurs dépendent de la surface, de la classe de risque et de la réglementation nationale applicable. La règle générale est d'en avoir au moins un par niveau et un tous les 200 m² environ, mais cela varie." },
      { q: 'À quand remonte la dernière obligation d\'exercice d\'évacuation ?', a: "La plupart des réglementations nationales imposent au moins un exercice par an, parfois plus. Vérifiez la réglementation applicable à votre pays et à votre type d'établissement." },
      { q: 'Qui forme les équipes de première intervention ?', a: "Des organismes de formation habilités selon le pays (parfois les pompiers eux-mêmes). HSE Academy propose des modules de prévention incendie intégrés à ses parcours QHSE." },
    ]),
  },

  // ==========================================================================
  // 10 — PLAN DE PRÉVENTION
  // ==========================================================================
  {
    slug: 'plan-de-prevention',
    title: 'Plan de prévention : objectif et méthode',
    metaTitle: 'Plan de prévention : objectif, contenu et quand l\'établir',
    metaDescription: 'Plan de prévention : document obligatoire en cas de co-activité entre une entreprise utilisatrice et un prestataire. Objectif, contenu, étapes de mise en place.',
    primaryKeyword: 'plan de prévention',
    keywords: 'plan de prévention, co-activité, prestataire, entreprise extérieure, intervention, document de sécurité, protocole de sécurité',
    excerpt: 'Le plan de prévention est un document contractuel qui organise la co-activité entre une entreprise utilisatrice et une entreprise extérieure afin de prévenir les risques d\'interférence.',
    coverImage: null,
    order: 10,
    showInMenu: true,
    content: `# Plan de prévention : objectif et méthode

Un **plan de prévention** est un document contractuel qui organise la co-activité entre une **entreprise utilisatrice** (celle qui accueille) et une ou plusieurs **entreprises extérieures** (prestataires, sous-traitants) intervenant sur le même site. Son objectif est d'**identifier et de prévenir les risques d'interférence** entre les activités, les équipements et les travailleurs des différentes entreprises. C'est l'un des documents les plus importants de la coordination HSE en cas d'intervention extérieure.

## Définition : quand parle-t-on de plan de prévention ?

Le plan de prévention est généralement exigé :

- lorsqu'une entreprise extérieure intervient dans les locaux d'une entreprise utilisatrice ;
- lorsque l'intervention présente un **risque d'interférence** entre les activités des deux entreprises ;
- pour des opérations de **travaux** (maintenance, nettoyage, BTP, chaudronnerie, etc.).

La notion voisine de **protocole de sécurité** s'applique souvent aux opérations de chargement/déchargement et de livraison. Les deux documents ont le même objectif : structurer la co-activité et prévenir les risques.

Dans la plupart des pays, ces obligations relèvent de la **réglementation nationale** sur la sécurité et la santé au travail. Au Maroc, les obligations précises dépendent de la législation nationale : consultez les autorités compétentes.

## Pourquoi un plan de prévention ?

La co-activité crée des risques spécifiques que ni l'entreprise utilisatrice ni l'entreprise extérieure ne peuvent prévoir seuls. Par exemple :

- un prestataire travaille en hauteur pendant que l'entreprise utilisatrice continue sa production en contre-bas ;
- une intervention électrique pendant qu'une autre équipe travaille sur le même site ;
- des produits dangereux présents dans la zone d'intervention ;
- des consignes de sécurité différentes entre les deux entreprises.

Le plan de prévention identifie ces **risques d'interférence** et définit les **mesures de prévention** communes.

## Contenu typique d'un plan de prévention

Un plan de prévention comporte en général :

1. **Identification** des entreprises (utilisatrice et extérieures), de leurs représentants et des coordonnées d'urgence.
2. **Adresse et localisation** précise de l'intervention.
3. **Descriptif** de l'intervention (nature, durée, horaires).
4. **Identification des risques** propres à chaque entreprise et **risques d'interférence**.
5. **Mesures de prévention** communes :
   - balisage et accès ;
   - consignation des énergies (cf. [permis de travail](/pages/permis-de-travail)) ;
   - protections collectives ([EPC](/pages/epc)) et protections individuelles ([EPI](/pages/epi)) ;
   - gestion des déchets et des produits dangereux.
6. **Permis spécifiques** nécessaires (permis de feu, permis électrique, permis de travail en hauteur, permis d'intervention en [espace confiné](/pages/espaces-confines)).
7. **Consignes en cas d'incident** (alerte, secours, évacuation).
8. **Information et formation** des intervenants.
9. **Date et signatures** des deux parties.

## Méthode : les étapes de mise en place

### Étape 1 — Inspection commune préalable

Avant le début de l'intervention, les représentants des deux entreprises inspectent ensemble le lieu d'intervention et identifient les risques. Cette inspection est **obligatoire** dans la plupart des réglementations nationales.

### Étape 2 — Rédaction du plan

Le plan est rédigé à l'issue de l'inspection, par l'entreprise utilisatrice en lien avec l'entreprise extérieure. Il peut être adapté à chaque intervention ou repris d'une intervention à l'autre s'il s'agit d'une opération récurrente.

### Étape 3 — Information des travailleurs

Le plan doit être **porté à la connaissance** des travailleurs des deux entreprises avant le début de l'intervention. Une réunion de démarrage est fréquente.

### Étape 4 — Suivi pendant l'intervention

Le plan est **évolutif**. Si une nouvelle activité ou un nouveau risque apparaît, il doit être révisé en commun. À tout moment, l'un ou l'autre peut **suspendre l'intervention** en cas de danger grave.

### Étape 5 — Bilan en fin d'intervention

Un bilan est réalisé en fin d'intervention pour vérifier que les opérations se sont déroulées conformément au plan et pour capitaliser sur l'expérience (retour d'expérience).

## Distinction entre plan de prévention et permis de travail

| Plan de prévention | Permis de travail |
|---|---|
| Document **contractuel** entre deux entreprises | Document **d'autorisation** pour une opération à haut risque |
| Organise la **co-activité** sur la durée de l'intervention | Autorise une **opération précise** à un instant T |
| Portée : site / intervention | Portée : opération / poste |
| Voir [plan de prévention](/pages/plan-de-prevention) | Voir [permis de travail](/pages/permis-de-travail) |

Les deux documents sont **complémentaires** : un plan de prévention peut nécessiter plusieurs permis de travail pour les opérations à haut risque identifiées.

## Réglementation et références

Le plan de prévention relève de **principes internationaux** de coordination des activités (OIT) et de **réglementations nationales** qui précisent son contenu, son étendue et les cas où il est obligatoire. HSE Academy recommande toujours de se référer à la réglementation applicable dans le pays d'implantation.

## FAQ

**Quand doit-on établir un plan de prévention ?**
Lorsqu'une entreprise extérieure intervient dans les locaux d'une entreprise utilisatrice et que l'intervention présente un risque d'interférence. La portée exacte dépend de la réglementation nationale.

**Qui rédige le plan de prévention ?**
Il est rédigé conjointement par l'entreprise utilisatrice et l'entreprise extérieure, à l'issue d'une inspection commune. Les deux parties le signent.

**Le plan de prévention remplace-t-il le permis de travail ?**
Non, ce sont deux documents complémentaires. Le plan organise la co-activité, le permis autorise une opération précise à haut risque.

## Approfondir avec HSE Academy

La coordination des activités, la rédaction de plans de prévention et l'analyse des risques d'interférence sont des compétences centrales du [responsable HSE](/pages/responsable-hse). HSE Academy les traite dans ses parcours diplômants QHSE.
`,
    faqJson: JSON.stringify([
      { q: 'Quand doit-on établir un plan de prévention ?', a: "Lorsqu'une entreprise extérieure intervient dans les locaux d'une entreprise utilisatrice et que l'intervention présente un risque d'interférence. La portée exacte dépend de la réglementation nationale." },
      { q: 'Qui rédige le plan de prévention ?', a: "Il est rédigé conjointement par l'entreprise utilisatrice et l'entreprise extérieure, à l'issue d'une inspection commune. Les deux parties le signent." },
      { q: 'Le plan de prévention remplace-t-il le permis de travail ?', a: "Non, ce sont deux documents complémentaires. Le plan organise la co-activité, le permis autorise une opération précise à haut risque." },
    ]),
  },

  // ==========================================================================
  // 11 — PERMIS DE TRAVAIL
  // ==========================================================================
  {
    slug: 'permis-de-travail',
    title: 'Permis de travail : quand et comment l\'établir',
    metaTitle: 'Permis de travail : définition, quand l\'établir et contenu',
    metaDescription: 'Permis de travail : document d\'autorisation pour interventions à haut risque (travail en hauteur, espaces confinés, électricité, feu). Définition, contenu, validation.',
    primaryKeyword: 'permis de travail',
    keywords: 'permis de travail, permis d\'intervention, autorisation de travail, travail à risque, permis feu, permis électrique, permis de plongée',
    excerpt: 'Le permis de travail est un document écrit qui autorise et encadre une opération à haut risque. Il garantit que toutes les mesures de prévention ont été prises avant le début de l\'intervention.',
    coverImage: null,
    order: 11,
    showInMenu: true,
    content: `# Permis de travail : quand et comment l'établir

Un **permis de travail** (en anglais *permit to work*) est un document écrit, formalisé, qui autorise une personne ou une équipe à réaliser une opération à haut risque, dans un périmètre et pour une durée définis. Il formalise le fait que **toutes les mesures de prévention** ont été identifiées et mises en place **avant** le début de l'intervention. Il est central dans la gestion des opérations dangereuses en entreprise industrielle, tertiaire ou BTP.

## Définition : qu'est-ce qu'un permis de travail ?

Le permis de travail n'est pas un simple document administratif. Il a trois fonctions :

- **Autoriser** une opération précise, à un moment précis, par une personne formée.
- **Vérifier** que les mesures de prévention sont en place (consignation, ventilation, balisage, EPI).
- **Tracer** l'opération et en garder une trace écrite (audit, retour d'expérience, analyse en cas d'incident).

Il s'agit d'un document à **durée limitée** (souvent une demi-journée ou une journée), propre à une opération, et révocable à tout moment si les conditions changent.

## Quand un permis de travail est-il requis ?

Le permis de travail est requis pour les opérations à haut risque, notamment :

- **travail en hauteur** (cf. [travail en hauteur](/pages/travail-en-hauteur)) ;
- **travail en espace confiné** (cf. [espaces confinés](/pages/espaces-confines)) ;
- **travail à chaud** (soudage, meulage, découpe) — souvent nommé **permis de feu** ;
- **intervention sur installation électrique** — souvent **permis de travail électrique** ou **consignation** ;
- **intervention sur installations dangereuses** (pressurisées, chimiques, thermiques) ;
- **travaux souterrains**, **travaux en mer**, **plongée** ;
- **interventions en zone ATEX** (atmosphère explosive) ;
- **démolition**, **manutention exceptionnelle**.

La liste exacte dépend de l'entreprise et de la **réglementation nationale** applicable. Au Maroc, les obligations précises dépendent de la réglementation nationale : consultez les autorités compétentes.

## Contenu typique d'un permis de travail

Un permis de travail contient en général :

1. **Identification** de l'opération (nature, lieu, date, heure de début et de fin prévue).
2. **Identification** des intervenants (nom, entreprise, qualifications, habilitations).
3. **Descriptif précis** de l'opération à réaliser.
4. **Analyse des risques** spécifiques à l'opération (cf. [Analyse des risques](/pages/analyse-des-risques)).
5. **Mesures de prévention** mises en place :
   - consignation des énergies (électrique, fluides, mécaniques) ;
   - balisage et signalisation ;
   - [EPC](/pages/epc) en place ;
   - [EPI](/pages/epi) requis ;
   - ventilation, mesures atmosphériques (cf. [espaces confinés](/pages/espaces-confines)).
6. **Procédures d'urgence** (alerte, secours, évacuation).
7. **Visas** de l'opérateur, du donneur d'ordre, du responsable HSE, et parfois de l'exploitant.
8. **Clôture** en fin d'intervention (état final, retour d'expérience).

## Types courants de permis

| Type | Périmètre |
|---|---|
| Permis de feu | Opérations à chaud (soudage, meulage, découpe) hors zone dédiée |
| Permis électrique | Intervention sur installation électrique (HTA, HTB, BT selon le pays) |
| Permis de hauteur | Travail en hauteur sans EPC suffisant (harnais antichute) |
| Permis d'intervention en espace confiné | Entrée en fosse, cuve, silo, etc. |
| Permis d'intervention ATEX | Intervention en zone explosive |
| Permis de levage | Levage de charges avec grue, pont roulant |

## Validation et signatures

Le permis est généralement signé par :

- l'**opérateur** qui réalise l'opération (atteste avoir compris les risques et mesures) ;
- le **donneur d'ordre** ou **responsable de l'installation** (autorise l'opération) ;
- le **responsable HSE** ou coordonnateur (vérifie la conformité des mesures de prévention) ;
- parfois l'**exploitant** de l'installation (notamment en industrie de process).

Aucune signature ne peut être **a posteriori** : le permis doit être signé **avant** le début de l'intervention.

## Suspension et clôture

Le permis peut être **suspendu** à tout moment par l'un des signataires (changement de conditions, alerte, incident). L'opération doit alors être interrompue. À la fin de l'intervention, le permis est **clôturé** : l'opérateur restitue le permis, les énergies sont déconsignées si nécessaire, l'état final est constaté.

## Réglementation et références

Le permis de travail s'inscrit dans les **principes internationaux** de gestion des opérations dangereuses (OIT, ISO 45001) et les **réglementations nationales**. Dans certains pays, des permis spécifiques sont encadrés par la loi (permis de feu, permis électrique, permis de plongée, etc.). HSE Academy ne formule aucune obligation non vérifiable et recommande de toujours se référer à la réglementation nationale.

## FAQ

**Le permis de travail est-il obligatoire pour toute intervention ?**
Non. Il est requis pour les opérations à haut risque, identifiées par l'évaluation des [risques professionnels](/pages/risques-professionnels) de l'entreprise.

**Qui signe le permis de travail ?**
L'opérateur, le donneur d'ordre et le responsable HSE (au minimum). En industrie de process, l'exploitant de l'installation signe également.

**Un permis de travail peut-il être prolongé ?**
Oui, mais uniquement par une nouvelle signature avant la fin de la période initiale. Sans prolongation signée, l'opération doit s'arrêter.

## Approfondir avec HSE Academy

La rédaction, la validation et le contrôle des permis de travail sont des compétences clés du [responsable HSE](/pages/responsable-hse). HSE Academy forme à ces pratiques dans ses parcours diplômants QHSE.
`,
    faqJson: JSON.stringify([
      { q: 'Le permis de travail est-il obligatoire pour toute intervention ?', a: "Non. Il est requis pour les opérations à haut risque, identifiées par l'évaluation des risques professionnels de l'entreprise." },
      { q: 'Qui signe le permis de travail ?', a: "L'opérateur, le donneur d'ordre et le responsable HSE (au minimum). En industrie de process, l'exploitant de l'installation signe également." },
      { q: 'Un permis de travail peut-il être prolongé ?', a: "Oui, mais uniquement par une nouvelle signature avant la fin de la période initiale. Sans prolongation signée, l'opération doit s'arrêter." },
    ]),
  },

  // ==========================================================================
  // 12 — ANALYSE DES RISQUES
  // ==========================================================================
  {
    slug: 'analyse-des-risques',
    title: 'Analyse des risques : méthodologie (ARP, HAZOP, etc.)',
    metaTitle: 'Analyse des risques : méthodes (ARP, HAZOP, What-if) et étapes',
    metaDescription: 'Analyse des risques professionnels : méthodes (ARP, HAZOP, What-if, MOSAR), étapes (identification, évaluation, hiérarchisation) et livrables. Fiche HSE Academy.',
    primaryKeyword: 'analyse des risques',
    keywords: 'analyse des risques, évaluation des risques, ARP, HAZOP, What-if, MOSAR, matrice des risques, document unique, DUERP',
    excerpt: 'L\'analyse des risques est une démarche structurée qui permet d\'identifier, d\'évaluer et de hiérarchiser les risques professionnels afin de définir des actions de prévention adaptées.',
    coverImage: null,
    order: 12,
    showInMenu: true,
    content: `# Analyse des risques : méthodologie (ARP, HAZOP, etc.)

L'**analyse des risques** est une démarche structurée qui permet d'identifier, d'évaluer et de hiérarchiser les [risques professionnels](/pages/risques-professionnels) d'une activité, d'un poste ou d'une installation, afin de définir des actions de prévention adaptées. Elle est au cœur de la démarche [HSE](/pages/hse) et constitue l'une des missions centrales du [responsable HSE](/pages/responsable-hse). Sans analyse des risques, il n'y a pas de prévention efficace : on ne peut prévenir que ce qu'on a identifié.

## Définition : évaluer vs analyser

Il faut distinguer deux notions souvent confondues :

- **Évaluation des risques** : démarche globale qui vise à estimer le niveau d'un risque (probabilité × gravité) pour le hiérarchiser.
- **Analyse des risques** : démarche plus fine qui examine en détail les mécanismes d'apparition d'un risque (scénarios, combinaisons de causes, enchaînements d'événements) pour identifier les mesures de prévention les plus pertinentes.

Les deux sont **complémentaires** : on évalue pour prioriser, on analyse pour traiter.

## Les étapes d'une analyse des risques

### 1. Cadrage

Avant toute chose, on définit le **périmètre** de l'analyse (un poste, une opération, une installation, un projet), les **objectifs** (préventif, projet, audit), les **méthodes** à utiliser et les **compétences** nécessaires (équipe pluridisciplinaire).

### 2. Identification des dangers et des risques

On recense :

- les **dangers** présents dans le périmètre (substances, énergies, situations) ;
- les **risques** associés à chaque danger ;
- les **situations d'exposition** (fréquence, durée, population concernée).

On s'appuie sur l'observation, l'expérience des opérateurs, l'historique des incidents, les retours d'expérience et des **méthodes** comme l'ARP (voir plus bas).

### 3. Évaluation

Pour chaque risque identifié, on estime :

- la **probabilité** d'occurrence (rare, possible, fréquente, etc.) ;
- la **gravité** du dommage potentiel (mineure, sérieuse, majeure, catastrophique) ;
- la **cinétique** (rapidité d'apparition du dommage — quelques méthodes l'intègrent).

On reporte ces évaluations dans une **matrice des risques** (probabilité × gravité) pour obtenir un niveau de risque (faible, modéré, élevé, inacceptable).

### 4. Hiérarchisation

On classe les risques par ordre de priorité. Les risques **inacceptables** sont traités en priorité, avec un échéancier et un responsable.

### 5. Plan d'action

Pour chaque risque prioritaire, on définit des actions de prévention selon la **hiérarchie des contrôles** (voir [EPI](/pages/epi) et [EPC](/pages/epc)) :

1. **Élimination** du danger ;
2. **Substitution** ;
3. **Protections collectives** ([EPC](/pages/epc)) ;
4. **Protections individuelles** ([EPI](/pages/epi)) ;
5. **Mesures organisationnelles** (formation, consignes).

### 6. Suivi et révision

L'analyse est **revue** à intervalle régulier, et à chaque modification importante (nouveau procédé, nouvel équipement, retour d'incident). Elle est **tracée** dans un document (souvent appelé **document unique d'évaluation des risques** — DUERP en France, équivalent national ailleurs).

## Méthodes d'analyse des risques

### ARP — Analyse des Risques par le Poste

Méthode **inventoriée** qui examine systématiquement toutes les **familles de risques** (physique, chimique, biologique, ergonomique, psychosocial, sécurité) pour un poste donné. Elle est particulièrement adaptée aux **postes de travail** et aux analyses transversales d'un atelier.

### HAZOP — Hazard and Operability Study

Méthode systématique qui examine les **écarts** par rapport aux paramètres de conception d'un procédé (pression, température, débit, etc.). Pour chaque écart, on identifie les causes, les conséquences et les mesures de prévention. HAZOP est utilisée dans l'industrie de procédé (chimie, pétrochimie, pharmacie).

### What-if / Check-list

Méthode **qualitative** qui consiste à se poser une série de questions « Et si... ? » (What if pressure exceeds the design value ? What if the operator forgets step X ?). Plus simple que HAZOP, elle est adaptée aux analyses préliminaires.

### MOSAR — Méthode Organisée Systémique d'Analyse des Risques

Méthode **systémique** qui décompose le système en sous-systèmes et analyse les scénarios d'accidents, les barrières de sécurité et leur combinaison. Utilisée dans les installations à grand risque.

### AMDEC — Analyse des Modes de Défaillance, de leurs Effets et de leur Criticité

Méthode **défaillance** qui examine chaque composant d'un système, identifie les modes de défaillance possibles et leurs effets. Adaptée à l'analyse de fiabilité des équipements.

### Arbre de défaillances / Arbre d'événements

Méthodes **déductives** (arbre de défaillances) ou **inductives** (arbre d'événements) qui relient un événement indésirable à ses causes ou à ses conséquences. Utilisées pour les scénarios complexes.

### Matrice des risques

La matrice des risques (probabilité × gravité) n'est pas une méthode d'analyse à proprement parler, mais un **outil de hiérarchisation** des résultats. Sa taille (3×3, 5×5, 4×4) dépend du contexte.

## Choisir la bonne méthode

| Méthode | Quand l'utiliser | Taille / Complexité |
|---|---|---|
| ARP | Analyse d'un poste ou d'un atelier | Simple à intermédiaire |
| What-if | Analyse préliminaire d'une opération | Simple |
| Check-list | Vérification systématique d'un poste | Simple |
| HAZOP | Conception d'un procédé (chimie, pétrole) | Complexe |
| MOSAR | Installation à haut risque (Seveso-like) | Complexe |
| AMDEC | Fiabilité d'un équipement | Intermédiaire |
| Arbre de défaillances | Scénario d'accident complexe | Complexe |

Le choix dépend du **niveau de risque**, de la **complexité** du système et des **compétences** disponibles.

## Réglementation et références

L'analyse des risques est encadrée par des **principes internationaux** (OIT, ISO 45001) et des **réglementations nationales** qui imposent dans la plupart des pays un **document d'évaluation des risques** à jour, tenu à disposition des travailleurs et de l'inspection. Au Maroc, les obligations précises dépendent de la réglementation nationale : consultez les autorités compétentes. HSE Academy ne publie aucune obligation non sourcée.

## FAQ

**Quand faut-il refaire une analyse des risques ?**
À intervalle régulier (souvent annuel), à chaque modification importante (nouvel équipement, nouveau procédé), et après tout incident significatif.

**Quelle méthode pour une PME ?**
L'ARP est souvent adaptée pour les PME : elle couvre toutes les familles de risques et ne nécessite pas d'outils complexes. Une matrice des risques 3×3 ou 4×4 suffit pour prioriser.

**Qui réalise l'analyse des risques ?**
Une équipe pluridisciplinaire (opérateurs, maintenance, HSE, encadrement) animée par le [responsable HSE](/pages/responsable-hse) ou un consultant formé. L'analyse n'est jamais un exercice individuel.

## Approfondir avec HSE Academy

Les méthodes d'analyse des risques sont enseignées dans tous les parcours HSE Academy, du Technicien QHSE (ARP, matrice des risques) au Master Professionnel QHSE (HAZOP, MOSAR, arbres de défaillances). HSE Academy propose aussi des formations courtes à la carte sur chaque méthode.
`,
    faqJson: JSON.stringify([
      { q: 'Quand faut-il refaire une analyse des risques ?', a: "À intervalle régulier (souvent annuel), à chaque modification importante (nouvel équipement, nouveau procédé), et après tout incident significatif." },
      { q: 'Quelle méthode pour une PME ?', a: "L'ARP est souvent adaptée pour les PME : elle couvre toutes les familles de risques et ne nécessite pas d'outils complexes. Une matrice des risques 3x3 ou 4x4 suffit pour prioriser." },
      { q: 'Qui réalise l\'analyse des risques ?', a: "Une équipe pluridisciplinaire (opérateurs, maintenance, HSE, encadrement) animée par le responsable HSE ou un consultant formé. L'analyse n'est jamais un exercice individuel." },
    ]),
  },
];

// ============================================================================
// Exécution — upsert sur le slug (idempotent, ré-exécuter met à jour)
// ============================================================================
async function main() {
  console.log(`Insertion de ${seoPages.length} pages SEO...`);
  for (const p of seoPages) {
    await db.page.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        content: p.content,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
        primaryKeyword: p.primaryKeyword,
        keywords: p.keywords,
        excerpt: p.excerpt,
        coverImage: p.coverImage,
        faqJson: p.faqJson,
        published: true,
        order: p.order,
        showInMenu: p.showInMenu,
      },
      create: {
        slug: p.slug,
        title: p.title,
        content: p.content,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
        primaryKeyword: p.primaryKeyword,
        keywords: p.keywords,
        excerpt: p.excerpt,
        coverImage: p.coverImage,
        faqJson: p.faqJson,
        published: true,
        order: p.order,
        showInMenu: p.showInMenu,
      },
    });
    console.log(`  ✓ /pages/${p.slug} — ${p.title}`);
  }
  console.log(`\n✅ ${seoPages.length} pages SEO insérées avec succès`);
}

main()
  .catch((e) => { console.error('Erreur:', e); process.exit(1); })
  .finally(() => db.$disconnect());
