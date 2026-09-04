import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { fullNameSchema } from '@/lib/validation';

// GET /api/profile — lire son propre profil
export async function GET() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const profile = await db.userProfile.findUnique({
      where: { userId: auth.id },
    });
    const enrollments = await db.enrollment.findMany({
      where: { userId: auth.id },
      include: {
        course: {
          select: { id: true, title: true, slug: true, level: true, totalHours: true,
            chapters: { select: { id: true }, orderBy: { order: 'asc' } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const attestations = await db.courseAttestation.findMany({
      where: { userId: auth.id },
      include: { course: { select: { title: true, slug: true, level: true, totalHours: true } } },
      orderBy: { issuedDate: 'desc' },
    });
    return NextResponse.json({ profile, enrollments, attestations });
  } catch (error) {
    console.error('GET /api/profile error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT /api/profile — modifier son propre profil (pas l'identité vérouillée)
export async function PUT(req: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const allowed: Record<string, unknown> = {};

    // Champs modifiables librement
    if (body.birthDate !== undefined) allowed.birthDate = body.birthDate ? new Date(body.birthDate) : null;
    if (body.birthPlace !== undefined) allowed.birthPlace = body.birthPlace || null;
    if (body.residence !== undefined) allowed.residence = body.residence || null;
    if (body.address !== undefined) allowed.address = body.address || null;
    if (body.facebook !== undefined) allowed.facebook = body.facebook || null;
    if (body.linkedin !== undefined) allowed.linkedin = body.linkedin || null;
    if (body.twitter !== undefined) allowed.twitter = body.twitter || null;
    if (body.website !== undefined) allowed.website = body.website || null;
    if (body.avatar !== undefined) allowed.avatar = body.avatar || null;

    // fullName : seulement si pas encore validé
    if (body.fullName !== undefined) {
      const existing = await db.userProfile.findUnique({ where: { userId: auth.id } });
      if (existing?.fullNameValidated) {
        return NextResponse.json({ error: 'Votre nom est validé et ne peut plus être modifié librement. Contactez l\'administration.' }, { status: 403 });
      }
      const nameCheck = fullNameSchema.safeParse(body.fullName);
      if (!nameCheck.success) {
        return NextResponse.json({ error: nameCheck.error.issues[0].message }, { status: 400 });
      }
      allowed.fullName = body.fullName.trim();
    }

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: 'Aucune donnée à modifier' }, { status: 400 });
    }

    // Upsert : si le profil n'existe pas encore, le créer
    const profile = await db.userProfile.upsert({
      where: { userId: auth.id },
      create: { userId: auth.id, ...allowed },
      update: allowed,
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('PUT /api/profile error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
