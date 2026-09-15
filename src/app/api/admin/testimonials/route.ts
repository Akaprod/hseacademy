import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

import { requireAdmin } from '@/lib/auth';
export async function GET() {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  try {
    const testimonials = await db.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ testimonials });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const { name, role, company, content, avatar, rating, featured } = body;
    if (!name || !content) return NextResponse.json({ error: 'Nom et contenu requis' }, { status: 400 });

    const testimonial = await db.testimonial.create({
      data: { name, role: role || '', company: company || null, content, avatar: avatar || null, rating: rating || 5, featured: featured || false },
    });
    return NextResponse.json({ testimonial }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}