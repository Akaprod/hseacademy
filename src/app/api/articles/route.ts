import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams;
    const categoryId = url.get('categoryId');
    const search = url.get('search');
    const featured = url.get('featured');
    const page = parseInt(url.get('page') || '1');
    const limit = parseInt(url.get('limit') || '12');

    const where: Record<string, unknown> = { published: true };

    if (categoryId) where.categoryId = categoryId;
    if (search) where.title = { contains: search };
    if (featured === 'true') where.featured = true;

    const skip = (page - 1) * limit;
    const [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        include: { category: true, _count: { select: { comments: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.article.count({ where }),
    ]);

    return NextResponse.json({ articles, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Protection C4 : réservé à un admin authentifié
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const article = await db.article.create({ data: body });
    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}