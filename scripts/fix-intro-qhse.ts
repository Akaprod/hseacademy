import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COURSE_SLUG = 'introduction-qhse';

const newChapters = [
  {
    title: "Les composantes de la Qualité",
    content: `## Les Composantes de la Qualité

La **qualité** est la première composante de la démarche QHSE. Elle désigne l'aptitude d'un produit ou d'un service à satisfaire les besoins exprimés ou implicites des clients.

### Définition et Principes Fondamentaux

Selon la norme **ISO 9001**, la qualité repose sur plusieurs principes essentiels :

- **Orientation client** : comprendre et répondre aux besoins actuels et futurs des clients
- **Leadership** : établir une direction et un objectif clairs pour l'organisation
- **Engagement des personnes** : impliquer les collaborateurs à tous les niveaux
- **Approche processus** : gérer les activités comme des processus interconnectés
- **Amélioration continue** : viser toujours l'excellence de manière permanente
- **Prise de décision fondée sur des preuves** : baser les décisions sur l'analyse des données
- **Management des relations** : gérer efficacement les relations avec les parties intéressées

### Les Outils de la Qualité

Plusieurs outils sont utilisés pour maîtriser et améliorer la qualité :

1. **Le diagramme d'Ishikawa (5M)** : pour identifier les causes d'un problème (Main-d'œuvre, Matière, Méthode, Matériel, Milieu)
2. **La méthode PDCA (Roue de Deming)** : Plan-Do-Check-Act pour l'amélioration continue
3. **Les diagrammes de Pareto** : pour prioriser les problèmes selon leur impact (règle 80/20)
4. **Le diagramme de Pareto** : identifier les causes les plus significatives
5. **Les cartes de contrôle** : surveiller la stabilité d'un processus dans le temps

### Le Système de Management de la Qualité (SMQ)

Un SMQ est un ensemble de processus interdépendants qui permettent de diriger et contrôler un organisme en matière de qualité. Sa mise en place passe par :

- La détermination des processus nécessaires au système de management
- La détermination des séquences et interactions de ces processus
- La détermination des critères et méthodes pour assurer le fonctionnement efficace
- La surveillance, la mesure et l'analyse de ces processus
- La mise en œuvre d'actions nécessaires pour atteindre les résultats prévus
- L'amélioration continue de ces processus

### L'Importance de la Qualité en Entreprise

La qualité n'est pas un coût mais un investissement. Elle permet de :

- Réduire les coûts de non-qualité (rebuts, retouches, retours clients)
- Augmenter la satisfaction et la fidélisation des clients
- Renforcer l'image de marque et la compétitivité
- Améliorer l'efficacité interne des processus
- Répondre aux exigences réglementaires et normatives

La certification **ISO 9001** est la norme internationale la plus répandue pour les systèmes de management de la qualité. Elle atteste que l'organisation a mis en place un système efficace pour gérer la qualité de ses produits et services.
`,
    questions: [
      { q: "Que signifie l'acronyme SMQ ?", opts: ["Système de Management de la Qualité", "Service de Maintenance et de Qualité", "Standard de Mesure de la Qualité", "Système de Maîtrise des Quantités"], correct: 0, explanation: "Le SMQ désigne le Système de Management de la Qualité, un ensemble de processus pour diriger et contrôler un organisme en matière de qualité." },
      { q: "Quel organisme publie la norme ISO 9001 ?", opts: ["L'OMS", "L'ISO (Organisation Internationale de Normalisation)", "L'OIT", "L'UE"], correct: 1, explanation: "L'ISO (Organisation Internationale de Normalisation) publie la norme ISO 9001 relative aux systèmes de management de la qualité." },
      { q: "Combien de principes fondamentaux la qualité comporte-t-elle selon l'ISO ?", opts: ["5", "6", "7", "8"], correct: 2, explanation: "La norme ISO 9001 repose sur 7 principes fondamentaux de management de la qualité." },
      { q: "Que représente la lettre 'M' dans le diagramme d'Ishikawa (5M) ?", opts: ["Moyen", "Matière, Méthode, Matériel, Main-d'œuvre, Milieu", "Mesure", "Management"], correct: 1, explanation: "Les 5M d'Ishikawa sont : Matière, Méthode, Matériel, Main-d'œuvre et Milieu (les 5 catégories de causes)." },
      { q: "Que signifie PDCA dans la méthode de Deming ?", opts: ["Plan-Do-Check-Act", "Process-Design-Control-Analyze", "Plan-Develop-Create-Apply", "Product-Data-Check-Audit"], correct: 0, explanation: "PDCA signifie Plan (Planifier), Do (Réaliser), Check (Vérifier), Act (Agir) - le cycle de l'amélioration continue." },
      { q: "Quel outil utilise la règle des 80/20 ?", opts: ["Le diagramme de Gantt", "Le diagramme de Pareto", "Le diagramme circulaire", "L'histogramme"], correct: 1, explanation: "Le diagramme de Pareto applique la règle des 80/20 : 80% des effets proviennent de 20% des causes." },
      { q: "Parmi ces principes, lequel n'appartient PAS à la qualité selon l'ISO ?", opts: ["Orientation client", "Approche processus", "Maximisation du profit", "Amélioration continue"], correct: 2, explanation: "La maximisation du profit n'est pas un principe de la qualité ISO. Les 7 principes sont : orientation client, leadership, engagement des personnes, approche processus, amélioration continue, prise de décision fondée sur des preuves, et management des relations." },
      { q: "La norme ISO 9001 est applicable à quel type d'organisation ?", opts: ["Uniquement aux entreprises industrielles", "À toute organisation, quelle que soit sa taille ou son secteur", "Uniquement aux grandes entreprises", "Uniquement au secteur des services"], correct: 1, explanation: "La norme ISO 9001 est universelle et applicable à toute organisation, quel que soit son taille, secteur ou activité." },
      { q: "Que sont les 'coûts de non-qualité' ?", opts: ["Les coûts de certification ISO", "Les coûts liés aux dysfonctionnements, rebuts et retours clients", "Les salaires du service qualité", "Le budget de formation du personnel"], correct: 1, explanation: "Les coûts de non-qualité regroupent toutes les pertes liées aux dysfonctionnements : rebuts, retouches, retours clients, litiges, etc." },
      { q: "Quel est l'objectif principal de la Roue de Deming (PDCA) ?", opts: ["Éliminer tout défaut", "L'amélioration continue des processus", "Certifier l'entreprise", "Mesurer la satisfaction client"], correct: 1, explanation: "La Roue de Deming (PDCA) est un outil d'amélioration continue qui permet de progresser de manière cyclique et systématique." }
    ]
  },
  {
    title: "Les Composantes de l'Hygiène et de la Santé au Travail",
    content: `## Les Composantes de l'Hygiène et de la Santé au Travail

L'**hygiène** et la **santé au travail** constituent le deuxième pilier de la démarche QHSE. Elles visent à prévenir les risques professionnels et à préserver la santé physique et mentale des travailleurs.

### Définitions Fondamentales

- **Hygiène industrielle** : discipline qui identifie, évalue et contrôle les risques pour la santé liés à l'environnement de travail (agents chimiques, biologiques, physiques)
- **Santé au travail** : ensemble des mesures visant à préserver et promouvoir la santé des travailleurs dans leur environnement professionnel
- **Médecine du travail** : spécialité médicale dédiée à la prévention et à la surveillance de la santé au travail

### Les Risques pour la Santé au Travail

Les principaux risques pour la santé sont classés en plusieurs catégories :

#### Risques Chimiques
- Exposition aux substances toxiques, cancérogènes, mutagènes ou reprotoxiques (CMR)
- Les solvants, les poussières, les fumées et les vapeurs
- Les effets peuvent être aigus (immédiats) ou chroniques (à long terme)

#### Risques Biologiques
- Exposition aux micro-organismes (bactéries, virus, champignons)
- Risques particuliers dans le secteur de la santé, les laboratoires, l'agroalimentaire
- Les maladies professionnelles d'origine biologique (tétanos, hépatite, etc.)

#### Risques Physiques
- **Bruit** : exposition au bruit pouvant entraîner une perte auditive irréversible
- **Vibrations** : transmissions manuelles ou corporelles
- **Rayonnements** : ionisants (rayons X) et non ionisants (UV, laser)
- **Ambiance thermique** : chaleur excessive ou froid

#### Risques Ergonomiques
- Troubles musculosquelettiques (TMS), premier risque professionnel en France
- Port de charges lourdes, postures contraignantes, mouvements répétitifs
- Travail sur écran et risques visuels

### La Prévention en Santé au Travail

La prévention repose sur les **9 principes généraux** de l'article L.4121-2 du Code du travail :

1. Éviter les risques
2. Évaluer les risques qui ne peuvent pas être évités
3. Combattre les risques à la source
4. Adapter le travail à l'homme
5. Tenir compte de l'état d'évolution de la technique
6. Remplacer ce qui est dangereux par ce qui ne l'est pas
7. Planifier la prévention
8. Prendre des mesures de protection collective
9. Donner les instructions appropriées aux travailleurs

### Le Rôle des Acteurs

- **L'employeur** : a l'obligation de prévenir les risques professionnels
- **Le salarié** : doit veiller à sa santé et sa sécurité, et signaler les dangers
- **Le médecin du travail** : assure la surveillance médicale des salariés
- **Le CHSCT/CSE** : participe à l'analyse des risques et propose des améliorations
- **L'inspecteur du travail** : contrôle le respect de la réglementation

### Les Indicateurs de Santé au Travail

- Le **TAux de Fréquence (TF)** : nombre d'accidents pour 1 000 000 d'heures travaillées
- Le **Taux de Gravité (TG)** : nombre de jours perdus pour 1 000 heures travaillées
- L'**Indice de Fréquence (IF)** : nombre d'accidents pour 1 000 salariés
`,
    questions: [
      { q: "Que signifie l'acronyme CMR en hygiène industrielle ?", opts: ["Contaminant, Mutagène, Radioactif", "Cancérogène, Mutagène, Reprotoxique", "Chimique, Minéral, Radioactif", "Comburant, Mutagène, Réactif"], correct: 1, explanation: "CMR signifie Cancérogène, Mutagène, Reprotoxique. Ce sont des substances particulièrement dangereuses pour la santé." },
      { q: "Quel est le premier risque professionnel en nombre de cas en France ?", opts: ["Les risques chimiques", "Les risques psychosociaux", "Les troubles musculosquelettiques (TMS)", "Les risques liés au bruit"], correct: 2, explanation: "Les TMS (Troubles Musculosquelettiques) représentent le premier risque professionnel en France, tant en nombre de cas qu'en jours d'arrêt." },
      { q: "Combien de principes généraux de prévention le Code du travail français prévoit-il ?", opts: ["5", "7", "9", "12"], correct: 2, explanation: "L'article L.4121-2 du Code du travail prévoit 9 principes généraux de prévention." },
      { q: "Qu'est-ce que le Taux de Fréquence (TF) ?", opts: ["Le nombre de jours perdus par salarié", "Le nombre d'accidents du travail pour 1 000 000 d'heures travaillées", "Le pourcentage de salariés accidentés", "Le nombre d'accidents par an"], correct: 1, explanation: "Le Taux de Fréquence mesure le nombre d'accidents du travail avec arrêt pour 1 000 000 d'heures travaillées." },
      { q: "Parmi ces risques, lequel est un risque physique ?", opts: ["Les solvants", "Les bactéries", "Les vibrations", "Les postures contraignantes"], correct: 2, explanation: "Les vibrations sont un risque physique. Les solvants sont chimiques, les bactéries sont biologiques, et les postures sont ergonomiques." },
      { q: "Quel acteur assure la surveillance médicale des salariés ?", opts: ["L'inspecteur du travail", "Le médecin du travail", "Le CSE", "L'employeur"], correct: 1, explanation: "Le médecin du travail est le professionnel de santé responsable de la surveillance médicale des salariés." },
      { q: "Quel principe de prévention consiste à remplacer un produit dangereux par un produit moins dangereux ?", opts: ["Éviter les risques", "Adapter le travail à l'homme", "Remplacer ce qui est dangereux", "Combattre les risques à la source"], correct: 2, explanation: "Le 6ème principe est de 'remplacer ce qui est dangereux par ce qui ne l'est pas ou par ce qui l'est moins'." },
      { q: "Les effets d'une exposition chimique peuvent être :", opts: ["Uniquement aigus", "Uniquement chroniques", "Aigus ou chroniques", "Uniquement temporaires"], correct: 2, explanation: "Les effets d'une exposition chimique peuvent être aigus (immédiats) ou chroniques (apparaissant après une exposition prolongée)." },
      { q: "Quel secteur est particulièrement concerné par les risques biologiques ?", opts: ["Le bâtiment", "La santé et les laboratoires", "L'informatique", "L'immobilier"], correct: 1, explanation: "Le secteur de la santé, les laboratoires et l'agroalimentaire sont particulièrement concernés par les risques biologiques (micro-organismes)." },
      { q: "Le Taux de Gravité (TG) mesure :", opts: ["Le nombre d'accidents graves", "Le nombre de jours perdus pour 1 000 heures travaillées", "Le pourcentage de récidives", "Le coût des accidents"], correct: 1, explanation: "Le Taux de Gravité mesure le nombre de jours d'incapacité (jours perdus) pour 1 000 heures travaillées." }
    ]
  },
  {
    title: "Les Composantes de la Sécurité au Travail",
    content: `## Les Composantes de la Sécurité au Travail

La **sécurité au travail** est le troisième pilier de la démarche QHSE. Elle vise à prévenir les accidents du travail et à protéger l'intégrité physique des travailleurs.

### Définition et Enjeux

La sécurité au travail englobe l'ensemble des mesures techniques, organisationnelles et humaines mises en œuvre pour :

- Prévenir les accidents du travail
- Protéger la santé et l'intégrité physique des travailleurs
- Assurer un environnement de travail sûr
- Répondre aux obligations réglementaires

### Statistiques des Accidents du Travail

Chaque année, des millions d'accidents du travail surviennent dans le monde. En France :

- Environ **700 000 accidents du travail** avec arrêt sont déclarés chaque année
- Près de **1 000 décès** liés au travail sont recensés annuellement
- Les secteurs les plus touchés sont le BTP, le transport, l'agriculture et l'industrie

### La Hiérarchie des Mesures de Prévention

Selon le Code du travail (article L.4121-1), l'employeur doit prendre les mesures nécessaires pour assurer la sécurité. La hiérarchie est :

1. **Élimination** : supprimer le danger à la source
2. **Substitution** : remplacer par quelque chose de moins dangereux
3. **Mesures techniques de protection collective** : gardes, capots, ventilation
4. **Mesures organisationnelles** : procédures, consignes, formation
5. **Équipements de Protection Individuelle (EPI)** : en dernier recours

### L'Analyse des Accidents

Lorsqu'un accident survient, il est essentiel de mener une analyse pour comprendre ses causes et éviter la récidive :

- **L'arbre des causes** : méthode qui remonte des effets aux causes en identifiant les facteurs ayant contribué à l'accident
- **La méthode des 5 Pourquoi** : poser la question 'pourquoi ?' successivement jusqu'à la cause racine
- **Le diagramme d'Ishikawa** : classer les causes selon les 5M

### Les Obligations de l'Employeur

L'employeur a une **obligation de résultat** en matière de sécurité (jurisprudence constante depuis 2002). Il doit :

- Évaluer les risques professionnels (Document Unique)
- Mettre en place des actions de prévention
- Fournir les EPI nécessaires
- Assurer la formation à la sécurité des travailleurs
- Organiser les secours et les premiers soins
- Tenir à jour le Document Unique d'Évaluation des Risques (DUERP)

### La Culture de Sécurité

Une bonne culture de sécurité repose sur :

- L'engagement visible de la direction
- La participation active des salariés
- La communication transparente sur les incidents
- L'apprentissage permanent des retours d'expérience
- La non-punition des signalements de near-miss (presqu'accidents)
`,
    questions: [
      { q: "Combien d'accidents du travail avec arrêt sont déclarés chaque année en France (environ) ?", opts: ["100 000", "300 000", "700 000", "1 500 000"], correct: 2, explanation: "Environ 700 000 accidents du travail avec arrêt sont déclarés chaque année en France." },
      { q: "Quel est le premier niveau de la hiérarchie des mesures de prévention ?", opts: ["Les EPI", "L'élimination du danger", "La formation", "Les consignes de sécurité"], correct: 1, explanation: "L'élimination du danger à la source est la mesure de prévention prioritaire." },
      { q: "L'employeur a quelle type d'obligation en matière de sécurité ?", opts: ["Une obligation de moyens", "Une obligation de résultat", "Une obligation de conseil", "Aucune obligation spécifique"], correct: 1, explanation: "Depuis 2002, la jurisprudence considère que l'employeur a une obligation de résultat en matière de sécurité des travailleurs." },
      { q: "Qu'est-ce que le DUERP ?", opts: ["Document Unique d'Évaluation des Risques Professionnels", "Directive Universelle d'Évaluation des Risques", "Document d'Urgence de Protection des Employés", "Diagnostique Unique des Risques Évalués"], correct: 0, explanation: "Le DUERP (Document Unique d'Évaluation des Risques Professionnels) est le document obligatoire qui répertorie tous les risques professionnels." },
      { q: "La méthode des '5 Pourquoi' sert à :", opts: ["Évaluer la gravité d'un risque", "Identifier la cause racine d'un problème", "Classer les risques par ordre de priorité", "Former les nouveaux employés"], correct: 1, explanation: "La méthode des 5 Pourquoi est une technique d'investigation qui consiste à poser la question 'pourquoi ?' de manière répétée pour remonter à la cause racine." },
      { q: "Les EPI sont le dernier recours dans la hiérarchie de prévention car :", opts: ["Ils sont trop coûteux", "Ils ne suppriment pas le danger, ils le protègent seulement", "Ils sont inconfortables", "Ils ne sont pas obligatoires"], correct: 1, explanation: "Les EPI ne suppriment pas le danger à la source, ils ne font que le protéger partiellement. C'est pourquoi ils sont le dernier recours après les protections collectives." },
      { q: "Qu'est-ce qu'un 'near-miss' en sécurité ?", opts: ["Un accident mineur", "Un presqu'accident qui aurait pu causer des dommages", "Un rapport de sécurité", "Un exercice de simulation"], correct: 1, explanation: "Un near-miss (presqu'accident) est un événement qui n'a pas causé de dommages mais qui aurait pu en causer dans des circonstances légèrement différentes." },
      { q: "Quel outil utilise-t-on pour classer les causes d'un accident selon 5 catégories ?", opts: ["Le diagramme de Pareto", "L'arbre des causes", "Le diagramme d'Ishikawa", "La matrice de risques"], correct: 2, explanation: "Le diagramme d'Ishikawa (également appelé diagramme en arêtes de poisson) classe les causes d'un problème selon les 5M." },
      { q: "Quel secteur d'activité est le plus touché par les accidents du travail ?", opts: ["L'informatique", "Le BTP (Bâtiment et Travaux Publics)", "L'éducation", "La finance"], correct: 1, explanation: "Le BTP (Bâtiment et Travaux Publics) est l'un des secteurs les plus touchés par les accidents du travail en raison des risques physiques importants." },
      { q: "Une bonne culture de sécurité implique :", opts: ["De punir les erreurs des employés", "De cacher les incidents pour maintenir la réputation", "La non-punition des signalements de near-miss", "De limiter la formation à la sécurité"], correct: 2, explanation: "Une bonne culture de sécurité encourage le signalement des near-miss sans punition, ce qui permet d'apprendre et de prévenir les futurs accidents." }
    ]
  },
  {
    title: "Les Composantes de l'Environnement",
    content: `## Les Composantes de l'Environnement

L'**environnement** est le quatrième pilier de la démarche QHSE. Il intègre la protection de l'environnement dans la stratégie globale de l'entreprise, dans une perspective de développement durable.

### Définitions et Enjeux

- **Environnement** : l'ensemble des éléments naturels et anthropiques qui entourent l'homme
- **Management environnemental** : partie du système de management globale qui détermine et met en œuvre la politique environnementale
- **Développement durable** : développement qui répond aux besoins du présent sans compromettre la capacité des générations futures à répondre aux leurs

### Les Impacts Environnementaux des Entreprises

Les entreprises ont divers impacts sur l'environnement :

#### Émissions Atmosphériques
- Gaz à effet de serre (CO2, CH4, N2O)
- Polluants atmosphériques (NOx, SO2, particules)
- Composés Organiques Volatils (COV)

#### Gestion des Déchets
- Déchets industriels banals (DIB)
- Déchets dangereux (DID)
- Déchets d'activités économiques (DAE)

#### Consommation de Ressources
- Eau et énergie
- Matières premières
- Sols et espaces naturels

### La Norme ISO 14001

La norme **ISO 14001** est le standard international pour les systèmes de management environnemental (SME). Elle repose sur le cycle PDCA :

- **Plan** : Établir les objectifs environnementaux et les processus nécessaires
- **Do** : Mettre en œuvre les processus
- **Check** : Surveiller et mesurer les processus
- **Act** : Agir pour améliorer en permanence

### La Réglementation Environnementale

Les principales réglementations incluent :

- **ICPE** : Installations Classées pour la Protection de l'Environnement
- **REACH** : Enregistrement, Évaluation et Autorisation des substances Chimiques
- **La réglementation sur les déchets** : hiérarchie 5 niveaux (prévention, réutilisation, recyclage, valorisation, élimination)
- **Les études d'impact** : obligatoires pour certains projets industriels

### Les Aspects Environnementaux Significatifs

L'entreprise doit identifier et évaluer ses aspects environnementaux significatifs :

1. Identifier les activités, produits et services
2. Identifier les aspects environnementaux associés
3. Déterminer les impacts environnementaux
4. Évaluer la significativité de chaque impact
5. Prioriser les actions d'amélioration

### L'Éco-conception

L'éco-conception consiste à intégrer les critères environnementaux dès la conception d'un produit ou service :

- Réduction de la consommation de matières premières
- Favoriser les matériaux recyclés et recyclables
- Optimiser la durée de vie du produit
- Faciliter le démontage et le recyclage en fin de vie
`,
    questions: [
      { q: "Que signifie la norme ISO 14001 ?", opts: ["Norme qualité", "Norme santé et sécurité", "Norme management environnemental", "Norme alimentaire"], correct: 2, explanation: "La norme ISO 14001 est le standard international pour les systèmes de management environnemental (SME)." },
      { q: "Que signifie l'acronyme ICPE ?", opts: ["Installation de Contrôle de Pollution Environnementale", "Installations Classées pour la Protection de l'Environnement", "Indice de Contamination des Productions Environnementales", "Inspection Certifiée de Protection Écologique"], correct: 1, explanation: "ICPE signifie Installations Classées pour la Protection de l'Environnement. Ce sont des installations soumises à une réglementation spécifique." },
      { q: "Quel est le principe du développement durable ?", opts: ["Maximiser la production", "Répondre aux besoins actuels sans compromettre les générations futures", "Réduire les coûts de production", "Augmenter les exportations"], correct: 1, explanation: "Le développement durable répond aux besoins du présent sans compromettre la capacité des générations futures à répondre aux leurs." },
      { q: "Parmi ces gaz, lequel est un gaz à effet de serre ?", opts: ["Oxygène (O2)", "Azote (N2)", "Dioxyde de carbone (CO2)", "Hélium (He)"], correct: 2, explanation: "Le dioxyde de carbone (CO2) est le principal gaz à effet de serre d'origine anthropique." },
      { q: "Que signifie REACH ?", opts: ["Recherche Environnementale Appliquée à la Chimie et l'Habitat", "Enregistrement, Évaluation et Autorisation des substances Chimiques", "Réglementation Européenne sur l'Évaluation des Catégories chimiques", "Réduction des Émissions Atmosphériques et Contrôle de l'Habitat"], correct: 1, explanation: "REACH est le règlement européen relatif à l'Enregistrement, l'Évaluation et l'Autorisation des substances Chimiques." },
      { q: "La hiérarchie de gestion des déchets comporte combien de niveaux ?", opts: ["3", "4", "5", "6"], correct: 2, explanation: "La hiérarchie de gestion des déchets comporte 5 niveaux : prévention, réutilisation, recyclage, valorisation, élimination." },
      { q: "L'éco-conception consiste à :", opts: ["Recycler les produits en fin de vie uniquement", "Intégrer les critères environnementaux dès la conception", "Réduire les emballages uniquement", "Fabriquer avec des matériaux naturels uniquement"], correct: 1, explanation: "L'éco-conception consiste à intégrer les critères environnementaux dès la phase de conception d'un produit ou service." },
      { q: "Quel sigle désigne les déchets dangereux industriels ?", opts: ["DIB", "DID", "DAE", " DV"], correct: 1, explanation: "DID signifie Déchets Industriels Dangereux. Ils nécessitent un traitement spécifique en raison de leur caractère nocif." },
      { q: "Le cycle PDCA appliqué à l'environnement signifie :", opts: ["Prévenir, Développer, Contrôler, Agir", "Planifier, Développer, Chiffrer, Analyser", "Plan, Do, Check, Act", "Protéger, Documenter, Communiquer, Améliorer"], correct: 2, explanation: "Le cycle PDCA (Plan-Do-Check-Act) est le fondement de l'amélioration continue appliqué au management environnemental." },
      { q: "Un aspect environnemental significatif est :", opts: ["Un risque pour la santé", "Un élément de l'activité qui a un impact environnemental notable", "Un coût de production élevé", "Une obligation légale"], correct: 1, explanation: "Un aspect environnemental significatif est un élément des activités, produits ou services d'une organisation qui interagit avec l'environnement de manière notable." }
    ]
  },
  {
    title: "Le Management Intégré QHSE",
    content: `## Le Management Intégré QHSE

Le **management intégré QHSE** est une approche globale qui unifie les quatre composantes (Qualité, Hygiène, Sécurité, Environnement) dans un système de management unique et cohérent.

### Principes du Management Intégré

Un Système de Management Intégré (SMI) QHSE vise à :

- Harmoniser les processus et les procédures
- Éviter les redondances entre les différents systèmes
- Optimiser les ressources dédiées au management
- Améliorer la performance globale de l'organisation
- Faciliter les audits et les certifications multiples

### La Structure du SMI QHSE

Un SMI QHSE repose sur une structure commune inspirée du cycle PDCA :

#### 1. Planification (Plan)
- Définition de la politique QHSE
- Fixation des objectifs et des cibles
- Identification des risques et des aspects environnementaux
- Planification des actions

#### 2. Mise en Œuvre (Do)
- Ressources, compétences et sensibilisation
- Communication interne et externe
- Documentation et maîtrise des documents
- Maîtrise opérationnelle
- Préparation aux situations d'urgence

#### 3. Vérification (Check)
- Surveillance et mesure des performances
- Évaluation de la conformité légale
- Audit interne
- Non-conformités et actions correctives

#### 4. Amélioration (Act)
- Revue de direction
- Actions correctives et préventives
- Amélioration continue

### Les Avantages du SMI QHSE

| Avantage | Description |
|----------|-------------|
| **Efficacité** | Réduction des redondances et optimisation des processus |
| **Cohérence** | Vision transversale de la performance |
| **Coûts** | Réduction des coûts de gestion de multiples systèmes |
| **Image** | Renforcement de la crédibilité auprès des parties intéressées |
| **Conformité** | Meilleure réponse aux exigences réglementaires |
| **Performance** | Amélioration globale et durable |

### Les Certifications QHSE

Les certifications les plus courantes sont :

- **ISO 9001** : Management de la Qualité
- **ISO 14001** : Management Environnemental
- **ISO 45001** : Santé et Sécurité au Travail (remplace OHSAS 18001)
- **ISO 22000** : Sécurité des Denrées Alimentaires

### La Politique QHSE

La politique QHSE est un document stratégique qui :

- Est adaptée à la nature, à l'échelle et aux impacts de l'organisation
- Comprend un engagement d'amélioration continue
- Comprend un engagement de conformité aux exigences légales
- Fournit un cadre pour fixer et réviser les objectifs QHSE
- Est communiquée à toutes les personnes travaillant pour l'organisation
- Est disponible pour les parties intéressées

### La Revue de Direction

La revue de direction est un élément clé du SMI QHSE. Elle doit être réalisée à des intervalles planifiés pour s'assurer que le système reste pertinent, adéquat et efficace. Les éléments d'entrée de la revue incluent :

- Les résultats des audits
- Le retour d'information des parties intéressées
- La performance QHSE et l'atteinte des objectifs
- Le statut des actions correctives et préventives
- Les changements pouvant affecter le système
- Les opportunités d'amélioration
`,
    questions: [
      { q: "Que signifie SMI en QHSE ?", opts: ["Système de Mesure Intégré", "Système de Management Intégré", "Service de Management Industriel", "Standard de Management International"], correct: 1, explanation: "SMI signifie Système de Management Intégré. C'est un système qui unifie plusieurs composantes du management." },
      { q: "Quelle norme a remplacé OHSAS 18001 pour la sécurité au travail ?", opts: ["ISO 9001:2015", "ISO 14001:2015", "ISO 45001:2018", "ISO 22000:2018"], correct: 2, explanation: "L'ISO 45001 publiée en 2018 a remplacé la norme OHSAS 18001 pour les systèmes de management de la santé et de la sécurité au travail." },
      { q: "Quel est l'objectif principal d'un SMI QHSE ?", opts: ["Obtenir des certifications", "Unifier les composantes QHSE dans un système cohérent", "Réduire le nombre de salariés", " Augmenter la production"], correct: 1, explanation: "L'objectif principal d'un SMI QHSE est d'unifier les quatre composantes (Qualité, Hygiène, Sécurité, Environnement) dans un système de management unique et cohérent." },
      { q: "La revue de direction est :", opts: ["Un audit externe annuel", " Une réunion périodique pour évaluer l'efficacité du système QHSE", "Un document réglementaire", " Une procédure d'urgence"], correct: 1, explanation: "La revue de direction est une évaluation périodique réalisée par la direction pour s'assurer que le système QHSE reste pertinent, adéquat et efficace. "},
      { q: "Parmi ces certifications, laquelle concerne la sécurité des denrées alimentaires ? ", opts: ["ISO 9001", "ISO 14001", "ISO 45001", "ISO 22000"], correct: 3, explanation: "L'ISO 22000 est la norme relative aux systèmes de management de la sécurité des denrées alimentaires. "},
      { q: "La politique QHSE doit être : ", opts: ["Confidentielle et restreinte à la direction", "Communiquée à toutes les personnes de l'organisation", "Uniquement accessible aux auditeurs", "Mise à jour tous les 10 ans"], correct: 1, explanation: "La politique QHSE doit être communiquée à toutes les personnes travaillant pour l'organisation et être disponible pour les parties intéressées. "},
      { q: "Combien de phases comporte le cycle PDCA ? ", opts: ["2", "3", "4", "5"], correct: 2, explanation: "Le cycle PDCA comporte 4 phases : Plan (Planifier), Do (Réaliser), Check (Vérifier), Act (Agir). "},
      { q: "Quel est un avantage du SMI QHSE en termes de coûts ? ", opts: ["Augmentation des coûts de certification", "Réduction des coûts de gestion de multiples systèmes", "Création de nouveaux postes", "Achat de logiciels coûteux"], correct: 1, explanation: "Le SMI QHSE permet de réduire les coûts de gestion en évitant les redondances entre les différents systèmes de management. "},
      { q: "La phase 'Check' du PDCA en QHSE comprend : ", opts: ["La définition des objectifs", "L'audit interne et la surveillance", "La formation du personnel", "L'achat d'équipements"], correct: 1, explanation: "La phase 'Check' comprend la surveillance et mesure des performances, l'évaluation de la conformité, les audits internes et le traitement des non-conformités. "},
      { q: "L'ISO 45001 est applicable à : ", opts: ["Uniquement aux entreprises industrielles", "Toute organisation souhaitant améliorer la sécurité au travail", "Uniquement aux grandes entreprises", "Uniquement au secteur du bâtiment"], correct: 1, explanation: "L'ISO 45001 est applicable à toute organisation, quelle que soit sa taille, son secteur ou son activité. "}
    ]
  },
  {
    title: "Les Audits et les Indicateurs QHSE",
    content: `## Les Audits et les Indicateurs QHSE

Les **audits** et les **indicateurs QHSE** sont des outils essentiels pour mesurer la performance du système et piloter l'amélioration continue.

### Les Audits QHSE

#### Définition
Un audit QHSE est un examen méthodique et indépendant qui permet de déterminer si les activités et les résultats relatifs à la QHSE sont conformes aux dispositions préétablies.

#### Types d'Audits

1. **Audit interne** : réalisé par l'organisation elle-même ou en son nom
   - Vérifie la conformité du système QHSE
   - Identifie les opportunités d'amélioration
   - Prépare l'organisation aux audits externes

2. **Audit externe** : réalisé par un organisme indépendant
   - **Audit de certification** : pour obtenir/maintenir une certification (ISO)
   - **Audit de conformité** : pour vérifier le respect des exigences réglementaires
   - **Audit de fournisseur** : pour évaluer les sous-traitants

#### Méthodologie d'Audit

La méthodologie d'audit suit généralement ces étapes :

1. **Planification** : définition du périmètre, des critères et de l'objectif
2. **Préparation** : revue des documents, élaboration de la checklist
3. **Exécution** : entretiens, observations, vérifications documentaires
4. **Rapport** : constats, non-conformités, recommandations
5. **Suivi** : vérification de la mise en œuvre des actions correctives

### Les Indicateurs QHSE (KPI)

#### Définition
Un indicateur QHSE est une donnée chiffrée qui permet de mesurer, de suivre et d'évaluer la performance QHSE d'une organisation.

#### Catégories d'Indicateurs

**Indicateurs de Résultat (lagging indicators) :**
- Taux de fréquence des accidents (TF)
- Taux de gravité (TG)
- Nombre de jours d'arrêt
- Taux de rotation du personnel
- Nombre de non-conformités
- Consommation d'énergie
- Quantité de déchets produits

**Indicateurs de Proactivité (leading indicators) :**
- Nombre d'actions de prévention réalisées
- Taux de réalisation des plans d'action
- Heures de formation QHSE
- Nombre d'audits internes réalisés
- Taux de participation aux formations
- Nombre de near-miss signalés
- Taux de conformité réglementaire

#### Le Tableau de Bord QHSE

Le tableau de bord QHSE est un outil de pilotage visuel qui :

- Présente les indicateurs clés de manière synthétique
- Permet un suivi en temps réel de la performance
- Facilite la prise de décision
- Doit être adapté à chaque niveau hiérarchique
- Soutient la communication vers les parties intéressées

### Les Non-Conformités

Une non-conformité est un écart par rapport à une exigence :

- **Non-conformité majeure** : absence ou défaillance totale d'un élément essentiel du système
- **Non-conformité mineure** : défaillance ponctuelle qui n'affecte pas la capacité du système à atteindre ses objectifs
- **Observation** : opportunité d'amélioration identifiée

Pour chaque non-conformité, une **action corrective** doit être mise en place selon la méthode **8D** :
1. Constituer l'équipe
2. Décrire le problème
3. Contenir les effets immédiats
4. Identifier la cause racine
5. Choisir et valider les actions correctives
6. Mettre en œuvre les corrections
7. Prévenir la récurrence
8. Féliciter l'équipe
`,
    questions: [
      { q: "Quelle est la différence entre un audit interne et un audit externe ?", opts: ["L'audit interne est obligatoire, l'externe non", "L'audit interne est réalisé par l'organisation, l'externe par un tiers indépendant", "L'audit interne ne vérifie que la qualité", "L'audit externe est plus rapide"], correct: 1, explanation: "L'audit interne est réalisé par l'organisation elle-même (ou en son nom), tandis que l'audit externe est conduit par un organisme indépendant. "},
      { q: "Qu'est-ce qu'un 'lagging indicator' ? ", opts: ["Un indicateur de performance future", "Un indicateur qui mesure les résultats passés", "Un indicateur financier", "Un indicateur de satisfaction client"], correct: 1, explanation: "Les lagging indicators (indicateurs de résultat) mesurent les événements passés comme les accidents, les maladies professionnelles, les non-conformités. "},
      { q: "Combien d'étapes comporte la méthode de résolution 8D ? ", opts: ["5", "6", "8", "10"], correct: 2, explanation: "La méthode 8D comporte 8 étapes disciplinaires pour résoudre les problèmes de manière systématique et durable. "},
      { q: "Parmi ces éléments, lequel est un 'leading indicator' ? ", opts: ["Le nombre d'accidents du travail", "Le nombre de jours d'arrêt", "Les heures de formation QHSE", "Le taux de gravité"], correct: 2, explanation: "Les heures de formation QHSE sont un indicateur proactif (leading indicator) car elles mesurent les actions de prévention avant les incidents. "},
      { q: "Qu'est-ce qu'une non-conformité majeure ? ", opts: ["Un écart mineur sans conséquence", "L'absence ou défaillance totale d'un élément essentiel du système", "Une suggestion d'amélioration", "Un retard dans un formulaire"], correct: 1, explanation: "Une non-conformité majeure correspond à l'absence ou à la défaillance totale d'un élément essentiel du système de management. "},
      { q: "Le tableau de bord QHSE sert à : ", opts: ["Piloter la performance QHSE de manière visuelle", "Stocker les documents QHSE", "Gérer les paies des agents QHSE", "Organiser les réunions"], correct: 0, explanation: "Le tableau de bord QHSE est un outil de pilotage visuel qui présente les indicateurs clés et facilite la prise de décision. "},
      { q: "Quelle est la première étape d'un audit QHSE ? ", opts: ["La rédaction du rapport", "L'exécution sur le terrain", "La planification (périmètre, critères, objectif)", "Le suivi des actions correctives"], correct: 2, explanation: "La planification est la première étape : elle définit le périmètre, les critères et l'objectif de l'audit. "},
      { q: "Laquelle de ces affirmations sur les audits est FAUSSE ? ", opts: ["L'audit doit être méthodique et indépendant", "L'audit est un outil de communication", "L'audit a pour but de sanctionner les responsables", "L'audit permet d'identifier les améliorations"], correct: 2, explanation: "L'audit n'a PAS pour but de sanctionner. C'est un outil d'évaluation et d'amélioration, pas un outil disciplinaire. "},
      { q: "Le Taux de Fréquence (TF) se calcule par : ", opts: ["(Nombre d'accidents × 1 000 000) / Heures travaillées", "Nombre d'accidents / Nombre de salariés", "Jours d'arrêt / Heures travaillées", "Nombre de near-miss / Nombre de salariés"], correct: 0, explanation: "TF = (Nombre d'accidents avec arrêt × 1 000 000) / Nombre total d'heures travaillées. "},
      { q: "Une 'observation' en audit QHSE est : ", opts: ["Une non-conformité légale", "Une opportunité d'amélioration identifiée", "Une faute disciplinaire", "Un écart par rapport au budget"], correct: 1, explanation: "Une observation est une opportunité d'amélioration identifiée lors d'un audit, sans caractère de non-conformité. "}
    ]
  },
  {
    title: "Les Outils et Méthodes QHSE",
    content: `## Les Outils et Méthodes QHSE

La démarche QHSE s'appuie sur de nombreux outils et méthodes qui permettent de structurer l'analyse, la décision et l'action.

### Les Méthodes d'Analyse des Risques

#### La Matrice des Risques
La matrice des risques est un outil visuel qui croise :

- **La probabilité d'occurrence** (de rare à très fréquent)
- **La gravité des conséquences** (de faible à catastrophique)

Elle permet de classer les risques en trois niveaux :
- **Risque acceptable** (vert) : monitoring et contrôle périodique
- **Risque à traiter** (orange) : actions de réduction planifiées
- **Risque inacceptable** (rouge) : action immédiate requise

#### L'Arbre des Causes
L'arbre des causes est une méthode d'analyse a posteriori (après un événement) qui :

- Représente graphiquement l'enchaînement des faits ayant conduit à l'accident
- Identifie les facteurs techniques, humains et organisationnels
- Utilise la logique booléenne (ET / OU)
- Fait la distinction entre les causes directes et les causes profondes

#### L'AMDEC (Analyse des Modes de Défaillance, de leurs Effets et de leur Criticité)

L'AMDEC est une méthode d'analyse préventive qui :

- Identifie les modes de défaillance potentiels d'un processus
- Évalue les effets et la criticité de chaque défaillance
- Calcule un indice de criticité (IPR) = Gravité × Fréquence × Détection
- Priorise les actions préventives selon la criticité

### Les Méthodes de Résolution de Problèmes

#### La Méthode 8D

Déjà détaillée dans le chapitre précédent, cette méthode est le standard automobile pour la résolution de problèmes.

#### Le QQOQCCP (ou 5W2H)

Cette méthode structure l'analyse d'une situation :

| Question | Signification |
|----------|---------------|
| **Qui ?** | Qui est concerné ? |
| **Quoi ?** | Que se passe-t-il ? |
| **Où ?** | Où cela se produit-il ? |
| **Quand ?** | Quand cela se produit-il ? |
| **Pourquoi ?** | Pourquoi cela se produit-il ? |
| **Comment ?** | Comment cela se produit-il ? |
| **Combien ?** | Quelle est l'ampleur ? |

#### La Roue de Deming (PDCA)

Le PDCA est le moteur de l'amélioration continue :

1. **Plan (Planifier)** : Définir les objectifs, analyser la situation, planifier les actions
2. **Do (Réaliser)** : Mettre en œuvre les actions planifiées
3. **Check (Vérifier)** : Mesurer les résultats, comparer aux objectifs
4. **Act (Agir)** : Standardiser les succès, corriger les écarts, planifier le prochain cycle

### Les Outils de la Qualité (Les 7 M de la Qualité)

1. **Diagramme d'Ishikawa** (causes-effets)
2. **Feuille de relevés** (collecte de données)
3. **Histogramme** (distribution des données)
4. **Diagramme de Pareto** (priorisation)
5. **Diagramme de corrélation** (relations entre variables)
6. **Carte de contrôle** (suivi de processus)
7. **Stratification** (classification des données)

### Les Outils Numériques QHSE

De nombreux logiciels QHSE sont disponibles pour :

- La gestion du Document Unique (DUERP)
- Le suivi des accidents et incidents
- La planification des audits
- Le pilotage des indicateurs (tableaux de bord)
- La gestion des formations et des compétences
- Le suivi des actions correctives et préventives
`,
    questions: [
      { q: "Que mesure l'indice IPR dans la méthode AMDEC ? ", opts: ["L'investissement prévisionnel requis", "La gravité × Fréquence × Détection", "Le nombre d'incidents par rapport", "L'indice de performance du risque"], correct: 1, explanation: "L'IPR (Indice de Priorité de Risque ou Indice de Criticité) = Gravité × Fréquence × Détection. Plus il est élevé, plus la défaillance est critique. "},
      { q: "Dans une matrice des risques, le risque rouge correspond à : ", opts: ["Un risque acceptable", "Un risque à traiter avec des actions planifiées", "Un risque inacceptable nécessitant une action immédiate", "Un risque négligeable"], correct: 2, explanation: "Dans la matrice des risques, le rouge représente un risque inacceptable qui nécessite une action immédiate pour réduire sa criticité. "},
      { q: "Que signifie le 'C' dans QQOQCCP ? ", opts: ["Contrôle", "Combien", "Conséquence", "Conformité"], correct: 1, explanation: "Les lettres QQOQCCP signifient : Qui, Quoi, Où, Quand, Pourquoi, Comment, Combien. "},
      { q: "L'AMDEC est une méthode : ", opts: ["Curative (après problème)", "Préventive (avant problème)", "Uniquement pour l'industrie automobile", "Uniquement pour les produits chimiques"], correct: 1, explanation: "L'AMDEC est une méthode d'analyse préventive qui identifie les modes de défaillance potentiels AVANT qu'ils ne surviennent. "},
      { q: "Combien d'outils fondamentaux de la qualité existe-t-il (les 7 M) ? ", opts: ["5", "6", "7", "8"], correct: 2, explanation: "Il existe 7 outils fondamentaux de la qualité : Ishikawa, feuille de relevés, histogramme, Pareto, corrélation, carte de contrôle et stratification. "},
      { q: "L'arbre des causes est une méthode : ", opts: ["Préventive", "A posteriori (après événement)", "Financière", "Commerciale"], correct: 1, explanation: "L'arbre des causes est une méthode d'analyse a posteriori qui sert à comprendre l'enchaînement des faits ayant conduit à un accident. "},
      { q: "Dans le PDCA, la phase 'Act' consiste à : ", opts: ["Planifier les objectifs", "Exécuter les actions", "Standardiser les succès et corriger les écarts", "Mesurer les résultats"], correct: 2, explanation: "La phase 'Act' consiste à standardiser les succès, corriger les écarts, et planifier le prochain cycle d'amélioration. "},
      { q: "Le diagramme de corrélation sert à : ", opts: ["Classer les causes par catégorie", "Étudier la relation entre deux variables", "Mesurer la fréquence des incidents", "Planifier un projet"], correct: 1, explanation: "Le diagramme de corrélation (ou nuage de points) permet d'étudier l'existence et l'intensité d'une relation entre deux variables. "},
      { q: "L'AMDEC évalue chaque défaillance selon trois critères. Lesquels ? ", opts: ["Coût, Délai, Qualité", "Gravité, Fréquence, Détection", "Probabilité, Impact, Vitesse", "Risque, Danger, Exposition"], correct: 1, explanation: "L'AMDEC évalue les défaillances selon trois critères : la Gravité des effets, la Fréquence d'apparition, et la Probabilité de non-détection. "},
      { q: "La feuille de relevés est un outil qui sert à : ", opts: ["Planifier les actions correctives", "Collecter des données de manière structurée", "Évaluer les compétences du personnel", "Mesurer la satisfaction client"], correct: 1, explanation: "La feuille de relevés est un outil simple et efficace pour collecter des données de manière organisée et structurée. "}
    ]
  }
];

async function main() {
  const course = await prisma.onlineCourse.findUnique({ where: { slug: COURSE_SLUG } });
  if (!course) { console.error('Course not found'); return; }

  const existingCount = await prisma.chapter.count({ where: { courseId: course.id } });
  console.log(`Course: ${course.title}`);
  console.log(`Existing chapters: ${existingCount}`);

  for (let i = 0; i < newChapters.length; i++) {
    const ch = newChapters[i];
    const chapter = await prisma.chapter.create({
      data: {
        title: ch.title,
        content: ch.content,
        order: existingCount + i + 1,
        courseId: course.id,
      },
    });
    console.log(`  Created chapter: ${ch.title}`);

    for (let j = 0; j < ch.questions.length; j++) {
      const q = ch.questions[j];
      await prisma.question.create({
        data: {
          question: q.q,
          options: JSON.stringify(q.opts),
          correctIndex: q.correct,
          explanation: q.explanation,
          order: j + 1,
          chapterId: chapter.id,
        },
      });
    }
    console.log(`    Added ${ch.questions.length} questions`);
  }

  const newCount = await prisma.chapter.count({ where: { courseId: course.id } });
  console.log(`New total chapters: ${newCount}`);

  // Update course totalChapters
  await prisma.onlineCourse.update({
    where: { id: course.id },
    data: { totalChapters: newCount },
  });
  console.log('Course totalChapters updated');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
