// ============================================================================
// Page /inscriptions/[formationSlug] — Formulaire d'inscription à une formation
// ============================================================================
// Server Component : valide le slug + récupère la formation + passe au client.
// ============================================================================

import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import InscriptionForm from './inscription-form';

interface PageProps {
  params: Promise<{ formationSlug: string }>;
}

export default async function InscriptionPage({ params }: PageProps) {
  const { formationSlug } = await params;

  // Lookup par slug OU seoSlug ; seulement les formations diplomantes non archivées
  const formation = await db.formation.findFirst({
    where: {
      OR: [{ slug: formationSlug }, { seoSlug: formationSlug }],
      archived: false,
      type: 'diplomante',
    },
  });

  if (!formation) {
    notFound();
  }

  return <InscriptionForm formation={JSON.parse(JSON.stringify(formation))} />;
}
