import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const formations = await db.formation.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json({ formations });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, shortDescription, fullDescription, level, duration, prerequisites, objectives, program, price, mode, coverImage, featured, order } = body;

    if (!title || !shortDescription) {
      return NextResponse.json({ error: 'Titre et description requis' }, { status: 400 });
    }

    const finalSlug = slug || title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const formation = await db.formation.create({
      data: {
        title,
        slug: finalSlug,
        shortDescription,
        fullDescription: fullDescription || '',
        level: level || 'technicien',
        duration: duration || '',
        prerequisites: prerequisites || null,
        objectives: JSON.stringify(objectives || []),
        program: JSON.stringify(program || []),
        price: price || null,
        mode: mode || 'presentiel',
        coverImage: coverImage || null,
        featured: featured || false,
        order: order || 0,
      },
    });

    return NextResponse.json({ formation }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    if (msg.includes('Unique')) return NextResponse.json({ error: 'Ce slug existe déjà' }, { status: 409 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}