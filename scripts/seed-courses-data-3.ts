export const COURSES_DATA_5_TO_6 = [
{
  title: 'Sécurité Incendie : Prévention et Intervention',
  slug: 'securite-incendie',
  description: 'Maîtrisez la prévention des risques d\'incendie, les classes de feux, l\'utilisation des extincteurs et les procédures d\'évacuation. Un cours essentiel pour tout salarié.',
  shortDescription: 'Prévention, extincteurs et évacuation en cas d\'incendie.',
  totalHours: '2h',
  icon: 'Flame',
  order: 5,
  chapters: [
    {
      title: 'Le triangle et le tétraèdre du feu',
      content: `# Le triangle et le tétraèdre du feu

## Le triangle du feu

Pour qu\'un feu se déclenche, **trois éléments** sont nécessaires simultanément :

### Les 3 côtés du triangle
1. **Combustible** : matière susceptible de brûler (bois, papier, carburant, gaz)
2. **Comburant** : agent permettant la combustion (généralement l\'oxygène de l\'air)
3. **Énergie d\'activation** : source de chaleur (flamme, étincelle, chaleur)

Pour éteindre un feu, il suffit de **supprimer un de ces trois éléments**.

## Le tétraèdre du feu

Le tétraèdre ajoute un **4e facteur** essentiel : la **réaction en chaîne**.

### Les 4 faces du tétraèdre
1. Combustible
2. Comburant
3. Énergie d\'activation
4. **Réaction en chaîne** : propagation de la combustion de molécule en molécule

## Les moyens d\'extinction

| Principe | Action | Exemple |
|----------|--------|--------|
| **Refroidissement** | Retirer l\'énergie | Eau |
| **Étouffement** | Retirer le comburant | CO2, mousse, couverture |
| **Appauvrissement** | Retirer le combustible | Fermeture de vanne |
| **Inhibition** | Briser la réaction en chaîne | Poudre |

## La propagation du feu

Le feu se propage par :
- **Conduction** : à travers les matériaux
- **Convection** : par les courants d\'air chaud
- **Rayonnement** : par émission de chaleur`,
      questions: [
        { question: 'Le triangle du feu comporte combien d\'éléments ?', options: ['2', '3', '4', '5'], correctIndex: 1, explanation: 'Le triangle du feu comporte 3 éléments.' },
        { question: 'L\'eau agit par ?', options: ['Étouffement', 'Refroidissement', 'Inhibition', 'Appauvrissement'], correctIndex: 1, explanation: 'L\'eau agit par refroidissement en retirant l\'énergie.' },
        { question: 'Le 4e facteur du tétraèdre est ?', options: ['Le vent', 'La réaction en chaîne', 'L\'humidité', 'La pression'], correctIndex: 1, explanation: 'La réaction en chaîne est le 4e facteur du tétraèdre du feu.' },
        { question: 'Le CO2 agit par ?', options: ['Refroidissement', 'Étouffement', 'Inhibition', 'Appauvrissement'], correctIndex: 1, explanation: 'Le CO2 étouffe le feu en remplaçant l\'oxygène.' },
        { question: 'Le comburant est généralement ?', options: ['L\'azote', 'L\'oxygène', 'Le CO2', 'L\'hélium'], correctIndex: 1, explanation: 'Le comburant est généralement l\'oxygène de l\'air.' },
        { question: 'Pour éteindre un feu, il suffit de ?', options: ['Ajouter de l\'eau', 'Supprimer un élément du triangle', 'Souffler dessus', 'Fermer les yeux'], correctIndex: 1, explanation: 'Supprimer un seul élément du triangle suffit à éteindre le feu.' },
        { question: 'La poudre agit par ?', options: ['Refroidissement', 'Étouffement', 'Inhibition de la réaction en chaîne', 'Appauvrissement'], correctIndex: 2, explanation: 'La poudre inhibe la réaction en chaîne.' },
        { question: 'La convection propage le feu par ?', options: ['Les matériaux', 'Les courants d\'air chaud', 'Les rayons', 'Le sol'], correctIndex: 1, explanation: 'La convection propage le feu par les courants d\'air chaud.' },
        { question: 'Un combustible est ?', options: ['De l\'eau', 'Une matière susceptible de brûler', 'De l\'oxygène', 'Un extincteur'], correctIndex: 1, explanation: 'Un combustible est une matière qui peut brûler.' },
        { question: 'L\'énergie d\'activation peut être ?', options: ['De l\'eau', 'Une étincelle', 'Du CO2', 'De la mousse'], correctIndex: 1, explanation: 'L\'énergie d\'activation peut être une flamme, étincelle ou chaleur.' },
      ],
    },
    {
      title: 'Les classes de feux et les extincteurs',
      content: `# Les classes de feux et les extincteurs

## Les 5 classes de feux

| Classe | Nature du feu | Exemples |
|--------|-------------|--------|
| **A** | Solides (braisant) | Bois, papier, carton, tissu |
| **B** | Liquides | Essence, huile, solvants, peinture |
| **C** | Gaz | Gaz naturel, propane, butane |
| **D** | Métaux | Magnésium, aluminium, sodium |
| **F** | Huiles de cuisson | Friteuses, poêles |

## Les types d\'extincteurs

### Eau pulvérisée (classe A)
- Jet pulvérisé ou eau + additif
- Ne JAMAIS sur un feu de classe B (huile) ou feu électrique

### Poudre ABC (classes A, B, C)
- Le plus polyvalent
- Actions : refroidissement, étouffement, inhibition
- Inconvénient : endommagement des équipements

### CO2 (classes B, feu électrique)
- Ne laisse pas de résidu
- Utilisé près des équipements électriques
- Danger en espace confiné (risque d\'asphyxie)

### Mousse (classe B)
- Crée un film isolant à la surface du liquide
- Très efficace sur les feux d\'hydrocarbures

## Comment lire un extincteur

Vérifier :
1. La **classe de feu** indiquée
2. La **capacité** (ex: 6 litres, 6 kg)
3. La **date de validité** (révision annuelle)
4. Le **marquage CE**`,
      questions: [
        { question: 'La classe A correspond aux feux de ?', options: ['Liquides', 'Solides', 'Gaz', 'Métaux'], correctIndex: 1, explanation: 'La classe A correspond aux feux de solides (bois, papier...).' },
        { question: 'Un extincteur à CO2 est utilisé sur ?', options: ['Feu de bois', 'Feu électrique et liquide', 'Feu de métal', 'Feu de gaz'], correctIndex: 1, explanation: 'Le CO2 est utilisé sur les feux de liquides et feux électriques.' },
        { question: 'La classe F correspond aux ?', options: ['Feux de gaz', 'Huiles de cuisson', 'Feux de métaux', 'Feux électriques'], correctIndex: 1, explanation: 'La classe F est pour les huiles de cuisson (friteuses).' },
        { question: 'Peut-on utiliser de l\'eau sur un feu d\'huile ?', options: ['Oui', 'Non, jamais', 'Seulement en petite quantité', 'Ça dépend'], correctIndex: 1, explanation: 'L\'eau est interdite sur les feux de liquides (classe B).' },
        { question: 'La poudre ABC est dite polyvalente car ?', options: ['Elle est moins chère', 'Elle couvre les classes A, B et C', 'Elle est plus légère', 'Elle dure plus longtemps'], correctIndex: 1, explanation: 'La poudre ABC couvre les classes A, B et C.' },
        { question: 'La classe D correspond aux ?', options: ['Solides', 'Liquides', 'Gaz', 'Métaux'], correctIndex: 3, explanation: 'La classe D est pour les feux de métaux.' },
        { question: 'Le CO2 a un inconvénient en espace confiné ?', options: ['Il est trop cher', 'Risque d\'asphyxie', 'Il est inefficace', 'Il détruit les équipements'], correctIndex: 1, explanation: 'Le CO2 peut provoquer une asphyxie en espace confiné.' },
        { question: 'La mousse est efficace sur ?', options: ['Feu de bois', 'Feu d\'hydrocarbures', 'Feu électrique', 'Feu de métal'], correctIndex: 1, explanation: 'La mousse crée un film isolant très efficace sur les feux d\'hydrocarbures.' },
        { question: 'Quelle est la fréquence de révision d\'un extincteur ?', options: ['Tous les 2 ans', 'Annuelle', 'Tous les 5 ans', 'Tous les 10 ans'], correctIndex: 1, explanation: 'Les extincteurs doivent être révisés annuellement.' },
        { question: 'La classe C correspond aux feux de ?', options: ['Solides', 'Liquides', 'Gaz', 'Métaux'], correctIndex: 2, explanation: 'La classe C est pour les feux de gaz.' },
      ],
    },
    {
      title: 'La prévention des risques d\'incendie',
      content: `# La prévention des risques d'incendie

## Les mesures de prévention structurelles

### La compartimentage
Division des bâtiments en **secteurs coupe-feu** pour limiter la propagation.

### Les matériaux résistant au feu
- **M0** : Incombustible
- **M1** : Non inflammable
- **M2** : Faiblement inflammable
- **M3** : Moyennement inflammable
- **M4** : Très inflammable

### Les installations techniques
- **Désenfumage** : évacuation des fumées
- **Sprinklers** : extincteurs automatiques au plafond
- **Colonnes sèches** : points d\'eau pour les pompiers
- **Systèmes d\'alarme incendie** : détection automatique

## Les mesures organisationnelles

### Le stockage des produits inflammables
- Stockage dans des armoires spécifiques
- Limites des quantités par zone
- Ventilation des locaux

### Les travaux à risque
- Permis de feu obligatoire
- Surveillance pendant et après les travaux
- Disponibilité de moyens d\'extinction

### L\'entretien des installations
- Vérification annuelle des extincteurs
- Maintenance des systèmes d\'alarme
- Nettoyage des conduits de ventilation

## Les bonnes pratiques
- Ne pas obstruer les voies d\'évacuation
- Ne pas stocker de matériaux dans les escaliers
- Maintenir les portes coupe-feu fermées
- Respecter les interdictions de fumer`,
      questions: [
        { question: 'M0 signifie ?', options: ['Moyennement inflammable', 'Incombustible', 'Très inflammable', 'Faiblement inflammable'], correctIndex: 1, explanation: 'M0 = incombustible, le plus sûr.' },
        { question: 'Le compartimentage sert à ?', options: ['Décorer', 'Limiter la propagation du feu', 'Chauffer le bâtiment', 'Isoler du bruit'], correctIndex: 1, explanation: 'Le compartimentage divise le bâtiment en secteurs coupe-feu.' },
        { question: 'Un sprinkler est ?', options: ['Un détecteur de fumée', 'Un extincteur automatique au plafond', 'Un extincteur portatif', 'Une alarme sonore'], correctIndex: 1, explanation: 'Un sprinkler est un extincteur automatique installé au plafond.' },
        { question: 'Le permis de feu est obligatoire pour ?', options: ['Tous les travaux', 'Les travaux à risque d\'incendie', 'Le nettoyage', 'La livraison'], correctIndex: 1, explanation: 'Le permis de feu est obligatoire pour les travaux à risque.' },
        { question: 'M4 signifie ?', options: ['Incombustible', 'Faiblement inflammable', 'Très inflammable', 'Non inflammable'], correctIndex: 2, explanation: 'M4 = très inflammable, le plus dangereux.' },
        { question: 'Les portes coupe-feu doivent être ?', options: ['Ouvertes', 'Fermées', 'Bloquées', 'Supprimées'], correctIndex: 1, explanation: 'Les portes coupe-feu doivent rester fermées pour être efficaces.' },
        { question: 'Les colonnes sèches servent à ?', options: ['Arroser le jardin', 'Fournir de l\'eau aux pompiers', 'Évacuer l\'eau', 'Stocker les produits'], correctIndex: 1, explanation: 'Les colonnes sèches sont des points d\'eau pour les pompiers.' },
        { question: 'La fréquence de vérification des extincteurs est ?', options: ['Tous les 5 ans', 'Annuelle', 'Mensuelle', 'Hebdomadaire'], correctIndex: 1, explanation: 'Les extincteurs doivent être vérifiés annuellement.' },
        { question: 'Le désenfumage sert à ?', options: ['Chauffer le bâtiment', 'Évacuer les fumées toxiques', 'Créer du feu', 'Refroidir les murs'], correctIndex: 1, explanation: 'Le désenfumage évacue les fumées pour faciliter l\'évacuation.' },
        { question: 'Peut-on stocker dans les escaliers ?', options: ['Oui', 'Non, jamais', 'Seulement du papier', 'Seulement en bas'], correctIndex: 1, explanation: 'Il ne faut jamais stocker dans les voies d\'évacuation.' },
      ],
    },
    {
      title: 'Les systèmes de détection et d\'alarme',
      content: `# Les systèmes de détection et d'alarme

## Les détecteurs d'incendie

### Détecteurs de fumée
Les plus courants. Fonctionnent par **ionisation** ou par **effet optique**.
- Plafond : au minimum 30 cm des murs
- Chaque pièce devrait en être équipée

### Détecteurs de chaleur
Réagissent à l\'augmentation de température.
- Fixe : déclenchement à une température donnée
- Différentiel : déclenchement sur une vitesse de montée en température

### Détecteurs de flamme
Réagissent aux rayonnements UV ou IR. Très rapides.

## Les systèmes d\'alarme

### L\'alarme incendie
- **Sonore** : sirène avec un niveau sonore minimum de 90 dB
- **Visuelle** : voyants clignotants pour les personnes malentendantes

### Les centrales d\'alarme
- Centralisent les informations des détecteurs
- Identifient la zone en alarme
- Transmettent l\'alerte aux secours

## Les consignes en cas de déclenchement
1. **Ne pas paniquer**
2. Identifier la source de l\'alarme
3. Si feu : déclencher l\'alarme et évacuer
4. Si fausse alarme : informer la sécurité
5. Ne jamais désactiver un détecteur`,
      questions: [
        { question: 'Les détecteurs les plus courants sont ?', options: ['De flamme', 'De fumée', 'De chaleur', 'De gaz'], correctIndex: 1, explanation: 'Les détecteurs de fumée sont les plus courants.' },
        { question: 'Le niveau sonore minimum d\'une alarme incendie est ?', options: ['50 dB', '70 dB', '90 dB', '120 dB'], correctIndex: 2, explanation: 'Le minimum est de 90 dB pour être audible partout.' },
        { question: 'Un détecteur de fumée optique fonctionne par ?', options: ['Ionisation', 'Obscuration d\'un faisceau lumineux', 'Augmentation de température', 'Présence de CO2'], correctIndex: 1, explanation: 'L\'effet optique détecte la fumée par l\'obscuration de la lumière.' },
        { question: 'Un détecteur de chaleur réagit à ?', options: ['La fumée', 'L\'augmentation de température', 'Les flammes', 'Le CO2'], correctIndex: 1, explanation: 'Le détecteur de chaleur réagit à la montée en température.' },
        { question: 'Les détecteurs de flamme sont ?', options: ['Lents', 'Très rapides', 'Inutiles', 'Obligatoires partout'], correctIndex: 1, explanation: 'Les détecteurs de flamme sont très rapides car ils détectent les UV/IR.' },
        { question: 'Où placer un détecteur de fumée ?', options: ['Sur le mur', 'Au plafond à 30 cm des murs', 'Sur le sol', 'Dans un placard'], correctIndex: 1, explanation: 'Au plafond, à au minimum 30 cm des murs.' },
        { question: 'Que faire en cas de fausse alarme ?', options: ['Désactiver le détecteur', 'Informer la sécurité', 'Ignorer', 'Partir'], correctIndex: 1, explanation: 'Il faut informer la sécurité, ne jamais désactiver un détecteur.' },
        { question: 'La centrale d\'alarme centralise ?', options: ['L\'eau', 'Les informations des détecteurs', 'L\'électricité', 'Le chauffage'], correctIndex: 1, explanation: 'La centrale centralise les informations de tous les détecteurs.' },
        { question: 'Les voyants visuels sont pour ?', options: ['Décorer', 'Les personnes malentendantes', 'Les enfants', 'Les visiteurs'], correctIndex: 1, explanation: 'Les voyants visuels sont pour les personnes malentendantes.' },
        { question: 'Peut-on désactiver un détecteur ?', options: ['Oui', 'Non, jamais', 'Seulement temporairement', 'Seulement un technicien'], correctIndex: 1, explanation: 'Il ne faut jamais désactiver un détecteur d\'incendie.' },
      ],
    },
    {
      title: 'Les plans d\'évacuation et de secours',
      content: `# Les plans d'évacuation et de secours

## Le plan d'évacuation

### Définition
Un **plan d\'évacuation** est un document qui définit les consignes à suivre en cas d\'incendie ou d\'autre urgence nécessitant l\'évacuation du bâtiment.

### Contenu du plan
1. **Plan de localisation** : plan du bâtiment avec les issues de secours
2. **Consignes d\'évacuation** : ce que chaque personne doit faire
3. **Plan de regroupement** : point de rassemblement extérieur
4. **Liste des responsables** : personnes chargées de guider l\'évacuation
5. **Numéros d\'urgence**

## Les issues de secours

### Caractéristiques
- Signalées par un **pictogramme vert** (bonhomme courant vers une porte)
- Toujours **dégagées** et **accessibles**
- Équipées de **barres anti-panique**
- Éclairées même en cas de coupure de courant

### Règles
- Ne JAMAIS utiliser les ascenseurs
- Ne JAMAIS retourner chercher des affaires
- Descendre les escaliers en marchant (pas courir)

## Le point de rassemblement

- Situé à l\'extérieur, à une **distance de sécurité** du bâtiment
- Connu de tous les occupants
- Équipé d\'un plan affiché
- Un **responsable** y fait l\'appel`,
      questions: [
        { question: 'Le pictogramme des issues de secours est de couleur ?', options: ['Rouge', 'Vert', 'Bleu', 'Jaune'], correctIndex: 1, explanation: 'Le pictogramme est vert avec un bonhomme courant vers une porte.' },
        { question: 'Peut-on utiliser les ascenseurs en cas d\'incendie ?', options: ['Oui', 'Non, jamais', 'Seulement au dernier étage', 'Seulement les pompiers'], correctIndex: 1, explanation: 'Il ne faut JAMAIS utiliser les ascenseurs en cas d\'incendie.' },
        { question: 'Le point de rassemblement est ?', options: ['Dans le hall', 'À l\'extérieur à distance de sécurité', 'Au sous-sol', 'Dans les toilettes'], correctIndex: 1, explanation: 'Le point de rassemblement est à l\'extérieur, à distance de sécurité.' },
        { question: 'Que fait-on au point de rassemblement ?', options: ['On rentre', 'Un responsable fait l\'appel', 'On attend 5 minutes', 'On part'], correctIndex: 1, explanation: 'Un responsable fait l\'appel au point de rassemblement.' },
        { question: 'Les issues de secours doivent être ?', options: ['Fermées à clé', 'Dégagées et accessibles', 'Cachées', 'Étroites'], correctIndex: 1, explanation: 'Les issues de secours doivent toujours être dégagées et accessibles.' },
        { question: 'Faut-il retourner chercher des affaires ?', options: ['Oui, si c\'est rapide', 'Non, jamais', 'Seulement les documents', 'Seulement le téléphone'], correctIndex: 1, explanation: 'Il ne faut JAMAIS retourner chercher des affaires.' },
        { question: 'Dans les escaliers, on ?', options: ['Court', 'Marche', 'Saute', 'Rampe'], correctIndex: 1, explanation: 'On descend les escaliers en marchant, sans courir.' },
        { question: 'Les barres anti-panique sont sur ?', options: ['Les fenêtres', 'Les issues de secours', 'Les ascenseurs', 'Les portes normales'], correctIndex: 1, explanation: 'Les barres anti-panique équipent les issues de secours.' },
        { question: 'L\'éclairage des issues doit fonctionner ?', options: ['Uniquement le jour', 'Même en cas de coupure de courant', 'Uniquement la nuit', 'Uniquement quand on appuie'], correctIndex: 1, explanation: 'L\'éclairage de sécurité fonctionne même en cas de coupure.' },
        { question: 'Le plan d\'évacuation inclut ?', options: ['Uniquement le plan du bâtiment', 'Les consignes, le plan, le regroupement et les responsables', 'Uniquement les numéros d\'urgence', 'Uniquement les noms des salariés'], correctIndex: 1, explanation: 'Le plan inclut consignes, localisation, regroupement et responsables.' },
      ],
    },
    {
      title: 'Le rôle des équipes d\'évacuation',
      content: `# Le rôle des équipes d'évacuation

## Qui compose les équipes ?

Les **guides** et **serres-file** sont désignés parmi les salariés volontaires ou désignés.

## Le rôle du guide

1. **Vérifier** que tous les occupants de son secteur ont évacué
2. **Fermer les portes** derrière le dernier évacué
3. **Guider** les personnes vers les issues de secours
4. **Faire le compte** au point de rassemblement
5. **Rendre compte** au responsable de sécurité

## Le rôle du serre-file

1. **Ouvrir** les portes de secours
2. **Maintenir l\'ordre** lors de l\'évacuation
3. **Aider** les personnes à mobilité réduite
4. **Diriger** le flux vers le point de rassemblement
5. **S\'assurer** que personne ne retourne à l\'intérieur

## La formation des équipes

Les guides et serres-file doivent recevoir une **formation spécifique** :
- Connaissance du bâtiment et des issues
- Utilisation des extincteurs
- Techniques d\'évacuation
- Gestion des personnes à mobilité réduite

## Les personnes à mobilité réduite (PMR)

### Mesures spécifiques
- **Zones de refuge** : zones protégées où les PMR attendent les secours
- **Évacuateurs** : chaises d\'évacuation pour les escaliers
- **Accompagnement** : chaque PMR est assignée à un accompagnant`,
      questions: [
        { question: 'Le guide fait quoi en premier ?', options: ['Ouvrir les portes', 'Vérifier que tous ont évacué son secteur', 'Courir dehors', 'Appeler le SAMU'], correctIndex: 1, explanation: 'Le guide vérifie d\'abord que tous les occupants ont évacué.' },
        { question: 'Le serre-file ouvre les ?', options: ['Fenêtres', 'Portes de secours', 'Armoires', 'Coffres'], correctIndex: 1, explanation: 'Le serre-file ouvre les portes de secours.' },
        { question: 'Que fait le guide au point de rassemblement ?', options: ['Il rentre', 'Il fait le compte', 'Il part', 'Il mange'], correctIndex: 1, explanation: 'Le guide fait le compte des personnes évacuées.' },
        { question: 'Les équipes doivent-elles être formées ?', options: ['Non', 'Oui, spécifiquement', 'Uniquement en ligne', 'Uniquement par lecture'], correctIndex: 1, explanation: 'Les guides et serres-file doivent recevoir une formation spécifique.' },
        { question: 'Une zone de refuge est pour ?', options: ['Les enfants', 'Les PMR', 'Les visiteurs', 'Les directeurs'], correctIndex: 1, explanation: 'Les zones de refuge sont pour les personnes à mobilité réduite.' },
        { question: 'Le serre-file aide les ?', options: ['Pompiers', 'Personnes à mobilité réduite', 'Directeurs', 'Livreurs'], correctIndex: 1, explanation: 'Le serre-file aide les personnes à mobilité réduite.' },
        { question: 'Le guide ferme les portes ?', options: ['Oui, derrière le dernier évacué', 'Non', 'Avant l\'évacuation', 'Uniquement la nuit'], correctIndex: 0, explanation: 'Le guide ferme les portes derrière le dernier évacué.' },
        { question: 'Un évacuateur est ?', options: ['Un extincteur', 'Une chaise d\'évacuation pour les escaliers', 'Un ascenseur', 'Un tapis roulant'], correctIndex: 1, explanation: 'Un évacuateur est une chaise pour évacuer les PMR dans les escaliers.' },
        { question: 'Qui désigne les guides et serres-file ?', options: ['Les pompiers', 'L\'employeur', 'Les clients', 'Le maire'], correctIndex: 1, explanation: 'L\'employeur désigne les guides et serres-file.' },
        { question: 'Le serre-file s\'assure que ?', options: ['Les lumières sont éteintes', 'Personne ne retourne à l\'intérieur', 'Les fenêtres sont ouvertes', 'Les ordinateurs sont éteints'], correctIndex: 1, explanation: 'Le serre-file s\'assure que personne ne retourne à l\'intérieur.' },
      ],
    },
    {
      title: 'Les extincteurs : choix et utilisation',
      content: `# Les extincteurs : choix et utilisation

## Comment choisir un extincteur ?

1. **Identifier les risques** présents dans le local
2. **Déterminer la classe de feu** la plus probable
3. **Choisir l\'extincteur adapté**
4. **Vérifier la capacité** adaptée à la surface du local

## Le protocole d'utilisation : la méthode P.A.S.S.

### P - Percuter
Retirer la goupille en percutant l\'extincteur.

### A - Appuyer
Appuyer sur la poignée pour libérer l\'agent extincteur.

### S - Sécouer (viser)
Viser la **base des flammes**, pas le sommet.

### S - Sélectionner
Effectuer un **mouvement de balayage** de gauche à droite à la base du feu.

## Les règles de sécurité

- Toujours attaquer le feu **face au vent** (dos au vent)
- Commencer à **3 à 5 mètres** du feu
- Se tenir toujours prêt à **s\'échapper**
- Si le feu n\'est pas maîtrisé en **30 secondes**, évacuer
- **Ne jamais** retourner dans un local en feu

## Les erreurs fréquentes
- Viser le sommet des flammes au lieu de la base
- Être trop près du feu
- Oublier de retirer la goupille
- Utiliser le mauvais type d\'extincteur
- Essayer d\'éteindre un feu trop important`,
      questions: [
        { question: 'La méthode P.A.S.S. signifie ?', options: ['Protéger, Attendre, Sortir, Secourir', 'Percuter, Appuyer, Viser, Sélectionner', 'Pousser, Attraper, Serrer, Soulever', 'Parler, Analyser, Sonner, Sortir'], correctIndex: 1, explanation: 'P.A.S.S. = Percuter, Appuyer, Sécouer/Viser, Sélectionner/Balayer.' },
        { question: 'Où viser avec l\'extincteur ?', options: ['Le sommet des flammes', 'La base des flammes', 'Le plafond', 'Les murs'], correctIndex: 1, explanation: 'On doit viser la base des flammes, pas le sommet.' },
        { question: 'Si le feu n\'est pas maîtrisé en 30 secondes ?', options: ['Continuer', 'Évacuer', 'Chercher un autre extincteur', 'Appeler un ami'], correctIndex: 1, explanation: 'Si le feu n\'est pas maîtrisé en 30 secondes, il faut évacuer.' },
        { question: 'On attaque le feu ?', options: ['Dos au vent', 'Face au vent', 'De côté', 'Peu importe'], correctIndex: 0, explanation: 'On attaque le feu dos au vent pour ne pas recevoir la chaleur.' },
        { question: 'On commence à quelle distance du feu ?', options: ['1 mètre', '3 à 5 mètres', '10 mètres', '20 mètres'], correctIndex: 1, explanation: 'On commence à 3 à 5 mètres du feu.' },
        { question: 'La première étape de P.A.S.S. est ?', options: ['Appuyer', 'Percuter (retirer la goupille)', 'Viser', 'Balayer'], correctIndex: 1, explanation: 'On percutre d\'abord pour retirer la goupille de sécurité.' },
        { question: 'Une erreur fréquente est ?', options: ['D\'être trop loin', 'De viser le sommet des flammes', 'D\'utiliser trop d\'extincteur', 'D\'appeler les secours'], correctIndex: 1, explanation: 'Une erreur fréquente est de viser le sommet au lieu de la base.' },
        { question: 'Peut-on retourner dans un local en feu ?', options: ['Oui', 'Non, jamais', 'Seulement si le feu est petit', 'Seulement pour sauver quelqu\'un'], correctIndex: 1, explanation: 'On ne retourne JAMAIS dans un local en feu.' },
        { question: 'Après avoir retiré la goupille, on ?', options: ['Jette l\'extincteur', 'Appuie sur la poignée', 'Le range', 'Le pose par terre'], correctIndex: 1, explanation: 'Après avoir retiré la goupille, on appuie sur la poignée.' },
        { question: 'Le mouvement de balayage se fait ?', options: ['De haut en bas', 'De gauche à droite à la base', 'En cercle', 'En zigzag'], correctIndex: 1, explanation: 'On effectue un balayage de gauche à droite à la base du feu.' },
      ],
    },
    {
      title: 'Les exercices d\'évacuation',
      content: `# Les exercices d'évacuation

## Pourquoi des exercices ?

Les exercices d\'évacuation sont **obligatoires** et permettent de :
- Vérifier l\'efficacité du plan d\'évacuation
- Former les occupants aux consignes
- Tester les installations (alarmes, éclairage)
- Identifier les points à améliorer

## La fréquence

- **Au minimum une fois par an** dans les ERP (Établissements Recevant du Public)
- **Deux fois par an** dans les immeubles de grande hauteur (IGH)
- Recommandé **trimestriellement** dans les entreprises à risques

## Le déroulement

### 1. Préparation
- Fixer la date et l\'heure
- Prévenir les occupants (ou exercice à surprise)
- Préparer les observateurs à chaque étage
- Vérifier le fonctionnement de l\'alarme

### 2. Déclenchement
- Déclencher l\'alarme incendie
- Chronométrer l\'évacuation

### 3. Évacuation
- Les guides et serres-file exécutent leur rôle
- Tous les occupants évacuent
- Comptage au point de rassemblement

### 4. Bilan
- Temps d\'évacuation (objectif : < 5 minutes)
- Problèmes constatés
- Actions correctives à mettre en place
- Rédaction du compte rendu

## Les critères de réussite
- Temps d\'évacuation < 5 minutes
- 100% des occupants évacués
- Aucun incident
- Alarme audible dans tout le bâtiment`,
      questions: [
        { question: 'Les exercices d\'évacuation sont ?', options: ['Facultatifs', 'Obligatoires', 'Uniquement dans les écoles', 'Uniquement en cas de feu'], correctIndex: 1, explanation: 'Les exercices d\'évacuation sont obligatoires.' },
        { question: 'L\'objectif de temps d\'évacuation est ?', options: ['1 minute', 'Moins de 5 minutes', '10 minutes', '30 minutes'], correctIndex: 1, explanation: 'L\'objectif est un temps d\'évacuation inférieur à 5 minutes.' },
        { question: 'La fréquence minimale dans les ERP est ?', options: ['Mensuelle', 'Trimestrielle', 'Annuelle', 'Biennale'], correctIndex: 2, explanation: 'Au minimum une fois par an dans les ERP.' },
        { question: 'Dans les IGH, la fréquence est ?', options: ['Annuelle', 'Semestrielle (2 fois par an)', 'Mensuelle', 'Hebdomadaire'], correctIndex: 1, explanation: 'Deux fois par an dans les immeubles de grande hauteur.' },
        { question: 'Que fait-on après l\'exercice ?', options: ['Rien', 'Un bilan avec temps, problèmes et actions correctives', 'Une fête', 'Un rapport au maire uniquement'], correctIndex: 1, explanation: 'On fait un bilan complet avec actions correctives.' },
        { question: 'ERP signifie ?', options: ['Établissement Recevant du Public', 'Entreprise de Répartition des Produits', 'Entrepôt de Réservation de Protection', 'Équipement de Réponse Protégée'], correctIndex: 0, explanation: 'ERP = Établissement Recevant du Public.' },
        { question: 'Qui chronomètre l\'évacuation ?', options: ['Personne', 'Un observateur désigné', 'Les pompiers', 'Le maire'], correctIndex: 1, explanation: 'Un observateur chronomètre l\'évacuation.' },
        { question: 'Peut-on prévenir les occupants à l\'avance ?', options: ['Non, jamais', 'Oui, ou à surprise', 'Uniquement par écrit', 'Uniquement les cadres'], correctIndex: 1, explanation: 'On peut prévenir à l\'avance ou faire un exercice à surprise.' },
        { question: 'Le critère de 100% des occupants signifie ?', options: ['100% sont contents', 'Tous les occupants ont évacué', '100% savent nager', '100% ont un EPI'], correctIndex: 1, explanation: 'Tous les occupants doivent avoir été évacués.' },
        { question: 'Que vérifie-t-on avant l\'exercice ?', options: ['Le chauffage', 'Le fonctionnement de l\'alarme', 'Les robinets', 'Les ascenseurs'], correctIndex: 1, explanation: 'On vérifie le fonctionnement de l\'alarme avant l\'exercice.' },
      ],
    },
  ],
},
{
  title: 'Le Cadre Réglementaire HSE et les Obligations de l\'Employeur',
  slug: 'cadre-reglementaire-hse',
  description: 'Comprenez le cadre juridique de la sécurité au travail : les obligations de l\'employeur, les droits des salariés, les instances représentatives et les sanctions en cas de manquement.',
  shortDescription: 'Le cadre juridique et les obligations de l\'employeur en HSE.',
  totalHours: '3h',
  icon: 'Scale',
  order: 6,
  chapters: [
    {
      title: 'Les sources du droit du travail',
      content: `# Les sources du droit du travail

## La hiérarchie des normes

| Niveau | Source | Exemple |
|--------|--------|--------|
| **International** | Traités, conventions OIT | Convention OIT n°155 |
| **Européen** | Directives, règlements UE | Directive Cadre 89/391 |
| **National** | Lois, décrets, arrêtés | Code du travail |
| **Conventionnel** | Accords collectifs, conventions | Convention collective |
| **Entreprise** | Règlement intérieur, notes de service | Note HSE |

## Les sources principales en HSE

### Le Code du travail
Le Code du travail est la **source principale** du droit de la sécurité au travail en France.

**Articles clés :**
- L4121-1 : Obligation générale de sécurité de l\'employeur
- L4121-2 : Principes généraux de prévention
- R4121-1 à R4121-3 : Document Unique (DUERP)
- L4122-1 : Obligation de former et d\'informer

### La Directive Cadre 89/391/CEE
Texte fondateur européen qui a imposé le principe de **prévention** dans tous les États membres.

### Les normes ISO
Bien que non obligatoires, les normes ISO (9001, 14001, 45001) sont des références reconnues.

### La jurisprudence
Les décisions de justice viennent préciser l\'interprétation du droit. L\'employeur a une **obligation de résultat** en matière de sécurité.`,
      questions: [
        { question: 'Quelle est la source principale du droit HSE ?', options: ['La jurisprudence européenne', 'Le Code du travail', 'Les normes ISO', 'Les conventions collectives'], correctIndex: 1, explanation: 'Le Code du travail est la source principale en France.' },
        { question: 'L\'article L4121-1 concerne ?', options: ['Les salaires', 'L\'obligation générale de sécurité', 'Les congés', 'Le licenciement'], correctIndex: 1, explanation: 'L4121-1 pose l\'obligation générale de sécurité de l\'employeur.' },
        { question: 'La Directive 89/391 est ?', options: ['Française', 'Européenne (cadre HSE)', 'Américaine', 'Internationale'], correctIndex: 1, explanation: 'La Directive Cadre 89/391/CEE est le texte fondateur européen.' },
        { question: 'L\'employeur a une obligation de ?', options: ['Moyen', 'Résultat en sécurité', 'Information uniquement', 'Formation uniquement'], correctIndex: 1, explanation: 'L\'employeur a une obligation de résultat en matière de sécurité.' },
        { question: 'Les normes ISO sont-elles obligatoires ?', options: ['Oui, toujours', 'Non, ce sont des références volontaires', 'Uniquement pour les grandes entreprises', 'Uniquement en Europe'], correctIndex: 1, explanation: 'Les normes ISO sont volontaires, non obligatoires.' },
        { question: 'Quelle est la hiérarchie supérieure ?', options: ['Code du travail', 'Règlement européen', 'Convention collective', 'Règlement intérieur'], correctIndex: 1, explanation: 'Le droit européen est supérieur au droit national.' },
        { question: 'L\'article L4121-2 liste ?', options: ['Les salaires minimaux', 'Les 9 principes de prévention', 'Les jours fériés', 'Les congés annuels'], correctIndex: 1, explanation: 'L4121-2 énonce les 9 principes généraux de prévention.' },
        { question: 'La convention OIT n°155 concerne ?', options: ['Le commerce', 'La sécurité et santé des travailleurs', 'L\'environnement', 'Les salaires'], correctIndex: 1, explanation: 'La convention OIT n°155 traite de la sécurité et santé au travail.' },
        { question: 'Le règlement intérieur est de niveau ?', options: ['International', 'Européen', 'National', 'Entreprise'], correctIndex: 3, explanation: 'Le règlement intérieur est une source de niveau entreprise.' },
        { question: 'La jurisprudence en HSE sert à ?', options: ['Rien', 'Préciser l\'interprétation du droit', 'Remplacer le Code du travail', 'Créer de nouvelles lois'], correctIndex: 1, explanation: 'La jurisprudence précise l\'interprétation des textes.' },
      ],
    },
    {
      title: 'Les obligations générales de l\'employeur',
      content: `# Les obligations générales de l'employeur

## L'obligation de sécurité (art. L4121-1)

L\'employeur doit prendre les mesures nécessaires pour assurer la **sécurité et protéger la santé physique et mentale** des travailleurs.

### Obligation de résultat
L\'employeur ne peut pas se contenter de prendre des mesures. Il doit obtenir un **résultat effectif** : aucun accident ne doit survenir.

## Les actions concrètes

### 1. Évaluer les risques
- Établir et mettre à jour le DUERP
- Identifier tous les dangers

### 2. Prévenir les risques
- Mettre en place des mesures de prévention collectives
- Fournir des EPI si nécessaire

### 3. Former et informer
- Formation à la sécurité lors de l\'embauche
- Formation continue et adaptation
- Information sur les risques

### 4. Organiser le travail
- Adapter les postes de travail
- Aménager les horaires
- Prévenir les RPS

### 5. Suivre la santé
- Organiser la médecine du travail
- Assurer le suivi de l\'exposition
- Déclarer les accidents et maladies professionnelles

## La faute inexcusable de l\'employeur

Si l\'employeur avait conscience du danger et n\'a pas pris les mesures nécessaires, sa responsabilité pénale peut être engagée pour **faute inexcusable**.`,
      questions: [
        { question: 'L\'employeur a une obligation de ?', options: ['Moyen en sécurité', 'Résultat en sécurité', 'Bonne volonté', 'Formation'], correctIndex: 1, explanation: 'L\'employeur doit obtenir un résultat effectif en sécurité.' },
        { question: 'La faute inexcusable implique ?', options: ['Une récompense', 'Une responsabilité pénale', 'Une promotion', 'Un bonus'], correctIndex: 1, explanation: 'La faute inexcusable engage la responsabilité pénale.' },
        { question: 'L\'employeur doit-il organiser la médecine du travail ?', options: ['Non', 'Oui, c\'est obligatoire', 'Uniquement si demandé', 'Uniquement dans l\'industrie'], correctIndex: 1, explanation: 'L\'organisation de la médecine du travail est obligatoire.' },
        { question: 'L\'article L4121-1 impose de protéger ?', options: ['Uniquement la santé physique', 'La santé physique et mentale', 'Uniquement les bâtiments', 'Uniquement l\'environnement'], correctIndex: 1, explanation: 'L\'employeur doit protéger la santé physique ET mentale.' },
        { question: 'La formation à la sécurité lors de l\'embauche est ?', options: ['Facultative', 'Obligatoire', 'Payante pour le salarié', 'Uniquement pour les cadres'], correctIndex: 1, explanation: 'La formation à la sécurité est obligatoire à l\'embauche.' },
        { question: 'Que doit faire l\'employeur face aux RPS ?', options: ['Rien', 'Les prévenir', 'Les ignorer', 'Les payer'], correctIndex: 1, explanation: 'L\'employeur doit prévenir les risques psychosociaux.' },
        { question: 'La déclaration des accidents du travail est ?', options: ['Facultative', 'Obligatoire', 'Uniquement si grave', 'Uniquement sur demande'], correctIndex: 1, explanation: 'La déclaration des accidents du travail est obligatoire.' },
        { question: 'Combien d\'actions concrètes sont listées ?', options: ['3', '4', '5', '6'], correctIndex: 2, explanation: '5 actions : évaluer, prévenir, former, organiser, suivre.' },
        { question: 'L\'employeur peut-il se contenter de prendre des mesures ?', options: ['Oui', 'Non, il doit obtenir un résultat', 'Seulement en petite entreprise', 'Seulement dans le BTP'], correctIndex: 1, explanation: 'L\'obligation de résultat va au-delà de la simple prise de mesures.' },
        { question: 'Quand la faute inexcusable est-elle retenue ?', options: ['Toujours', 'Quand l\'employeur connaissait le danger et n\'a pas agi', 'Jamais', 'Uniquement en cas de décès'], correctIndex: 1, explanation: 'Quand l\'employeur avait conscience du danger sans agir.' },
      ],
    },
    {
      title: 'Le DUERP et les plans d\'action',
      content: `# Le DUERP et les plans d'action

## Rappel : le DUERP
Le Document Unique d\'Évaluation des Risques Professionnels est obligatoire dans toute entreprise depuis 2001.

## Le contenu du DUERP

### L\'inventaire des risques
Pour chaque **unité de travail**, identifier :
- Les dangers
- Les risques associés
- Les travailleurs exposés

### L\'évaluation
- Gravité et probabilité
- Niveau de risque (matrice)

### Les mesures de prévention
- Mesures existantes
- Mesures prévues

## Le plan d\'action

Le DUERP doit être accompagné d\'un **plan d\'action** comprenant :

| Action | Responsable | Délai | Indicateur | Statut |
|--------|------------|-------|-----------|--------|
| Installer aspiration | M. Dupont | 15/03 | Niveau poussière | En cours |
| Former aux EPI | Mme Martin | 01/06 | % formés | À faire |

## La mise en œuvre

1. **Prioriser** les actions selon le niveau de risque
2. **Allouer les ressources** (budget, temps, personnel)
3. **Suivre** l\'avancement avec des indicateurs
4. **Communiquer** sur les actions réalisées

## Le dépôt numérique

Depuis 2022, le DUERP doit être déposé sur un **portail numérique** du ministère du Travail, dans un format standardisé.

## Les sanctions
- Amende de 1 500 € (3 000 en récidive)
- Responsabilité pénale en cas d\'accident`,
      questions: [
        { question: 'Le DUERP doit-il être accompagné d\'un plan d\'action ?', options: ['Non', 'Oui', 'Uniquement si demandé', 'Uniquement dans les grandes entreprises'], correctIndex: 1, explanation: 'Le DUERP doit être accompagné d\'un plan d\'action.' },
        { question: 'Le plan d\'action inclut-il des délais ?', options: ['Non', 'Oui, pour chaque action', 'Uniquement des budgets', 'Uniquement des noms'], correctIndex: 1, explanation: 'Chaque action a un responsable, un délai et un indicateur.' },
        { question: 'Depuis 2022, le DUERP doit être ?', options: ['Papier uniquement', 'Déposé sur un portail numérique', 'Envoyé par courrier', 'Téléphoné'], correctIndex: 1, explanation: 'Le DUERP doit être déposé sur un portail numérique.' },
        { question: 'Comment prioriser les actions ?', options: ['Aléatoirement', 'Selon le niveau de risque', 'Selon le coût', 'Selon l\'âge du responsable'], correctIndex: 1, explanation: 'Les actions sont priorisées selon le niveau de risque.' },
        { question: 'L\'évaluation dans le DUERP utilise ?', options: ['L\'intuition', 'La gravité et la probabilité', 'Le hasard', 'Le budget'], correctIndex: 1, explanation: 'L\'évaluation se base sur la gravité et la probabilité.' },
        { question: 'Que faut-il suivre avec des indicateurs ?', options: ['La météo', 'L\'avancement des actions', 'Les ventes', 'La production'], correctIndex: 1, explanation: 'Les indicateurs permettent de suivre l\'avancement des actions.' },
        { question: 'Le DUERP concerne chaque ?', options: ['Bâtiment uniquement', 'Unité de travail', 'Salarié individuellement', 'Service HSE'], correctIndex: 1, explanation: 'Le DUERP est fait pour chaque unité de travail.' },
        { question: 'L\'amende pour absence de DUERP est de ?', options: ['500 €', '1 500 €', '5 000 €', '10 000 €'], correctIndex: 1, explanation: 'L\'amende est de 1 500 € (3 000 en récidive).' },
        { question: 'Le format du DUERP est-il standardisé ?', options: ['Non', 'Oui, depuis 2022', 'Seulement en PDF', 'Seulement en Word'], correctIndex: 1, explanation: 'Depuis 2022, le DUERP doit être dans un format standardisé.' },
        { question: 'Les mesures prévues sont ?', options: ['Facultatives', 'Obligatoires dans le DUERP', 'Uniquement budgétées', 'Uniquement écrites'], correctIndex: 1, explanation: 'Le DUERP doit lister les mesures existantes et prévues.' },
      ],
    },
    {
      title: 'La formation et l\'information des travailleurs',
      content: `# La formation et l'information des travailleurs

## L'obligation de formation

L\'employeur doit assurer une formation à la sécurité **adaptée au poste de travail**.

### La formation à l\'embauche
Tout nouvel arrivant doit recevoir une **formation d\'intégration** comprenant :
- Les risques spécifiques au poste
- Les consignes de sécurité
- L\'utilisation des EPI
- Les procédures d\'urgence

### La formation continue
- Lors de tout **changement de poste**
- Lors de l\'introduction de **nouveaux équipements**
- En cas de **modification des procédures**
- De manière **périodique** (réactualisation)

## Les formations spécifiques obligatoires

| Formation | Quand ? |
|----------|--------|
| CACES (engins de chantier) | Conduite d\'engins |
| Habilitation électrique | Travaux électriques |
| SST (Sauveteur Secouriste du Travail) | Désignation comme SST |
| CHSCT / CSE | Membre du CSE |
| Travail en hauteur | > 3 mètres |
| Manipulation de produits chimiques | Exposition à des CMR |

## L\'obligation d\'information

### Affichages obligatoires
- Consignes de sécurité
- Plans d\'évacuation
- Numéros d\'urgence
- Horaires de travail

### Le livret d\'accueil
Document remis à tout nouvel arrivant avec les informations essentielles.

### La notice de poste
Pour chaque poste à risque, un document décrivant les risques et les précautions.`,
      questions: [
        { question: 'La formation à la sécurité est obligatoire ?', options: ['Uniquement à l\'embauche', 'À l\'embauche ET en continu', 'Uniquement en cas d\'accident', 'Jamais'], correctIndex: 1, explanation: 'La formation est obligatoire à l\'embauche et en continu.' },
        { question: 'Le CACES est pour ?', options: ['Les premiers secours', 'La conduite d\'engins', 'L\'électricité', 'Le travail en hauteur'], correctIndex: 1, explanation: 'Le CACES est le Certificat d\'Aptitude à la Conduite En Sécurité.' },
        { question: 'L\'habilitation électrique est pour ?', options: ['Les travaux électriques', 'La plomberie', 'La peinture', 'Le jardinage'], correctIndex: 0, explanation: 'L\'habilitation est obligatoire pour les travaux électriques.' },
        { question: 'Quand former en continu ?', options: ['Uniquement tous les 10 ans', 'Changement de poste, nouvel équipement, modification', 'Uniquement sur demande', 'Jamais'], correctIndex: 1, explanation: 'La formation continue est déclenchée par tout changement.' },
        { question: 'Le livret d\'accueil est remis à ?', options: ['Personne', 'Tout nouvel arrivant', 'Uniquement aux cadres', 'Uniquement aux visiteurs'], correctIndex: 1, explanation: 'Le livret d\'accueil est remis à tout nouvel arrivant.' },
        { question: 'La notice de poste est obligatoire pour ?', options: ['Tous les postes', 'Les postes à risque', 'Aucun poste', 'Uniquement le bureau'], correctIndex: 1, explanation: 'La notice de poste est obligatoire pour les postes à risque.' },
        { question: 'L\'affichage des consignes est ?', options: ['Facultatif', 'Obligatoire', 'Uniquement en cas d\'inspection', 'Payant'], correctIndex: 1, explanation: 'L\'affichage des consignes de sécurité est obligatoire.' },
        { question: 'La formation SST est pour ?', options: ['Tous les salariés', 'Les salariés désignés', 'Uniquement les médecins', 'Uniquement les directeurs'], correctIndex: 1, explanation: 'La formation SST est pour les salariés désignés comme sauveteurs.' },
        { question: 'Le travail en hauteur nécessite une formation au-delà de ?', options: ['1 mètre', '2 mètres', '3 mètres', '5 mètres'], correctIndex: 2, explanation: 'La formation est obligatoire pour le travail en hauteur > 3 mètres.' },
        { question: 'Les produits CMR nécessitent ?', options: ['Rien', 'Une formation spécifique', 'Uniquement des EPI', 'Uniquement une signalisation'], correctIndex: 1, explanation: 'La manipulation de produits CMR nécessite une formation spécifique.' },
      ],
    },
    {
      title: 'Les instances représentatives (CSE)',
      content: `# Les instances représentatives (CSE)

## Le Comité Social et Économique (CSE)

### Création
Le CSE a remplacé le CHSCT, les délégués du personnel et le comité d\'entreprise depuis 2018 (ordonnances Macron).

### Composition
- **L\'employeur** (ou son représentant)
- **Les élus du personnel** (nombre variable selon l\'effectif)
- **Le secrétaire du CSE** (un élu)
- Possibilité de recourir à un **expert CSE**

### Les attributions du CSE en HSE

Le CSE a un rôle **consultatif et de contrôle** :

1. **Consultation** sur les questions de sécurité
2. **Analyse des risques professionnels**
3. **Enquête** après accident grave
4. **Droit d\'alerte** en cas de danger grave et imminent
5. **Inspection** des locaux de travail
6. **Accès au DUERP**
7. **Contributions** au plan d\'action

## Le droit d\'alerte

En cas de **danger grave et imminent**, tout membre du CSE peut :
1. Alerter immédiatement l\'employeur
2. Procéder à une **enquête conjointe**
3. En cas de désaccord : saisir l\'inspection du travail

## La CSSCT
La **Commission Santé, Sécurité et Conditions de Travail** est une commission spécialisée du CSE. Elle est obligatoire dans les entreprises de plus de 50 salariés.

### Attributions de la CSSCT
- Analyse des risques professionnels
- Étude des modes de travail
- Propositions d\'amélioration
- Enquêtes en cas d\'accident`,
      questions: [
        { question: 'Le CSE a remplacé quelles instances ?', options: ['Les syndicats', 'Le CHSCT, les délégués du personnel et le CE', 'Le tribunal', 'La médecine du travail'], correctIndex: 1, explanation: 'Le CSE a remplacé le CHSCT, les DP et le CE en 2018.' },
        { question: 'Le droit d\'alerte concerne ?', options: ['Les salaires', 'Le danger grave et imminent', 'Les congés', 'La formation'], correctIndex: 1, explanation: 'Le droit d\'alerte s\'exerce en cas de danger grave et imminent.' },
        { question: 'La CSSCT est obligatoire au-delà de ?', options: ['10 salariés', '50 salariés', '100 salariés', '500 salariés'], correctIndex: 1, explanation: 'La CSSCT est obligatoire dans les entreprises de plus de 50 salariés.' },
        { question: 'Le CSE peut-il enquêter après un accident ?', options: ['Non', 'Oui, après accident grave', 'Uniquement sur demande', 'Uniquement en cas de décès'], correctIndex: 1, explanation: 'Le CSE peut enquêter après un accident grave.' },
        { question: 'Le CSE a accès au ?', options: ['Budget', 'DUERP', 'Fiches de paie', 'Contrats clients'], correctIndex: 1, explanation: 'Le CSE a accès au DUERP.' },
        { question: 'Qui compose le CSE ?', options: ['Uniquement l\'employeur', 'L\'employeur et les élus du personnel', 'Uniquement les syndicats', 'Uniquement les cadres'], correctIndex: 1, explanation: 'Le CSE est composé de l\'employeur et des élus du personnel.' },
        { question: 'En cas de désaccord sur le droit d\'alerte ?', options: ['On fait rien', 'On saisit l\'inspection du travail', 'On va en grève', 'On attend'], correctIndex: 1, explanation: 'En cas de désaccord, on saisit l\'inspection du travail.' },
        { question: 'La CSSCT signifie ?', options: ['Commission de Sécurité des Sociétés', 'Commission Santé Sécurité et Conditions de Travail', 'Comité de Sécurité Sociale et Technique', 'Convention de Sécurité Standardisée'], correctIndex: 1, explanation: 'CSSCT = Commission Santé, Sécurité et Conditions de Travail.' },
        { question: 'Le CSE peut-il inspecter les locaux ?', options: ['Non', 'Oui', 'Uniquement le parking', 'Uniquement les toilettes'], correctIndex: 1, explanation: 'Le CSE a le droit d\'inspecter les locaux de travail.' },
        { question: 'Le CSE a un rôle ?', options: ['Exécutif', 'Consultatif et de contrôle', 'Judiciaire', 'Législatif'], correctIndex: 1, explanation: 'Le CSE a un rôle consultatif et de contrôle en HSE.' },
      ],
    },
    {
      title: 'Les droits et obligations des salariés',
      content: `# Les droits et obligations des salariés

## Les obligations du salarié

### Obligation de sécurité (art. L4122-1)
Le salarié doit :
1. **Se conformer** aux instructions de sécurité
2. **Utiliser** les EPI et équipements de sécurité fournis
3. **Ne pas modifier** les dispositifs de sécurité
4. **Signaler** tout danger constaté
5. **Signaler** toute défectuosité des équipements

### Le droit de retrait
Le salarié peut **quitter son poste de travail** s\'il estime qu\'il existe un **danger grave et imminent** pour sa vie ou sa santé.

#### Conditions du droit de retrait
- Le danger doit être **grave et imminent**
- Le salarié doit **alerter l\'employeur** immédiatement
- Il ne peut pas être **sanctionné** pour avoir exercé ce droit
- Le salarié ne doit pas créer un **danger pour autrui**

## Les droits du salarié

### Le droit d\'alerte
Le salarié peut alerter :
1. **Son supérieur hiérarchique**
2. **Le CSE**
3. **L\'inspection du travail**

### Le suivi médical
- Visite d\'information et de prévention (VIP)
- Visite médicale périodique
- Visite à la reprise après arrêt maladie

### La protection contre le harcèlement
L\'employeur doit protéger les salariés contre le harcèlement moral et sexuel.

## La protection des lanceurs d\'alerte (whistleblowers)

Les salariés qui signalent des dangers sont protégés contre toute **mesure de représailles**.`,
      questions: [
        { question: 'Le droit de retrait permet de ?', options: ['Prendre des vacances', 'Quitter le poste en cas de danger grave et imminent', 'Refuser de travailler', 'Changer de service'], correctIndex: 1, explanation: 'Le droit de retrait permet de quitter son poste en cas de danger grave.' },
        { question: 'Le salarié peut-il être sanctionné pour avoir utilisé le droit de retrait ?', options: ['Oui', 'Non, c\'est interdit', 'Seulement si erreur', 'Ça dépend'], correctIndex: 1, explanation: 'Aucune sanction ne peut être prise pour l\'exercice du droit de retrait.' },
        { question: 'L\'article L4122-1 impose au salarié de ?', options: ['Travailler plus', 'Se conformer aux instructions de sécurité', 'Recruter', 'Gérer le budget'], correctIndex: 1, explanation: 'Le salarié doit se conformer aux instructions de sécurité.' },
        { question: 'Qui le salarié doit-il alerter en premier ?', options: ['La police', 'Son supérieur hiérarchique', 'Les médias', 'Le maire'], correctIndex: 1, explanation: 'Le salarié alerte d\'abord son supérieur hiérarchique.' },
        { question: 'Le salarié doit-il signaler les dangers ?', options: ['Non', 'Oui, c\'est une obligation', 'Uniquement les graves', 'Uniquement les mortels'], correctIndex: 1, explanation: 'Le salarié a l\'obligation de signaler tout danger constaté.' },
        { question: 'La VIP est ?', options: ['Une carte de fidélité', 'Une Visite d\'Information et de Prévention', 'Un variateur industriel', 'Un visa de travail'], correctIndex: 1, explanation: 'VIP = Visite d\'Information et de Prévention (suivi médical).' },
        { question: 'Les lanceurs d\'alerte sont protégés contre ?', options: ['Les maladies', 'Les mesures de représailles', 'Le bruit', 'La chaleur'], correctIndex: 1, explanation: 'Les whistleblowers sont protégés contre toute mesure de représailles.' },
        { question: 'Le droit de retrait nécessite un danger ?', options: ['Quelconque', 'Grave et imminent', 'Léger', 'Hypothétique'], correctIndex: 1, explanation: 'Le danger doit être grave et imminent.' },
        { question: 'Le salarié peut-il modifier les dispositifs de sécurité ?', options: ['Oui', 'Non, c\'est interdit', 'Seulement avec autorisation', 'Seulement le week-end'], correctIndex: 1, explanation: 'Le salarié ne doit pas modifier les dispositifs de sécurité.' },
        { question: 'L\'employeur doit protéger contre le harcèlement ?', options: ['Non', 'Oui, moral et sexuel', 'Uniquement sexuel', 'Uniquement moral'], correctIndex: 1, explanation: 'L\'employeur doit protéger contre le harcèlement moral ET sexuel.' },
      ],
    },
    {
      title: 'Les sanctions et responsabilités pénales',
      content: `# Les sanctions et responsabilités pénales

## La responsabilité pénale de l\'employeur

L\'employeur (personne physique ou morale) peut être poursuivi pénalement en cas de manquement à ses obligations de sécurité.

## Les principales infractions

### Mise en danger de la vie d\'autrui (art. 223-1 Code pénal)
- **Peine** : 1 an d\'emprisonnement et 15 000 € d\'amende
- En cas de blessure involontaire : peines aggravées

### Non-respect du DUERP
- **Amende** : 1 500 € (3 000 € en récidive)

### Atteinte à la santé et à la sécurité
- **Homicide involontaire** : 3 ans d\'emprisonnement
- **Blessures involontaires** : jusqu\'à 5 ans selon la gravité

### Non-fourniture d\'EPI
- **Amende** : 3 750 € par salarié concerné

## La faute inexcusable

### Conséquences
- **Indemnisation majorée** de la victime
- Responsabilité civile de l\'employeur
- Possible poursuite pénale

### Conditions de reconnaissance
- L\'employeur avait ou aurait dû avoir conscience du danger
- Il n\'a pas pris les mesures nécessaires pour le prévenir

## La responsabilité des salariés

Un salarié peut également être poursuivi s\'il :
- A **volontairement** enfreint les règles de sécurité
- A **créé un danger** pour autrui
- A **modifié ou neutralisé** les dispositifs de sécurité

## La prescription
- Délai de prescription pénal : **6 ans** pour les délits
- Délai de prescription en matière de faute inexcusable : **10 ans**`,
      questions: [
        { question: 'La mise en danger est punie de ?', options: ['1 an de prison et 15 000 €', '10 ans de prison', 'Une amende de 100 €', 'Aucune peine'], correctIndex: 0, explanation: 'Mise en danger : 1 an d\'emprisonnement et 15 000 € d\'amende.' },
        { question: 'La faute inexcusable entraîne ?', options: ['Une promotion', 'Une indemnisation majorée', 'Un bonus', 'Rien'], correctIndex: 1, explanation: 'La faute inexcusable majore l\'indemnisation de la victime.' },
        { question: 'Le délai de prescription pénal est de ?', options: ['3 ans', '6 ans', '10 ans', '20 ans'], correctIndex: 1, explanation: 'Le délai de prescription pénal est de 6 ans pour les délits.' },
        { question: 'La non-fourniture d\'EPI est punie de ?', options: ['100 €', '3 750 € par salarié', '50 €', '10 000 €'], correctIndex: 1, explanation: 'L\'amende est de 3 750 € par salarié concerné.' },
        { question: 'L\'homicide involontaire est puni de ?', options: ['1 an', '3 ans', '10 ans', '20 ans'], correctIndex: 1, explanation: 'L\'homicide involontaire est puni de 3 ans d\'emprisonnement.' },
        { question: 'Un salarié peut-il être poursuivi ?', options: ['Non, jamais', 'Oui, s\'il enfreint volontairement les règles', 'Uniquement les cadres', 'Uniquement les employeurs'], correctIndex: 1, explanation: 'Le salarié peut être poursuivi pour infraction volontaire.' },
        { question: 'La prescription en faute inexcusable est de ?', options: ['3 ans', '6 ans', '10 ans', '30 ans'], correctIndex: 2, explanation: 'Le délai est de 10 ans en matière de faute inexcusable.' },
        { question: 'Qui peut être poursuivi pénalement ?', options: ['Uniquement les personnes physiques', 'Les personnes physiques et morales', 'Uniquement l\'État', 'Personne'], correctIndex: 1, explanation: 'L\'employeur personne physique ou morale peut être poursuivi.' },
        { question: 'L\'article 223-1 du Code pénal concerne ?', options: ['Le vol', 'La mise en danger de la vie d\'autrui', 'L\'escroquerie', 'Le vandalisme'], correctIndex: 1, explanation: 'L\'article 223-1 punit la mise en danger de la vie d\'autrui.' },
        { question: 'L\'amende pour absence de DUERP en récidive est ?', options: ['1 500 €', '3 000 €', '5 000 €', '10 000 €'], correctIndex: 1, explanation: 'En récidive, l\'amende passe à 3 000 €.' },
      ],
    },
    {
      title: 'Les inspections du travail et les contrôles',
      content: `# Les inspections du travail et les contrôles

## L'inspection du travail

### Mission
L\'inspection du travail a pour mission de :
- **Contrôler** l\'application du droit du travail
- **Conseiller** les employeurs et les salariés
- **Constatater** les infractions
- **Rédiger** des procès-verbaux

### Les pouvoirs de l\'inspecteur

#### Droit d\'accès
- Accès **libre et sans préavis** à tous les établissements
- Accès à tous les **documents obligatoires** (DUERP, registres...)

#### Pouvoirs d\'enquête
- **Auditions** de l\'employeur et des salariés
- **Prélèvements** d\'échantillons
- **Mesures** d\'atmosphère
- **Relevés** photographiques

#### Pouvoirs de décision
- **Mise en demeure** : injonction de remédier à une situation dangereuse
- **Procès-verbal** : constatation d\'infraction
- **Arrêté d\'urgence** : cessation immédiate d\'une activité dangereuse
- **Reféré** : saisine du juge en cas de danger grave

## Le déroulement d\'un contrôle

1. **Présentation** : l\'inspecteur se présente et explique sa mission
2. **Visite des locaux** : inspection des postes de travail
3. **Examen des documents** : DUERP, registres, formations
4. **Entretiens** : avec l\'employeur, les salariés, les représentants
5. **Constatations** : relevé des infractions éventuelles
6. **Bilan** : observations et recommandations

## Les suites d\'un contrôle

- **Observations** : simples recommandations
- **Mise en demeure** : obligation de corriger sous délai
- **Procès-verbal** : transmission au procureur
- **Arrêté immédiat** : en cas de danger grave et imminent`,
      questions: [
        { question: 'L\'inspecteur du travail a un accès ?', options: ['Sur rendez-vous', 'Libre et sans préavis', 'Uniquement le matin', 'Uniquement le vendredi'], correctIndex: 1, explanation: 'L\'inspecteur a un accès libre et sans préavis.' },
        { question: 'Une mise en demeure est ?', options: ['Une amende', 'Une injonction de corriger sous délai', 'Une fermeture', 'Un licenciement'], correctIndex: 1, explanation: 'La mise en demeure oblige à corriger la situation sous un délai.' },
        { question: 'L\'inspecteur peut-il faire des prélèvements ?', options: ['Non', 'Oui, d\'échantillons et d\'atmosphère', 'Uniquement des photos', 'Uniquement des documents'], correctIndex: 1, explanation: 'L\'inspecteur peut prélever des échantillons et mesurer l\'atmosphère.' },
        { question: 'L\'arrêté d\'urgence impose ?', options: ['Une formation', 'La cessation immédiate d\'une activité', 'Un recrutement', 'Un budget'], correctIndex: 1, explanation: 'L\'arrêté d\'urgence impose la cessation immédiate d\'une activité dangereuse.' },
        { question: 'Le procès-verbal est transmis au ?', options: ['Maire', 'Procureur de la République', 'Préfet', 'Ministre'], correctIndex: 1, explanation: 'Le PV est transmis au procureur de la République.' },
        { question: 'L\'inspection a un rôle de ?', options: ['Arbitre', 'Contrôle et conseil', 'Juge', 'Avocat'], correctIndex: 1, explanation: 'L\'inspection contrôle et conseille employeurs et salariés.' },
        { question: 'L\'inspecteur peut-il accéder au DUERP ?', options: ['Non', 'Oui, c\'est un document obligatoire', 'Uniquement sur demande', 'Seulement en ligne'], correctIndex: 1, explanation: 'L\'inspecteur a accès à tous les documents obligatoires.' },
        { question: 'Le référé est utilisé pour ?', options: ['Demander une augmentation', 'Saisir le juge en cas de danger grave', 'Contester un salaire', 'Démissionner'], correctIndex: 1, explanation: 'Le référé permet de saisir le juge en urgence.' },
        { question: 'Combien d\'étapes a un contrôle ?', options: ['3', '4', '5', '6'], correctIndex: 3, explanation: 'Le contrôle comprend 6 étapes de la présentation au bilan.' },
        { question: 'Les observations sont ?', options: ['Des amendes', 'De simples recommandations', 'Des fermetures', 'Des licenciements'], correctIndex: 1, explanation: 'Les observations sont de simples recommandations sans sanction.' },
      ],
    },
  ],
},
];
