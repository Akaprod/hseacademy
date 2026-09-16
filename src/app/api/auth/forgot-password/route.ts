// ============================================================================
// POST /api/auth/forgot-password
// ============================================================================
// Reçoit email → génère token → envoie email de reset.
// Sécurité :
//   - Ne révèle JAMAIS si l'email existe (réponse identique dans tous les cas)
//   - Rate limiting : 3 demandes / 24h par utilisateur (fenêtre glissante)
//   - Au-delà de 3 : blocage auth 24h + email d'alerte
//   - Token : aléatoire 256 bits, hashé en DB, valable 10 minutes, usage unique
//   - Anciens tokens invalidés à chaque nouvelle demande
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateVerificationToken, hashToken, sendPasswordResetEmail, sendSecurityAlertEmail, isEmailConfigured } from '@/lib/email';
import { checkIpRateLimit, getClientIP } from '@/lib/rate-limit';

const MAX_RESET_REQUESTS_24H = 3;
const RESET_BLOCK_HOURS = 24;
// Rate limit IP: 10 demandes / heure (en plus du rate limit par user déjà en place)
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  // Rate limit par IP
  const clientIP = getClientIP(request);
  const rl = checkIpRateLimit(clientIP, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);
  if (!rl.allowed) {
    return NextResponse.json({
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé.'
    });
  }
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';

    // Chercher l'utilisateur (ne pas révéler s'il existe)
    const user = await db.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      // Email n'existe pas — répondre comme si tout s'était bien passé
      return NextResponse.json({
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé.'
      });
    }

    // Vérifier si l'utilisateur est déjà bloqué pour reset
    if (user.passwordResetBlockedUntil && user.passwordResetBlockedUntil > new Date()) {
      // Déjà bloqué — ne pas envoyer d'email, mais répondre comme si tout allait bien
      return NextResponse.json({
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé.'
      });
    }

    // Vérifier le compteur de demandes (fenêtre glissante 24h)
    // On compte les tokens créés dans les dernières 24h
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentRequests = await db.passwordResetToken.count({
      where: {
        userId: user.id,
        createdAt: { gt: twentyFourHoursAgo },
      },
    });

    if (recentRequests >= MAX_RESET_REQUESTS_24H) {
      // Bloquer l'utilisateur pendant 24h
      const blockedUntil = new Date(Date.now() + RESET_BLOCK_HOURS * 60 * 60 * 1000);
      await db.user.update({
        where: { id: user.id },
        data: {
          passwordResetBlockedUntil: blockedUntil,
        },
      });

      // Envoyer email d'alerte
      if (isEmailConfigured()) {
        await sendSecurityAlertEmail(user.email, 'reset_attempts', clientIP);
      }

      // Répondre comme si tout allait bien (ne pas révéler le blocage)
      return NextResponse.json({
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé.'
      });
    }

    // Vérifier que l'email de l'utilisateur est vérifié
    const profile = await db.userProfile.findUnique({ where: { userId: user.id } });
    if (!profile?.emailVerified) {
      // Email non vérifié — ne pas envoyer de reset
      return NextResponse.json({
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé.'
      });
    }

    // Vérifier que le SMTP est configuré
    if (!isEmailConfigured()) {
      return NextResponse.json({
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé.'
      });
    }

    // Invalider les anciens tokens non utilisés
    await db.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Générer le nouveau token
    const rawToken = generateVerificationToken();
    const tokenHash = hashToken(rawToken);

    // Stocker en DB (hashé, 10 minutes)
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        token: tokenHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        ipAddress: clientIP,
      },
    });

    // Envoyer l'email
    const result = await sendPasswordResetEmail(user.email, rawToken);

    // Réponse identique dans tous les cas (ne pas révéler si l'email existe)
    return NextResponse.json({
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé.'
    });
  } catch (error) {
    console.error('POST /api/auth/forgot-password error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
