import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ============================================================================
// GET /api/legal-content?type=refund|privacy|terms
// ============================================================================
//
// Route PUBLIQUE — aucune authentification requise.
//
// Renvoie UNIQUEMENT le contenu libre de la page légale demandée :
//   - refund  → settings.refundPolicy
//   - privacy → settings.privacyPolicy
//   - terms   → settings.termsOfService
//
// Renvoie également les infos juridiques structurées (établissement, ICE, RC,
// etc.) pour que la page puisse les afficher dynamiquement — en filtrant les
// champs vides, comme /api/legal-settings.
//
// Si le contenu n'est pas encore renseigné, content = null et la page affiche
// un message "en cours d'élaboration" sans inventer de contenu.
// ============================================================================

const VALID_TYPES = ['refund', 'privacy', 'terms'] as const;
type LegalType = (typeof VALID_TYPES)[number];

const CONTENT_FIELD: Record<LegalType, 'refundPolicy' | 'privacyPolicy' | 'termsOfService'> = {
  refund: 'refundPolicy',
  privacy: 'privacyPolicy',
  terms: 'termsOfService',
};

const PUBLIC_INFO_FIELDS = [
  'legalName', 'commercialName', 'representative',
  'address', 'city', 'country', 'phone', 'email', 'website',
  'ice', 'rc', 'if',
  'authorizationRef', 'authorityName',
  'cndpReceipt',
] as const;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get('type');

    if (!typeParam || !VALID_TYPES.includes(typeParam as LegalType)) {
      return NextResponse.json(
        { error: 'Type invalide. Valeurs acceptées : refund, privacy, terms' },
        { status: 400 }
      );
    }

    const type = typeParam as LegalType;
    const settings = await db.legalSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      return NextResponse.json({ content: null, info: {} });
    }

    // Filtrer les infos publiques (champs vides exclus)
    const info: Record<string, string> = {};
    for (const field of PUBLIC_INFO_FIELDS) {
      const value = settings[field];
      if (typeof value === 'string' && value.trim().length > 0) {
        info[field] = value;
      }
    }

    const contentField = CONTENT_FIELD[type];
    const content = settings[contentField];
    const contentValue =
      typeof content === 'string' && content.trim().length > 0
        ? content
        : null;

    return NextResponse.json({ content: contentValue, info });
  } catch (error) {
    console.error('GET /api/legal-content error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
