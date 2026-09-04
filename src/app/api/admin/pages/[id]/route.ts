import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

import { requireAdmin } from '@/lib/auth';
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const p = await db.page.findUnique({ where: { id } });
    if (!p) return NextResponse.json({ error: 'Page non trouvée' }, { status: 404 });
    return NextResponse.json({ page: p });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const body = await request.json();
    const data: Record<string, unknown> = {};
    if (body.title) data.title = body.title;
    if (body.content !== undefined) data.content = body.content;
    if (body.metaTitle !== undefined) data.metaTitle = body.metaTitle;
    if (body.metaDescription !== undefined) data.metaDescription = body.metaDescription;
    if (body.published !== undefined) data.published = body.published;
    if (body.order !== undefined) data.order = body.order;
    if (body.showInMenu !== undefined) data.showInMenu = body.showInMenu;
    if (body.parentSlug !== undefined) data.parentSlug = body.parentSlug;

    const page = await db.page.update({ where: { id }, data });
    return NextResponse.json({ page });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    if (msg.includes('Unique')) return NextResponse.json({ error: 'Slug déjà utilisé' }, { status: 409 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    await db.page.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}