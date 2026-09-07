import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';

// ============================================================================
// POST /api/profile/username — Définir ou modifier son username
// PATCH /api/profile/username — Toggle profilePublic + modifier champs CV
// ============================================================================

const USERNAME_REGEX = /^[a-zA-Z0-9_]{5,12}$/;

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { username } = body;

    if (!username || !USERNAME_REGEX.test(username)) {
      return NextResponse.json({
        error: 'Username invalide. 5 à 12 caractères, lettres, chiffres et _ uniquement.'
      }, { status: 400 });
    }

    // Vérifier l'unicité
    const existing = await db.userProfile.findFirst({
      where: { username, NOT: { userId: auth.id } },
    });

    if (existing) {
      return NextResponse.json({ error: 'Ce nom d\'utilisateur est déjà utilisé' }, { status: 409 });
    }

    // Mettre à jour le profil
    let profile = await db.userProfile.findUnique({ where: { userId: auth.id } });
    if (!profile) {
      profile = await db.userProfile.create({ data: { userId: auth.id, username } });
    } else {
      await db.userProfile.update({
        where: { userId: auth.id },
        data: { username },
      });
    }

    return NextResponse.json({ username, publicUrl: `/@${username}` });
  } catch (error) {
    console.error('POST /api/profile/username error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.profilePublic !== undefined) data.profilePublic = body.profilePublic;
    if (body.cvTemplate !== undefined) {
      if (!['modern', 'classic', 'minimal'].includes(body.cvTemplate)) {
        return NextResponse.json({ error: 'Template invalide' }, { status: 400 });
      }
      data.cvTemplate = body.cvTemplate;
    }
    if (body.cvTitle !== undefined) data.cvTitle = body.cvTitle?.trim() || null;
    if (body.cvBio !== undefined) data.cvBio = body.cvBio?.trim() || null;
    if (body.cvSkills !== undefined) data.cvSkills = JSON.stringify(body.cvSkills || []);
    if (body.cvExperience !== undefined) data.cvExperience = JSON.stringify(body.cvExperience || []);

    await db.userProfile.update({
      where: { userId: auth.id },
      data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/profile/username error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
