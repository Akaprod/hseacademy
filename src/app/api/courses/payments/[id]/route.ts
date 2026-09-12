import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';

// ============================================================================
// GET /api/courses/payments/[id] — Détail d'un paiement (owner only)
// ============================================================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;

    const payment = await db.coursePayment.findUnique({
      where: { id },
      include: {
        enrollment: {
          include: {
            course: { select: { title: true, slug: true } },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Paiement non trouvé' }, { status: 404 });
    }

    // Ownership check
    if (payment.userId !== auth.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error('GET /api/courses/payments/[id] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
