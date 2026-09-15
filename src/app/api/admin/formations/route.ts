import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

import { requireAdmin } from '@/lib/auth';

// GET /api/admin/formations?type=diplomante|certifiante&archived=all|true|false
// Admin only — returns ALL formations (including archived if ?archived=all or ?archived=true)
export async function GET(request: NextRequest) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'diplomante' | 'certifiante' | null
    const archivedParam = searchParams.get('archived') || 'false'; // 'all' | 'true' | 'false'

    const where: { type?: string; archived?: boolean } = {};
    if (type && (type === 'diplomante' || type === 'certifiante')) {
      where.type = type;
    }
    if (archivedParam === 'all') {
      // no filter on archived
    } else if (archivedParam === 'true') {
      where.archived = true;
    } else {
      where.archived = false;
    }

    const formations = await db.formation.findMany({ where, orderBy: { order: 'asc' } });
    return NextResponse.json({ formations });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const {
      title, slug, shortDescription, fullDescription, level, duration, durationHours,
      prerequisites, objectives, program, price, priceIndividual, priceGroup, priceEnterprise,
      mode, type, coverImage, featured, order,
      // New SEO + type-specific + archive fields
      archived,
      seoTitle, seoDescription, seoKeywords, seoImage, seoSlug, seoRobots, seoCanonical,
      seoOgTitle, seoOgDescription, seoOgImage,
      careerOutcomes, degreeType,
      certificateValidity, certificatePrefix, mandatoryPrerequisites,
      targetAudience, certifyingBody,
    } = body;

    if (!title || !shortDescription) {
      return NextResponse.json({ error: 'Titre et description requis' }, { status: 400 });
    }

    // Validate type enum
    const formationType = type && (type === 'certifiante') ? 'certifiante' : 'diplomante';

    const finalSlug = slug || title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check seoSlug uniqueness if provided
    if (seoSlug && seoSlug.trim()) {
      const existingSeo = await db.formation.findUnique({ where: { seoSlug: seoSlug.trim() } });
      if (existingSeo) {
        return NextResponse.json({ error: 'Ce slug SEO est déjà utilisé par une autre formation' }, { status: 409 });
      }
    }

    const formation = await db.formation.create({
      data: {
        title,
        slug: finalSlug,
        shortDescription,
        fullDescription: fullDescription || '',
        level: level || 'technicien',
        duration: duration || '',
        durationHours: durationHours || null,
        prerequisites: prerequisites || null,
        objectives: JSON.stringify(objectives || []),
        program: JSON.stringify(program || []),
        price: price || null,
        priceIndividual: priceIndividual || null,
        priceGroup: priceGroup || null,
        priceEnterprise: priceEnterprise || null,
        mode: mode || 'presentiel',
        type: formationType,
        coverImage: coverImage || null,
        featured: featured || false,
        order: order || 0,
        archived: archived || false,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        seoKeywords: seoKeywords || null,
        seoImage: seoImage || null,
        seoSlug: seoSlug && seoSlug.trim() ? seoSlug.trim() : null,
        seoRobots: seoRobots || 'index,follow',
        seoCanonical: seoCanonical || null,
        seoOgTitle: seoOgTitle || null,
        seoOgDescription: seoOgDescription || null,
        seoOgImage: seoOgImage || null,
        careerOutcomes: JSON.stringify(careerOutcomes || []),
        degreeType: degreeType || null,
        certificateValidity: certificateValidity || null,
        certificatePrefix: certificatePrefix || null,
        mandatoryPrerequisites: JSON.stringify(mandatoryPrerequisites || []),
        targetAudience: targetAudience || null,
        certifyingBody: certifyingBody || null,
      },
    });

    return NextResponse.json({ formation }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    if (msg.includes('Unique')) {
      // Could be slug OR seoSlug uniqueness
      if (msg.includes('seoSlug')) {
        return NextResponse.json({ error: 'Ce slug SEO est déjà utilisé' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Ce slug existe déjà' }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
