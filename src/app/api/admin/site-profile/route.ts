import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/site-profile — récupère le profil du site (singleton)
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    let profile = await db.siteProfile.findUnique({ where: { id: 'default' } });
    if (!profile) {
      // Auto-create on first call
      profile = await db.siteProfile.create({ data: { id: 'default' } });
    }
    return NextResponse.json({ profile });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT /api/admin/site-profile — met à jour le profil du site
export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const {
      siteName, siteLogo, siteDescription, siteKeywords, siteUrl,
      gscVerification,
      facebook, twitter, linkedin, instagram, youtube,
    } = body;

    // Upsert (creates if missing)
    const profile = await db.siteProfile.upsert({
      where: { id: 'default' },
      create: { id: 'default', siteName, siteLogo, siteDescription, siteKeywords, siteUrl, gscVerification, facebook, twitter, linkedin, instagram, youtube },
      update: {
        ...(siteName !== undefined ? { siteName } : {}),
        ...(siteLogo !== undefined ? { siteLogo } : {}),
        ...(siteDescription !== undefined ? { siteDescription } : {}),
        ...(siteKeywords !== undefined ? { siteKeywords } : {}),
        ...(siteUrl !== undefined ? { siteUrl } : {}),
        ...(gscVerification !== undefined ? { gscVerification } : {}),
        ...(facebook !== undefined ? { facebook } : {}),
        ...(twitter !== undefined ? { twitter } : {}),
        ...(linkedin !== undefined ? { linkedin } : {}),
        ...(instagram !== undefined ? { instagram } : {}),
        ...(youtube !== undefined ? { youtube } : {}),
      },
    });

    return NextResponse.json({ profile });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
