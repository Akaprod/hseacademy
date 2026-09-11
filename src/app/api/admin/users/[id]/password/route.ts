import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { isRootAdmin } from '@/lib/root-admin';
import bcrypt from 'bcryptjs';

// ============================================================================
// PATCH /api/admin/users/[id]/password — Reset le mot de passe d'un user
// Body: { password: string } (en clair — sera hashé avec bcrypt côté serveur)
// L'admin ne JAMAIS voir l'ancien mot de passe.
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
    const { password } = body;

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Mot de passe requis (min 6 caractères)' }, { status: 400 });
    }

    // PROTECTION ROOT : le mot de passe du compte ROOT ne peut être réinitialisé que par ROOT
    if (await isRootAdmin(id) && !(await isRootAdmin(auth.id))) {
      return NextResponse.json(
        { error: 'Seul un administrateur ROOT peut réinitialiser le mot de passe d\'un compte ROOT.' },
        { status: 403 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true, message: 'Mot de passe réinitialisé' });
  } catch (error) {
    console.error('PATCH /api/admin/users/[id]/password error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
