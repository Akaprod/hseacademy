// GET/PUT /api/assistant/behavior — Admin only (Phase 2 — Personnalité)
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getBehavior, updateBehavior, STYLE_OPTIONS, TONE_OPTIONS, LENGTH_OPTIONS } from '@/assistant/services/behavior';

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const behavior = await getBehavior();
    return NextResponse.json({
      behavior,
      options: {
        styles: STYLE_OPTIONS,
        tones: TONE_OPTIONS,
        lengths: LENGTH_OPTIONS,
      },
    });
  } catch (error) {
    console.error('GET /api/assistant/behavior error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await req.json();
    const updates: any = {};
    if (typeof body.style === 'string' && STYLE_OPTIONS.some(o => o.value === body.style)) updates.style = body.style;
    if (typeof body.tone === 'string' && TONE_OPTIONS.some(o => o.value === body.tone)) updates.tone = body.tone;
    if (typeof body.responseLength === 'string' && LENGTH_OPTIONS.some(o => o.value === body.responseLength)) updates.responseLength = body.responseLength;
    if (typeof body.customGuidelines === 'string' && body.customGuidelines.length <= 5000) updates.customGuidelines = body.customGuidelines;
    const updated = await updateBehavior(updates, auth.id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/assistant/behavior error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
