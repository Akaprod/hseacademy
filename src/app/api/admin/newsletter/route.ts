import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

import { requireAdmin } from '@/lib/auth';
export async function GET(request: NextRequest) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  try {
    const url = request.nextUrl.searchParams;
    const page = parseInt(url.get('page') || '1');
    const limit = parseInt(url.get('limit') || '20');

    const [subscribers, total] = await Promise.all([
      db.newsletter.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.newsletter.count(),
    ]);

    return NextResponse.json({ subscribers, total, page, limit, pages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const { ids } = body;
    if (!ids || !Array.isArray(ids)) return NextResponse.json({ error: 'IDs requis' }, { status: 400 });

    await db.newsletter.deleteMany({ where: { id: { in: ids } } });
    return NextResponse.json({ success: true, deleted: ids.length });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}