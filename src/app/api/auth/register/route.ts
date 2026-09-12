import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { setSessionCookie } from '@/lib/auth';
import { passwordSchema, emailSchema, validateAndNormalizePhone, fullNameSchema } from '@/lib/validation';
import { generateVerificationToken, hashToken, sendVerificationEmail, isEmailConfigured } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, confirmPassword, phone, phoneCountry } = body;

    // --- Validation nom ---
    const nameCheck = fullNameSchema.safeParse(name);
    if (!nameCheck.success) {
      return NextResponse.json({ error: nameCheck.error.issues[0].message }, { status: 400 });
    }

    // --- Validation email ---
    const emailCheck = emailSchema.safeParse(email);
    if (!emailCheck.success) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    // --- Validation mot de passe ---
    const pwCheck = passwordSchema.safeParse(password);
    if (!pwCheck.success) {
      return NextResponse.json({ error: pwCheck.error.issues[0].message }, { status: 400 });
    }

    // --- Confirmation mot de passe ---
    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Les mots de passe ne correspondent pas' }, { status: 400 });
    }

    // --- Validation téléphone ---
    let phoneNormalized: string | null = null;
    let phoneCountryCode: string | null = null;
    if (phone && phone.trim()) {
      const phoneResult = validateAndNormalizePhone(phone, phoneCountry);
      if (!phoneResult.valid) {
        return NextResponse.json({ error: phoneResult.error || 'Téléphone invalide' }, { status: 400 });
      }
      phoneNormalized = phoneResult.normalized;
      phoneCountryCode = phoneResult.country || null;
    }

    // --- Email unique (case-insensitive via findFirst) ---
    const normalizedEmail = email.toLowerCase().trim();
    const existingEmail = await db.user.findFirst({
      where: { email: { equals: normalizedEmail } },
    });
    if (existingEmail) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 });
    }

    // --- Téléphone unique (si fourni) ---
    if (phoneNormalized) {
      const existingPhone = await db.userProfile.findUnique({
        where: { phoneNormalized },
      });
      if (existingPhone) {
        return NextResponse.json({ error: 'Ce numéro de téléphone est déjà utilisé' }, { status: 409 });
      }
    }

    // --- Création User ---
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phoneNormalized || phone?.trim() || null,
      },
    });

    // --- Création UserProfile ---
    await db.userProfile.create({
      data: {
        userId: user.id,
        phoneNormalized,
        phoneCountry: phoneCountryCode,
      },
    });

    // --- Auto-login ---
    await setSessionCookie(user.id);

    // --- Envoi email de vérification ---
    let emailSent = false;
    let emailError: string | undefined;
    if (isEmailConfigured()) {
      const rawToken = generateVerificationToken();
      const tokenHash = hashToken(rawToken);
      await db.emailVerificationToken.create({
        data: {
          userId: user.id,
          token: tokenHash,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
        },
      });
      const result = await sendVerificationEmail(user.email, rawToken);
      emailSent = result.success;
      emailError = result.error;
    }

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({
      user: userWithoutPassword,
      emailVerificationSent: emailSent,
      emailVerificationError: emailError,
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/auth/register error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
