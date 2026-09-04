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
    const categoryId = url.get('categoryId') || '';
    const published = url.get('published');
    const sortBy = url.get('sortBy') || 'createdAt';
    const sortOrder = url.get('sortOrder') || 'desc';

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (published !== null && published !== '') {
      where.published = published === 'true';
    }

    const [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true, color: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { [sortBy]: sortOrder as 'asc' | 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.article.count({ where }),
    ]);

    return NextResponse.json({ articles, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const { title, content, excerpt, coverImage, published, featured, authorName, categoryId } = body;

    if (!title || !categoryId) {
      return NextResponse.json({ error: 'Titre et catégorie requis' }, { status: 400 });
    }

    const slug = body.slug || title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const article = await db.article.create({
      data: {
        title,
        slug,
        content: content || '',
        excerpt: excerpt || '',
        coverImage: coverImage || null,
        published: published !== false,
        featured: featured || false,
        authorName: authorName || 'IICP',
        categoryId,
      },
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    if (msg.includes('Unique')) {
      return NextResponse.json({ error: 'Un article avec ce slug existe déjà' }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}