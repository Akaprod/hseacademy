import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// ============================================================================
// GET /api/admin/payments — Lister tous les paiements + rechargements wallet
// ============================================================================
// Inclut :
//   - CoursePayment (paiements cours)
//   - AttestationPayment (paiements attestation imprimée)
//   - WalletTransaction type='charge' (demandes de rechargement wallet)
//
// Filtre par statut : pending | submitted | validated | rejected
// Pour wallet, le statut est déduit de la description :
//   "EN ATTENTE" → pending, "VALIDÉ" → validated, "REFUSÉ" → rejected
// ============================================================================

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const url = request.nextUrl.searchParams;
    const page = parseInt(url.get('page') || '1');
    const limit = parseInt(url.get('limit') || '50');
    const status = url.get('status'); // pending | submitted | validated | rejected
    const type = url.get('type');

    // ---- Filtre pour CoursePayment / AttestationPayment ----
    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    // ---- Filtre pour WalletTransaction (status déduit de la description) ----
    const walletWhere: Record<string, unknown> = { type: 'charge' };
    if (status === 'pending') {
      walletWhere.description = { contains: 'EN ATTENTE' };
    } else if (status === 'validated') {
      walletWhere.description = { contains: 'VALIDÉ' };
    } else if (status === 'rejected') {
      walletWhere.description = { contains: 'REFUSÉ' };
    }

    let coursePayments: any[] = [];
    let attestationPayments: any[] = [];
    let walletCharges: any[] = [];
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

    if (!type || type === 'wallet') {
      const [wc, wcCount] = await Promise.all([
        db.walletTransaction.findMany({
          where: walletWhere,
          include: {
            wallet: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.walletTransaction.count({ where: walletWhere }),
      ]);
      walletCharges = wc.map(t => ({
        id: t.id,
        userId: t.wallet.userId,
        user: t.wallet.user,
        amount: t.amount,
        currency: 'MAD',
        method: t.paymentMethod || 'wallet',
        status: t.description.includes('EN ATTENTE') ? 'pending' :
                t.description.includes('REFUSÉ') ? 'rejected' : 'validated',
        type: 'wallet',
        description: t.description,
        createdAt: t.createdAt,
        validatedAt: t.description.includes('VALIDÉ') ? t.createdAt : null,
        proofPath: null,
      }));
      total += wcCount;
    }

    // Merge, filter by status if needed (for wallet, already filtered via DB)
    // and sort by createdAt desc
    let allPayments = [...coursePayments, ...attestationPayments, ...walletCharges]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply client-side filter for wallet items if status filter is active
    // (DB filter already handled course/attestation, wallet was filtered via description)
    // Just slice to limit
    allPayments = allPayments.slice(0, limit);

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
