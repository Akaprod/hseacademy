import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const c = await db.category.findUnique({ where: { id }, include: { _count: { select: { articles: true } } } });
    if (!c) return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 });
    return NextResponse.json({ category: c });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data: Record<string, unknown> = {};
    if (body.name) data.name = body.name;
    if (body.description !== undefined) data.description = body.description;
    if (body.color) data.color = body.color;
    if (body.order !== undefined) data.order = body.order;

    const category = await db.category.update({ where: { id }, data });
    return NextResponse.json({ category });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    if (msg.includes('Unique')) return NextResponse.json({ error: 'Slug déjà utilisé' }, { status: 409 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const articlesCount = await db.article.count({ where: { categoryId: id } });
    if (articlesCount > 0) {
      return NextResponse.json({ error: `Impossible de supprimer: ${articlesCount} article(s) lié(s)` }, { status: 400 });
    }
    await db.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}