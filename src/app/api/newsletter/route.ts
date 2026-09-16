import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkIpRateLimit, getClientIP } from '@/lib/rate-limit';

// Rate limit IP: 10 inscriptions / heure
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  // Rate limit par IP
  const clientIP = getClientIP(request);
  const rl = checkIpRateLimit(clientIP, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Trop de demandes. Réessayez plus tard.' },
      { status: 429 }
    );
  }
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    const newsletter = await db.newsletter.upsert({
      where: { email },
      update: { active: true },
      create: { email, active: true },
    });

    return NextResponse.json({
      message: 'Inscription à la newsletter réussie !',
      email: newsletter.email,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}