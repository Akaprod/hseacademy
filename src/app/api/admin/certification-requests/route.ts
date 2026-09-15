// ============================================================================
// GET /api/admin/certification-requests — Lister les demandes (ADMIN)
// ============================================================================
// Query params:
//   ?status=pending|contacted|liste_attente|confirmed|rejected
//   ?mode=individuel|groupe|entreprise
//   ?formationSlug=xxx
//   ?search=xxx
//   ?page=1&limit=20
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
    const mode = url.searchParams.get('mode') || undefined;
    const formationSlug = url.searchParams.get('formationSlug') || undefined;
    const search = url.searchParams.get('search') || undefined;
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50')));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && ['pending', 'contacted', 'liste_attente', 'confirmed', 'rejected'].includes(status)) {
      where.status = status;
    }
    if (mode && ['individuel', 'groupe', 'entreprise'].includes(mode)) {
      where.mode = mode;
    }
    if (formationSlug) {
      where.formationSlug = formationSlug;
    }
    if (search) {
      const s = search.trim();
      where.OR = [
        { nom: { contains: s } },
        { prenom: { contains: s } },
        { email: { contains: s } },
        { phone: { contains: s } },
        { entreprise: { contains: s } },
        { formationOther: { contains: s } },
      ];
    }

    const [items, total] = await Promise.all([
      db.certificationRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.certificationRequest.count({ where }),
    ]);

    return NextResponse.json({ items, total, page, limit });
  } catch (error) {
    console.error('GET /api/admin/certification-requests error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
