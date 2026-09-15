// ============================================================================
// GET /api/admin/inscriptions — Lister les demandes (ADMIN)
// ============================================================================
// Query params:
//   ?status=pending|reviewing|accepted|rejected|waitlisted  (filtre statut)
//   ?formationSlug=xxx                                       (filtre formation)
//   ?search=xxx                                               (recherche nom/email)
//   ?page=1&limit=20                                          (pagination)
// Retourne: { items, total, page, limit }
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || undefined;
    const formationSlug = url.searchParams.get('formationSlug') || undefined;
    const search = url.searchParams.get('search') || undefined;
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50')));
    const skip = (page - 1) * limit;

    // Construire le where
    const where: any = {};
    if (status && ['pending', 'reviewing', 'accepted', 'rejected', 'waitlisted'].includes(status)) {
      where.status = status;
    }
    if (formationSlug) {
      where.formationSlug = formationSlug;
    }
    if (search) {
      // Recherche sur nom, prenom, email (case-insensitive sur SQLite via contains)
      // Prisma SQLite ne supporte pas mode: 'insensitive' — mais LIKE est case-insensitive par défaut
      // sur SQLite pour les chars ASCII. Pour les accents, on utilise une recherche simple.
      const s = search.trim();
      where.OR = [
        { nom: { contains: s } },
        { prenom: { contains: s } },
        { email: { contains: s } },
        { phone: { contains: s } },
      ];
    }

    const [items, total] = await Promise.all([
      db.inscriptionRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.inscriptionRequest.count({ where }),
    ]);

    return NextResponse.json({ items, total, page, limit });
  } catch (error) {
    console.error('GET /api/admin/inscriptions error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
