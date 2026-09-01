import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const items = await db.menuItem.findMany({
      where: { parentId: null },
      include: { children: { orderBy: { order: 'asc' } } },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ menus: items });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { label, page, url, parentId, order, icon, target, visible } = body;

    if (!label) return NextResponse.json({ error: 'Label requis' }, { status: 400 });

    const item = await db.menuItem.create({
      data: {
        label,
        page: page || null,
        url: url || null,
        parentId: parentId || null,
        order: order || 0,
        icon: icon || null,
        target: target || '_self',
        visible: visible !== false,
      },
      include: { children: true },
    });
    return NextResponse.json({ menuItem: item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}