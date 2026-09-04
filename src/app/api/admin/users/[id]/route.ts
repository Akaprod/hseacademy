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
      select: { id: true, name: true, email: true, phone: true, role: true, avatar: true, bio: true, createdAt: true, _count: { select: { comments: true, certifications: true } } },
    });
    if (!user) return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });

    // Enrichir avec le flag isRoot (pour UI)
    const isRoot = await isRootAdmin(user.id);

    return NextResponse.json({ user: { ...user, isRoot } });
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
