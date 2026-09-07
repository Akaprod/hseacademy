import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// ============================================================================
// GET /api/admin/payments/[id] — Détail d'un paiement (admin only)
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'course';

    let payment: any = null;

    if (type === 'course') {
      payment = await db.coursePayment.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, name: true, email: true } },
          enrollment: {
            include: {
              course: { select: { id: true, title: true, slug: true } },
            },
          },
        },
      });
    } else if (type === 'attestation') {
      payment = await db.attestationPayment.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });
    }

    if (!payment) {
      return NextResponse.json({ error: 'Paiement non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ payment: { ...payment, type } });
  } catch (error) {
    console.error('GET /api/admin/payments/[id] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// ============================================================================
// PATCH /api/admin/payments/[id] — Valider ou refuser un paiement
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const body = await request.json();
    const { action, type, rejectionReason } = body;

    if (!action || !['validate', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Action invalide (validate ou reject)' }, { status: 400 });
    }
    if (!type || !['course', 'attestation', 'wallet'].includes(type)) {
      return NextResponse.json({ error: 'Type invalide (course, attestation ou wallet)' }, { status: 400 });
    }

    if (action === 'reject' && !rejectionReason) {
      return NextResponse.json({ error: 'Motif de refus requis' }, { status: 400 });
    }

    if (type === 'course') {
      const payment = await db.coursePayment.findUnique({ where: { id } });
      if (!payment) {
        return NextResponse.json({ error: 'Paiement non trouvé' }, { status: 404 });
      }

      if (action === 'validate') {
        const updated = await db.coursePayment.update({
          where: { id },
          data: {
            status: 'validated',
            validatedAt: new Date(),
            validatedBy: auth.id,
            rejectionReason: null,
          },
        });

        // Mettre à jour enrollment.paymentStatus
        await db.enrollment.update({
          where: { id: payment.enrollmentId },
          data: { paymentStatus: 'validated' },
        });

        return NextResponse.json({ payment: updated });
      } else {
        const updated = await db.coursePayment.update({
          where: { id },
          data: {
            status: 'rejected',
            rejectionReason,
            validatedBy: auth.id,
          },
        });

        // Remettre enrollment.paymentStatus à pending
        await db.enrollment.update({
          where: { id: payment.enrollmentId },
          data: { paymentStatus: 'pending' },
        });

        return NextResponse.json({ payment: updated });
      }
    } else if (type === 'attestation') {
      const payment = await db.attestationPayment.findUnique({ where: { id } });
      if (!payment) {
        return NextResponse.json({ error: 'Paiement non trouvé' }, { status: 404 });
      }

      if (action === 'validate') {
        const updated = await db.attestationPayment.update({
          where: { id },
          data: {
            status: 'validated',
            validatedAt: new Date(),
            validatedBy: auth.id,
            rejectionReason: null,
          },
        });
        return NextResponse.json({ payment: updated });
      } else {
        const updated = await db.attestationPayment.update({
          where: { id },
          data: {
            status: 'rejected',
            rejectionReason,
            validatedBy: auth.id,
          },
        });
        return NextResponse.json({ payment: updated });
      }
    } else if (type === 'wallet') {
      // ---- Validation wallet : créditer le solde + bonus ----
      const tx = await db.walletTransaction.findUnique({
        where: { id },
        include: { wallet: true },
      });
      if (!tx || tx.type !== 'charge') {
        return NextResponse.json({ error: 'Transaction wallet non trouvée' }, { status: 404 });
      }

      if (action === 'validate') {
        let bonus = 0;
        if (tx.amount >= 1000) bonus = tx.amount * 0.10;
        else if (tx.amount >= 500) bonus = tx.amount * 0.05;

        const newBalance = tx.wallet.balance + tx.amount + bonus;
        await db.wallet.update({
          where: { id: tx.walletId },
          data: { balance: newBalance },
        });

        await db.walletTransaction.update({
          where: { id },
          data: { description: `Rechargement de ${tx.amount} MAD via ${tx.paymentMethod} — VALIDÉ` },
        });

        if (bonus > 0) {
          await db.walletTransaction.create({
            data: {
              walletId: tx.walletId,
              type: 'bonus',
              amount: bonus,
              description: `Bonus de ${bonus} MAD (rechargement ≥ ${tx.amount >= 1000 ? '1000' : '500'} MAD)`,
            },
          });
        }

        return NextResponse.json({ success: true, newBalance, bonus });
      } else {
        await db.walletTransaction.update({
          where: { id },
          data: { description: `Rechargement de ${tx.amount} MAD via ${tx.paymentMethod} — REFUSÉ (${rejectionReason})` },
        });
        return NextResponse.json({ success: true });
      }
    }
  } catch (error) {
    console.error('PATCH /api/admin/payments/[id] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
