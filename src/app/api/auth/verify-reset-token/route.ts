// ============================================================================
// GET /api/auth/verify-reset-token?token=...
// ============================================================================
// Vérifie la validité d'un token de reset password (pour la page reset).
// Retourne: { valid: boolean, reason?: string }
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashToken } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const token = new URL(request.url).searchParams.get('token');

    if (!token) {
      return NextResponse.json({ valid: false, reason: 'Token manquant' }, { status: 400 });
    }

    const tokenHash = hashToken(token);
    const record = await db.passwordResetToken.findUnique({
      where: { token: tokenHash },
    });

    if (!record) {
      return NextResponse.json({ valid: false, reason: 'Token invalide' });
    }

    if (record.usedAt) {
      return NextResponse.json({ valid: false, reason: 'Ce lien a déjà été utilisé' });
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, reason: 'Ce lien a expiré (validité 10 minutes)' });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('GET /api/auth/verify-reset-token error:', error);
    return NextResponse.json({ valid: false, reason: 'Erreur serveur' }, { status: 500 });
  }
}
