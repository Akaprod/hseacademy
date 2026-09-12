import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// ============================================================================
// GET /api/admin/payment-requests — Lister les demandes SOUMISES (admin only)
// ============================================================================
// L'admin ne voit QUE les demandes avec preuve soumise (reqStatus = 'submitted')
// Les demandes 'pending' sans preuve restent invisibles pour l'admin
// ============================================================================

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const url = request.nextUrl.searchParams;
    const status = url.get('status') || 'submitted';

    const where: Record<string, unknown> = {};
    if (status === 'all') {
      where.reqStatus = { in: ['submitted', 'validated', 'rejected'] };
    } else {
      where.reqStatus = status;
    }

    const requests = await db.paymentRequest.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ requests, total: requests.length });
  } catch (error) {
    console.error('GET /api/admin/payment-requests error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// ============================================================================
// PATCH /api/admin/payment-requests/[id] — Valider ou refuser
// ============================================================================
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { id, action, rejectionReason } = body;

    if (!id || !action || !['validate', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'ID et action requis' }, { status: 400 });
    }

    if (action === 'reject' && !rejectionReason) {
      return NextResponse.json({ error: 'Motif de refus requis' }, { status: 400 });
    }

    const req = await db.paymentRequest.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true } } },
    });

    if (!req) {
      return NextResponse.json({ error: 'Demande non trouvée' }, { status: 404 });
    }

    if (req.reqStatus !== 'submitted') {
      return NextResponse.json({ error: 'Demande déjà traitée' }, { status: 400 });
    }

    if (action === 'validate') {
      await db.paymentRequest.update({
        where: { id },
        data: {
          reqStatus: 'validated',
          validatedAt: new Date(),
          validatedBy: auth.id,
          rejectionReason: null,
        },
      });

      // Si c'est un rechargement wallet, créditer le solde
      if (req.reqType === 'wallet_charge') {
        let wallet = await db.wallet.findUnique({ where: { userId: req.userId } });
        if (!wallet) {
          wallet = await db.wallet.create({ data: { userId: req.userId } });
        }

        let bonus = 0;
        if (req.amount >= 1000) bonus = req.amount * 0.10;
        else if (req.amount >= 500) bonus = req.amount * 0.05;

        const newBalance = wallet.balance + req.amount + bonus;
        await db.wallet.update({
          where: { id: wallet.id },
          data: { balance: newBalance },
        });

        // IMPORTANT : on crée la WalletTransaction en liant le paymentRequestId
        // pour éviter les doublons côté admin (voir /api/admin/payments qui filtre
        // les WalletTransaction ayant un paymentRequestId non null).
        await db.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'charge',
            amount: req.amount,
            paymentMethod: req.method,
            paymentRequestId: req.id,
            description: `Rechargement de ${req.amount} MAD via ${req.method} — VALIDÉ`,
          },
        });

        if (bonus > 0) {
          await db.walletTransaction.create({
            data: {
              walletId: wallet.id,
              type: 'bonus',
              amount: bonus,
              paymentRequestId: req.id,
              description: `Bonus de ${bonus} MAD (rechargement ≥ ${req.amount >= 1000 ? '1000' : '500'} MAD)`,
            },
          });
        }
      }

      return NextResponse.json({ success: true, message: 'Demande validée' + (req.reqType === 'wallet_charge' ? ' — solde crédité' : '') });
    } else {
      await db.paymentRequest.update({
        where: { id },
        data: {
          reqStatus: 'rejected',
          rejectionReason,
          validatedAt: new Date(),
          validatedBy: auth.id,
        },
      });
      return NextResponse.json({ success: true, message: 'Demande refusée' });
    }
  } catch (error) {
    console.error('PATCH /api/admin/payment-requests error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
