import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
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