import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

import { requireAdmin } from '@/lib/auth';
import { isRootAdmin, isLastAdmin } from '@/lib/root-admin';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const user = await db.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, phone: true, role: true, status: true, avatar: true, bio: true, createdAt: true, _count: { select: { comments: true, certifications: true } } },
    });
    if (!user) return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });

    // Enrichir avec le flag isRoot (pour UI)
    const isRoot = await isRootAdmin(user.id);

    // Récupérer le profil (UserProfile), wallet, enrollments, attestations, paiements
    const [profile, wallet, enrollments, attestations, coursePayments, paymentRequests] = await Promise.all([
      db.userProfile.findUnique({ where: { userId: id } }),
      db.wallet.findUnique({ where: { userId: id } }),
      db.enrollment.findMany({
        where: { userId: id },
        include: { course: { select: { id: true, title: true, slug: true, icon: true, level: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      db.courseAttestation.findMany({
        where: { userId: id },
        orderBy: { issuedDate: 'desc' },
      }),
      db.coursePayment.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
      }),
      db.paymentRequest.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Récupérer les transactions du wallet (pour affichage détail + calcul totalCharged)
    const walletTransactions = wallet ? await db.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }) : [];

    // Stats résumées
    // Bug 3 — Alignement des noms de propriétés avec le frontend admin-dashboard.tsx
    const validAttestations = attestations.filter(a => a.status === 'valid');
    const validatedPayments = coursePayments.filter(p => p.status === 'validated');
    const chargeTransactions = walletTransactions.filter(t => t.type === 'charge');

    const stats = {
      // Anciens champs (rétro-compatibilité)
      enrollmentCount: enrollments.length,
      attestationCount: attestations.length,
      paymentCount: coursePayments.length,
      paymentRequestCount: paymentRequests.length,
      walletBalance: wallet?.balance || 0,
      // Nouveaux champs (alignement frontend admin-dashboard.tsx — Bug 3)
      coursesEnrolled: enrollments.length,
      attestationsObtained: validAttestations.length,
      totalSpent: validatedPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
      totalCharged: chargeTransactions.reduce((sum, t) => sum + (t.amount || 0), 0),
    };

    return NextResponse.json({
      user: { ...user, isRoot },
      profile,
      wallet,
      walletTransactions,
      enrollments,
      attestations,
      coursePayments,
      paymentRequests,
      stats,
    });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, role } = body;

    const data: Record<string, unknown> = {};
    if (status) data.status = status;
    if (role) data.role = role;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Aucune donnée à mettre à jour' }, { status: 400 });
    }

    // PROTECTION ROOT : le rôle du compte ROOT ne peut pas être modifié
    if (role && await isRootAdmin(id)) {
      return NextResponse.json(
        { error: 'Le rôle du compte ROOT administrateur ne peut pas être modifié.' },
        { status: 403 }
      );
    }

    const user = await db.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, status: true },
    });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;

    // PROTECTION ROOT : le compte ROOT ne peut pas être supprimé
    if (await isRootAdmin(id)) {
      return NextResponse.json(
        { error: 'Le compte ROOT administrateur ne peut pas être supprimé.' },
        { status: 403 }
      );
    }

    // SAFETY NET : empêcher la suppression du dernier admin (lockout)
    if (await isLastAdmin(id)) {
      return NextResponse.json(
        { error: 'Impossible de supprimer le dernier administrateur restant.' },
        { status: 403 }
      );
    }

    await db.comment.deleteMany({ where: { userId: id } });
    await db.certification.deleteMany({ where: { userId: id } });
    await db.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
