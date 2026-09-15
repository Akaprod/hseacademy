import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ============================================================================
// GET /api/legal-settings — Récupère les informations juridiques publiques
// ============================================================================
//
// Route PUBLIQUE — aucune authentification requise.
//
// Renvoie uniquement les champs qui ont une valeur non nulle en DB.
// JAMAIS de placeholder, JAMAIS de champ vide affiché comme une information
// réelle. Un champ non renseigné n'est tout simplement pas présent dans la
// réponse JSON — le frontend sait qu'il ne doit pas l'afficher.
//
// N'inclut pas les contenus des pages légales (refundPolicy, privacyPolicy,
// termsOfService) car ce sont de gros blocs de texte,chargés séparément
// par les pages concernées via /api/legal-content?type=...
// ============================================================================

export async function GET() {
  try {
    const settings = await db.legalSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      // Aucune ligne en DB — tout est vide
      return NextResponse.json({ settings: {} });
    }

    // Champs publics (pas les contenus de pages légales — trop volumineux)
    const publicFields = [
      'legalName', 'commercialName', 'representative',
      'address', 'city', 'country', 'phone', 'email', 'website',
      'ice', 'rc', 'if',
      'authorizationRef', 'authorityName',
      'cndpReceipt',
    ] as const;

    const filtered: Record<string, string> = {};
    for (const field of publicFields) {
      const value = settings[field];
      if (typeof value === 'string' && value.trim().length > 0) {
        filtered[field] = value;
      }
      // Sinon : champ vide ou null → on ne l'inclut PAS dans la réponse
    }

    return NextResponse.json({ settings: filtered });
  } catch (error) {
    console.error('GET /api/legal-settings error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
