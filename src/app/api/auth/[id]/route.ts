import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // C6 : Authentification obligatoire. L'utilisateur ne peut consulter
  // QUE son propre profil — pas celui d'un autre user via params.id.
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;

    // Refus explicite si l'URL cible un autre utilisateur
    if (id !== auth.id) {
      return NextResponse.json(
        { error: 'Accès refusé — vous ne pouvez consulter que votre propre profil' },
        { status: 403 }
      );
    }

    const user = await db.user.findUnique({ where: { id: auth.id } });
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }
    // Ne jamais exposer le hash du mot de passe
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
