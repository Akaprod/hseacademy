import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

import { requireAdmin } from '@/lib/auth';
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const body = await request.json();
    const data: Record<string, unknown> = {};
    if (body.label) data.label = body.label;
    if (body.page !== undefined) data.page = body.page;
    if (body.url !== undefined) data.url = body.url;
    if (body.order !== undefined) data.order = body.order;
    if (body.icon !== undefined) data.icon = body.icon;
    if (body.target) data.target = body.target;
    if (body.visible !== undefined) data.visible = body.visible;

    const item = await db.menuItem.update({ where: { id }, data, include: { children: true } });
    return NextResponse.json({ menuItem: item });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    await db.menuItem.deleteMany({ where: { parentId: id } });
    await db.menuItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}