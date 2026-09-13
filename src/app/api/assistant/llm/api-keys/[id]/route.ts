// ============================================================================
// PATCH  /api/assistant/llm/api-keys/[id]   — update (label, priority, enabled)
// DELETE /api/assistant/llm/api-keys/[id]   — delete key
// ============================================================================
// SÉCURITÉ : apiKey n'est JAMAIS sélectionné. PATCH ne permet PAS de modifier
// la valeur de la clé (admin doit supprimer + recréer pour rotation).
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const body = await req.json();
    const updates: any = {};

    if (typeof body.label === 'string' && body.label.length >= 1 && body.label.length <= 80) {
      updates.label = body.label;
    }
    if (typeof body.priority === 'number' && body.priority > 0 && body.priority < 1000) {
      updates.priority = body.priority;
    }
    if (typeof body.enabled === 'boolean') {
      updates.enabled = body.enabled;
      // If enabling, also clear 'disabled' status back to active
      if (body.enabled) {
        const existing = await db.assistantLlmApiKey.findUnique({ where: { id }, select: { status: true } });
        if (existing?.status === 'disabled' || existing?.status === 'invalid') {
          updates.status = 'active';
        }
      } else {
        // If disabling, set status to disabled
        updates.status = 'disabled';
      }
    }
    // Allow manual status reset (e.g. clear rate_limited back to active)
    if (typeof body.status === 'string' && ['active', 'rate_limited', 'quota_exhausted', 'auth_error', 'network_error', 'disabled', 'invalid', 'never_used'].includes(body.status)) {
      updates.status = body.status;
    }

    const updated = await db.assistantLlmApiKey.update({
      where: { id },
      data: updates,
      select: {
        id: true,
        providerId: true,
        label: true,
        keyHint: true,
        enabled: true,
        priority: true,
        status: true,
        updatedAt: true,
      },
    });
    return NextResponse.json({ apiKey: updated });
  } catch (error: any) {
    console.error('PATCH /api/assistant/llm/api-keys/[id] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const existing = await db.assistantLlmApiKey.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'API key introuvable' }, { status: 404 });
    }
    await db.assistantLlmApiKey.delete({ where: { id } });
    return NextResponse.json({ success: true, deleted: id });
  } catch (error: any) {
    console.error('DELETE /api/assistant/llm/api-keys/[id] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
