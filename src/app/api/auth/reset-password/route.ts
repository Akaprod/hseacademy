// ============================================================================
// POST /api/auth/reset-password
// ============================================================================
// Reçoit token + nouveau password + confirmPassword → valide → update.
// Sécurité :
//   - Token hashé en DB (jamais stocké en clair)
//   - Token à usage unique (usedAt marqué après usage)
//   - Token valable 10 minutes (expiresAt)
//   - Nouveau mot de passe = mêmes règles que la création (passwordSchema)
//   - Reset en 2 phases : password + confirmPassword (doivent être identiques)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { hashToken } from '@/lib/email';
import { passwordSchema } from '@/lib/validation';
import { setSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, confirmPassword } = body;

    // 1. Valider les entrées
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token manquant' }, { status: 400 });
    }

    if (!password || !confirmPassword) {
      return NextResponse.json({ error: 'Mot de passe et confirmation requis' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Les mots de passe ne correspondent pas' }, { status: 400 });
    }

    // 2. Valider le mot de passe (mêmes règles que la création)
    const pwCheck = passwordSchema.safeParse(password);
    if (!pwCheck.success) {
      return NextResponse.json({ error: pwCheck.error.issues[0].message }, { status: 400 });
    }

    // 3. Vérifier le token (hashé en DB)
    const tokenHash = hashToken(token);
    const record = await db.passwordResetToken.findUnique({
      where: { token: tokenHash },
    });

    if (!record) {
      return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 400 });
    }

    // 4. Vérifier qu'il n'a pas déjà été utilisé
    if (record.usedAt) {
      return NextResponse.json({ error: 'Ce lien a déjà été utilisé. Veuillez refaire une demande.' }, { status: 400 });
    }

    // 5. Vérifier l'expiration (10 minutes)
    if (record.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Ce lien a expiré (validité 10 minutes). Veuillez refaire une demande.' }, { status: 400 });
    }

    // 6. Vérifier que l'utilisateur existe encore
    const user = await db.user.findUnique({ where: { id: record.userId } });
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 400 });
    }

    // 7. Vérifier que l'utilisateur n'est pas bloqué (reset block 24h)
    if (user.passwordResetBlockedUntil && user.passwordResetBlockedUntil > new Date()) {
      return NextResponse.json({ error: 'Compte temporairement bloqué pour des raisons de sécurité. Veuillez réessayer plus tard.' }, { status: 403 });
    }

    // 8. Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // 9. Mettre à jour le mot de passe + reset compteurs + marquer token comme utilisé
    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          failedLoginAttempts: 0,
          lockedUntil: null,
          passwordResetRequests: 0,
          passwordResetBlockedUntil: null,
        },
      }),
      db.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    // 10. Connecter l'utilisateur (auto-login après reset)
    await setSessionCookie(user.id);

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({
      message: 'Mot de passe réinitialisé avec succès',
      user: { ...userWithoutPassword, password: undefined },
    });
  } catch (error) {
    console.error('POST /api/auth/reset-password error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
