import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkIpRateLimit, getClientIP } from '@/lib/rate-limit';

// Rate limit IP: 5 messages / heure
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  // Rate limit par IP
  const clientIP = getClientIP(request);
  const rl = checkIpRateLimit(clientIP, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Trop de messages envoyés. Réessayez dans une heure.' },
      { status: 429 }
    );
  }
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 });
    }

    const contactMessage = await db.contactMessage.create({
      data: { name, email, phone: phone || null, subject, message },
    });

    return NextResponse.json({
      message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}