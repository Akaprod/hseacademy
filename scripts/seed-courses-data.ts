export const COURSES_DATA_2_TO_6 = [
{
  title: 'Identification et Évaluation des Risques Professionnels',
  slug: 'identification-evaluation-risques',
  description: 'Apprenez à identifier, évaluer et hiérarchiser les risques professionnels dans votre environnement de travail. Ce cours couvre la méthodologie complète d\'évaluation des risques, le Document Unique, et les principales familles de risques.',
  shortDescription: 'Maîtrisez la méthodologie d\'identification et d\'évaluation des risques professionnels.',
  totalHours: '3h',
  icon: 'Search',
  order: 2,
  chapters: [
    {
      title: 'Définition du danger et du risque',
      content: `# Définition du danger et du risque

## Définitions fondamentales

### Le Danger
Un **danger** est la propriété ou capacité intrinsèque d\'un équipement, d\'une substance, d\'une méthode de travail ou d\'un environnement de causer un dommage.

### Le Risque
Le **risque** est la combinaison de la **probabilité** d\'occurrence d\'un événement dangereux et de la **gravité** de ses conséquences sur la santé des travailleurs.

### La relation Danger / Risque / Dommage

**Danger** → Exposition → **Risque** → Événement → **Dommage**

- Le danger existe même sans exposition
- Le risque n\'existe que s\'il y a exposition au danger
- Le dommage est la conséquence de la réalisation du risque

## Les différents types de dommages

| Type | Exemples |
|------|--------|
| Atteinte corporelle | Blessure, fracture, brûlure |
| Atteinte à la santé | Maladie professionnelle, trouble musculosquelettique |
| Atteinte psychologique | Stress, burnout, harcèlement |
| Dommage matériel | Destruction d\'équipement |
| Atteinte environnementale | Pollution, rejet |

## La gravité et la probabilité

La **gravité** se mesure par la sévérité du dommage potentiel :
- Légère : blessure sans arrêt de travail
- Modérée : blessure avec arrêt de travail
- Grave : incapacité permanente
- Très grave / Décès

La **probabilité** dépend de la fréquence d\'exposition, de la durée, et des mesures de prévention en place.`,
      questions: [
        { question: 'Qu\'est-ce qu\'un danger ?', options: ['Un accident déjà survenu', 'La capacité intrinsèque de causer un dommage', 'Une maladie professionnelle', 'Une amende de l\'inspection du travail'], correctIndex: 1, explanation: 'Le danger est la propriété intrinsèque d\'un élément de causer un dommage.' },
        { question: 'Comment se définit le risque ?', options: ['Un accident certain', 'La combinaison de la probabilité et de la gravité', 'Une obligation légale', 'Un type de danger'], correctIndex: 1, explanation: 'Le risque = probabilité x gravité des conséquences.' },
        { question: 'Le risque existe-t-il sans exposition au danger ?', options: ['Oui, toujours', 'Non, le risque n\'existe que s\'il y a exposition', 'Seulement dans l\'industrie', 'Seulement pour les produits chimiques'], correctIndex: 1, explanation: 'Le risque suppose une exposition au danger.' },
        { question: 'Une blessure sans arrêt de travail correspond à une gravité ?', options: ['Légère', 'Modérée', 'Grave', 'Très grave'], correctIndex: 0, explanation: 'Une blessure sans arrêt de travail est considérée comme légère.' },
        { question: 'La probabilité d\'un risque dépend de ?', options: ['La taille de l\'entreprise', 'La fréquence et durée d\'exposition', 'Le nombre de clients', 'La couleur des murs'], correctIndex: 1, explanation: 'La probabilité dépend de la fréquence d\'exposition, de la durée et des mesures de prévention.' },
        { question: 'Un trouble musculosquelettique est un ?', options: ['Danger', 'Dommage (atteinte à la santé)', 'Événement', 'Mesure de prévention'], correctIndex: 1, explanation: 'Un TMS est un dommage, une atteinte à la santé.' },
        { question: 'Quelle est la séquence correcte ?', options: ['Risque → Danger → Dommage', 'Danger → Exposition → Risque → Dommage', 'Dommage → Danger → Risque', 'Exposition → Dommage → Risque'], correctIndex: 1, explanation: 'La séquence est Danger → Exposition → Risque → Événement → Dommage.' },
        { question: 'La gravité d\'une incapacité permanente est classée ?', options: ['Légère', 'Modérée', 'Grave', 'Minime'], correctIndex: 2, explanation: 'L\'incapacité permanente est classée comme grave.' },
        { question: 'Le burn-out est un type de ?', options: ['Danger physique', 'Atteinte psychologique', 'Dommage matériel', 'Mesure de prévention'], correctIndex: 1, explanation: 'Le burn-out est une atteinte psychologique.' },
        { question: 'L\'évaluation des risques se base sur ?', options: ['L\'intuition', 'La gravité et la probabilité', 'Le hasard', 'L\'avis des clients'], correctIndex: 1, explanation: 'L\'évaluation des risques se base sur la gravité et la probabilité.' },
      ],
    },
    {
      title: 'La méthodologie d\'évaluation des risques',
      content: `# La méthodologie d'évaluation des risques

## Les étapes de l'évaluation

L'évaluation des risques professionnels suit une **méthodologie structurée** en 5 étapes :

### 1. Préparer l'évaluation
- Définir le périmètre (unité de travail, poste, activité)
- Constituer l'équipe d'évaluation
- Rassembler les données existantes (accidents, maladies, audits)
- Identifier les situations de travail

### 2. Identifier les dangers
Pour chaque situation de travail, identifier tous les dangers potentiels.

### 3. Classer les risques
Regrouper les risques par familles :
- Risques physiques (bruit, vibrations, température)
- Risques chimiques (poussières, gaz, vapeurs)
- Risques biologiques (virus, bactéries)
- Risques ergonomiques (postures, manutention)
- Risques psychosociaux (stress, harcèlement)
- Risques liés à l'organisation (rythme de travail)

### 4. Évaluer la gravité et la probabilité
Utiliser une **matrice d'évaluation** (grille de cotation) pour classer chaque risque.

### 5. Définir les actions de prévention
Appliquer les 9 principes généraux de prévention du Code du travail.

## Les outils d'évaluation

- **Grille de cotation** : Note de 1 à 5 pour gravité et probabilité
- **Matrice des risques** : Croisement gravité/probabilité
- **Diagramme de Pareto** : Priorisation des actions`,
      questions: [
        { question: 'Combien d\'étapes a la méthodologie d\'évaluation ?', options: ['3', '4', '5', '6'], correctIndex: 2, explanation: 'L\'évaluation des risques comporte 5 étapes.' },
        { question: 'La première étape est ?', options: ['Identifier les dangers', 'Préparer l\'évaluation', 'Évaluer la gravité', 'Définir les actions'], correctIndex: 1, explanation: 'La première étape est la préparation.' },
        { question: 'Qu\'est-ce que la matrice des risques ?', options: ['Un formulaire administratif', 'Le croisement gravité/probabilité', 'Un plan de formation', 'Un registre du personnel'], correctIndex: 1, explanation: 'La matrice croise la gravité et la probabilité de chaque risque.' },
        { question: 'Les risques psychosociaux font partie de quelle famille ?', options: ['Risques physiques', 'Risques chimiques', 'Risques psychosociaux', 'Risques biologiques'], correctIndex: 2, explanation: 'Les RPS forment une famille à part.' },
        { question: 'La grille de cotation utilise des notes de ?', options: ['1 à 3', '1 à 4', '1 à 5', '1 à 10'], correctIndex: 2, explanation: 'La grille utilise généralement une échelle de 1 à 5.' },
        { question: 'Le diagramme de Pareto sert à ?', options: ['Mesurer le bruit', 'Prioriser les actions', 'Compter le personnel', 'Classer les produits'], correctIndex: 1, explanation: 'Pareto aide à prioriser les actions d\'amélioration.' },
        { question: 'Qu\'identifie-t-on à l\'étape 2 ?', options: ['Les actions', 'Les dangers', 'Les coûts', 'Les clients'], correctIndex: 1, explanation: 'L\'étape 2 est l\'identification des dangers.' },
        { question: 'Les 9 principes généraux de prévention sont issus de ?', options: ['ISO 9001', 'Code du travail', 'Normes européennes', 'Règlement intérieur'], correctIndex: 1, explanation: 'Les 9 principes sont issus du Code du travail (art. L4121-2).' },
        { question: 'Le périmètre d\'évaluation peut être ?', options: ['Uniquement l\'entreprise entière', 'Un poste ou une activité spécifique', 'Uniquement le bureau', 'Uniquement l\'extérieur'], correctIndex: 1, explanation: 'Le périmètre peut être un poste, une activité ou une unité.' },
        { question: 'Que fait-on à l\'étape 5 ?', options: ['Identifier les dangers', 'Définir les actions de prévention', 'Classer les risques', 'Préparer l\'évaluation'], correctIndex: 1, explanation: 'L\'étape 5 définit les actions de prévention.' },
      ],
    },
    {
      title: 'Le Document Unique (DUERP)',
      content: `# Le Document Unique (DUERP)

## Définition et cadre légal

Le **Document Unique d'Évaluation des Risques Professionnels (DUERP)** est un document obligatoire dans toute entreprise. Il est prévu par le Code du travail (article L4121-1 et R4121-1).

## Contenu obligatoire du DUERP

Le DUERP doit contenir :
1. **L'inventaire des risques** identifiés dans chaque unité de travail
2. **Le classement de ces risques**
3. **Les mesures de prévention** existantes et prévues

## Mise à jour obligatoire

Le DUERP doit être mis à jour :
- Au moins **une fois par an**
- Lors de toute **décision d'aménagement** modifiant les conditions de travail
- Lorsqu'une information **supplémentaire** est recueillie

## Accessibilité

Le DUERP doit être :
- Tenu à la **disposition** des travailleurs
- Consultable par le **CSE**
- Présent lors de l'**inspection du travail**

## Sanctions

Le défaut de DUERP ou sa non-mise à jour est passible d'une amende pénale pouvant aller jusqu'à **1 500 euros** (3 000 en récidive) et d'un an d'emprisonnement en cas de mise en danger de la vie d'autrui.

## Format numérique

Depuis 2022, le DUERP doit être établi dans un **format unique et standardisé** et déposé sur un portail numérique déployé par le ministère du Travail.`,
      questions: [
        { question: 'Que signifie DUERP ?', options: ['Document Universel d\'Évaluation des Risques', 'Document Unique d\'Évaluation des Risques Professionnels', 'Dossier d\'Utilisation des Équipements de Réparation', 'Directive d\'Urgence des Risques Économiques'], correctIndex: 1, explanation: 'DUERP = Document Unique d\'Évaluation des Risques Professionnels.' },
        { question: 'Le DUERP est obligatoire dans ?', options: ['Les entreprises de plus de 50 salariés', 'Toute entreprise', 'Uniquement le secteur industriel', 'Uniquement le BTP'], correctIndex: 1, explanation: 'Le DUERP est obligatoire dans toute entreprise.' },
        { question: 'Le DUERP doit être mis à jour ?', options: ['Tous les 5 ans', 'Au moins une fois par an', 'Uniquement en cas d\'accident', 'Tous les 3 ans'], correctIndex: 1, explanation: 'Le DUERP doit être mis à jour au moins une fois par an.' },
        { question: 'L\'amende pour défaut de DUERP peut atteindre ?', options: ['500 euros', '1 500 euros', '5 000 euros', '10 000 euros'], correctIndex: 1, explanation: 'L\'amende peut atteindre 1 500 euros (3 000 en récidive).' },
        { question: 'Le DUERP doit contenir ?', options: ['Uniquement les noms des salariés', 'L\'inventaire, le classement et les mesures de prévention', 'Uniquement le budget', 'Les fiches de paie'], correctIndex: 1, explanation: 'Il contient l\'inventaire, le classement des risques et les mesures.' },
        { question: 'Le DUERP doit être consultable par ?', options: ['Personne', 'Le CSE et les travailleurs', 'Uniquement la direction', 'Uniquement l\'inspecteur du travail'], correctIndex: 1, explanation: 'Le DUERP est consultable par les travailleurs et le CSE.' },
        { question: 'Depuis 2022, le DUERP doit être ?', options: ['Uniquement papier', 'En format numérique standardisé', 'En anglais', 'En format audio'], correctIndex: 1, explanation: 'Le DUERP doit être en format unique et standardisé numérique.' },
        { question: 'Le DUERP est prévu par quel article du Code du travail ?', options: ['L4121-1', 'L1234-1', 'L3456-1', 'L5678-1'], correctIndex: 0, explanation: 'Le DUERP est prévu par l\'article L4121-1 du Code du travail.' },
        { question: 'Le DUERP est-il nécessaire en cas de réaménagement ?', options: ['Non', 'Oui, il doit être mis à jour', 'Uniquement si le budget le permet', 'Uniquement sur demande du CSE'], correctIndex: 1, explanation: 'Il doit être mis à jour lors de tout aménagement modifiant les conditions.' },
        { question: 'L\'article de mise en danger peut entraîner ?', options: ['Une amende de 10 euros', 'Un an d\'emprisonnement', 'Une promotion', 'Rien'], correctIndex: 1, explanation: 'La mise en danger peut entraîner un an d\'emprisonnement.' },
      ],
    },
    {
      title: 'Les risques physiques',
      content: `# Les risques physiques

## Le bruit

Le bruit est le risque physique le plus fréquent en entreprise. Les effets du bruit sur la santé sont :
- **Fatigue auditive** (réversible)
- **Traumatisme acoustique** (réversible si pris en charge)
- **Surdité professionnelle** (irréversible)

### Valeurs limites d'exposition
- Action : 80 dB(A) sur 8h
- Danger : 85 dB(A) sur 8h
- Maximum : 87 dB(A) avec atténuation

## Les vibrations

Deux types :
- **Vibrations main-bras** : outils portatifs (meuleuses, perceuses)
- **Vibrations corps entier** : véhicules, engins

Conséquences : syndrome de Raynaud, lombalgies, troubles vasculaires.

## Les rayonnements

- **Non ionisants** : UV, infrarouge, laser
- **Ionisants** : rayons X, gamma, radioactivité

## Les températures extrêmes

- **Froid** : engelures, hypothermie
- **Chaleur** : coup de chaleur, déshydratation

## L'éclairage

Un mauvais éclairage entraîne fatigue visuelle, maux de tête et erreurs de manipulation.

### Niveaux d'éclairement recommandés
| Zone | Minimum (lux) |
|------|--------------|
| Circulations | 100 |
| Bureaux | 300-500 |
| Travail de précision | 750+ |`,
      questions: [
        { question: 'Le risque physique le plus fréquent est ?', options: ['Les vibrations', 'Le bruit', 'Les radiations', 'Le froid'], correctIndex: 1, explanation: 'Le bruit est le risque physique le plus fréquent en entreprise.' },
        { question: 'La surdité professionnelle est ?', options: ['Réversible', 'Irréversible', 'Temporaire', 'Saisonnière'], correctIndex: 1, explanation: 'La surdité professionnelle est irréversible.' },
        { question: 'Le seuil d\'action du bruit est de ?', options: ['60 dB(A)', '70 dB(A)', '80 dB(A)', '90 dB(A)'], correctIndex: 2, explanation: 'Le seuil d\'action est de 80 dB(A) sur 8 heures.' },
        { question: 'Les vibrations main-bras sont causées par ?', options: ['Les véhicules', 'Les outils portatifs', 'Le bruit', 'Le soleil'], correctIndex: 1, explanation: 'Les outils portatifs comme les meuleuses causent les vibrations main-bras.' },
        { question: 'Les rayons X sont des rayonnements ?', options: ['Non ionisants', 'Ionisants', 'Ultraviolets', 'Infrarouges'], correctIndex: 1, explanation: 'Les rayons X sont des rayonnements ionisants.' },
        { question: 'Le syndrome de Raynaud est lié aux ?', options: ['Rayonnements', 'Vibrations', 'Bruit', 'Chaleur'], correctIndex: 1, explanation: 'Le syndrome de Raynaud est lié aux vibrations.' },
        { question: 'L\'éclairement minimum pour un bureau est de ?', options: ['50 lux', '100 lux', '300-500 lux', '1000 lux'], correctIndex: 2, explanation: 'Le minimum pour un bureau est de 300-500 lux.' },
        { question: 'Le seuil de danger du bruit est de ?', options: ['75 dB(A)', '80 dB(A)', '85 dB(A)', '95 dB(A)'], correctIndex: 2, explanation: 'Le seuil de danger est de 85 dB(A) sur 8 heures.' },
        { question: 'Le coup de chaleur est un risque lié à ?', options: ['Le froid', 'La chaleur', 'Le bruit', 'Les radiations'], correctIndex: 1, explanation: 'Le coup de chaleur est lié à l\'exposition à la chaleur.' },
        { question: 'Les UV sont des rayonnements ?', options: ['Ionisants', 'Non ionisants', 'Gamma', 'Radioactifs'], correctIndex: 1, explanation: 'Les UV sont des rayonnements non ionisants.' },
      ],
    },
    {
      title: 'Les risques chimiques et biologiques',
      content: `# Les risques chimiques et biologiques

## Les risques chimiques

### Classification des produits chimiques
Les produits chimiques sont classifiés selon le **SGH** (Système Général Harmonisé) avec des pictogrammes :

- **Flamme** : Inflammable
- **Bombe explosion** : Explosif
- **Corrosion** : Corrosif
- **Tête de mort** : Mortel ou toxique
- **Exclamation** : Irritant ou nocif
- **Santé humaine** : Danger pour la santé
- **Environnement** : Dangereux pour l\'environnement

### Voies d\'exposition
- **Respiratoire** : inhalation de gaz, vapeurs, poussières
- **Cutanée** : contact avec la peau
- **Oculaire** : projection dans les yeux
- **Digestive** : ingestion accidentelle

### L\'étiquetage et la FDS
La **Fiche de Données de Sécurité (FDS)** est obligatoire pour chaque produit chimique dangereux. Elle contient 16 sections.

## Les risques biologiques

Les agents biologiques sont classés en 4 groupes :
- **Groupe 1** : Peu probable de causer une maladie
- **Groupe 2** : Peut causer une maladie, risque de propagation limité
- **Groupe 3** : Peut causer une maladie grave, risque de propagation
- **Groupe 4** : Peut causer une maladie grave et très contagieuse

### Secteurs concernés
- Santé (hôpitaux, laboratoires)
- Agriculture (élevage, traitement des déchets)
- Alimentation (abattoirs, laiteries)
- Assainissement (stations d\'épuration)`,
      questions: [
        { question: 'Que signifie SGH ?', options: ['Système Général Harmonisé', 'Service de Gestion Hygiénique', 'Standard de Gestion des Hazards', 'Système de Garantie Humaine'], correctIndex: 0, explanation: 'SGH = Système Général Harmonisé de classification.' },
        { question: 'Le pictogramme \"tête de mort\" indique ?', options: ['Inflammable', 'Corrosif', 'Mortel ou toxique', 'Irritant'], correctIndex: 2, explanation: 'La tête de mort indique un produit mortel ou toxique.' },
        { question: 'Combien de sections a une FDS ?', options: ['8', '10', '12', '16'], correctIndex: 3, explanation: 'La Fiche de Données de Sécurité contient 16 sections.' },
        { question: 'L\'inhalation est une voie d\'exposition ?', options: ['Cutanée', 'Respiratoire', 'Digestive', 'Oculaire'], correctIndex: 1, explanation: 'L\'inhalation est la voie d\'exposition respiratoire.' },
        { question: 'Les agents biologiques du groupe 4 sont ?', options: ['Inoffensifs', 'Peu dangereux', 'Très graves et contagieux', 'Uniquement végétaux'], correctIndex: 2, explanation: 'Le groupe 4 = très graves et très contagieux.' },
        { question: 'Quels secteurs sont concernés par les risques biologiques ?', options: ['Uniquement la santé', 'Santé, agriculture, alimentation, assainissement', 'Uniquement l\'industrie', 'Uniquement le BTP'], correctIndex: 1, explanation: 'Plusieurs secteurs sont concernés.' },
        { question: 'La FDS est-elle obligatoire ?', options: ['Non', 'Oui, pour chaque produit chimique dangereux', 'Uniquement pour les liquides', 'Uniquement en Europe'], correctIndex: 1, explanation: 'La FDS est obligatoire pour chaque produit chimique dangereux.' },
        { question: 'Le pictogramme \"flamme\" indique un produit ?', options: ['Toxique', 'Corrosif', 'Inflammable', 'Explosif'], correctIndex: 2, explanation: 'La flamme indique un produit inflammable.' },
        { question: 'L\'ingestion accidentelle est une voie ?', options: ['Respiratoire', 'Cutanée', 'Digestive', 'Thermique'], correctIndex: 2, explanation: 'L\'ingestion est la voie d\'exposition digestive.' },
        { question: 'Le groupe 1 des agents biologiques est ?', options: ['Très dangereux', 'Peu probable de causer une maladie', 'Mortel', 'Radiactif'], correctIndex: 1, explanation: 'Groupe 1 = peu probable de causer une maladie.' },
      ],
    },
    {
      title: 'Les risques psychosociaux (RPS)',
      content: `# Les risques psychosociaux (RPS)

## Définition

Les **risques psychosociaux (RPS)** désignent les risques pour la santé mentale, physique et sociale, engendrés par les conditions d'organisation et de relations de travail.

## Les principaux facteurs de RPS

### 1. Les facteurs organisationnels
- Surcharge ou sous-charge de travail
- Horaires atypiques et travail de nuit
- Pression temporelle
- Manque d'autonomie
- Procédures d'évaluation injustes

### 2. Les facteurs relationnels
- Mauvaises relations avec la hiérarchie
- Conflits entre collègues
- Isolement au travail
- Harcèlement moral ou sexuel
- Violence au travail

### 3. Les facteurs liés au contenu du travail
- Travail monotone ou dégradant
- Insécurité de l'emploi
- Manque de reconnaissance

## Les conséquences des RPS

| Niveau | Effets |
|--------|--------|
| Individuel | Stress, anxiété, dépression, burnout, suicide |
| Collectif | Absentéisme, turn-over, conflits, baisse de productivité |
| Organisationnel | Dégradation du climat social, atteinte à l'image |

## La prévention des RPS

- Diagnostic partagé (questionnaires, entretiens)
- Formation des managers à la détection précoce
- Amélioration de l'organisation du travail
- Médiation et cellule d'écoute

## Les indicateurs de suivi
- Taux d'absentéisme
- Taux de turn-over
- Nombre de visites médicales
- Enquêtes de climat social`,
      questions: [
        { question: 'Que signifie RPS ?', options: ['Risques Physiques et Sensoriels', 'Risques Psychosociaux', 'Réglementation de la Production de Sécurité', 'Référentiel de Prévention des Situations'], correctIndex: 1, explanation: 'RPS = Risques Psychosociaux.' },
        { question: 'La surcharge de travail est un facteur ?', options: ['Physique', 'Chimique', 'Organisationnel de RPS', 'Biologique'], correctIndex: 2, explanation: 'La surcharge de travail est un facteur organisationnel des RPS.' },
        { question: 'Le burn-out est une conséquence des ?', options: ['Risques chimiques', 'Risques physiques', 'RPS', 'Risques biologiques'], correctIndex: 2, explanation: 'Le burn-out est une conséquence des RPS.' },
        { question: 'Quels sont les facteurs relationnels des RPS ?', options: ['Le bruit', 'Les conflits et le harcèlement', 'Les vibrations', 'Les produits chimiques'], correctIndex: 1, explanation: 'Les facteurs relationnels incluent les conflits et le harcèlement.' },
        { question: 'Un indicateur de suivi des RPS est ?', options: ['La production', 'Le taux d\'absentéisme', 'Le chiffre d\'affaires', 'La surface des locaux'], correctIndex: 1, explanation: 'Le taux d\'absentéisme est un indicateur clé des RPS.' },
        { question: 'La prévention des RPS passe par ?', options: ['L\'augmentation des horaires', 'Un diagnostic partagé', 'La réduction des salaires', 'La suppression des pauses'], correctIndex: 1, explanation: 'La prévention passe par un diagnostic partagé et des actions ciblées.' },
        { question: 'Le harcèlement moral est un facteur de ?', options: ['Risque chimique', 'RPS', 'Risque physique', 'Risque environnemental'], correctIndex: 1, explanation: 'Le harcèlement moral est un facteur relationnel des RPS.' },
        { question: 'L\'isolement au travail est un facteur de ?', options: ['Risque physique', 'Risque chimique', 'RPS', 'Risque biologique'], correctIndex: 2, explanation: 'L\'isolement au travail est un facteur relationnel des RPS.' },
        { question: 'Le turn-over élevé peut indiquer ?', options: ['Une bonne ambiance', 'Des problèmes de RPS', 'Un bon salaire', 'Des promotions fréquentes'], correctIndex: 1, explanation: 'Un turn-over élevé peut signaler des problèmes de RPS.' },
        { question: 'La prévention des RPS nécessite ?', options: ['Uniquement des sanctions', 'La formation des managers', 'L\'augmentation du travail', 'La suppression du personnel'], correctIndex: 1, explanation: 'La formation des managers à la détection précoce est essentielle.' },
      ],
    },
    {
      title: 'Les risques liés aux manutentions manuelles',
      content: `# Les risques liés aux manutentions manuelles

## Définition

La **manutention manuelle** est toute opération de transport ou de soutien d'une charge par un ou plusieurs travailleurs. C'est l'une des principales causes de **troubles musculosquelettiques (TMS)**.

## Les troubles musculosquelettiques (TMS)

Les TMS représentent **87% des maladies professionnelles** reconnues en France.

### Principales localisations
- Rachis lombaire (douleurs dorsales)
- Épaules
- Poignets et mains
- Coudes

## Les facteurs de risque

- **Charge trop lourde** : > 25 kg (hommes), > 15 kg (femmes) dans le Code du travail
- **Mauvaise posture** : torsion du tronc, flexion
- **Fréquence élevée** : répétition des gestes
- **Distance de port** : éloignement du corps
- **Environnement** : sol glissant, espace réduit

## La prévention

### Principes généraux
1. **Éviter** les manutentions manuelles quand c'est possible
2. **Évaluer** les risques qui ne peuvent être évités
3. **Réduire** les risques (aide à la manutention, formation)
4. **Organiser** le poste de travail

### Aides à la manutention
- Chariots, transpalettes
- Ponts roulants, palans
- Tables élévatrices
- Systèmes de convoyage

## Les gestes et postures de sécurité

- Garder le dos droit
- Fléchir les genoux
- Serrer la charge près du corps
- Utiliser la force des jambes
- Ne jamais tourner le tronc en portant`,
      questions: [
        { question: 'Les TMS représentent quel pourcentage de maladies professionnelles ?', options: ['50%', '67%', '75%', '87%'], correctIndex: 3, explanation: 'Les TMS représentent 87% des maladies professionnelles reconnues.' },
        { question: 'Le seuil de charge pour les femmes est de ?', options: ['10 kg', '15 kg', '20 kg', '25 kg'], correctIndex: 1, explanation: 'Le seuil est de 15 kg pour les femmes (25 kg pour les hommes).' },
        { question: 'Le rachis lombaire est concerné par ?', options: ['Le bruit', 'Les TMS liés à la manutention', 'Les rayonnements', 'Les produits chimiques'], correctIndex: 1, explanation: 'Le rachis lombaire est une localisation majeure des TMS.' },
        { question: 'Le premier principe de prévention est ?', options: ['Former les salariés', 'Éviter les manutentions manuelles', 'Acheter des chariots', 'Augmenter les salaires'], correctIndex: 1, explanation: 'Le premier principe est d\'éviter les manutentions manuelles.' },
        { question: 'Quel est le bon geste pour porter une charge ?', options: ['Dos droit, genoux fléchis', 'Dos courbé, jambes tendues', 'Dos tordu, charge éloignée', 'Un seul bras'], correctIndex: 0, explanation: 'Il faut garder le dos droit et fléchir les genoux.' },
        { question: 'Un transpalette est une ?', options: ['Machine dangereuse', 'Aide à la manutention', 'Outil de coupe', 'Équipement de protection'], correctIndex: 1, explanation: 'Le transpalette est une aide à la manutention.' },
        { question: 'La torsion du tronc en portant est ?', options: ['Recommandée', 'À éviter', 'Sans danger', 'Obligatoire'], correctIndex: 1, explanation: 'Il ne faut jamais tourner le tronc en portant une charge.' },
        { question: 'Le seuil de charge pour les hommes est de ?', options: ['15 kg', '20 kg', '25 kg', '30 kg'], correctIndex: 2, explanation: 'Le seuil est de 25 kg pour les hommes.' },
        { question: 'Un sol glissant est un facteur de risque de ?', options: ['Risque chimique', 'Manutention manuelle', 'Risque psychosocial', 'Risque biologique'], correctIndex: 1, explanation: 'L\'environnement (sol, espace) est un facteur de risque de manutention.' },
        { question: 'La fréquence élevée des gestes est un facteur de ?', options: ['Amélioration', 'Risque de TMS', 'Motivation', 'Sécurité'], correctIndex: 1, explanation: 'La répétition des gestes est un facteur de risque de TMS.' },
      ],
    },
    {
      title: 'La hiérarchie des mesures de prévention',
      content: `# La hiérarchie des mesures de prévention

## Les 9 principes généraux de prévention

Le Code du travail (article L4121-2) énonce 9 principes généraux de prévention :

1. **Éviter les risques**
2. **Évaluer les risques** qui ne peuvent être évités
3. **Combattre les risques à la source**
4. **Adapter le travail à l'homme** (ergonomie)
5. **Tenir compte de l'évolution de la technique**
6. **Remplacer ce qui est dangereux** par ce qui ne l'est pas
7. **Planifier la prévention** avec un plan d'actions
8. **Prendre des mesures de protection collective** avant l'individuelle
9. **Former et informer** les travailleurs

## La hiérarchie des contrôles

Les mesures de prévention sont classées de la plus efficace à la moins efficace :

| Niveau | Mesure | Efficacité |
|--------|--------|-----------|
| 1 | **Élimination/Substitution** | Très élevée |
| 2 | **Mesures techniques collectives** (ventilation, garde-corps) | Élevée |
| 3 | **Mesures organisationnelles** (procédures, rotations) | Modérée |
| 4 | **EPI** (équipements de protection individuelle) | Plus faible |

## Le principe de la prévention intégrée

La prévention doit être intégrée dès la **conception** des équipements, des procédés et des méthodes de travail.

## Les plans d'action

Après l'évaluation des risques, un **plan d'action** priorisé doit être établi avec :
- Des actions à court, moyen et long terme
- Des responsabilités clairement définies
- Des délais de réalisation
- Des indicateurs de suivi`,
      questions: [
        { question: 'Combien de principes généraux de prévention existe-t-il ?', options: ['5', '7', '9', '12'], correctIndex: 2, explanation: 'Le Code du travail énonce 9 principes généraux.' },
        { question: 'La mesure la plus efficace est ?', options: ['Les EPI', 'L\'élimination/substitution', 'La formation', 'L\'information'], correctIndex: 1, explanation: 'L\'élimination/substitution est la mesure la plus efficace.' },
        { question: 'Les EPI sont classés comme mesure de niveau ?', options: ['1', '2', '3', '4'], correctIndex: 3, explanation: 'Les EPI sont la dernière ligne de défense (niveau 4).' },
        { question: 'Le 8e principe est ?', options: ['Éviter les risques', 'Adapter le travail à l\'homme', 'Mesures de protection collective avant individuelle', 'Former les travailleurs'], correctIndex: 2, explanation: 'Le 8e principe : protections collectives avant individuelles.' },
        { question: 'La ventilation est une mesure ?', options: ['Individuelle', 'Technique collective', 'Organisationnelle', 'Éliminatoire'], correctIndex: 1, explanation: 'La ventilation est une mesure technique collective.' },
        { question: 'Un plan d\'action doit inclure ?', options: ['Uniquement le budget', 'Des actions, responsabilités, délais et indicateurs', 'Uniquement les noms des salariés', 'Uniquement les dates'], correctIndex: 1, explanation: 'Le plan d\'action inclut actions, responsabilités, délais et indicateurs.' },
        { question: 'Le premier principe est ?', options: ['Évaluer les risques', 'Éviter les risques', 'Combattre à la source', 'Former les travailleurs'], correctIndex: 1, explanation: 'Le premier principe est d\'éviter les risques.' },
        { question: 'Les mesures organisationnelles incluent ?', options: ['Les casques', 'Les procédures et rotations', 'Les extincteurs', 'Les masques'], correctIndex: 1, explanation: 'Les procédures et rotations sont des mesures organisationnelles.' },
        { question: 'La prévention intégrée se fait dès ?', options: ['L\'accident', 'La conception', 'Le licenciement', 'L\'audit'], correctIndex: 1, explanation: 'La prévention doit être intégrée dès la conception.' },
        { question: 'Les 9 principes sont dans quel article du Code du travail ?', options: ['L4121-1', 'L4121-2', 'L1234-1', 'L3456-1'], correctIndex: 1, explanation: 'Les 9 principes sont à l\'article L4121-2.' },
      ],
    },
  ],
},
];
