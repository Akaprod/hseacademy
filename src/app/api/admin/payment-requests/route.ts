import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { COURSE_PRICE_MAD, CURRENCY, canIssueAttestation } from '@/lib/payment';

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

        await db.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'charge',
            amount: req.amount,
            paymentMethod: req.method,
            description: `Rechargement de ${req.amount} MAD via ${req.method} — VALIDÉ`,
          },
        });

        if (bonus > 0) {
          await db.walletTransaction.create({
            data: {
              walletId: wallet.id,
              type: 'bonus',
              amount: bonus,
              description: `Bonus de ${bonus} MAD (rechargement ≥ ${req.amount >= 1000 ? '1000' : '500'} MAD)`,
            },
          });
        }

        // ====================================================================
        // AUTOMATISATION : Après crédit du wallet, vérifier si l'utilisateur a
        // des cours terminés en attente de paiement. Si le solde est suffisant,
        // déduire automatiquement le montant et valider le paiement du cours.
        // ====================================================================
        const pendingEnrollments = await db.enrollment.findMany({
          where: {
            userId: req.userId,
            paymentStatus: { in: ['pending', 'submitted', 'rejected'] },
            courseOrderIndex: { gt: 1 },
          },
          include: { course: { select: { title: true } } },
        });

        for (const enrollment of pendingEnrollments) {
          // Re-vérifier le solde à chaque itération (au cas où plusieurs cours)
          const currentWallet = await db.wallet.findUnique({ where: { userId: req.userId } });
          if (!currentWallet || currentWallet.balance < COURSE_PRICE_MAD) break;

          // Vérifier qu'aucun CoursePayment validé n'existe déjà (anti-double-paiement)
          const existingPayment = await db.coursePayment.findUnique({
            where: { enrollmentId: enrollment.id },
          });
          if (existingPayment && existingPayment.status === 'validated') continue;

          // Déduire le montant du wallet
          const balanceAfterDeduction = currentWallet.balance - COURSE_PRICE_MAD;
          await db.wallet.update({
            where: { id: currentWallet.id },
            data: { balance: balanceAfterDeduction },
          });

          // Créer la transaction wallet
          await db.walletTransaction.create({
            data: {
              walletId: currentWallet.id,
              type: 'purchase',
              amount: COURSE_PRICE_MAD,
              description: `Paiement automatique cours : ${enrollment.course.title} (après rechargement validé)`,
            },
          });

          // Créer ou mettre à jour le CoursePayment
          if (existingPayment) {
            await db.coursePayment.update({
              where: { enrollmentId: enrollment.id },
              data: {
                method: 'wallet',
                status: 'validated',
                amount: COURSE_PRICE_MAD,
                currency: CURRENCY,
                validatedAt: new Date(),
                validatedBy: 'wallet-auto',
                rejectionReason: null,
              },
            });
          } else {
            await db.coursePayment.create({
              data: {
                userId: req.userId,
                enrollmentId: enrollment.id,
                courseId: enrollment.courseId,
                amount: COURSE_PRICE_MAD,
                currency: CURRENCY,
                method: 'wallet',
                status: 'validated',
                validatedAt: new Date(),
                validatedBy: 'wallet-auto',
              },
            });
          }

          // Valider l'enrollment
          await db.enrollment.update({
            where: { id: enrollment.id },
            data: { paymentStatus: 'validated' },
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
