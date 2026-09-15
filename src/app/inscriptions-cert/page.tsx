// ============================================================================
// Page /inscriptions-cert — Formulaire de demande pour formation certifiante
// ============================================================================
// Server Component : lit les query params (formation, mode) pour pré-remplir.
// Récupère la liste des 14 formations certifiantes pour le dropdown.
// Passe au composant client CertificationForm.
// ============================================================================

import { db } from '@/lib/db';
import CertificationForm from './certification-form';

interface PageProps {
  searchParams: Promise<{ formation?: string; mode?: string }>;
}

export default async function InscriptionCertPage({ searchParams }: PageProps) {
  const { formation, mode } = await searchParams;

  // Récupérer la liste des 14 formations certifiantes non archivées
  const formations = await db.formation.findMany({
    where: { type: 'certifiante', archived: false },
    orderBy: { order: 'asc' },
    select: { id: true, title: true, slug: true },
  });

  // Si formation est dans l'URL, vérifier qu'elle existe
  let preselectedFormation: { slug: string; title: string } | null = null;
  if (formation) {
    const found = await db.formation.findFirst({
      where: { OR: [{ slug: formation }, { seoSlug: formation }], type: 'certifiante', archived: false },
      select: { slug: true, title: true },
    });
    if (found) preselectedFormation = found;
  }

  // Valider le mode passé en URL
  const validModes = ['individuel', 'groupe', 'entreprise'];
  const initialMode = mode && validModes.includes(mode) ? mode : 'individuel';

  return (
    <CertificationForm
      formations={formations.map(f => ({ slug: f.slug, title: f.title }))}
      preselectedFormation={preselectedFormation}
      initialMode={initialMode as 'individuel' | 'groupe' | 'entreprise'}
    />
  );
}
