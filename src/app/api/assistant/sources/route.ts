// GET/PUT /api/assistant/sources — Admin only (Phase 2 — Sources de connaissance)
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getAllSources, updateSource, SOURCE_METADATA } from '@/assistant/services/sources';
import type { KnowledgeSourceCategory } from '@/assistant/types';

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const sources = await getAllSources();
    return NextResponse.json({
      sources,
      metadata: SOURCE_METADATA,
    });
  } catch (error) {
    console.error('GET /api/assistant/sources error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await req.json();
    const { category, enabled } = body;
    if (!category || !Object.keys(SOURCE_METADATA).includes(category)) {
      return NextResponse.json({ error: 'Catégorie invalide' }, { status: 400 });
    }
    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'enabled doit être un booléen' }, { status: 400 });
    }
    const updated = await updateSource(category as KnowledgeSourceCategory, { enabled }, auth.id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/assistant/sources error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
