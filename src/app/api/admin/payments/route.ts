import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// ============================================================================
// GET /api/admin/payments — Lister tous les paiements + rechargements wallet
// ============================================================================
// Inclut :
//   - CoursePayment (paiements cours)
//   - AttestationPayment (paiements attestation imprimée)
//   - WalletTransaction type='charge' SANS paymentRequestId (anciennes demandes wallet
//     pré-PaymentRequest — les nouvelles sont déjà représentées par leur PaymentRequest)
//   - PaymentRequest (nouveau système de demandes — wallet_charge, course, attestation)
//
// IMPORTANT 1 : pour éviter les doublons, on exclut les WalletTransaction qui ont un
// paymentRequestId non null (déjà listées via leur PaymentRequest correspondante).
//
// IMPORTANT 2 : on sépare "En attente" et "Preuve soumise" côté admin pour bien
// distinguer les 2 types de demandes PaymentRequest :
//   - "En attente" (status=pending) → SANS preuve (l'utilisateur n'a pas encore
//     soumis de preuve, l'admin ne peut rien faire)
//   - "Preuve soumise" (status=submitted) → AVEC preuve (l'admin peut valider/
//     refuser — c'est LA liste actionnable)
// Sans cette séparation, on aurait 150 demandes "En attente" sans preuve mélangées
// avec 1 demande "Preuve soumise" — l'admin devrait scroller pour trouver
// l'actionnable.
//
// Filtre par statut : pending | submitted | validated | rejected | archived
// Pour wallet (anciennes), le statut est déduit de la description :
//   "EN ATTENTE" → pending, "VALIDÉ" → validated, "REFUSÉ" → rejected, "ARCHIVÉ" → archived
// Pour PaymentRequest, le statut est reqStatus directement.
// ============================================================================

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const url = request.nextUrl.searchParams;
    const page = parseInt(url.get('page') || '1');
    const limit = parseInt(url.get('limit') || '50');
    const status = url.get('status'); // pending | submitted | validated | rejected | archived
    const type = url.get('type');

    // ---- Marquer les PaymentRequest expirées (pending > 72h sans preuve) ----
    // Cela permet aux demandes "en attente" de sortir automatiquement de la liste
    // pending une fois la fenêtre de 72h dépassée.
    await db.paymentRequest.updateMany({
      where: {
        reqStatus: 'pending',
        expiresAt: { lt: new Date() },
      },
      data: { reqStatus: 'expired' },
    });

    // ---- Filtre pour CoursePayment / AttestationPayment ----
    const where: Record<string, unknown> = {};
    if (status === 'pending') {
      // "En attente" inclut pending ET submitted (preuve soumise = toujours en attente de validation)
      where.status = { in: ['pending', 'submitted'] };
    } else if (status === 'archived') {
      where.status = 'archived';
    } else if (status) {
      where.status = status;
    }

    // ---- Filtre pour WalletTransaction (status déduit de la description) ----
    // IMPORTANT : on exclut paymentRequestId IS NOT NULL (ces transactions sont
    // déjà représentées par leur PaymentRequest correspondante — évite les doublons)
    const walletWhere: Record<string, unknown> = {
      type: 'charge',
      paymentRequestId: null,
    };
    if (status === 'pending') {
      walletWhere.description = { contains: 'EN ATTENTE' };
    } else if (status === 'validated') {
      walletWhere.description = { contains: 'VALIDÉ' };
    } else if (status === 'rejected') {
      walletWhere.description = { contains: 'REFUSÉ' };
    } else if (status === 'archived') {
      walletWhere.description = { contains: 'ARCHIVÉ' };
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
                t.description.includes('REFUSÉ') ? 'rejected' :
                t.description.includes('ARCHIVÉ') ? 'archived' : 'validated',
        type: 'wallet',
        description: t.description,
        createdAt: t.createdAt,
        validatedAt: t.description.includes('VALIDÉ') ? t.createdAt : null,
        proofPath: null,
      }));
      total += wcCount;
    }

    // ---- PaymentRequests (nouveau système de demandes) ----
    // LOGIQUE des filtres admin :
    //   "pending"   → demandes SANS preuve soumise (en attente utilisateur)
    //                 L'admin ne peut rien faire, c'est l'utilisateur qui doit envoyer sa preuve
    //   "submitted" → demandes AVEC preuve soumise (en attente admin)
    //                 L'admin peut valider/refuser — c'est LA liste actionnable
    //   "validated" → demandes validées par l'admin
    //   "rejected" → demandes refusées par l'admin
    //   "archived"  → n/a pour PaymentRequest (exclu)
    //
    // IMPORTANT : pour ne pas mélanger les "pending" (150 sans preuve) avec les
    // "submitted" (1 avec preuve), on a 2 filtres distincts côté admin :
    //   - "En attente"     → pending (sans preuve)
    //   - "Preuve soumise" → submitted (avec preuve, actionnable par l'admin)
    const prWhere: Record<string, unknown> = {};
    if (status === 'pending') {
      // "En attente" = sans preuve (l'utilisateur n'a pas encore soumis)
      prWhere.reqStatus = 'pending';
    } else if (status === 'submitted') {
      // "Preuve soumise" = avec preuve (l'admin doit valider/refuser)
      prWhere.reqStatus = 'submitted';
    } else if (status === 'archived') {
      // Pas de statut 'archived' pour PaymentRequest → on exclut tout
      prWhere.reqStatus = '__never__';
    } else if (status) {
      prWhere.reqStatus = status;
    }

    const pr = await db.paymentRequest.findMany({
      where: prWhere,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const paymentRequests = pr.map(r => ({
      id: r.id,
      userId: r.userId,
      user: r.user,
      amount: r.amount,
      currency: 'MAD',
      method: r.method,
      status: r.reqStatus,
      type: 'payment_request',
      description: r.description || '',
      createdAt: r.createdAt,
      validatedAt: r.validatedAt,
      proofPath: r.proofPath,
    }));
    const prCount = await db.paymentRequest.count({ where: prWhere });
    total += prCount;

    // Merge, filter by status if needed (for wallet, already filtered via DB)
    // and sort by createdAt desc
    let allPayments = [...coursePayments, ...attestationPayments, ...walletCharges, ...paymentRequests]
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
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('GET /api/admin/payments error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
