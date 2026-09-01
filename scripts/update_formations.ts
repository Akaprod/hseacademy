import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Update existing formations: durations + prerequisites
  console.log('Updating existing formations...');

  const updates = [
    {
      slug: 'technicien-qhse',
      data: {
        duration: '2 ans',
        prerequisites: 'Niveau 3ème année bac',
      },
    },
    {
      slug: 'technicien-superieur-qhse',
      data: {
        duration: '2 ans',
        prerequisites: 'Baccalauréat ou équivalent',
      },
    },
    {
      slug: 'licence-professionnelle-qhse',
      data: {
        duration: '1 an',
        prerequisites: 'Niveau Bac+2',
      },
    },
    {
      slug: 'master-professionnel-qhse',
      data: {
        prerequisites: 'Licence ou équivalent',
      },
    },
  ];

  for (const u of updates) {
    const result = await prisma.formation.update({
      where: { slug: u.slug },
      data: u.data,
    });
    console.log(`  Updated: ${result.title} -> duration=${result.duration}, prerequisites=${result.prerequisites}`);
  }

  // 2. Create new formation: Diplôme Qualifié QHSE
  console.log('\nCreating Diplôme Qualifié QHSE...');
  const diplome = await prisma.formation.create({
    data: {
      title: 'Diplôme Qualifié QHSE',
      slug: 'diplome-qualifie-qhse',
      shortDescription: 'Formation qualifiante en Qualité, Hygiène, Sécurité et Environnement. Acquérez les compétences fondamentales et pratiques pour intervenir efficacement dans la gestion QHSE au sein des entreprises.',
      fullDescription: `## Diplôme Qualifié QHSE

Ce programme qualifiant vous forme aux fondamentaux de la gestion QHSE (Qualité, Hygiène, Sécurité et Environnement). Il est conçu pour les professionnels souhaitant acquérir une qualification reconnue et opérationnelle.

### Public cible
- Personnes en reconversion professionnelle
- Agents de sécurité et d\'hygiène souhaitant monter en compétences
- Salariés d\'entreprises devant répondre aux exigences réglementaires QHSE

### Programme
- Introduction au management QHSE
- Normes ISO 9001, ISO 14001, ISO 45001
- Techniques d\'audit interne
- Gestion des risques professionnels
- Hygiène et sécurité au travail
- Environnement et développement durable
- Communication et sensibilisation QHSE

### Débouchés
- Technicien QHSE
- Chargé de sécurité
- Animateur QHSE
- Responsable hygiène et sécurité`,
      level: 'diplome-qualifie',
      duration: '2 ans',
      prerequisites: 'Niveau 3ème année collège',
      mode: 'hybride',
      type: 'diplomante',
      featured: true,
      order: 0,
      objectives: JSON.stringify([
        'Maîtriser les fondamentaux de la gestion QHSE',
        'Appliquer les exigences des normes ISO 9001, 14001, 45001',
        'Évaluer et maîtriser les risques professionnels',
        'Mettre en place des actions de prévention',
        'Communiquer et sensibiliser sur les enjeux QHSE',
      ]),
      program: JSON.stringify([
        'Module 1 : Introduction au management QHSE',
        'Module 2 : Qualité et norme ISO 9001',
        'Module 3 : Hygiène, santé et sécurité',
        'Module 4 : Environnement et ISO 14001',
        'Module 5 : Sécurité au travail et ISO 45001',
        'Module 6 : Techniques d\'audit interne',
        'Module 7 : Gestion des risques',
        'Module 8 : Projet professionnel et stage',
      ]),
    },
  });
  console.log(`  Created: ${diplome.title} (${diplome.level}, ${diplome.duration})`);

  // 3. Verify all diplomante formations
  console.log('\nFinal diplomante formations:');
  const formations = await prisma.formation.findMany({
    where: { type: 'diplomante' },
    orderBy: { order: 'asc' },
    select: { title: true, level: true, duration: true, prerequisites: true, mode: true },
  });
  for (const f of formations) {
    console.log(`  ${f.level.padEnd(25)} | ${f.duration.padEnd(10)} | ${f.prerequisites || '—'}`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
