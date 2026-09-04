import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

import { requireAdmin } from '@/lib/auth';
import { isRootAdmin, isLastAdmin } from '@/lib/root-admin';

export async function GET(request: NextRequest) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  try {
    const url = request.nextUrl.searchParams;
    const page = parseInt(url.get('page') || '1');
    const limit = parseInt(url.get('limit') || '20');

    const [users, total] = await Promise.all([
      db.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, phone: true, role: true, avatar: true, bio: true, createdAt: true },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count(),
    ]);

    // Enrichir chaque user avec le flag isRoot (pour UI)
    // Calculé côté serveur pour éviter toute falsification côté client
    const usersWithRootFlag = await Promise.all(
      users.map(async (u) => ({
        ...u,
        isRoot: await isRootAdmin(u.id),
      }))
    );

    return NextResponse.json({ users: usersWithRootFlag, total, page, limit, pages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const { id, role } = body;
    if (!id || !role) return NextResponse.json({ error: 'ID et rôle requis' }, { status: 400 });

    // PROTECTION ROOT : le rôle du compte ROOT ne peut pas être modifié
    if (await isRootAdmin(id)) {
      return NextResponse.json(
        { error: 'Le rôle du compte ROOT administrateur ne peut pas être modifié.' },
        { status: 403 }
      );
    }

    // SAFETY NET : empêcher la rétrogradation du dernier admin (lockout)
    if (role !== 'admin' && await isLastAdmin(id)) {
      return NextResponse.json(
        { error: 'Impossible de rétrograder le dernier administrateur restant.' },
        { status: 403 }
      );
    }

    const user = await db.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
