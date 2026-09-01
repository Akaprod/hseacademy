import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams;
    const level = url.get('level');
    const featured = url.get('featured');
    const type = url.get('type');

    const where: Record<string, unknown> = {};
    if (level && level !== 'all') where.level = level;
    if (featured === 'true') where.featured = true;
    if (type) where.type = type;

    const formations = await db.formation.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ formations });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}