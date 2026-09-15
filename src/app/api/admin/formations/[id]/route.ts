import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

import { requireAdmin } from '@/lib/auth';
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
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
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const body = await request.json();
    const existing = await db.formation.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Formation non trouvée' }, { status: 404 });

    // Check seoSlug uniqueness if being changed (or set if previously null)
    if (body.seoSlug !== undefined) {
      const newSeoSlug = body.seoSlug && body.seoSlug.trim() ? body.seoSlug.trim() : null;
      if (newSeoSlug && newSeoSlug !== existing.seoSlug) {
        const conflicting = await db.formation.findFirst({
          where: { seoSlug: newSeoSlug, NOT: { id } },
        });
        if (conflicting) {
          return NextResponse.json({ error: 'Ce slug SEO est déjà utilisé par une autre formation' }, { status: 409 });
        }
      }
    }

    const data: Record<string, unknown> = {};
    // Existing fields
    if (body.title !== undefined) data.title = body.title;
    if (body.slug !== undefined) data.slug = body.slug;
    if (body.shortDescription !== undefined) data.shortDescription = body.shortDescription;
    if (body.fullDescription !== undefined) data.fullDescription = body.fullDescription;
    if (body.level !== undefined) data.level = body.level;
    if (body.duration !== undefined) data.duration = body.duration;
    if (body.durationHours !== undefined) data.durationHours = body.durationHours || null;
    if (body.prerequisites !== undefined) data.prerequisites = body.prerequisites;
    if (body.objectives !== undefined) data.objectives = JSON.stringify(body.objectives);
    if (body.program !== undefined) data.program = JSON.stringify(body.program);
    if (body.price !== undefined) data.price = body.price;
    if (body.priceIndividual !== undefined) data.priceIndividual = body.priceIndividual || null;
    if (body.priceGroup !== undefined) data.priceGroup = body.priceGroup || null;
    if (body.priceEnterprise !== undefined) data.priceEnterprise = body.priceEnterprise || null;
    if (body.mode !== undefined) data.mode = body.mode;
    if (body.type !== undefined) {
      // Validate enum
      if (body.type !== 'diplomante' && body.type !== 'certifiante') {
        return NextResponse.json({ error: 'Type invalide (diplomante ou certifiante)' }, { status: 400 });
      }
      data.type = body.type;
    }
    if (body.coverImage !== undefined) data.coverImage = body.coverImage || null;
    if (body.featured !== undefined) data.featured = body.featured;
    if (body.order !== undefined) data.order = body.order;

    // New fields
    if (body.archived !== undefined) data.archived = body.archived;
    if (body.seoTitle !== undefined) data.seoTitle = body.seoTitle || null;
    if (body.seoDescription !== undefined) data.seoDescription = body.seoDescription || null;
    if (body.seoKeywords !== undefined) data.seoKeywords = body.seoKeywords || null;
    if (body.seoImage !== undefined) data.seoImage = body.seoImage || null;
    if (body.seoSlug !== undefined) {
      data.seoSlug = body.seoSlug && body.seoSlug.trim() ? body.seoSlug.trim() : null;
    }
    if (body.seoRobots !== undefined) data.seoRobots = body.seoRobots;
    if (body.seoCanonical !== undefined) data.seoCanonical = body.seoCanonical || null;
    if (body.seoOgTitle !== undefined) data.seoOgTitle = body.seoOgTitle || null;
    if (body.seoOgDescription !== undefined) data.seoOgDescription = body.seoOgDescription || null;
    if (body.seoOgImage !== undefined) data.seoOgImage = body.seoOgImage || null;
    if (body.careerOutcomes !== undefined) data.careerOutcomes = JSON.stringify(body.careerOutcomes);
    if (body.degreeType !== undefined) data.degreeType = body.degreeType || null;
    if (body.certificateValidity !== undefined) data.certificateValidity = body.certificateValidity || null;
    if (body.certificatePrefix !== undefined) data.certificatePrefix = body.certificatePrefix || null;
    if (body.mandatoryPrerequisites !== undefined) data.mandatoryPrerequisites = JSON.stringify(body.mandatoryPrerequisites);
    if (body.targetAudience !== undefined) data.targetAudience = body.targetAudience || null;
    if (body.certifyingBody !== undefined) data.certifyingBody = body.certifyingBody || null;

    const formation = await db.formation.update({ where: { id }, data });
    return NextResponse.json({ formation });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    if (msg.includes('Unique')) {
      if (msg.includes('seoSlug')) {
        return NextResponse.json({ error: 'Ce slug SEO est déjà utilisé' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Slug déjà utilisé' }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    await db.formation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
