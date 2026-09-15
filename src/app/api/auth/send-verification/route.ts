import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { generateVerificationToken, hashToken, sendVerificationEmail, isEmailConfigured } from '@/lib/email';

// POST /api/auth/send-verification — envoyer email de vérification (LIEN UNIQUEMENT)
// Note: la vérification par code à 6 chiffres est temporairement désactivée
// (le route /api/auth/verify-code n'était pas déployé correctement sur Hostinger).
// On reviendra à la vérification par code plus tard.
export async function POST() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    // Vérifier si déjà vérifié
    const profile = await db.userProfile.findUnique({ where: { userId: auth.id } });
    if (profile?.emailVerified) {
      return NextResponse.json({ error: 'Email déjà vérifié' }, { status: 400 });
    }

    // Cooldown : 60 secondes entre les envois
    const lastToken = await db.emailVerificationToken.findFirst({
      where: { userId: auth.id },
      orderBy: { createdAt: 'desc' },
    });
    if (lastToken && lastToken.createdAt > new Date(Date.now() - 60 * 1000)) {
      const waitSec = Math.ceil((60 * 1000 - (Date.now() - lastToken.createdAt.getTime())) / 1000);
      return NextResponse.json({ error: `Veuillez attendre ${waitSec} secondes avant de renvoyer` }, { status: 429 });
    }

    if (!isEmailConfigured()) {
      return NextResponse.json({ error: 'Service email non configuré. Contactez l\'administration.' }, { status: 503 });
    }

    // Générer uniquement le token pour le lien (plus de code à 6 chiffres)
    const rawToken = generateVerificationToken();
    const tokenHash = hashToken(rawToken);

    // Invalider les anciens tokens
    await db.emailVerificationToken.updateMany({
      where: { userId: auth.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Créer un seul enregistrement : le token pour le lien (valide 24h)
    await db.emailVerificationToken.create({
      data: {
        userId: auth.id,
        token: tokenHash, // Pour vérification par lien uniquement
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 heures
      },
    });

    // Envoyer email (avec le lien uniquement, sans code)
    const result = await sendVerificationEmail(auth.email, rawToken);
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Erreur envoi email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Email envoyé avec votre lien de vérification' });
  } catch (error) {
    console.error('POST /api/auth/send-verification error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
