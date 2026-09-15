import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { hashCode } from '@/lib/email';

// ============================================================================
// POST /api/auth/verify-code — Vérifier un code à 6 chiffres
// Body: { code: string }
// Vérifie le code saisi par l'utilisateur contre le hash stocké en DB.
// Si valide → marque emailVerified = true.
// ============================================================================
export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { code } = body;

    if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'Code invalide (6 chiffres requis)' }, { status: 400 });
    }

    // Hasher le code saisi
    const codeHash = hashCode(code);

    // Chercher le token non utilisé correspondant
    const record = await db.emailVerificationToken.findFirst({
      where: {
        userId: auth.id,
        token: codeHash,
        usedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return NextResponse.json({ error: 'Code incorrect. Vérifiez le code reçu par email, ou demandez un nouveau code.' }, { status: 400 });
    }

    // Vérifier l'expiration (30 minutes)
    if (record.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Code expiré. Cliquez sur "Renvoyer le code" pour recevoir un nouveau code valide pendant 30 minutes.' }, { status: 400 });
    }

    // Marquer le token comme utilisé
    await db.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    // Marquer l'email comme vérifié
    await db.userProfile.upsert({
      where: { userId: auth.id },
      create: { userId: auth.id, emailVerified: true, emailVerifiedAt: new Date() },
      update: { emailVerified: true, emailVerifiedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: 'Email vérifié avec succès !' });
  } catch (error) {
    console.error('POST /api/auth/verify-code error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
