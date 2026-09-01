import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const f = await db.formation.findUnique({ where: { id } });
    if (!f) return NextResponse.json({ error: 'Formation non trouvée' }, { status: 404 });
    return NextResponse.json({ formation: f });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const existing = await db.formation.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Formation non trouvée' }, { status: 404 });

    const data: Record<string, unknown> = {};
    if (body.title) data.title = body.title;
    if (body.shortDescription) data.shortDescription = body.shortDescription;
    if (body.fullDescription !== undefined) data.fullDescription = body.fullDescription;
    if (body.level) data.level = body.level;
    if (body.duration) data.duration = body.duration;
    if (body.prerequisites !== undefined) data.prerequisites = body.prerequisites;
    if (body.objectives !== undefined) data.objectives = JSON.stringify(body.objectives);
    if (body.program !== undefined) data.program = JSON.stringify(body.program);
    if (body.price !== undefined) data.price = body.price;
    if (body.mode) data.mode = body.mode;
    if (body.coverImage !== undefined) data.coverImage = body.coverImage;
    if (body.featured !== undefined) data.featured = body.featured;
    if (body.order !== undefined) data.order = body.order;

    const formation = await db.formation.update({ where: { id }, data });
    return NextResponse.json({ formation });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    if (msg.includes('Unique')) return NextResponse.json({ error: 'Slug déjà utilisé' }, { status: 409 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.formation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}