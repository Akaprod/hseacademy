import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// ============================================================================
// GET /api/admin/legal-settings — Récupère les informations juridiques
// PUT /api/admin/legal-settings — Met à jour les informations juridiques
// ============================================================================
//
// Auth : requireAdmin() — seul un admin peut lire/écrire ces informations.
//
// Singleton : une seule ligne avec id="default". Si la ligne n'existe pas
// encore, GET renvoie {} (tous champs vides), PUT crée ou met à jour via upsert.
//
// Tous les champs sont OPTIONAL. Aucune validation qui imposerait une valeur.
// Les champs envoyés comme null ou "" sont stockés comme null (pas de chaîne
// vide en DB) afin que les pages publiques puissent simplement tester "truthy".
// ============================================================================

const ALLOWED_FIELDS = [
  'legalName', 'commercialName', 'representative',
  'address', 'city', 'country', 'phone', 'email', 'website',
  'ice', 'rc', 'if',
  'authorizationRef', 'authorityName',
  'cndpReceipt',
  'refundPolicy', 'privacyPolicy', 'termsOfService',
] as const;

type LegalField = (typeof ALLOWED_FIELDS)[number];

// --- GET ---
export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const settings = await db.legalSettings.findUnique({
      where: { id: 'default' },
    });
    // Toujours renvoyer un objet (même si vide) — pas de 404
    return NextResponse.json({ settings: settings || {} });
  } catch (error) {
    console.error('GET /api/admin/legal-settings error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// --- PUT ---
export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const data: Record<string, string | null> = {};

    // Filter + sanitize : on ne trust que les champs autorisés.
    // Les valeurs null/"" deviennent null en DB.
    for (const field of ALLOWED_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        const value = body[field];
        if (typeof value === 'string') {
          const trimmed = value.trim();
          data[field] = trimmed.length > 0 ? trimmed : null;
        } else if (value === null) {
          data[field] = null;
        }
        // Tout autre type est ignoré (pas de trust)
      }
    }

    const settings = await db.legalSettings.upsert({
      where: { id: 'default' },
      create: { id: 'default', ...data },
      update: data,
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('PUT /api/admin/legal-settings error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
