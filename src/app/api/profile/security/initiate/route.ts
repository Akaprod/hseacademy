// ============================================================================
// POST /api/profile/security/initiate
// ============================================================================
// Démarre un changement sécurisé (email/tel/password) :
//   1. Valide la nouvelle valeur (format + unicité email)
//   2. Vérifie le rate-limiting (5 demandes / 1h par user)
//   3. Pour password : vérifie l'ancien mot de passe
//   4. Génère un code OTP à 6 chiffres, hashé en DB, valable 10 min
//   5. Envoie le code par email à l'ADRESSE ACTUELLE (jamais la nouvelle)
//   6. Invalide les anciens codes non utilisés (même changeType)
//
// Body: { changeType: 'email' | 'phone' | 'password', newValue: string, currentValue?: string }
// Réponse : { message: string } — ne révèle jamais si l'email existe
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import {
  generateVerificationCode,
  hashCode,
  sendSecurityChangeCodeEmail,
  isEmailConfigured,
} from '@/lib/email';
import { passwordSchema, emailSchema } from '@/lib/validation';

const MAX_INITIATES_1H = 5;
const CODE_TTL_MIN = 10;

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { changeType, newValue, currentValue } = body || {};

    if (!changeType || !['email', 'phone', 'password'].includes(changeType)) {
      return NextResponse.json({ error: 'Type de changement invalide' }, { status: 400 });
    }

    if (!newValue || typeof newValue !== 'string') {
      return NextResponse.json({ error: 'Nouvelle valeur requise' }, { status: 400 });
    }

    const clientIP =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    // --- Rate limiting : 5 demandes / 1h ---
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCodes = await db.securityChangeCode.count({
      where: { userId: auth.id, createdAt: { gt: oneHourAgo } },
    });
    if (recentCodes >= MAX_INITIATES_1H) {
      return NextResponse.json(
        { error: 'Trop de demandes. Réessayez dans une heure.' },
        { status: 429 }
      );
    }

    // --- Récupérer l'utilisateur + son email actuel ---
    const user = await db.user.findUnique({ where: { id: auth.id } });
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }
    const currentEmail = user.email;

    // --- Validation par type ---
    let pendingValue: string;
    let previewForEmail: string | undefined;

    if (changeType === 'email') {
      const normalized = newValue.toLowerCase().trim();
      const check = emailSchema.safeParse(normalized);
      if (!check.success) {
        return NextResponse.json({ error: 'Nouvel email invalide' }, { status: 400 });
      }
      if (normalized === currentEmail) {
        return NextResponse.json({ error: 'Le nouvel email est identique à l\'actuel' }, { status: 400 });
      }
      const existing = await db.user.findUnique({ where: { email: normalized } });
      if (existing && existing.id !== auth.id) {
        return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 });
      }
      pendingValue = normalized;
      previewForEmail = normalized; // montré dans l'email (pour confirmer visuellement)
    } else if (changeType === 'phone') {
      const normalized = newValue.trim();
      if (normalized.length < 6 || normalized.length > 20) {
        return NextResponse.json({ error: 'Numéro de téléphone invalide' }, { status: 400 });
      }
      if (user.phone && normalized === user.phone) {
        return NextResponse.json({ error: 'Le nouveau numéro est identique à l\'actuel' }, { status: 400 });
      }
      pendingValue = normalized;
      previewForEmail = normalized;
    } else {
      // password
      const pwCheck = passwordSchema.safeParse(newValue);
      if (!pwCheck.success) {
        return NextResponse.json({ error: pwCheck.error.issues[0].message }, { status: 400 });
      }
      // Vérifier l'ancien mot de passe
      if (!currentValue) {
        return NextResponse.json({ error: 'Mot de passe actuel requis' }, { status: 400 });
      }
      if (!user.password) {
        return NextResponse.json({ error: 'Aucun mot de passe défini' }, { status: 400 });
      }
      const ok = await bcrypt.compare(currentValue, user.password);
      if (!ok) {
        return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 });
      }
      // Hasher le nouveau password (sera stocké dans pendingValue)
      pendingValue = await bcrypt.hash(newValue, 10);
      previewForEmail = undefined; // ne pas afficher le password dans l'email
    }

    // --- Vérifier que le SMTP est configuré ---
    if (!isEmailConfigured()) {
      return NextResponse.json({ error: 'Service email non configuré. Réessayez plus tard.' }, { status: 503 });
    }

    // --- Invalider les anciens codes non utilisés (même changeType) ---
    await db.securityChangeCode.updateMany({
      where: { userId: auth.id, changeType, usedAt: null },
      data: { usedAt: new Date() },
    });

    // --- Générer + stocker le code ---
    const rawCode = generateVerificationCode();
    const codeHash = hashCode(rawCode);

    await db.securityChangeCode.create({
      data: {
        userId: auth.id,
        changeType,
        codeHash,
        pendingValue,
        expiresAt: new Date(Date.now() + CODE_TTL_MIN * 60 * 1000),
        ipAddress: clientIP,
      },
    });

    // --- Envoyer l'email à l'ADRESSE ACTUELLE (jamais la nouvelle) ---
    const result = await sendSecurityChangeCodeEmail(
      currentEmail,
      rawCode,
      changeType,
      previewForEmail
    );

    if (!result.success) {
      // Marquer le code comme utilisé pour éviter qu'il reste pending sans email
      await db.securityChangeCode.updateMany({
        where: { userId: auth.id, changeType, codeHash, usedAt: null },
        data: { usedAt: new Date() },
      });
      return NextResponse.json({ error: 'Erreur lors de l\'envoi de l\'email. Réessayez.' }, { status: 502 });
    }

    return NextResponse.json({
      message: 'Un code de confirmation a été envoyé à votre adresse email actuelle.',
    });
  } catch (error) {
    console.error('POST /api/profile/security/initiate error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
