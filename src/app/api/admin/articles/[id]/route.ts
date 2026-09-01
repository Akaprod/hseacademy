import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const article = await db.article.findUnique({
      where: { id },
      include: { category: true, comments: { orderBy: { createdAt: 'desc' }, take: 20, include: { user: { select: { id: true, name: true, email: true } } } } },
    });
    if (!article) return NextResponse.json({ error: 'Article non trouvé' }, { status: 404 });
    return NextResponse.json({ article });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, slug, content, excerpt, coverImage, published, featured, authorName, categoryId } = body;

    const existing = await db.article.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Article non trouvé' }, { status: 404 });

    let newSlug = existing.slug;
    if (title) {
      newSlug = slug || title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const article = await db.article.update({
      where: { id },
      data: {
        ...(title && { title }),
        slug: newSlug,
        ...(content !== undefined && { content }),
        ...(excerpt !== undefined && { excerpt }),
        ...(coverImage !== undefined && { coverImage }),
        ...(published !== undefined && { published }),
        ...(featured !== undefined && { featured }),
        ...(authorName && { authorName }),
        ...(categoryId && { categoryId }),
      },
    });
    return NextResponse.json({ article });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    if (msg.includes('Unique')) return NextResponse.json({ error: 'Slug déjà utilisé' }, { status: 409 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.comment.deleteMany({ where: { articleId: id } });
    await db.article.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}