// ============================================================================
// POST /api/auth/login
// ============================================================================
// Sécurité :
//   - 3 mots de passe incorrects consécutifs → gel du compte 4h + email d'alerte
//   - Connexion réussie → failedLoginAttempts revient à 0
//   - Ne révèle jamais si l'email existe (message identique)
//   - Compte gelé → refuse la connexion avec message explicite
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { setSessionCookie } from '@/lib/auth';
import { sendSecurityAlertEmail, isEmailConfigured } from '@/lib/email';

const MAX_FAILED_ATTEMPTS = 3;
const LOCK_HOURS = 4;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';

    const user = await db.user.findUnique({ where: { email: normalizedEmail } });

    // Ne pas révéler si l'email existe — message identique
    if (!user || !user.password) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    // Vérifier si le compte est gelé (lockedUntil)
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMs = user.lockedUntil.getTime() - Date.now();
      const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
      const remainingMins = Math.ceil(remainingMs / (60 * 1000));
      const remainingText = remainingHours >= 1 ? `${remainingHours} heure(s)` : `${remainingMins} minute(s)`;
      return NextResponse.json({
        error: `Compte temporairement bloqué pour des raisons de sécurité. Veuillez réessayer dans ${remainingText}.`
      }, { status: 403 });
    }

    // Si le gel est expiré, reset le compteur
    if (user.lockedUntil && user.lockedUntil <= new Date()) {
      await db.user.update({
        where: { id: user.id },
        data: { lockedUntil: null, failedLoginAttempts: 0 },
      });
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
    }

    // Vérifier le mot de passe
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      // Incrémenter le compteur d'échecs
      const newAttemptCount = (user.failedLoginAttempts || 0) + 1;

      if (newAttemptCount >= MAX_FAILED_ATTEMPTS) {
        // Gel du compte pendant 4h
        const lockedUntil = new Date(Date.now() + LOCK_HOURS * 60 * 60 * 1000);
        await db.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: newAttemptCount,
            lockedUntil: lockedUntil,
          },
        });

        // Envoyer email d'alerte
        if (isEmailConfigured()) {
          await sendSecurityAlertEmail(user.email, 'failed_logins', clientIP);
        }

        return NextResponse.json({
          error: `Trop de tentatives incorrectes. Votre compte est bloqué pendant ${LOCK_HOURS} heures. Un email d'alerte vous a été envoyé.`
        }, { status: 403 });
      }

      // Pas encore au max — incrémenter sans bloquer
      await db.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: newAttemptCount },
      });

      const remaining = MAX_FAILED_ATTEMPTS - newAttemptCount;
      return NextResponse.json({
        error: `Email ou mot de passe incorrect. ${remaining} tentative(s) restante(s) avant le blocage du compte.`
      }, { status: 401 });
    }

    // Connexion réussie — reset le compteur d'échecs
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await db.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }

    // Pose le cookie httpOnly signé
    await setSessionCookie(user.id);

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('POST /api/auth/login error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
