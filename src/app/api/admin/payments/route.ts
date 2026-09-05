import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// ============================================================================
// GET /api/admin/payments — Lister tous les paiements (admin only)
// ============================================================================

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const url = request.nextUrl.searchParams;
    const page = parseInt(url.get('page') || '1');
    const limit = parseInt(url.get('limit') || '20');
    const status = url.get('status');
    const type = url.get('type'); // 'course' | 'attestation' | undefined (all)

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    let coursePayments: any[] = [];
    let attestationPayments: any[] = [];
    let total = 0;

    if (!type || type === 'course') {
      const [cp, cpCount] = await Promise.all([
        db.coursePayment.findMany({
          where,
          include: {
            user: { select: { id: true, name: true, email: true } },
            enrollment: {
              include: {
                course: { select: { id: true, title: true, slug: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.coursePayment.count({ where }),
      ]);
      coursePayments = cp.map(p => ({ ...p, type: 'course' }));
      total += cpCount;
    }

    if (!type || type === 'attestation') {
      const [ap, apCount] = await Promise.all([
        db.attestationPayment.findMany({
          where,
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.attestationPayment.count({ where }),
      ]);
      attestationPayments = ap.map(p => ({ ...p, type: 'attestation' }));
      total += apCount;
    }

    // Merge and sort by createdAt desc
    const allPayments = [...coursePayments, ...attestationPayments]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    return NextResponse.json({
      payments: allPayments,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('GET /api/admin/payments error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
