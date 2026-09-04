import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

import { requireAdmin } from '@/lib/auth';
export async function GET() {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  try {
    const categories = await db.category.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { articles: true } } },
    });
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const { name, slug, description, color, order } = body;
    if (!name) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });

    const finalSlug = slug || name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const category = await db.category.create({
      data: { name, slug: finalSlug, description: description || null, color: color || '#059669', order: order || 0 },
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    if (msg.includes('Unique')) return NextResponse.json({ error: 'Slug déjà utilisé' }, { status: 409 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}