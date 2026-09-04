import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashToken } from '@/lib/email';

// GET /api/auth/verify-email?token=... — vérifier email via token
export async function GET(req: NextRequest) {
  try {
    const token = new URL(req.url).searchParams.get('token');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 400 });
    }

    const tokenHash = hashToken(token);
    const record = await db.emailVerificationToken.findUnique({
      where: { token: tokenHash },
    });

    if (!record) {
      return NextResponse.redirect(new URL('/?verify=invalid', req.url));
    }

    if (record.usedAt) {
      return NextResponse.redirect(new URL('/?verify=already-used', req.url));
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.redirect(new URL('/?verify=expired', req.url));
    }

    // Marquer comme utilisé
    await db.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    // Marquer email comme vérifié dans le profil
    await db.userProfile.upsert({
      where: { userId: record.userId },
      create: { userId: record.userId, emailVerified: true, emailVerifiedAt: new Date() },
      update: { emailVerified: true, emailVerifiedAt: new Date() },
    });

    return NextResponse.redirect(new URL('/?verify=success', req.url));
  } catch (error) {
    console.error('GET /api/auth/verify-email error:', error);
    return NextResponse.redirect(new URL('/?verify=error', req.url));
  }
}
