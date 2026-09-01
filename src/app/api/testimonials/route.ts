import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams;
    const featured = url.get('featured');
    const limit = parseInt(url.get('limit') || '10');

    const where: Record<string, unknown> = {};
    if (featured === 'true') where.featured = true;

    const testimonials = await db.testimonial.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ testimonials });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}