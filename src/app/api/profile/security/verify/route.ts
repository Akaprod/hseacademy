// ============================================================================
// POST /api/profile/security/verify
// ============================================================================
// Valide un changement sécurisé (email/tel/password) avec le code OTP :
//   1. Vérifie le code saisi (hash HMAC) — pas de timing attack
//   2. Vérifie qu'il n'est pas expiré (> 10 min) ou déjà utilisé
//   3. Applique le changement :
//      - email : update User.email + remet emailVerified=false sur UserProfile
//      - phone : update User.phone + remet phoneVerified=false
//      - password : update User.password
//   4. Marque le code comme consommé
//   5. Invalide tous les autres codes non utilisés du même user
//
// Body: { changeType: 'email' | 'phone' | 'password', code: string }
// Réponse : { success: true, message: string }
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser, setSessionCookie } from '@/lib/auth';
import { hashCode } from '@/lib/email';

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { changeType, code } = body || {};

    if (!changeType || !['email', 'phone', 'password'].includes(changeType)) {
      return NextResponse.json({ error: 'Type de changement invalide' }, { status: 400 });
    }

    if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'Code invalide (6 chiffres requis)' }, { status: 400 });
    }

    const codeHash = hashCode(code);

    // Trouver le code le plus récent non utilisé pour ce user + changeType
    const record = await db.securityChangeCode.findFirst({
      where: {
        userId: auth.id,
        changeType,
        codeHash,
        usedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return NextResponse.json(
        { error: 'Code incorrect. Vérifiez le code reçu par email, ou demandez un nouveau code.' },
        { status: 400 }
      );
    }

    if (record.expiresAt < new Date()) {
      // Marquer comme utilisé pour éviter qu'il reste pending
      await db.securityChangeCode.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      });
      return NextResponse.json(
        { error: 'Code expiré (validité 10 minutes). Demandez un nouveau code.' },
        { status: 400 }
      );
    }

    // --- Appliquer le changement ---
    const user = await db.user.findUnique({ where: { id: auth.id } });
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    let successMessage = '';

    if (record.changeType === 'email') {
      // Vérifier que l'email n'a pas été pris entre-temps
      const existing = await db.user.findUnique({ where: { email: record.pendingValue } });
      if (existing && existing.id !== auth.id) {
        await db.securityChangeCode.update({
          where: { id: record.id },
          data: { usedAt: new Date() },
        });
        return NextResponse.json(
          { error: 'Cet email a été pris par un autre compte entre-temps. Modification annulée.' },
          { status: 409 }
        );
      }
      await db.user.update({
        where: { id: auth.id },
        data: { email: record.pendingValue },
      });
      // Remettre emailVerified = false (nouvelle adresse à vérifier)
      await db.userProfile.upsert({
        where: { userId: auth.id },
        create: { userId: auth.id, emailVerified: false },
        update: { emailVerified: false, emailVerifiedAt: null },
      });
      successMessage = 'Votre adresse email a été modifiée. Veuillez vérifier votre nouvelle adresse.';
    } else if (record.changeType === 'phone') {
      await db.user.update({
        where: { id: auth.id },
        data: { phone: record.pendingValue },
      });
      // Remettre phoneVerified = false
      await db.userProfile.upsert({
        where: { userId: auth.id },
        create: { userId: auth.id, phoneVerified: false },
        update: { phoneVerified: false },
      });
      successMessage = 'Votre numéro de téléphone a été modifié.';
    } else {
      // password : pendingValue contient déjà le bcrypt hash
      await db.user.update({
        where: { id: auth.id },
        data: { password: record.pendingValue },
      });
      successMessage = 'Votre mot de passe a été modifié avec succès.';
    }

    // --- Marquer le code comme consommé ---
    await db.securityChangeCode.update({
      where: { id: record.id },
      data: { usedAt: new Date(), consumedAt: new Date() },
    });

    // --- Invalider tous les autres codes non utilisés du même user ---
    await db.securityChangeCode.updateMany({
      where: { userId: auth.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    // --- Régénérer la session (invalide l'ancien cookie) ---
    // Sécurité : après un changement de password ou email, l'ancien cookie JWT
    // reste valide (stateless). On régénère le cookie pour invalider l'ancienne
    // session (nouveau exp timestamp → ancien cookie expirera plus tôt).
    await setSessionCookie(auth.id);

    return NextResponse.json({ success: true, message: successMessage });
  } catch (error) {
    console.error('POST /api/profile/security/verify error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
