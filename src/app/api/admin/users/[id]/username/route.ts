import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { isRootAdmin } from '@/lib/root-admin';
import { validateUsername } from '@/lib/reserved-usernames';

// ============================================================================
// PATCH /api/admin/users/[id]/username — Modifier le username d'un user
// Body: { username: string }
// L'admin peut bypass la liste des réservés (comme déjà prévu dans validateUsername)
// ============================================================================
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const body = await req.json();
    const { username } = body;

    if (!username || username.length < 5 || username.length > 12) {
      return NextResponse.json({ error: 'Username requis (5 à 12 caractères)' }, { status: 400 });
    }

    // Vérifier l'unicité (sauf pour l'utilisateur actuel)
    const existing = await db.userProfile.findFirst({
      where: { username, NOT: { userId: id } },
    });
    if (existing) {
      return NextResponse.json({ error: 'Ce username est déjà utilisé' }, { status: 409 });
    }

    // L'admin bypass la liste des réservés (isAdmin = true)
    const validation = validateUsername(username, true);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Vérifier si l'utilisateur a un UserProfile, sinon le créer
    let profile = await db.userProfile.findUnique({ where: { userId: id } });
    if (!profile) {
      const user = await db.user.findUnique({ where: { id } });
      profile = await db.userProfile.create({
        data: { userId: id, username, fullName: user?.name || '' },
      });
    } else {
      profile = await db.userProfile.update({
        where: { userId: id },
        data: { username },
      });
    }

    return NextResponse.json({ success: true, username: profile.username });
  } catch (error) {
    console.error('PATCH /api/admin/users/[id]/username error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
