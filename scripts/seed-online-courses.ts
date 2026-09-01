import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const COURSES = [
  {
    title: 'Introduction à la QHSE',
    slug: 'introduction-qhse',
    description: 'Découvrez les fondamentaux de la démarche Qualité, Hygiène, Sécurité et Environnement. Ce cours vous donnera une vue d\'ensemble complète du management QHSE, ses enjeux stratégiques, et son rôle essentiel dans la performance des entreprises modernes.',
    shortDescription: 'Les fondamentaux du management Qualité, Hygiène, Sécurité et Environnement.',
    totalHours: '2h30',
    icon: 'BookOpen',
    order: 1,
    chapters: [
      {
        title: 'Définition et enjeux de la QHSE',
        content: `# Définition et enjeux de la QHSE

## Qu'est-ce que la QHSE ?

La **QHSE** est un acronyme qui désigne **Qualité, Hygiène, Sécurité et Environnement**. Il s'agit d'une approche de management intégré qui vise à assurer la conformité réglementaire, la protection des personnes et de l'environnement, et l'amélioration continue de la performance organisationnelle.

### Les quatre piliers de la QHSE

| Pilier | Définition | Objectif principal |
|--------|-----------|-------------------|
| **Qualité** | Satisfaction des exigences des clients et parties intéressées | Améliorer la satisfaction client et la conformité |
| **Hygiène** | Prévention des risques liés à la santé au travail | Protéger la santé des travailleurs |
| **Sécurité** | Prévention des accidents et incidents de travail | Réduire les risques d'accidents |
| **Environnement** | Maîtrise des impacts environnementaux de l'activité | Réduire l'empreinte environnementale |

## Pourquoi la QHSE est-elle importante ?

La démarche QHSE est devenue un **impératif stratégique** pour les entreprises de toutes tailles. Ses principaux enjeux sont :

- **Juridique** : Respect des lois et réglementations en vigueur
- **Économique** : Réduction des coûts liés aux accidents, maladies professionnelles, et non-qualité
- **Social** : Protection de la santé et de la sécurité des travailleurs
- **Image** : Amélioration de la réputation et de la crédibilité de l'entreprise
- **Compétitivité** : Atout différenciateur sur les marchés nationaux et internationaux

## Les référentiels internationaux

La QHSE s'appuie sur des normes internationales reconnues :

- **ISO 9001** : Système de management de la qualité
- **ISO 14001** : Système de management environnemental
- **ISO 45001** : Système de management de la santé et de la sécurité au travail

Ces normes partagent une structure commune (High Level Structure) permettant une intégration efficace des différents systèmes de management.`,
        questions: [
          { question: 'Que signifie l\'acronyme QHSE ?', options: ['Qualité, Hygiène, Sécurité, Environnement', 'Qualité, Habitabilité, Sécurité, Énergie', 'Quantité, Hygiène, Santé, Environnement', 'Qualité, Homologation, Sécurité, Évaluation'], correctIndex: 0, explanation: 'QHSE signifie Qualité, Hygiène, Sécurité et Environnement.' },
          { question: 'Quel est l\'objectif principal du pilier Qualité ?', options: ['Augmenter les profits', 'Satisfaire les exigences des clients', 'Réduire les coûts de production', 'Recruter plus de personnel'], correctIndex: 1, explanation: 'Le pilier Qualité vise la satisfaction des exigences des clients.' },
          { question: 'Quelle norme ISO concerne le management environnemental ?', options: ['ISO 9001', 'ISO 45001', 'ISO 14001', 'ISO 22000'], correctIndex: 2, explanation: 'ISO 14001 est la norme pour le management environnemental.' },
          { question: 'La QHSE est-elle uniquement un enjeu juridique ?', options: ['Oui, c\'est son seul rôle', 'Non, c\'est aussi un enjeu économique, social et stratégique', 'Oui, mais uniquement pour les grandes entreprises', 'Non, c\'est uniquement un enjeu marketing'], correctIndex: 1, explanation: 'La QHSE est un impératif multidimensionnel.' },
          { question: 'Quelle norme ISO traite de la santé et sécurité au travail ?', options: ['ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 22000'], correctIndex: 2, explanation: 'ISO 45001 est la norme pour la SST.' },
          { question: 'Qu\'est-ce que la High Level Structure (HLS) ?', options: ['Une réglementation européenne', 'Une structure commune aux normes ISO', 'Un document interne', 'Un type d\'audit'], correctIndex: 1, explanation: 'La HLS est une structure commune facilitant l\'intégration des normes ISO.' },
          { question: 'Quel pilier QHSE vise à réduire l\'empreinte carbone ?', options: ['Qualité', 'Hygiène', 'Sécurité', 'Environnement'], correctIndex: 3, explanation: 'Le pilier Environnement vise à réduire les impacts environnementaux.' },
          { question: 'La QHSE concerne-t-elle les petites entreprises ?', options: ['Non, uniquement les grandes', 'Oui, toutes les entreprises', 'Uniquement les entreprises industrielles', 'Uniquement le BTP'], correctIndex: 1, explanation: 'La QHSE concerne toutes les entreprises quelle que soit leur taille.' },
          { question: 'L\'enjeu social de la QHSE porte sur ?', options: ['La rentabilité financière', 'La protection de la santé et sécurité des travailleurs', 'Le développement de produits', 'La communication externe'], correctIndex: 1, explanation: 'L\'enjeu social concerne la protection des travailleurs.' },
          { question: 'Combien de piliers composent la QHSE ?', options: ['Deux', 'Trois', 'Quatre', 'Cinq'], correctIndex: 2, explanation: 'La QHSE a 4 piliers : Qualité, Hygiène, Sécurité, Environnement.' },
        ],
      },
      {
        title: 'Histoire et évolution de la QHSE',
        content: `# Histoire et évolution de la QHSE

## Les origines historiques

### XIXe siècle : Les prémices
- **Révolution industrielle** : Apparition de nouveaux risques
- **1841** : Première loi française sur le travail des enfants
- **1893** : Loi sur la sécurité des travailleurs

### XXe siècle : La structuration
- **1947** : Création de l'ISO
- **1987** : Publication de la norme ISO 9001 (première version)
- **1996** : Publication d'ISO 14001
- **2018** : ISO 45001 remplace OHSAS 18001

## L'évolution vers le management intégré

Les entreprises ont compris que gérer séparément la qualité, la sécurité et l'environnement était moins efficace qu'une **approche intégrée**. Le management QHSE intégré permet de réduire les redondances, d'harmoniser les processus et de mutualiser les ressources.

## Les grandes catastrophes et leur impact

| Année | Événement | Impact |
|-------|-----------|--------|
| 1976 | Seveso (Italie) | Directive Seveso |
| 1984 | Bhopal (Indie) | Réglementation chimique |
| 1986 | Tchernobyl | Normes nucléaires |
| 2010 | Deepwater Horizon | Réglementation offshore |`,
        questions: [
          { question: 'En quelle année l\'ISO a-t-elle été créée ?', options: ['1920', '1947', '1960', '1987'], correctIndex: 1, explanation: 'L\'ISO a été créée en 1947.' },
          { question: 'Quelle catastrophe a conduit à la directive Seveso ?', options: ['Bhopal', 'Tchernobyl', 'Seveso (1976)', 'Deepwater Horizon'], correctIndex: 2, explanation: 'La catastrophe de Seveso en 1976 a conduit à la directive Seveso.' },
          { question: 'Qu\'est-ce que le rapport Brundtland (1987) ?', options: ['Un rapport sur la qualité', 'Le rapport fondateur du développement durable', 'Une norme ISO', 'Une directive européenne'], correctIndex: 1, explanation: 'Le rapport Brundtland a défini le concept de développement durable.' },
          { question: 'Quelle norme a été remplacée par ISO 45001 ?', options: ['ISO 9001', 'ISO 14001', 'OHSAS 18001', 'ISO 22000'], correctIndex: 2, explanation: 'ISO 45001 a remplacé OHSAS 18001 en 2018.' },
          { question: 'Quel est l\'avantage du management QHSE intégré ?', options: ['Augmenter les coûts', 'Réduire les redondances', 'Supprimer le personnel', 'Éviter les audits'], correctIndex: 1, explanation: 'Le management intégré réduit les redondances et harmonise les processus.' },
          { question: 'La catastrophe de Bhopal concernait quel secteur ?', options: ['Nucléaire', 'Pétrolier', 'Chimique', 'Minier'], correctIndex: 2, explanation: 'Bhopal était une catastrophe chimique.' },
          { question: 'Quand a été publiée la première ISO 9001 ?', options: ['1960', '1975', '1987', '2000'], correctIndex: 2, explanation: 'La première ISO 9001 date de 1987.' },
          { question: 'La prise de conscience environnementale des années 60 est liée à ?', options: ['La découverte du pétrole', 'Les travaux de Rachel Carson et le Club de Rome', 'La création de l\'ONU', 'La guerre froide'], correctIndex: 1, explanation: 'Rachel Carson et le Club de Rome ont accéléré cette prise de conscience.' },
          { question: 'Deepwater Horizon (2010) a impacté quelle réglementation ?', options: ['Nucléaire', 'Chimique', 'Offshore pétrolier', 'Aérienne'], correctIndex: 2, explanation: 'Deepwater Horizon a renforcé la réglementation offshore.' },
          { question: 'La première loi sur le travail des enfants date de ?', options: ['1800', '1841', '1893', '1936'], correctIndex: 1, explanation: 'Elle date de 1841.' },
        ],
      },
      {
        title: 'Les acteurs de la QHSE',
        content: `# Les acteurs de la QHSE

## Les acteurs internes

### La direction générale
La direction a la **responsabilité ultime** de la politique QHSE : définir la politique, allouer les ressources, s'impliquer et montrer l'exemple.

### Le responsable QHSE
Le responsable QHSE est le **pilote** du système : mettre en place le SMQHSE, coordonner les audits, former le personnel et rendre compte à la direction.

### Les salariés
Chaque salarié est un **acteur essentiel** : respecter les procédures, participer aux formations, signaler les dangers et proposer des améliorations.

### Le CSE
Le Comité Social et Économique participe à la prévention des risques et dispose d'un **droit d'alerte** en cas de danger grave et imminent.

## Les acteurs externes

- **Inspection du travail** : Contrôle du code du travail
- **DREAL** : Environnement et aménagement
- **ARS** : Santé publique
- **ISO/AFNOR** : Normalisation
- **Organismes de certification** : Délivrance des certificats

## La culture QHSE

Une démarche QHSE efficace repose sur une **culture de sécurité** partagée : engagement de la direction, communication transparente, participation active et amélioration continue.`,
        questions: [
          { question: 'Qui a la responsabilité ultime de la politique QHSE ?', options: ['Le responsable QHSE', 'La direction générale', 'Les salariés', 'Le CSE'], correctIndex: 1, explanation: 'La direction générale a la responsabilité ultime.' },
          { question: 'Quel est le rôle du responsable QHSE ?', options: ['Produire les biens', 'Piloter le système QHSE', 'Recruter du personnel', 'Gérer la comptabilité'], correctIndex: 1, explanation: 'Le responsable QHSE pilote le système de management.' },
          { question: 'Les salariés doivent ?', options: ['Uniquement travailler', 'Respecter les procédures et signaler les dangers', 'Uniquement signaler les accidents graves', 'Gérer le budget'], correctIndex: 1, explanation: 'Les salariés doivent respecter les procédures et signaler les dangers.' },
          { question: 'Quel organisme délivre les certificats ISO ?', options: ['Le gouvernement', 'Les organismes de certification accrédités', 'L\'inspection du travail', 'Les syndicats'], correctIndex: 1, explanation: 'Les organismes de certification accrédités délivrent les certificats.' },
          { question: 'Que signifie CSE ?', options: ['Comité de Sécurité Environnementale', 'Comité Social et Économique', 'Centre de Santé d\'Entreprise', 'Conseil de Sécurité Européen'], correctIndex: 1, explanation: 'CSE = Comité Social et Économique.' },
          { question: 'La DREAL est responsable de ?', options: ['La sécurité routière', 'L\'environnement et l\'aménagement', 'La santé publique', 'L\'éducation'], correctIndex: 1, explanation: 'La DREAL gère l\'environnement et l\'aménagement.' },
          { question: 'Que signifie AFNOR ?', options: ['Agence Française de Normalisation', 'Association Fédérale de Normalisation', 'Agence de Formation National', 'Association de Formation des Opérateurs'], correctIndex: 0, explanation: 'AFNOR = Association Française de Normalisation.' },
          { question: 'L\'inspection du travail contrôle ?', options: ['La qualité des produits', 'Le respect du code du travail', 'Les finances', 'Le marketing'], correctIndex: 1, explanation: 'L\'inspection du travail contrôle le code du travail.' },
          { question: 'Une culture QHSE efficace se caractérise par ?', options: ['La peur des sanctions', 'L\'engagement de tous et l\'amélioration continue', 'Le respect strict sans questionnement', 'La minimisation des incidents'], correctIndex: 1, explanation: 'La culture QHSE repose sur l\'engagement et l\'amélioration continue.' },
          { question: 'Le CSE dispose d\'un droit de ?', options: ['Grève', 'Alerte en cas de danger grave', 'Licenciement', 'Veto sur les décisions'], correctIndex: 1, explanation: 'Le CSE a un droit d\'alerte en cas de danger grave et imminent.' },
        ],
      },
      {
        title: 'Le management intégré QHSE',
        content: `# Le management intégré QHSE

## Définition
Le **management intégré QHSE** consiste à gérer de manière unifiée les systèmes de Qualité, Hygiène, Sécurité et Environnement.

## Principes fondamentaux

### 1. L'approche processus
Identifier, gérer et interconnecter les processus avec des **entrées**, des **activités** et des **sorties** mesurables.

### 2. Le PDCA (Roue de Deming)
- **Plan** : Planifier les objectifs et actions
- **Do** : Déployer et réaliser
- **Check** : Contrôler et mesurer
- **Act** : Corriger et améliorer

### 3. L'approche par les risques
Identifier les risques et opportunités pour définir des actions de traitement.

## Structure d'un SMQHSE (7 composantes)
1. Contexte de l'organisation
2. Leadership
3. Planification
4. Support
5. Réalisation des activités
6. Évaluation de la performance
7. Amélioration

## Avantages de l'intégration
- Un seul système au lieu de plusieurs
- Objectifs et indicateurs alignés
- Réduction des coûts d'audit
- Simplification documentaire`,
        questions: [
          { question: 'Que signifie le P dans PDCA ?', options: ['Procédure', 'Plan (Planifier)', 'Production', 'Protection'], correctIndex: 1, explanation: 'P = Plan (Planifier).' },
          { question: 'Qu\'est-ce que l\'approche processus ?', options: ['Une méthode de production', 'L\'identification et gestion systématique des processus', 'Un outil de comptabilité', 'Une technique de marketing'], correctIndex: 1, explanation: 'L\'approche processus gère les processus interconnectés.' },
          { question: 'Le D de PDCA correspond à ?', options: ['Décision', 'Do (Déployer)', 'Direction', 'Diagnostic'], correctIndex: 1, explanation: 'D = Do (Déployer/Réaliser).' },
          { question: 'Combien de composantes a un SMQHSE ?', options: ['4', '5', '7', '10'], correctIndex: 2, explanation: 'Un SMQHSE a 7 composantes selon la HLS.' },
          { question: 'Un avantage du management intégré ?', options: ['Augmenter les coûts', 'Réduire les redondances', 'Complexifier les procédures', 'Supprimer la documentation'], correctIndex: 1, explanation: 'L\'intégration réduit les redondances et les coûts.' },
          { question: 'Qui a popularisé le PDCA ?', options: ['Henri Fayol', 'Edwards Deming', 'Frederick Taylor', 'Peter Drucker'], correctIndex: 1, explanation: 'Edwards Deming a popularisé le cycle PDCA.' },
          { question: 'Un processus a des ?', options: ['Un seul résultat', 'Des entrées, activités et sorties mesurables', 'Uniquement des activités internes', 'Un budget fixe'], correctIndex: 1, explanation: 'Un processus a des entrées, des activités et des sorties.' },
          { question: 'Le A de PDCA correspond à ?', options: ['Analyse', 'Act (Agir)', 'Audit', 'Accompagnement'], correctIndex: 1, explanation: 'A = Act (Agir/Améliorer).' },
          { question: 'Le C dans PDCA signifie ?', options: ['Communication', 'Check (Contrôler)', 'Conformité', 'Coordination'], correctIndex: 1, explanation: 'C = Check (Contrôler/Vérifier).' },
          { question: 'La politique QHSE est définie par ?', options: ['Le responsable QHSE', 'La direction', 'Les salariés', 'Les auditeurs'], correctIndex: 1, explanation: 'La direction définit la politique QHSE.' },
        ],
      },
      {
        title: 'La politique QHSE et ses composantes',
        content: `# La politique QHSE et ses composantes

## Définition
La politique QHSE est une **déclaration formelle** de la direction exprimant ses intentions et engagements QHSE.

## Exigences d'une politique efficace

1. **Appropriée au contexte** de l'organisation
2. **Engagements structurants** : conformité réglementaire, amélioration continue, prévention, protection environnementale
3. **Communication** : communiquée à tous, disponible pour les parties intéressées

## Les objectifs QHSE (SMART)
- **S**pécifiques
- **M**esurables
- **A**tteignables
- **R**éalistes
- **T**emporellement définis

### Exemples d'objectifs
| Domaine | Exemple |
|---------|--------|
| Qualité | Réduire les réclamations de 20% |
| Hygiène | 100% de formation hygiène |
| Sécurité | Réduire l'indice de fréquence de 15% |
| Environnement | Réduire la consommation d'eau de 10% |

## Le Document Unique (DUERP)
Le DUERP est **obligatoire** dans toute entreprise. Il recense et évalue les risques professionnels.`,
        questions: [
          { question: 'Qu\'est-ce qu\'une politique QHSE ?', options: ['Un manuel technique', 'Une déclaration formelle de la direction', 'Un plan de production', 'Un budget'], correctIndex: 1, explanation: 'C\'est une déclaration formelle des engagements de la direction.' },
          { question: 'Que signifie SMART ?', options: ['Simple, Mesurable, Actif, Rapide, Testé', 'Spécifique, Mesurable, Atteignable, Réaliste, Temporel', 'Systématique, Moderne, Applicable, Révisable, Total', 'Stratégique, Maintenable, Adaptable, Récurrent, Technologique'], correctIndex: 1, explanation: 'SMART = Spécifique, Mesurable, Atteignable, Réaliste, Temporel.' },
          { question: 'Le DUERP est-il obligatoire ?', options: ['Non', 'Oui, dans toute entreprise', 'Uniquement +50 salariés', 'Uniquement industriel'], correctIndex: 1, explanation: 'Le DUERP est obligatoire dans toute entreprise.' },
          { question: 'Qui définit la politique QHSE ?', options: ['Le responsable qualité', 'Les auditeurs', 'La direction', 'Le comité d\'entreprise'], correctIndex: 2, explanation: 'La direction définit la politique.' },
          { question: 'La politique doit-elle être communiquée ?', options: ['Non', 'Oui, à tous', 'Uniquement aux cadres', 'Uniquement aux auditeurs'], correctIndex: 1, explanation: 'Elle doit être communiquée à toutes les personnes.' },
          { question: 'Quel est un objectif environnemental ?', options: ['Augmenter la production', 'Réduire la consommation d\'eau', 'Recruter du personnel', 'Augmenter les ventes'], correctIndex: 1, explanation: 'Réduire la consommation d\'eau est un objectif environnemental.' },
          { question: 'La politique doit inclure un engagement pour ?', options: ['L\'augmentation des bénéfices', 'L\'amélioration continue', 'La réduction du personnel', 'La délocalisation'], correctIndex: 1, explanation: 'Elle doit inclure l\'amélioration continue.' },
          { question: 'Que signifie DUERP ?', options: ['Document Unique d\'Évaluation des Risques Professionnels', 'Directive d\'Urgence des Risques Planétaires', 'Dossier Uniforme des Évaluations', 'Document d\'Utilisation des Équipements'], correctIndex: 0, explanation: 'DUERP = Document Unique d\'Évaluation des Risques Professionnels.' },
          { question: 'Un objectif QHSE doit être ?', options: ['Vague et général', 'Spécifique et mesurable', 'Secret', 'Permanent'], correctIndex: 1, explanation: 'Les objectifs doivent être SMART.' },
          { question: 'La politique doit être disponible pour ?', options: ['Personne', 'Les parties intéressées', 'Uniquement sur demande', 'Les clients uniquement'], correctIndex: 1, explanation: 'Elle doit être disponible pour les parties intéressées.' },
        ],
      },
      {
        title: 'La documentation du système QHSE',
        content: `# La documentation du système QHSE

## Les 4 niveaux de documentation

### Niveau 1 : Le manuel QHSE
Décrit le système de management dans son ensemble.

### Niveau 2 : Les procédures
Documents décrivant **qui fait quoi, quand et comment**.

### Niveau 3 : Les instructions de travail
Documents détaillés expliquant **pas à pas** une tâche.

### Niveau 4 : Les enregistrements
Preuves objectives : formulaires, rapports, registres.

## Principes de gestion documentaire

- **Maîtrise des documents** : approbation, identification, version, diffusion
- **Maîtrise des enregistrements** : conservation, protection, traçabilité
- **Cycle de vie** : création → approbation → diffusion → utilisation → archivage

## Versionning
- Numéro unique d'identification
- Date de création et de révision
- Indice de version (A, B, C...)
- Statut (en vigueur, obsolète)`,
        questions: [
          { question: 'Combien de niveaux a la documentation QHSE ?', options: ['Deux', 'Trois', 'Quatre', 'Cinq'], correctIndex: 2, explanation: '4 niveaux : manuel, procédures, instructions, enregistrements.' },
          { question: 'Que décrit le manuel QHSE ?', options: ['Les tâches quotidiennes', 'Le système de management global', 'Les enregistrements', 'Le budget'], correctIndex: 1, explanation: 'Le manuel décrit le système de management global.' },
          { question: 'Un formulaire rempli est un ?', options: ['Procédure', 'Manuel', 'Enregistrement (niveau 4)', 'Politique'], correctIndex: 2, explanation: 'Un formulaire rempli est un enregistrement.' },
          { question: 'Les instructions de travail sont au niveau ?', options: ['1', '2', '3', '4'], correctIndex: 2, explanation: 'Instructions de travail = niveau 3.' },
          { question: 'La maîtrise des documents comprend ?', options: ['La destruction immédiate', 'L\'approbation, identification et version', 'La création sans contrôle', 'L\'archivage automatique'], correctIndex: 1, explanation: 'Elle comprend approbation, identification, version et diffusion.' },
          { question: 'Qu\'est-ce qu\'une procédure ?', options: ['Une preuve d\'action', 'Un document décrivant qui fait quoi quand comment', 'Une politique', 'Un registre'], correctIndex: 1, explanation: 'Une procédure décrit qui fait quoi, quand et comment.' },
          { question: 'L\'indice de version est généralement ?', options: ['Un numéro de page', 'Une lettre (A, B, C)', 'Un pourcentage', 'Un code couleur'], correctIndex: 1, explanation: 'L\'indice est une lettre : A, B, C...' },
          { question: 'La traçabilité concerne ?', options: ['Les documents papier uniquement', 'L\'historique d\'un document', 'La destruction', 'Le cryptage'], correctIndex: 1, explanation: 'C\'est la capacité de retrouver l\'historique d\'un document.' },
          { question: 'Qui approuve les documents QHSE ?', options: ['N\'importe qui', 'Les personnes autorisées', 'L\'auditeur externe', 'Le ministère'], correctIndex: 1, explanation: 'Les personnes autorisées selon les règles définies.' },
          { question: 'Un rapport d\'audit est un ?', options: ['Manuel', 'Enregistrement', 'Plan d\'action', 'Procédure'], correctIndex: 1, explanation: 'Un rapport d\'audit est un enregistrement (niveau 4).' },
        ],
      },
      {
        title: 'L\'audit QHSE',
        content: `# L'audit QHSE

## Définition
Un **audit QHSE** est un examen méthodique et indépendant de la conformité du système.

## Types d'audits
- **Interne** : Réalisé par l'organisation (vérification, préparation)
- **Externe** : Réalisé par des organismes indépendants (certification, clients)

## Processus d'audit (5 étapes)
1. **Planification** : Périmètre, critères, équipe
2. **Préparation** : Revue des documents, checklist
3. **Réalisation** : Entretiens, observations, analyses
4. **Rapport** : Constats, non-conformités, recommandations
5. **Suivi** : Vérification des actions correctives

## Types de non-conformités
- **Majeure** : Absence ou défaillance totale
- **Mineure** : Défaillance ponctuelle
- **Observation** : Opportunité d'amélioration

## Compétences de l'auditeur
- Connaissances techniques et réglementaires
- Maîtrise des référentiels
- Compétences en audit (interview, observation)
- Indépendance et objectivité`,
        questions: [
          { question: 'Qu\'est-ce qu\'un audit QHSE ?', options: ['Un contrôle financier', 'Un examen méthodique de conformité', 'Un recrutement', 'Une inspection routière'], correctIndex: 1, explanation: 'C\'est un examen méthodique de la conformité.' },
          { question: 'Quel type d\'audit est réalisé en premier ?', options: ['Externe', 'Interne', 'De certification', 'Réglementaire'], correctIndex: 1, explanation: 'Les audits internes sont réalisés en premier.' },
          { question: 'Une non-conformité majeure se caractérise par ?', options: ['Un problème esthétique', 'L\'absence totale d\'un élément', 'Une suggestion', 'Un retard de livraison'], correctIndex: 1, explanation: 'C\'est l\'absence ou défaillance totale d\'un élément.' },
          { question: 'La dernière étape d\'un audit est ?', options: ['La planification', 'Le rapport et le suivi', 'La préparation', 'Le recrutement'], correctIndex: 1, explanation: 'Le rapport et le suivi sont la dernière étape.' },
          { question: 'Un auditeur doit-il être indépendant ?', options: ['Non', 'Oui, c\'est essentiel', 'Uniquement pour l\'externe', 'Uniquement dans le privé'], correctIndex: 1, explanation: 'L\'indépendance est essentielle.' },
          { question: 'Qu\'est-ce qu\'une observation ?', options: ['Une faute grave', 'Une opportunité d\'amélioration', 'Un compliment', 'Une sanction'], correctIndex: 1, explanation: 'Une observation est une opportunité d\'amélioration.' },
          { question: 'Les audits externes sont réalisés par ?', options: ['Les salariés', 'Des organismes indépendants', 'Le gouvernement', 'Les fournisseurs'], correctIndex: 1, explanation: 'Par des organismes indépendants.' },
          { question: 'Combien d\'étapes a le processus d\'audit ?', options: ['3', '4', '5', '6'], correctIndex: 2, explanation: '5 étapes : planification, préparation, réalisation, rapport, suivi.' },
          { question: 'Une checklist sert à ?', options: ['Recruter des auditeurs', 'Préparer et structurer l\'audit', 'Réprimander le personnel', 'Augmenter la production'], correctIndex: 1, explanation: 'Elle prépare et structure l\'audit.' },
          { question: 'Une non-conformité mineure remet-elle en cause le système ?', options: ['Oui', 'Non, c\'est ponctuel', 'Oui, comme la majeure', 'Ça dépend'], correctIndex: 1, explanation: 'Non, c\'est une défaillance ponctuelle.' },
        ],
      },
      {
        title: 'L\'amélioration continue en QHSE',
        content: `# L'amélioration continue en QHSE

## Le principe
L'amélioration continue est le **coeur** de toute démarche QHSE. L'organisation doit constamment améliorer sa performance.

## Les outils d'amélioration continue

### Le cycle PDCA
Itératif et se répète indéfiniment.

### La méthode 8D (résolution de problèmes)
1. Constituer l'équipe
2. Décrire le problème
3. Mesurer le problème
4. Analyser les causes
5. Développer des actions correctives
6. Valider l'efficacité
7. Prévenir la récurrence
8. Féliciter l'équipe

### Les 5 Pourquoi
Technique consistant à se demander **"pourquoi"** 5 fois pour trouver la cause racine.

### Le diagramme d'Ishikawa
Aussi appelé **diagramme en arête de poisson**, il classe les causes en 5 catégories : Main d'oeuvre, Matière, Méthode, Milieu, Matériel (5M).

### Le diagramme de Pareto
Règle des 80/20 : 20% des causes produisent 80% des effets.

## Indicateurs de performance QHSE
- **Taux de conformité**
- **Indice de fréquence des accidents (IF)**
- **Indice de gravité (IG)**
- **Taux de rotation du personnel**
- **Consommation énergétique**

## La roue de Deming en pratique
Chaque boucle du PDCA doit apporter une **amélioration mesurable**, documentée et pérenne.`,
        questions: [
          { question: 'L\'amélioration continue est ?', options: ['Optionnelle', 'Le coeur de la démarche QHSE', 'Uniquement pour la qualité', 'Uniquement pour l\'environnement'], correctIndex: 1, explanation: 'Elle est le coeur de toute démarche QHSE.' },
          { question: 'La méthode 8D sert à ?', options: ['Former du personnel', 'Résoudre des problèmes complexes', 'Gérer les stocks', 'Planifier la production'], correctIndex: 1, explanation: 'La méthode 8D sert à résoudre les problèmes complexes.' },
          { question: 'Les 5 Pourquoi servent à ?', options: ['Évaluer les coûts', 'Trouver la cause racine', 'Recruter du personnel', 'Mesurer la production'], correctIndex: 1, explanation: 'Les 5 Pourquoi trouvent la cause racine d\'un problème.' },
          { question: 'Le diagramme d\'Ishikawa est aussi appelé ?', options: ['Diagramme circulaire', 'Diagramme en arête de poisson', 'Organigramme', 'Histogramme'], correctIndex: 1, explanation: 'Il est aussi appelé diagramme en arête de poisson.' },
          { question: 'Le principe de Pareto (80/20) signifie ?', options: ['80% du temps pour 20% du travail', '20% des causes produisent 80% des effets', '80% des coûts pour 20% des bénéfices', '20% du personnel fait 80% du travail'], correctIndex: 1, explanation: '20% des causes produisent 80% des effets.' },
          { question: 'Les 5M d\'Ishikawa sont ?', options: ['Marketing, Management, Méthode, Milieu, Matériel', 'Main d\'oeuvre, Matière, Méthode, Milieu, Matériel', 'Moral, Motivation, Méthode, Milieu, Matériel', 'Main d\'oeuvre, Machine, Méthode, Money, Maintenance'], correctIndex: 1, explanation: '5M = Main d\'oeuvre, Matière, Méthode, Milieu, Matériel.' },
          { question: 'L\'indice de fréquence (IF) mesure ?', options: ['La qualité', 'La fréquence des accidents', 'La production', 'La rentabilité'], correctIndex: 1, explanation: 'L\'IF mesure la fréquence des accidents du travail.' },
          { question: 'Combien d\'étapes a la méthode 8D ?', options: ['5', '6', '8', '10'], correctIndex: 2, explanation: 'La méthode 8D comporte 8 étapes.' },
          { question: 'Chaque boucle PDCA doit apporter ?', options: ['Un coût supplémentaire', 'Une amélioration mesurable', 'Une nouvelle procédure', 'Un nouveau manager'], correctIndex: 1, explanation: 'Chaque boucle doit apporter une amélioration mesurable.' },
          { question: 'Le diagramme de Pareto est utile pour ?', options: ['Recruter du personnel', 'Prioriser les actions d\'amélioration', 'Comptabiliser les dépenses', 'Organiser les réunions'], correctIndex: 1, explanation: 'Pareto aide à prioriser les actions en identifiant les causes les plus impactantes.' },
        ],
      },
    ],
  },
];

async function main() {
  console.log('Seeding online courses...');
  for (const courseData of COURSES) {
    const course = await db.onlineCourse.create({
      data: {
        title: courseData.title,
        slug: courseData.slug,
        description: courseData.description,
        shortDescription: courseData.shortDescription,
        totalHours: courseData.totalHours,
        icon: courseData.icon,
        order: courseData.order,
        level: 'debutant',
        isFree: true,
        published: true,
        featured: true,
        totalChapters: courseData.chapters.length,
      },
    });
    console.log(`  Created course: ${course.title}`);
    for (const ch of courseData.chapters) {
      const chapter = await db.chapter.create({
        data: {
          title: ch.title,
          content: ch.content,
          order: courseData.chapters.indexOf(ch) + 1,
          courseId: course.id,
        },
      });
      for (const q of ch.questions) {
        await db.question.create({
          data: {
            question: q.question,
            options: JSON.stringify(q.options),
            correctIndex: q.correctIndex,
            explanation: q.explanation,
            order: ch.questions.indexOf(q) + 1,
            chapterId: chapter.id,
          },
        });
      }
      console.log(`    Chapter: ${ch.title} (${ch.questions.length} questions)`);
    }
  }
  console.log('Done seeding first course! Run with more courses...');
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
