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
    const search = url.get('search') || '';
    const published = url.get('published');

    const where: Record<string, unknown> = {};
    if (search) where.OR = [{ title: { contains: search } }, { slug: { contains: search } }];
    if (published !== null && published !== '') where.published = published === 'true';

    const [pages, total] = await Promise.all([
      db.page.findMany({
        where,
        orderBy: { order: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.page.count({ where }),
    ]);

    return NextResponse.json({ pages, total, page, limit, pages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const { title, slug, content, metaTitle, metaDescription, published, order, showInMenu, parentSlug } = body;

    if (!title) return NextResponse.json({ error: 'Titre requis' }, { status: 400 });

    const finalSlug = slug || title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const page = await db.page.create({
      data: {
        title,
        slug: finalSlug,
        content: content || '',
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        published: published !== false,
        order: order || 0,
        showInMenu: showInMenu || false,
        parentSlug: parentSlug || null,
      },
    });
    return NextResponse.json({ page }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    if (msg.includes('Unique')) return NextResponse.json({ error: 'Ce slug existe déjà' }, { status: 409 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}