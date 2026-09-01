export const COURSES_DATA_3_TO_6 = [
{
  title: 'Les Équipements de Protection Individuelle (EPI)',
  slug: 'equipements-protection-individuelle',
  description: 'Maîtrisez le cadre réglementaire, la classification, le choix et l\'utilisation des équipements de protection individuelle. Ce cours vous permettra de comprendre quand et comment utiliser les EPI de manière optimale.',
  shortDescription: 'Classification, choix et utilisation optimale des EPI.',
  totalHours: '2h',
  icon: 'Shield',
  order: 3,
  chapters: [
    {
      title: 'Cadre réglementaire des EPI',
      content: `# Cadre réglementaire des EPI

## Définition
Un **EPI** est un dispositif porté ou tenu par le travailleur pour le protéger contre un ou plusieurs risques. Le Code du travail (article R4323-91) définit les EPI.

## Le cadre réglementaire
- **Règlement (UE) 2016/425** : Règlement européen sur les EPI
- **Code du travail** : Articles R4323-91 à R4323-106
- **Normes européennes** : EN correspondant à chaque type d\'EPI

## L\'obligation de l\'employeur
L\'employeur doit :
1. Fournir gratuitement les EPI nécessaires
2. Veiller à leur utilisation effective
3. Assurer leur entretien et remplacement
4. Former les travailleurs à leur usage

## Quand utiliser un EPI ?
Les EPI constituent le **dernier recours** dans la hiérarchie des moyens de prévention. Ils ne doivent être utilisés que lorsque les mesures de protection collective sont insuffisantes.

## La responsabilité partagée
- **Employeur** : fourniture, formation, entretien
- **Salarié** : utilisation conforme, signalement d\'anomalie, entretien de base`,
      questions: [
        { question: 'Qu\'est-ce qu\'un EPI ?', options: ['Un outil de travail', 'Un dispositif de protection porté par le travailleur', 'Un document réglementaire', 'Un type de formation'], correctIndex: 1, explanation: 'Un EPI est un dispositif porté ou tenu pour protéger le travailleur.' },
        { question: 'Les EPI sont le dernier recours car ?', options: ['Ils sont chers', 'Les mesures collectives doivent être prioritaires', 'Ils ne fonctionnent pas', 'Ils sont obligatoires'], correctIndex: 1, explanation: 'Les EPI sont le dernier recours après les mesures collectives.' },
        { question: 'L\'employeur doit fournir les EPI ?', options: ['À vendre', 'Gratuitement', 'En location', 'Uniquement sur demande'], correctIndex: 1, explanation: 'L\'employeur doit fournir gratuitement les EPI nécessaires.' },
        { question: 'Le règlement européen sur les EPI est ?', options: ['2014/320', '2016/425', '2018/500', '2020/123'], correctIndex: 1, explanation: 'Le règlement (UE) 2016/425 régit les EPI.' },
        { question: 'Qui doit entretenir les EPI ?', options: ['Le salarié uniquement', 'L\'employeur principalement', 'Personne', 'Le fabricant'], correctIndex: 1, explanation: 'L\'employeur doit assurer l\'entretien et le remplacement.' },
        { question: 'Les articles R4323-91 du Code du travail concernent ?', options: ['Les congés', 'Les EPI', 'Les salaires', 'Le licenciement'], correctIndex: 1, explanation: 'Ces articles définissent le cadre des EPI.' },
        { question: 'Le salarié a la responsabilité de ?', options: ['Acheter ses EPI', 'Les utiliser conformément et signaler les anomalies', 'Les concevoir', 'Les vendre'], correctIndex: 1, explanation: 'Le salarié doit utiliser les EPI correctement et signaler les anomalies.' },
        { question: 'Les normes EN concernent ?', options: ['Les salaires', 'Chaque type d\'EPI', 'Les congés', 'Le marketing'], correctIndex: 1, explanation: 'Les normes EN correspondent à chaque type d\'EPI.' },
        { question: 'Quand utilise-t-on un EPI ?', options: ['En premier choix', 'Quand les mesures collectives sont insuffisantes', 'Jamais', 'Uniquement le week-end'], correctIndex: 1, explanation: 'Les EPI sont utilisés quand les mesures collectives sont insuffisantes.' },
        { question: 'L\'employeur doit-il former les travailleurs aux EPI ?', options: ['Non', 'Oui, c\'est obligatoire', 'Uniquement dans l\'industrie', 'Uniquement sur demande'], correctIndex: 1, explanation: 'La formation à l\'utilisation des EPI est obligatoire.' },
      ],
    },
    {
      title: 'Classification et catégories des EPI',
      content: `# Classification et catégories des EPI

## Les 3 catégories de risques

### Catégorie I (risques mineurs)
Risques de blessures superficielles :
- Gants de jardinage
- Lunettes de soleil
- Chapeaux

### Catégorie II (risques intermédiaires)
Risques de blessures graves, non mortels :
- Casques de chantier
- Gants de protection mécanique
- Chaussures de sécurité
- Lunettes de protection

### Catégorie III (risques graves ou mortels)
Risques pouvant entraîner la mort :
- Appareils de protection respiratoire (masques à gaz)
- Harnais de sécurité (travail en hauteur)
- Combinaisons de protection chimique

## Le marquage CE
Tous les EPI doivent porter le **marquage CE** attestant de leur conformité réglementaire.

## Les pictogrammes sur les EPI
- **Casque avec lettre M** : protection mécanique
- **Oreille** : protection auditive
- **Main** : protection cutanée
- **Poumon** : protection respiratoire
- **Oeil** : protection oculaire`,
      questions: [
        { question: 'Combien de catégories d\'EPI existe-t-il ?', options: ['2', '3', '4', '5'], correctIndex: 1, explanation: 'Il existe 3 catégories d\'EPI selon le niveau de risque.' },
        { question: 'La catégorie III concerne les risques ?', options: ['Mineurs', 'Intermédiaires', 'Graves ou mortels', 'Esthétiques'], correctIndex: 2, explanation: 'La catégorie III concerne les risques graves ou mortels.' },
        { question: 'Un harnais de sécurité est de catégorie ?', options: ['I', 'II', 'III', 'Aucune'], correctIndex: 2, explanation: 'Le harnais est un EPI de catégorie III.' },
        { question: 'Les gants de jardinage sont de catégorie ?', options: ['I', 'II', 'III', 'IV'], correctIndex: 0, explanation: 'Les gants de jardinage sont en catégorie I (risques mineurs).' },
        { question: 'Le marquage CE est-il obligatoire ?', options: ['Non', 'Oui, pour tous les EPI', 'Uniquement catégorie III', 'Uniquement en France'], correctIndex: 1, explanation: 'Tous les EPI doivent porter le marquage CE.' },
        { question: 'Un casque de chantier est de catégorie ?', options: ['I', 'II', 'III', '0'], correctIndex: 1, explanation: 'Le casque de chantier est en catégorie II.' },
        { question: 'Le pictogramme poumon indique ?', options: ['Protection auditive', 'Protection respiratoire', 'Protection oculaire', 'Protection mécanique'], correctIndex: 1, explanation: 'Le pictogramme poumon indique une protection respiratoire.' },
        { question: 'Un masque à gaz est de catégorie ?', options: ['I', 'II', 'III', 'Non classé'], correctIndex: 2, explanation: 'Un masque à gaz protège contre des risques mortels (catégorie III).' },
        { question: 'La catégorie II correspond à ?', options: ['Risques mineurs', 'Risques de blessures graves non mortelles', 'Risques mortels', 'Risques esthétiques'], correctIndex: 1, explanation: 'La catégorie II couvre les blessures graves non mortelles.' },
        { question: 'Le pictogramme oreille indique ?', options: ['Protection visuelle', 'Protection auditive', 'Protection respiratoire', 'Protection cutanée'], correctIndex: 1, explanation: 'Le pictogramme oreille = protection auditive.' },
      ],
    },
    {
      title: 'Les EPI de protection de la tête et du visage',
      content: `# Les EPI de protection de la tête et du visage

## Les casques de protection

### Norme : EN 397
Protège contre les chutes d\'objets et les chocs latéraux.

### Types de casques
| Type | Usage |
|------|--------|
| Casque chantier | BTP, industrie |
| Casque isolant électrique | Travaux électriques |
| Casque forestier | Bûcheronnage |
| Casque haute température | Métallurgie |

## Les protections oculaires

### Normes : EN 166 (protection générale)

### Types :
- **Lunettes de sécurité** : contre les projections
- **Écrans faciaux** : contre les éclaboussures
- **Masques de soudage** : contre les UV et les étincelles
- **Cagoules** : contre les risques multiples

## Les protections auditives

### Normes : EN 352

### Types :
- **Bouchons d\'oreilles** (jetables, moulés)
- **Casques antibruit** (serre-tête)
- **Arceaux antibruit**

### Règle importante
L\'atténuation ne doit pas empêcher l\'audition des signaux d\'alarme.

## Les protections respiratoires

### Normes : EN 149, EN 140, EN 136

### Types :
- **Masques à usage unique** (FFP1, FFP2, FFP3)
- **Demi-masques** avec cartouche filtrante
- **Masques complets** (couvrant nez, bouche, yeux)
- **Appareils à adduction d\'air**`,
      questions: [
        { question: 'La norme EN 397 concerne ?', options: ['Les lunettes', 'Les casques de protection', 'Les gants', 'Les chaussures'], correctIndex: 1, explanation: 'EN 397 est la norme pour les casques de protection.' },
        { question: 'FFP3 est un type de ?', options: ['Casque', 'Masque respiratoire', 'Chaussure', 'Gant'], correctIndex: 1, explanation: 'FFP3 est le niveau le plus élevé de masque filtrant.' },
        { question: 'Les bouchons d\'oreilles protègent contre ?', options: ['Les produits chimiques', 'Le bruit', 'Les chutes', 'Le froid'], correctIndex: 1, explanation: 'Les bouchons d\'oreilles sont des protections auditives.' },
        { question: 'La norme EN 166 concerne ?', options: ['Les casques', 'Les protections oculaires', 'Les gants', 'Les chaussures'], correctIndex: 1, explanation: 'EN 166 est la norme pour les protections oculaires.' },
        { question: 'Un masque de soudage protège contre ?', options: ['Le bruit', 'Les UV et étincelles', 'Les produits chimiques', 'Le froid'], correctIndex: 1, explanation: 'Le masque de soudage protège contre les UV et les étincelles.' },
        { question: 'L\'atténuation du bruit ne doit pas ?', options: ['Dépasser 30 dB', 'Empêcher l\'audition des signaux d\'alarme', 'Être trop faible', 'Être réversible'], correctIndex: 1, explanation: 'L\'atténuation doit permettre d\'entendre les signaux d\'alarme.' },
        { question: 'Un demi-masque avec cartouche est un ?', options: ['Casque', 'EPI respiratoire', 'Écran facial', 'Bouchon d\'oreille'], correctIndex: 1, explanation: 'Le demi-masque avec cartouche est un EPI respiratoire.' },
        { question: 'Le casque isolant électrique est utilisé pour ?', options: ['Le bâtiment', 'Les travaux électriques', 'La forêt', 'La métallurgie'], correctIndex: 1, explanation: 'Le casque isolant électrique protège lors des travaux électriques.' },
        { question: 'La norme EN 352 concerne ?', options: ['Les casques', 'Les protections auditives', 'Les gants', 'Les chaussures'], correctIndex: 1, explanation: 'EN 352 est la norme pour les protections auditives.' },
        { question: 'Un écran facial protège contre ?', options: ['Le bruit', 'Les éclaboussures', 'Les chutes', 'Le froid'], correctIndex: 1, explanation: 'L\'écran facial protège contre les éclaboussures.' },
      ],
    },
    {
      title: 'Les EPI de protection respiratoire',
      content: `# Les EPI de protection respiratoire

## Pourquoi une protection respiratoire ?

L\'inhalation est la **voie d\'exposition principale** pour de nombreux risques :
- Poussières, fibres (amiante, silice)
- Gaz et vapeurs (solvants, CO, CO2)
- Aérosols (brouillards, fumées)
- Agents biologiques (virus, bactéries)

## Les types de protection respiratoire

### 1. Les masques filtrants (pièces faciales filtrantes)
Norme EN 149

| Classe | Efficacité | Usage |
|--------|-----------|--------|
| FFP1 | 80% | Poussières non toxiques |
| FFP2 | 94% | Poussières fines, aérosols |
| FFP3 | 99% | Particules toxiques, agents biologiques |

### 2. Les demi-masques et masques complets
Normes EN 140, EN 136
- Utilisés avec des **cartouches filtrantes** adaptées au risque
- A, B, E, K : types de gaz filtrés
- AX, BX : gaz spéciaux

### 3. Les appareils à adduction d\'air
- **Appareils isolants** : bouteille d\'air comprimé
- **Appareils à adduction d\'air libre** : raccordés à une source

## Les vérifications avant utilisation
- État du masque (fissures, déformations)
- Étanchéité (test d\'ajustement)
- Date de péremption des filtres
- Adéquation du filtre au risque identifié`,
      questions: [
        { question: 'Un masque FFP2 filtre à ?', options: ['80%', '94%', '99%', '100%'], correctIndex: 1, explanation: 'FFP2 a une efficacité de filtration de 94%.' },
        { question: 'La norme EN 149 concerne ?', options: ['Les gants', 'Les masques filtrants', 'Les casques', 'Les chaussures'], correctIndex: 1, explanation: 'EN 149 est la norme pour les pièces faciales filtrantes.' },
        { question: 'Les cartouches filtrantes sont utilisées avec ?', options: ['Les lunettes', 'Les demi-masques', 'Les casques', 'Les gants'], correctIndex: 1, explanation: 'Les cartouches filtrantes s\'utilisent avec les demi-masques et masques complets.' },
        { question: 'Un masque FFP3 est utilisé pour ?', options: ['Les poussières légères', 'Les particules toxiques et agents biologiques', 'Le bruit', 'La chaleur'], correctIndex: 1, explanation: 'FFP3 est pour les particules toxiques et les agents biologiques.' },
        { question: 'L\'inhalation est la voie d\'exposition ?', options: ['Secondaire', 'Principale', 'Négligeable', 'Inexistante'], correctIndex: 1, explanation: 'L\'inhalation est la voie d\'exposition principale.' },
        { question: 'Que vérifie-t-on avant utilisation ?', options: ['La couleur', 'L\'étanchéité et la péremption', 'Le poids', 'La marque'], correctIndex: 1, explanation: 'Il faut vérifier l\'étanchéité et la date de péremption.' },
        { question: 'Les appareils à adduction d\'air utilisent ?', options: ['Des filtres', 'Une bouteille ou une source d\'air', 'Des piles', 'Du papier'], correctIndex: 1, explanation: 'Ces appareils utilisent une bouteille d\'air ou une source d\'air.' },
        { question: 'Un filtre de type A protège contre ?', options: ['Les poussières', 'Les gaz et vapeurs organiques', 'Le bruit', 'Les radiations'], correctIndex: 1, explanation: 'Le filtre A est pour les gaz et vapeurs organiques.' },
        { question: 'FFP1 filtre à ?', options: ['80%', '94%', '99%', '100%'], correctIndex: 0, explanation: 'FFP1 a une efficacité de 80%.' },
        { question: 'Le test d\'ajustement vérifie ?', options: ['Le confort', 'L\'étanchéité du masque', 'Le prix', 'La couleur'], correctIndex: 1, explanation: 'Le test d\'ajustement vérifie l\'étanchéité du masque.' },
      ],
    },
    {
      title: 'Les EPI de protection des mains et des bras',
      content: `# Les EPI de protection des mains et des bras

## Pourquoi protéger les mains ?

Les mains sont les **premières parties du corps exposées** aux risques professionnels.

## Les risques pour les mains
- **Mécaniques** : coupures, perforations, abrasions
- **Chimiques** : irritation, brûlures, allergies
- **Thermiques** : brûlures par le chaud ou le froid
- **Électriques** : chocs électriques, arcs électriques
- **Biologiques** : infections, piqûres

## Les types de gants

### Gants à usage unique
- Latex, nitrile, vinyle
- Travaux légers, alimentaire, médical

### Gants de protection mécanique
Norme EN 388
- Résistance à l\'abrasion, coupure, déchirure, perforation
- 6 niveaux de performance (0 à 5)

### Gants de protection chimique
Norme EN 374
- Lettres de code : A, B, C... selon les produits chimiques

### Gants thermiques
Norme EN 407 (chaleur) / EN 511 (froid)

### Gants diélectriques
Norme EN 60903
- Protection contre les tensions électriques

## Choisir le bon gant
- Identifier le risque principal
- Choisir la norme adaptée
- Vérifier la taille (taille S à XXXL)
- Tester avant utilisation prolongée`,
      questions: [
        { question: 'Les mains sont les parties du corps ?', options: ['Les moins exposées', 'Les plus exposées', 'Non concernées', 'Protégées naturellement'], correctIndex: 1, explanation: 'Les mains sont les premières parties du corps exposées.' },
        { question: 'La norme EN 388 concerne ?', options: ['Les gants chimiques', 'Les gants de protection mécanique', 'Les gants thermiques', 'Les gants électriques'], correctIndex: 1, explanation: 'EN 388 est la norme pour les gants mécaniques.' },
        { question: 'Les gants en nitrile sont à usage ?', options: ['Permanent', 'Unique', 'Quotidien', 'Annuel'], correctIndex: 1, explanation: 'Les gants en nitrile sont généralement à usage unique.' },
        { question: 'La norme EN 374 concerne ?', options: ['Les gants mécaniques', 'Les gants chimiques', 'Les gants thermiques', 'Les casques'], correctIndex: 1, explanation: 'EN 374 est la norme pour les gants de protection chimique.' },
        { question: 'Combien de niveaux de performance a EN 388 ?', options: ['3', '4', '6', '10'], correctIndex: 2, explanation: 'EN 388 a 6 niveaux de performance (0 à 5).' },
        { question: 'Les gants diélectriques protègent contre ?', options: ['Le froid', 'Les produits chimiques', 'Les tensions électriques', 'Les coupures'], correctIndex: 2, explanation: 'Les gants diélectriques protègent contre les tensions électriques.' },
        { question: 'La norme EN 407 concerne les gants ?', options: ['Mécaniques', 'Chimiques', 'Contre la chaleur', 'Électriques'], correctIndex: 2, explanation: 'EN 407 est la norme pour les gants de protection contre la chaleur.' },
        { question: 'Que faire avant d\'utiliser des gants prolongés ?', options: ['Les jeter', 'Les tester', 'Les peindre', 'Les coudre'], correctIndex: 1, explanation: 'Il est recommandé de tester les gants avant une utilisation prolongée.' },
        { question: 'La taille des gants va de ?', options: ['XS à XL', 'S à XXXL', 'Unique', '1 à 10'], correctIndex: 1, explanation: 'Les gants vont de la taille S à XXXL.' },
        { question: 'Les risques pour les mains sont ?', options: ['Uniquement mécaniques', 'Mécaniques, chimiques, thermiques, électriques, biologiques', 'Uniquement chimiques', 'Uniquement thermiques'], correctIndex: 1, explanation: 'Les risques sont multiples : mécaniques, chimiques, thermiques, etc.' },
      ],
    },
    {
      title: 'Les EPI de protection du corps et des pieds',
      content: `# Les EPI de protection du corps et des pieds

## Les chaussures de sécurité

### Norme : EN ISO 20345

### Types de chaussures
| Type | Description |
|------|------------|
| SB | Chaussure de sécurité de base |
| S1 | SB + propriétés antistatiques + absorption énergie |
| S2 | S1 + pénétration d\'eau |
| S3 | S2 + semelle antidérapante et embout |

### Classes de résistance de l\'embout
- **I** : 200 Joules
- **II** : 100 Joules

### Autres protections
- **Semelle anticoupure** : protection contre les objets pointus
- **Semelle antidérapante** : SRC, SRA, SRB
- **Protection thermique** : chaud ou froid
- **Protection chimique** : acides, bases

## Les vêtements de protection

### Vêtements haute visibilité
Norme EN ISO 20471
- **Classe 1** : risque minimal (zones à faible vitesse)
- **Classe 2** : risque intermédiaire
- **Classe 3** : risque élevé (routes, chantiers)

### Vêtements de protection chimique
- Combinaisons jetables
- Combinaisons réutilisables
- Normes EN 14605, EN 13034

### Vêtements de protection contre la chaleur
Norme EN ISO 11612

### Harnais de sécurité
Norme EN 361
- Protection contre les chutes de hauteur
- Point d\'accrochage dorsal ou ventral`,
      questions: [
        { question: 'La norme EN ISO 20345 concerne ?', options: ['Les casques', 'Les chaussures de sécurité', 'Les gants', 'Les lunettes'], correctIndex: 1, explanation: 'EN ISO 20345 est la norme pour les chaussures de sécurité.' },
        { question: 'Un embout de classe I résiste à ?', options: ['50 Joules', '100 Joules', '200 Joules', '500 Joules'], correctIndex: 2, explanation: 'La classe I résiste à 200 Joules.' },
        { question: 'La classe 3 de haute visibilité est pour ?', options: ['Le bureau', 'Les routes et chantiers', 'La piscine', 'La chambre'], correctIndex: 1, explanation: 'La classe 3 est pour les risques élevés (routes, chantiers).' },
        { question: 'La norme EN 361 concerne ?', options: ['Les gants', 'Les harnais de sécurité', 'Les chaussures', 'Les lunettes'], correctIndex: 1, explanation: 'EN 361 est la norme pour les harnais de sécurité.' },
        { question: 'S3 signifie pour les chaussures ?', options: ['Sans base', 'SB + antistatique + eau + antidérapante + embout', 'Sécurité niveau 3', 'Sport niveau 3'], correctIndex: 1, explanation: 'S3 inclut toutes les protections de base plus antidérapant et embout.' },
        { question: 'La semelle SRC est ?', options: ['Une semelle chauffante', 'Une semelle antidérapante', 'Une semelle isolante', 'Une semelle jetable'], correctIndex: 1, explanation: 'SRC est une semelle antidérapante.' },
        { question: 'Les vêtements haute visibilité norme ?', options: ['EN ISO 20345', 'EN ISO 20471', 'EN ISO 11612', 'EN ISO 361'], correctIndex: 1, explanation: 'EN ISO 20471 est la norme pour les vêtements haute visibilité.' },
        { question: 'L\'embout de classe II résiste à ?', options: ['200 Joules', '100 Joules', '50 Joules', '300 Joules'], correctIndex: 1, explanation: 'La classe II résiste à 100 Joules.' },
        { question: 'Un harnais de sécurité protège contre ?', options: ['Le bruit', 'Les chutes de hauteur', 'Le froid', 'Les produits chimiques'], correctIndex: 1, explanation: 'Le harnais protège contre les chutes de hauteur.' },
        { question: 'Les combinaisons jetables sont des ?', options: ['EPI auditifs', 'Vêtements de protection chimique', 'Chaussures', 'Casques'], correctIndex: 1, explanation: 'Les combinaisons jetables protègent contre les risques chimiques.' },
      ],
    },
    {
      title: 'Choix, mise en place et entretien des EPI',
      content: `# Choix, mise en place et entretien des EPI

## La démarche de choix des EPI

### 1. Identifier les risques
Analyser le poste de travail et les dangers associés.

### 2. Définir les exigences
- Nature du risque
- Niveau de protection nécessaire
- Confort et ergonomie
- Compatibilité avec d\'autres EPI

### 3. Consulter les utilisateurs
Les travailleurs doivent être associés au choix de leurs EPI.

### 4. Vérifier la conformité
- Présence du marquage CE
- Adéquation de la norme
- Notice d\'utilisation

## La mise en place
- Formation des utilisateurs
- Essai individuel (taille, confort)
- Définition des règles de port
- Mise à disposition dans des zones accessibles

## L\'entretien des EPI

### Entretien courant
- Nettoyage après chaque utilisation
- Séchage à l\'air libre
- Rangement dans un endroit propre et sec

### Vérifications périodiques
- Inspection visuelle avant chaque utilisation
- Vérification approfondie selon un calendrier
- Tenue d\'un registre d\'entretien

### Le remplacement
Un EPI doit être remplacé quand :
- Il est endommagé
- Il a atteint sa date de péremption
- Il ne assure plus sa fonction de protection

## Le registre des EPI
L\'employeur doit tenir un registre indiquant :
- La nature des EPI fournis
- Les dates de distribution
- Les dates de vérification et d\'entretien`,
      questions: [
        { question: 'Qui doit être consulté pour le choix des EPI ?', options: ['Uniquement la direction', 'Les utilisateurs', 'Uniquement le fournisseur', 'Personne'], correctIndex: 1, explanation: 'Les travailleurs doivent être associés au choix de leurs EPI.' },
        { question: 'Quand nettoyer un EPI ?', options: ['Une fois par an', 'Après chaque utilisation', 'Jamais', 'Uniquement s\'il est sale'], correctIndex: 1, explanation: 'Le nettoyage doit se faire après chaque utilisation.' },
        { question: 'Un EPI doit être remplacé quand ?', options: ['Après 10 ans', 'Quand il est endommagé ou périmé', 'Une fois par an', 'Jamais'], correctIndex: 1, explanation: 'Un EPI doit être remplacé dès qu\'il est endommagé ou périmé.' },
        { question: 'Le registre des EPI contient ?', options: ['Le nom des clients', 'La nature, les dates de distribution et vérification', 'Les factures', 'Le chiffre d\'affaires'], correctIndex: 1, explanation: 'Le registre contient les informations de suivi des EPI.' },
        { question: 'La vérification visuelle se fait ?', options: ['Une fois par an', 'Avant chaque utilisation', 'Tous les 5 ans', 'Jamais'], correctIndex: 1, explanation: 'L\'inspection visuelle doit se faire avant chaque utilisation.' },
        { question: 'Qu\'est-ce qui garantit la conformité d\'un EPI ?', options: ['La couleur', 'Le marquage CE', 'Le prix', 'Le pays d\'origine'], correctIndex: 1, explanation: 'Le marquage CE garantit la conformité réglementaire.' },
        { question: 'Les EPI doivent être rangés ?', options: ['N\'importe où', 'Dans un endroit propre et sec', 'Dehors', 'Dans un coffre fermé à clé'], correctIndex: 1, explanation: 'Les EPI doivent être rangés proprement et au sec.' },
        { question: 'La compatibilité des EPI signifie ?', options: ['Ils sont de la même marque', 'Ils peuvent être portés ensemble sans gêne', 'Ils sont gratuits', 'Ils sont jolis'], correctIndex: 1, explanation: 'La compatibilité signifie qu\'ils peuvent être portés ensemble.' },
        { question: 'L\'essai individuel sert à ?', options: ['Prouver la résistance', 'Vérifier la taille et le confort', 'Augmenter le prix', 'Réduire la garantie'], correctIndex: 1, explanation: 'L\'essai individuel vérifie la taille et le confort.' },
        { question: 'La formation des utilisateurs est ?', options: ['Facultative', 'Obligatoire', 'Uniquement pour les cadres', 'Payante'], correctIndex: 1, explanation: 'La formation à l\'utilisation des EPI est obligatoire.' },
      ],
    },
    {
      title: 'Limites des EPI et principes de substitution',
      content: `# Limites des EPI et principes de substitution

## Les limites des EPI

### 1. Protection limitée
Un EPI ne protège que contre le risque pour lequel il est conçu.

### 2. Confort et acceptabilité
- Gêne, chaleur, poids
- Réduction de la perception (visuelle, auditive)
- Peut réduire la dextérité

### 3. Efficacité dépendante de l\'utilisation
- Port correct requis
- Entretien régulier nécessaire
- Non-respect des règles de port

### 4. Ne traite pas le risque à la source
Les EPI protègent le travailleur mais ne suppriment pas le danger.

## Le principe de substitution

Le **6e principe général de prévention** stipule : remplacer ce qui est dangereux par ce qui ne l\'est pas ou par ce qui l\'est moins.

### Exemples de substitution
| Produit dangereux | Substitution |
|------------------|-------------|
| Solvant toxique | Solvant aqueux |
| Peinture au plomb | Peinture sans plomb |
| Outil bruyant | Outil silencieux |
| Produit chimique corrosif | Produit moins agressif |

## Le principe de réduction à la source
Quand la substitution n\'est pas possible :
- **Captage à la source** (aspiration)
- **Enfermement** (enceinte fermée)
- **Automatisation** (robotisation)

## L\'EPI comme dernier recours
L\'EPI ne doit être utilisé que quand :
- Les mesures techniques sont insuffisantes
- Le risque ne peut être éliminé
- En complément d\'autres mesures

**Rappel** : Les EPI ne remplacent jamais les mesures de prévention collectives.`,
      questions: [
        { question: 'Un EPI protège contre ?', options: ['Tous les risques', 'Le risque pour lequel il est conçu', 'Uniquement le bruit', 'Rien'], correctIndex: 1, explanation: 'Un EPI ne protège que contre le risque pour lequel il est conçu.' },
        { question: 'Le principe de substitution est le ?', options: ['3e principe', '6e principe', '9e principe', '1er principe'], correctIndex: 1, explanation: 'Le 6e principe est de remplacer ce qui est dangereux.' },
        { question: 'Les EPI traitent-ils le risque à la source ?', options: ['Oui', 'Non, ils protègent le travailleur sans supprimer le danger', 'Parfois', 'Toujours'], correctIndex: 1, explanation: 'Les EPI ne suppriment pas le danger à la source.' },
        { question: 'Quand utiliser un EPI ?', options: ['En premier choix', 'En dernier recours', 'Jamais', 'Uniquement le week-end'], correctIndex: 1, explanation: 'Les EPI sont le dernier recours dans la hiérarchie.' },
        { question: 'La substitution d\'un solvant toxique par un solvant aqueux est ?', options: ['Interdite', 'Un exemple du principe de substitution', 'Inutile', 'Obligatoire uniquement en Europe'], correctIndex: 1, explanation: 'C\'est un exemple classique du principe de substitution.' },
        { question: 'Quand la substitution n\'est pas possible, on utilise ?', options: ['Rien', 'Le captage à la source, l\'enfermement, l\'automatisation', 'Uniquement les EPI', 'Le licenciement'], correctIndex: 1, explanation: 'On utilise des mesures de réduction à la source.' },
        { question: 'Les EPI peuvent réduire la ?', options: ['Production', 'Perception et dextérité', 'Salaire', 'Surface du bureau'], correctIndex: 1, explanation: 'Les EPI peuvent réduire la perception visuelle/auditive et la dextérité.' },
        { question: 'Le captage à la source est une mesure ?', options: ['Individuelle', 'De réduction à la source', 'Éliminatoire', 'D\'EPI'], correctIndex: 1, explanation: 'Le captage à la source réduit le risque à la source.' },
        { question: 'Les EPI peuvent-ils remplacer les protections collectives ?', options: ['Oui, toujours', 'Non, jamais', 'Seulement en cas d\'urgence', 'Seulement la nuit'], correctIndex: 1, explanation: 'Les EPI ne remplacent jamais les protections collectives.' },
        { question: 'L\'efficacité d\'un EPI dépend de ?', options: ['La couleur', 'Son utilisation correcte et de son entretien', 'Le prix', 'La marque'], correctIndex: 1, explanation: 'L\'efficacité dépend de l\'utilisation correcte et de l\'entretien.' },
      ],
    },
  ],
},
{
  title: 'Les Gestes de Premiers Secours en Entreprise',
  slug: 'premiers-secours-entreprise',
  description: 'Apprenez les gestes essentiels de premiers secours en entreprise : réanimation cardio-pulmonaire, utilisation du défibrillateur, gestion des hémorragies, brûlures et autres urgences. Chaque minute compte pour sauver une vie.',
  shortDescription: 'Les gestes essentiels de premiers secours en milieu professionnel.',
  totalHours: '2h30',
  icon: 'Heart',
  order: 4,
  chapters: [
    {
      title: 'L\'alerte aux secours',
      content: `# L'alerte aux secours

## Pourquoi alerter ?

L\'alerte est le **premier maillon** de la chaîne des secours. Une alerte rapide et précise permet de déclencher les secours appropriés dans les meilleurs délais.

## Les numéros d\'urgence
| Service | Numéro |
|---------|--------|
| SAMU | 15 |
| Pompiers | 18 |
| Urgences médicales (mobile) | 112 |
| Police/Gendarmerie | 17 |
| Centre antipoison | Consultez annuaire |

## Les 4 informations essentielles

Lors d\'un appel d\'urgence, fournir :
1. **Ce qui s\'est passé** (nature de l\'accident)
2. **Où ça s\'est passé** (adresse précise, étage, localisation)
3. **Combien de victimes** (nombre et état apparent)
4. **Qui appelle** (nom, numéro de rappel)

## Les erreurs à éviter
- Ne pas raccrocher en premier
- Donner des informations imprécises
- Oublier de préciser le lieu exact
- Ne pas rester en ligne avec le régulateur

## Le protocole d\'alerte en entreprise
1. **Sécuriser** la zone
2. **Alerter** les secours (15/18/112)
3. **Informer** la hiérarchie et le service HSE
4. **Accueillir** les secours à l\'entrée
5. **Préparer** le DICT (Document d\'Information Commune aux Secours)`,
      questions: [
        { question: 'Quel est le numéro du SAMU ?', options: ['17', '18', '15', '112'], correctIndex: 2, explanation: 'Le SAMU est le 15.' },
        { question: 'Le 18 correspond à ?', options: ['La police', 'Les pompiers', 'Le SAMU', 'Les urgences'], correctIndex: 1, explanation: 'Le 18 est le numéro des pompiers.' },
        { question: 'Combien d\'informations essentielles faut-il donner ?', options: ['2', '3', '4', '5'], correctIndex: 2, explanation: '4 informations : quoi, où, combien, qui.' },
        { question: 'Le numéro européen d\'urgence est ?', options: ['15', '18', '112', '17'], correctIndex: 2, explanation: 'Le 112 est le numéro d\'urgence européen.' },
        { question: 'Que faut-il faire en premier ?', options: ['Alerter immédiatement', 'Sécuriser la zone', 'Donner les premiers soins', 'Appeler la police'], correctIndex: 1, explanation: 'Il faut d\'abord sécuriser la zone avant d\'alerter.' },
        { question: 'Le DICT signifie ?', options: ['Document d\'Information Commune aux Secours', 'Directive d\'Intervention des Cas de Trouble', 'Document d\'Identification des Contenus Toxiques', 'Dossier d\'Inspection du Circuit Thermique'], correctIndex: 0, explanation: 'DICT = Document d\'Information Commune aux Secours.' },
        { question: 'Qui doit accueillir les secours ?', options: ['Personne', 'Un salarié à l\'entrée', 'Uniquement le directeur', 'Les pompiers se débrouillent'], correctIndex: 1, explanation: 'Un salarié doit accueillir les secours à l\'entrée.' },
        { question: 'Le 17 correspond à ?', options: ['Le SAMU', 'Les pompiers', 'La police/gendarmerie', 'Les urgences'], correctIndex: 2, explanation: 'Le 17 est le numéro de la police/gendarmerie.' },
        { question: 'Faut-il raccrocher en premier lors d\'un appel d\'urgence ?', options: ['Oui', 'Non, c\'est le régulateur qui raccroche', 'Ça dépend', 'Toujours'], correctIndex: 1, explanation: 'On ne raccroche jamais en premier, le régulateur le fait.' },
        { question: 'L\'alerte est le premier maillon de ?', options: ['La production', 'La chaîne des secours', 'La comptabilité', 'Le marketing'], correctIndex: 1, explanation: 'L\'alerte est le premier maillon de la chaîne des secours.' },
      ],
    },
    {
      title: 'La chaîne des secours',
      content: `# La chaîne des secours

## Définition
La **chaîne des secours** est une séquence d\'actions coordonnées dont chaque maillon est indispensable pour sauver une vie.

## Les 4 maillons de la chaîne de survie

### 1. Alerter
Déclencher les secours professionnels rapidement.

### 2. Réanimer
Pratiquer les gestes de premiers secours (RCP, position latérale).

### 3. Défibriller
Utiliser un défibrillateur automatisé externe (DAE) le plus tôt possible.

### 4. Médicaliser
Les équipes médicales prennent en charge la victime.

## La chaîne des secours en entreprise

### Maillon 1 : Le témoin (sauveteur secouriste du travail - SST)
- Protéger et alerter
- Réaliser les premiers gestes

### Maillon 2 : Les secours internes
- Équipe d\'intervention d\'urgence
- Moyens de premiers secours de l\'entreprise

### Maillon 3 : Les secours publics
- SAMU (15), Pompiers (18)
- Intervention médicale spécialisée

### Maillon 4 : L\'hôpital
- Prise en charge médicale définitive
- Traitement et rééducation

## Le SST (Sauveteur Secouriste du Travail)
Le SST est un salarié formé pour intervenir immédiatement en cas d\'accident. Sa formation est obligatoire dans certaines entreprises.

## Le principe du "golden hour"
En cas de traumatisme grave, la **première heure** (golden hour) est cruciale. Plus la prise en charge est rapide, meilleures sont les chances de survie.`,
      questions: [
        { question: 'Combien de maillons a la chaîne de survie ?', options: ['3', '4', '5', '6'], correctIndex: 1, explanation: 'La chaîne de survie a 4 maillons.' },
        { question: 'Le SST signifie ?', options: ['Service de Sécurité du Travail', 'Sauveteur Secouriste du Travail', 'Système de Surveillance Technique', 'Secours et Soins du Travail'], correctIndex: 1, explanation: 'SST = Sauveteur Secouriste du Travail.' },
        { question: 'Le golden hour désigne ?', options: ['Une heure de pause', 'La première heure cruciale après un traumatisme', 'L\'heure de déjeuner', 'L\'heure de fermeture'], correctIndex: 1, explanation: 'Le golden hour est la première heure cruciale pour la survie.' },
        { question: 'Le premier maillon est ?', options: ['Réanimer', 'Alerter', 'Défibriller', 'Médicaliser'], correctIndex: 1, explanation: 'Le premier maillon est d\'alerter les secours.' },
        { question: 'Un DAE est un ?', options: ['Document administratif', 'Défibrillateur Automatisé Externe', 'Dispositif d\'Alarme Électrique', 'Détecteur d\'Air Emballé'], correctIndex: 1, explanation: 'DAE = Défibrillateur Automatisé Externe.' },
        { question: 'Qui peut être SST ?', options: ['Uniquement le médecin', 'Un salarié formé', 'Uniquement le directeur', 'Un pompier'], correctIndex: 1, explanation: 'Le SST est un salarié formé aux premiers secours.' },
        { question: 'Le deuxième maillon est ?', options: ['Alerter', 'Réanimer', 'Défibriller', 'L\'hôpital'], correctIndex: 1, explanation: 'Le deuxième maillon est la réanimation.' },
        { question: 'Le 4e maillon est ?', options: ['Alerter', 'Défibriller', 'Médicaliser', 'Protéger'], correctIndex: 2, explanation: 'Le 4e maillon est la médicalisation par les équipes professionnelles.' },
        { question: 'La formation SST est-elle obligatoire ?', options: ['Jamais', 'Dans certaines entreprises (selon les risques)', 'Partout', 'Uniquement dans le BTP'], correctIndex: 1, explanation: 'La formation SST est obligatoire dans certaines entreprises selon les risques.' },
        { question: 'Les secours internes sont le ?', options: ['1er maillon', '2e maillon', '3e maillon', '4e maillon'], correctIndex: 1, explanation: 'Les secours internes constituent le 2e maillon en entreprise.' },
      ],
    },
    {
      title: 'L\'arrêt cardiaque et la réanimation (RCP)',
      content: `# L'arrêt cardiaque et la réanimation (RCP)

## L'arrêt cardiaque
L\'**arrêt cardiaque** est l\'arrêt brutal de la circulation sanguine. Sans intervention, les lésions cérébrales apparaissent en **4 à 6 minutes**.

## Les signes d\'un arrêt cardiaque
- Perte de connaissance brutale
- Absence de respiration normale
- Absence de pouls carotidien
- Pâleur, cyanose (lèvres bleues)

## Le protocole de RCP

### 1. Sécuriser
Protéger la victime et les témoins.

### 2. Vérifier la conscience
Tapoter les épaules et crier : "Vous m\'entendez ?"

### 3. Alerter
Appeler le 15 (SAMU) ou le 18 (pompiers) immédiatement.

### 4. Masser le coeur
- Placer le talon d\'une main au centre de la poitrine
- Autre main par-dessus, doigts entrelacés
- **30 compressions thoraciques** à une fréquence de **100-120 par minute**
- Profondeur : **5 à 6 cm**

### 5. Insuffler
- Basculer prudemment la tête en arrière
- Soulever le menton
- **2 insufflations** (bouche-à-bouche ou avec masque)
- Vérifier le soulèvement de la poitrine

### 6. Alterner
**30 compressions / 2 insufflations** sans interruption.

## Jusqu\'à quand continuer ?
- Jusqu\'à l\'arrivée des secours
- Jusqu\'à la reprise d\'une respiration normale
- Jusqu\'à l\'épuisement du sauveteur`,
      questions: [
        { question: 'En combien de temps apparaissent les lésions cérébrales sans intervention ?', options: ['30 secondes', '1 minute', '4 à 6 minutes', '30 minutes'], correctIndex: 2, explanation: 'Les lésions cérébrales apparaissent en 4 à 6 minutes.' },
        { question: 'Le ratio de RCP est ?', options: ['10/2', '15/2', '30/2', '50/2'], correctIndex: 2, explanation: 'Le ratio est 30 compressions pour 2 insufflations.' },
        { question: 'La fréquence des compressions est de ?', options: ['60-80 par minute', '80-100 par minute', '100-120 par minute', '150 par minute'], correctIndex: 2, explanation: 'La fréquence recommandée est de 100-120 compressions par minute.' },
        { question: 'La profondeur des compressions est de ?', options: ['2 à 3 cm', '3 à 4 cm', '5 à 6 cm', '10 cm'], correctIndex: 2, explanation: 'La profondeur recommandée est de 5 à 6 cm.' },
        { question: 'Que faire en premier face à une personne inconsciente ?', options: ['Commencer le massage', 'Vérifier la conscience', 'L\'appeler', 'La déplacer'], correctIndex: 1, explanation: 'On vérifie d\'abord la conscience en tapotant les épaules.' },
        { question: 'Combien d\'insufflations après 30 compressions ?', options: ['1', '2', '3', '5'], correctIndex: 1, explanation: 'On fait 2 insufflations après 30 compressions.' },
        { question: 'La cyanose se manifeste par ?', options: ['Une rougeur', 'Des lèvres bleues', 'Une pâleur totale', 'Une transpiration'], correctIndex: 1, explanation: 'La cyanose se manifeste par une coloration bleue des lèvres.' },
        { question: 'Où placer les mains pour le massage cardiaque ?', options: ['Sur le ventre', 'Au centre de la poitrine', 'Sur la tête', 'Sur le dos'], correctIndex: 1, explanation: 'Les mains se placent au centre de la poitrine, sur le sternum.' },
        { question: 'Quand arrêter la RCP ?', options: ['Après 5 minutes', 'À l\'arrivée des secours ou épuisement', 'Après 30 compressions', 'Jamais'], correctIndex: 1, explanation: 'On continue jusqu\'à l\'arrivée des secours ou la reprise de la respiration.' },
        { question: 'Quel numéro appeler en cas d\'arrêt cardiaque ?', options: ['17', '15 ou 18', '3615', '0811'], correctIndex: 1, explanation: 'On appelle le 15 (SAMU) ou le 18 (pompiers).' },
      ],
    },
    {
      title: 'L\'utilisation du défibrillateur (DAE)',
      content: `# L'utilisation du défibrillateur (DAE)

## Qu'est-ce qu'un DAE ?

Le **Défibrillateur Automatisé Externe (DAE)** est un appareil portable qui analyse le rythme cardiaque et délivre un choc électrique si nécessaire. Il est conçu pour être utilisé par des **non-spécialistes**.

## Pourquoi défibriller rapidement ?

Chaque minute sans défibrillation réduit les chances de survie de **7 à 10%**. Après 5 minutes, les chances de survie chutent considérablement.

## Le protocole d'utilisation

### 1. Allumer le DAE
Appuyer sur le bouton d\'allumage.

### 2. Suivre les instructions vocales
Le DAE guide l\'utilisateur par des **messages vocaux** et des **indications visuelles**.

### 3. Exposer la poitrine
Découvrir le torse de la victime (dégrafer, sécher si nécessaire).

### 4. Appliquer les électrodes
- Électrode 1 : sous la clavicule droite
- Électrode 2 : sur le côté gauche, sous l\'aisselle

### 5. Laisser le DAE analyser
**Ne pas toucher la victime** pendant l\'analyse.

### 6. Délivrer le choc si demandé
- Appuyer sur le bouton lumineux
- **Ne toucher personne** pendant le choc
- Reprendre la RCP immédiatement après le choc

### 7. Continuer la RCP
Reprendre les 30 compressions / 2 insufflations.

## Important
- **Tous les DAE sont sécurisés** : ils ne délivrent un choc que si nécessaire
- **Ne pas retirer les électrodes** avant l\'arrivée des secours
- Former tous les salariés à l\'utilisation du DAE`,
      questions: [
        { question: 'Chaque minute sans défibrillation réduit les chances de ?', options: ['1-2%', '7-10%', '20%', '50%'], correctIndex: 1, explanation: 'Chaque minute réduit les chances de 7 à 10%.' },
        { question: 'Un DAE est conçu pour ?', options: ['Les médecins uniquement', 'Les non-spécialistes', 'Les pompiers uniquement', 'Les infirmiers uniquement'], correctIndex: 1, explanation: 'Le DAE est conçu pour être utilisé par des non-spécialistes.' },
        { question: 'Où placer la première électrode ?', options: ['Sur le ventre', 'Sous la clavicule droite', 'Sur le dos', 'Sur le pied'], correctIndex: 1, explanation: 'La première électrode se place sous la clavicule droite.' },
        { question: 'Pendant l\'analyse du DAE ?', options: ['Continuer le massage', 'Ne pas toucher la victime', 'Déplacer la victime', 'Appeler quelqu\'un'], correctIndex: 1, explanation: 'Il ne faut pas toucher la victime pendant l\'analyse.' },
        { question: 'Le DAE peut-il délivrer un choc inutilement ?', options: ['Oui', 'Non, il analyse le rythme d\'abord', 'Parfois', 'Toujours'], correctIndex: 1, explanation: 'Le DAE ne délivre un choc que si le rythme cardiaque le nécessite.' },
        { question: 'Après le choc, que faire ?', options: ['Attendre', 'Reprendre la RCP immédiatement', 'Arrêter tout', 'Appeler le médecin'], correctIndex: 1, explanation: 'Il faut reprendre la RCP immédiatement après le choc.' },
        { question: 'Où placer la deuxième électrode ?', options: ['Sur le ventre', 'Côté gauche sous l\'aisselle', 'Sur la tête', 'Sur le dos'], correctIndex: 1, explanation: 'La deuxième électrode se place sur le côté gauche sous l\'aisselle.' },
        { question: 'Le DAE guide l\'utilisateur par ?', options: ['Un écran tactile', 'Des messages vocaux et visuels', 'Un manuel papier', 'Un téléphone'], correctIndex: 1, explanation: 'Le DAE guide par des messages vocaux et des indications visuelles.' },
        { question: 'Faut-il retirer les électrodes avant l\'arrivée des secours ?', options: ['Oui', 'Non', 'Seulement si la victime se réveille', 'Ça dépend'], correctIndex: 1, explanation: 'Il ne faut pas retirer les électrodes avant l\'arrivée des secours.' },
        { question: 'Combien de temps après un arrêt cardiaque les chances chutent-elles ?', options: ['1 minute', '5 minutes', '10 minutes', '30 minutes'], correctIndex: 1, explanation: 'Après 5 minutes sans défibrillation, les chances chutent considérablement.' },
      ],
    },
    {
      title: 'Les hémorragies externes',
      content: `# Les hémorragies externes

## Définition
Une **hémorragie** est une perte de sang anormale. Une hémorragie externe est visible et correspond à un saignement à l\'extérieur du corps.

## La gravité
- **Hémorragie légère** : saignement faible qui s\'arrête seul
- **Hémorragie modérée** : saignement abondant mais contrôlable
- **Hémorragie grave** : saignement très abondant, menace le pronostic vital

## Les gestes d\'urgence

### 1. Hémorragie d\'un membre
- **Comprimer directement** la plaie avec un tissu propre
- **Maintenir la compression** fermement
- Si possible, **surélever** le membre blessé
- **Allonger** la victime

### 2. Compression à distance
Si la compression directe est impossible :
- Comprimer l\'artère en amont de la plaie
- Point de compression : aine (jambe), aisselle (bras), cou (cou)

### 3. Le garrot
**Dernier recours** si la compression ne suffit pas :
- Placer le garrot entre la plaie et le coeur
- Notez l\'heure de pose
- Ne jamais desserrer un garrot

## Les signes de gravité
- Pâleur, sueurs froides
- Pouls rapide et faible
- Respiration rapide
- Agitation puis confusion
- Perte de connaissance

## Les erreurs à éviter
- Ne pas retirer un corps étranger planté
- Ne pas nettoyer une plaie grave
- Ne pas donner à boire ni à manger`,
      questions: [
        { question: 'Le premier geste face à une hémorragie est ?', options: ['Nettoyer la plaie', 'Comprimer directement', 'Donner à boire', 'Appeler un ami'], correctIndex: 1, explanation: 'Le premier geste est de comprimer directement la plaie.' },
        { question: 'Le garrot est ?', options: ['Le premier geste', 'Le dernier recours', 'Facultatif', 'Interdit'], correctIndex: 1, explanation: 'Le garrot est un dernier recours si la compression ne suffit pas.' },
        { question: 'Que faire avec un corps étranger planté ?', options: ['Le retirer', 'Ne pas le retirer', 'Le déplacer', 'Le couper'], correctIndex: 1, explanation: 'Il ne faut JAMAIS retirer un corps étranger planté.' },
        { question: 'Où placer le garrot ?', options: ['Sur la plaie', 'Entre la plaie et le coeur', 'Loin de la plaie', 'N\'importe où'], correctIndex: 1, explanation: 'Le garrot se place entre la plaie et le coeur.' },
        { question: 'Un signe de gravité est ?', options: ['Le rire', 'La pâleur et les sueurs froides', 'La faim', 'Le bâillement'], correctIndex: 1, explanation: 'La pâleur et les sueurs froides sont des signes de gravité.' },
        { question: 'Faut-il donner à boire en cas d\'hémorragie ?', options: ['Oui, beaucoup', 'Non, ne jamais donner à boire', 'Uniquement de l\'eau', 'Uniquement du café'], correctIndex: 1, explanation: 'Il ne faut jamais donner à boire ni à manger.' },
        { question: 'La compression à distance se fait ?', options: ['Sur la plaie', 'En amont de la plaie', 'En aval de la plaie', 'Sur la tête'], correctIndex: 1, explanation: 'La compression se fait en amont (entre la plaie et le coeur).' },
        { question: 'Peut-on desserrer un garrot ?', options: ['Oui', 'Non, jamais', 'Toutes les 10 minutes', 'Seulement un médecin'], correctIndex: 1, explanation: 'On ne desserre jamais un garrot posé en urgence.' },
        { question: 'Que faut-il noter en posant un garrot ?', options: ['Le nom de la victime', 'L\'heure de pose', 'La température', 'Le poids'], correctIndex: 1, explanation: 'Il faut noter l\'heure de pose du garrot.' },
        { question: 'Que faut-il faire avec un membre blessé ?', options: ['Le laisser pendre', 'Le surélever si possible', 'Le masser', 'Le plier'], correctIndex: 1, explanation: 'Il faut surélever le membre blessé si possible.' },
      ],
    },
    {
      title: 'Les brûlures',
      content: `# Les brûlures

## Les degrés de brûlures

| Degré | Description | Apparence |
|--------|-----------|----------|
| 1er degré | Atteinte de l\'épiderme | Rougeur, douleur, pas de cloque |
| 2e degré | Atteinte de l\'épiderme et du derme | Rouges, cloques, douloureux |
| 3e degré | Destruction complète de la peau | Blanc/brun/noir, indolore |

## La règle des 9 de Wallace
Pour évaluer l\'étendue (surface corporelle brûlée - SCB) :
- Tête et cou : 9%
- Chaque membre supérieur : 9%
- Face antérieure du tronc : 18%
- Face postérieure du tronc : 18%
- Chaque membre inférieur : 18%
- Périnée : 1%

## Les gestes de premiers secours

### Brûlures simples (1er et petit 2e degré)
1. **Refroidir** la brûlure sous l\'eau tiède (15-25°C) pendant **15 à 30 minutes**
2. **Ne jamais percer les cloques**
3. **Ne pas appliquer** de pommade, beurre ou autre produit
4. **Couvrir** d\'un pansement stérile

### Brûlures graves (grand 2e et 3e degré)
1. Alerter le 15 immédiatement
2. Ne pas refroidir si la brûlure dépasse 10% de la SCB
3. Allonger la victime
4. Couvrir les brûlures d\'un drap propre

## Les situations d\'urgence absolue
- Brûlure > 10% de la surface corporelle
- Brûlure du visage, des mains, des pieds, du périnée
- Brûlure circulaire d\'un membre
- Inhalation de fumées
- Victime âgée ou très jeune`,
      questions: [
        { question: 'Une brûlure du 3e degré est ?', options: ['Douloureuse', 'Indolore (sans douleur)', 'Légère', 'Superficielle'], correctIndex: 1, explanation: 'La brûlure du 3e degré détruit les terminaisons nerveuses, elle est indolore.' },
        { question: 'Que faire en premier pour une brûlure simple ?', options: ['Appliquer du beurre', 'Refroidir sous l\'eau tiède', 'Percer les cloques', 'Appliquer une pommade'], correctIndex: 1, explanation: 'Il faut refroidir sous l\'eau tiède pendant 15 à 30 minutes.' },
        { question: 'La règle des 9 de Wallace sert à ?', options: ['Mesurer la température', 'Évaluer l\'étendue de la brûlure', 'Compter les cloques', 'Mesurer la douleur'], correctIndex: 1, explanation: 'Elle évalue la surface corporelle brûlée en pourcentage.' },
        { question: 'Faut-il percer les cloques ?', options: ['Oui, toujours', 'Non, jamais', 'Seulement les grandes', 'Seulement le jour même'], correctIndex: 1, explanation: 'Il ne faut JAMAIS percer les cloques.' },
        { question: 'Quelle surface représente la tête et le cou ?', options: ['5%', '9%', '18%', '25%'], correctIndex: 1, explanation: 'La tête et le cou représentent 9% de la surface corporelle.' },
        { question: 'Une brûlure > 10% est considérée ?', options: ['Légère', 'Grave', 'Normale', 'Bénigne'], correctIndex: 1, explanation: 'Une brûlure de plus de 10% de la SCB est une urgence absolue.' },
        { question: 'L\'eau de refroidissement doit être à ?', options: ['0°C (glacée)', '15-25°C (tiède)', '40°C (chaude)', '100°C (bouillante)'], correctIndex: 1, explanation: 'L\'eau doit être tiède (15-25°C), jamais glacée.' },
        { question: 'Combien de temps refroidir une brûlure ?', options: ['5 minutes', '10 minutes', '15 à 30 minutes', '1 heure'], correctIndex: 2, explanation: 'Le refroidissement doit durer 15 à 30 minutes.' },
        { question: 'Une brûlure de la face est ?', options: ['Mineure', 'Une urgence absolue', 'Sans importance', 'Courante'], correctIndex: 1, explanation: 'La brûlure du visage est une urgence absolue.' },
        { question: 'Un 2e degré se caractérise par ?', options: ['Rougeur simple', 'Des cloques', 'Une peau noire', 'Un gonflement'], correctIndex: 1, explanation: 'Le 2e degré se caractérise par des cloques.' },
      ],
    },
    {
      title: 'Les traumatismes et positions d\'attente',
      content: `# Les traumatismes et positions d'attente

## Les principaux traumatismes

### Les fractures
Signes : douleur, déformation, gonflement, impossibilité de bouger.

### Les entorses
Signes : douleur, gonflement, instabilité de l\'articulation.

### Les luxations
Signes : douleur vive, déformation, impossibilité de bouger, membre "dans une mauvaise position".

## Les positions d\'attente

### Position latérale de sécurité (PLS)
Pour une victime **inconsciente qui respire** :
1. Allonger la victime sur le côté
2. Placer la main sous la joue
3. Fléchir la jambe du dessus
4. Basculer la tête en arrière
5. Surveiller la respiration

### Position demi-assise
Pour une victime consciente ayant des **difficultés respiratoires** ou une **douleur thoracique** :
- Dos calé à 45°
- Jambes étendues ou fléchies

### Position allongée
Pour une victime ayant un **malaise**, des **douleurs abdominales** ou une **chute de tension** :
- Allonger la victime
- Surélever les jambes si possible
- Couvrir pour maintenir au chaud

## Les principes généraux
- **Ne jamais déplacer** une victime de suspicion de traumatisme rachidien
- **Immobiliser** les fractures avant le déplacement
- **Surveiller** en permanence la conscience et la respiration
- **Rassurer** la victime et lui parler`,
      questions: [
        { question: 'La PLS est pour une victime ?', options: ['Consciente', 'Inconsciente qui respire', 'En arrêt cardiaque', 'Blessée au bras'], correctIndex: 1, explanation: 'La PLS est pour une victime inconsciente qui respire.' },
        { question: 'Que ne faut-on jamais faire en cas de suspicion de traumatisme rachidien ?', options: ['Alerter', 'Déplacer la victime', 'Rassurer', 'Surveiller'], correctIndex: 1, explanation: 'Il ne faut JAMAIS déplacer une victime avec suspicion de trauma rachidien.' },
        { question: 'La position demi-assise est pour ?', options: ['Un malaise abdominal', 'Des difficultés respiratoires', 'Une fracture du bras', 'Une entorse'], correctIndex: 1, explanation: 'La position demi-assise aide les victimes avec difficultés respiratoires.' },
        { question: 'Un signe de fracture est ?', options: ['Démangeaison', 'Douleur, déformation, gonflement', 'Toux', 'Éternuement'], correctIndex: 1, explanation: 'Les signes de fracture sont douleur, déformation et gonflement.' },
        { question: 'La PLS comporte combien d\'étapes ?', options: ['3', '4', '5', '6'], correctIndex: 2, explanation: 'La PLS comporte 5 étapes principales.' },
        { question: 'Que faut-il faire en cas de luxation ?', options: ['Remettre en place soi-même', 'Immobiliser et alerter les secours', 'Masser la zone', 'Appliquer du chaud'], correctIndex: 1, explanation: 'Il faut immobiliser et alerter, jamais remettre en place soi-même.' },
        { question: 'Faut-il rassurer la victime ?', options: ['Non', 'Oui, lui parler et la rassurer', 'Uniquement si elle le demande', 'Seulement si elle est consciente'], correctIndex: 1, explanation: 'Il faut toujours rassurer la victime et lui parler.' },
        { question: 'La position allongée jambes surélevées est pour ?', options: ['Une fracture', 'Un malaise ou chute de tension', 'Une brûlure', 'Une hémorragie'], correctIndex: 1, explanation: 'Cette position est pour les malaises et chutes de tension.' },
        { question: 'Combien de temps surveiller une victime en PLS ?', options: ['5 minutes', 'En permanence', '30 minutes', '1 heure'], correctIndex: 1, explanation: 'Il faut surveiller en permanence la conscience et la respiration.' },
        { question: 'Que faire d\'une fracture ?', options: ['La réduire', 'L\'immobiliser', 'La masser', 'L\'ignorer'], correctIndex: 1, explanation: 'Il faut immobiliser la fracture avant tout déplacement.' },
      ],
    },
    {
      title: 'Les malaises et pathologies courantes',
      content: `# Les malaises et pathologies courantes

## L'évanouissement
### Signes
- Sensation de faiblesse, vertiges
- Sueurs froides, pâleur
- Perte de connaissance brève

### Gestes
- Allonger la victime, jambes surélevées
- Desserrer les vêtements serrés
- Rassurer après le réveil
- Alerter si le malaise se répète

## La crise d'épilepsie
### Signes
- Perte de connaissance soudaine
- Convulsions, rigidité musculaire
- Morsure de la langue, perte d'urine

### Gestes
- Écarter les objets dangereux
- **Ne jamais** introduire quoi que ce soit dans la bouche
- Mettre un coussin sous la tête
- Placer en PLS après la crise
- Alerter si la crise dure > 5 minutes

## Le malaise cardiaque
### Signes
- Douleur thoracique (serrement, brûlure)
- Douleur irradiant au bras gauche, mâchoire, dos
- Essoufflement, sueurs, nausées

### Gestes
- Alerter le **15** immédiatement
- Allonger en position demi-assise
- Administrer la trinitrine si prescrite
- Rassurer et surveiller
- Préparer le DAE en cas d'arrêt cardiaque

## L'hypoglycémie
### Signes
- Tremblements, sueurs
- Palpitations, faiblesse
- Confusion, troubles de la vision

### Gestes
- Si conscient : donner du sucre (morcelé, jus)
- Si inconscient : ne rien donner par la bouche, alerter

## L'asthme
### Gestes
- Aider à prendre son traitement (inhalateur)
- Installer en position demi-assise
- Rassurer
- Alerter si pas d'amélioration`,
      questions: [
        { question: 'Face à une crise d\'épilepsie, faut-il mettre quelque chose dans la bouche ?', options: ['Oui, un mouchoir', 'Non, jamais', 'Uniquement un doigt', 'Un médicament'], correctIndex: 1, explanation: 'Il ne faut JAMAIS introduire quoi que ce soit dans la bouche.' },
        { question: 'Le malaise cardiaque irradie souvent vers ?', options: ['La jambe droite', 'Le bras gauche et la mâchoire', 'Le pied', 'L\'épaule droite'], correctIndex: 1, explanation: 'La douleur cardiaque irradie au bras gauche, mâchoire et dos.' },
        { question: 'En cas d\'hypoglycémie avec victime consciente ?', options: ['Donner de l\'eau', 'Donner du sucre', 'Ne rien faire', 'Donner du sel'], correctIndex: 1, explanation: 'On donne du sucre si la victime est consciente.' },
        { question: 'La position en cas d\'évanouissement est ?', options: ['Assise', 'Allongée jambes surélevées', 'Debout', 'En PLS'], correctIndex: 1, explanation: 'On allonge la victime avec les jambes surélevées.' },
        { question: 'Quand alerter pour une crise d\'épilepsie ?', options: ['Immédiatement', 'Si elle dure > 5 minutes', 'Après 1 heure', 'Jamais'], correctIndex: 1, explanation: 'On alerte si la crise dure plus de 5 minutes.' },
        { question: 'En cas d\'asthme, on installe la victime ?', options: ['Allongée', 'En position demi-assise', 'Debout', 'En PLS'], correctIndex: 1, explanation: 'La position demi-assise facilite la respiration.' },
        { question: 'La trinitrine est utilisée pour ?', options: ['L\'asthme', 'Le malaise cardiaque', 'L\'épilepsie', 'L\'hypoglycémie'], correctIndex: 1, explanation: 'La trinitrine est un traitement pour le malaise cardiaque.' },
        { question: 'L\'hypoglycémie se manifeste par ?', options: ['Une soif intense', 'Tremblements, sueurs, faiblesse', 'Une toux', 'Une éruption cutanée'], correctIndex: 1, explanation: 'L\'hypoglycémie provoque tremblements, sueurs et faiblesse.' },
        { question: 'Après une crise d\'épilepsie ?', options: ['Relever immédiatement', 'Placer en PLS et surveiller', 'Donner à boire', 'Faire marcher'], correctIndex: 1, explanation: 'On place en PLS après la crise et on surveille.' },
        { question: 'Que faire face à une victime inconsciente hypoglycémique ?', options: ['Donner du sucre', 'Ne rien donner par la bouche et alerter', 'Donner de l\'insuline', 'Masser le ventre'], correctIndex: 1, explanation: 'On ne donne rien par la bouche à une personne inconsciente.' },
      ],
    },
  ],
},
];
