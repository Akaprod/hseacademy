// ============================================================================
// GET    /api/assistant/llm/providers/[id]   — fetch one provider
// PATCH  /api/assistant/llm/providers/[id]  — update provider (priority, model, etc.)
// DELETE /api/assistant/llm/providers/[id]   — delete provider (cascades API keys)
// ============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const provider = await db.assistantLlmProvider.findUnique({ where: { id } });
    if (!provider) {
      return NextResponse.json({ error: 'Provider introuvable' }, { status: 404 });
    }
    return NextResponse.json({
      provider: {
        ...provider,
        availableModels: (() => { try { return JSON.parse(provider.availableModels || '[]'); } catch { return []; } })(),
      },
    });
  } catch (error: any) {
    console.error('GET /api/assistant/llm/providers/[id] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

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

    // Whitelist fields (code is NOT editable — it's the immutable identifier)
    if (typeof body.displayName === 'string' && body.displayName.length > 0 && body.displayName.length <= 50) {
      updates.displayName = body.displayName;
    }
    if (typeof body.baseUrl === 'string' && body.baseUrl.startsWith('http')) {
      updates.baseUrl = body.baseUrl;
    }
    if (typeof body.defaultModel === 'string' && body.defaultModel.length > 0 && body.defaultModel.length <= 100) {
      updates.defaultModel = body.defaultModel;
    }
    if (typeof body.enabled === 'boolean') {
      updates.enabled = body.enabled;
    }
    if (typeof body.priority === 'number' && body.priority > 0 && body.priority < 1000) {
      updates.priority = body.priority;
    }
    if (typeof body.adapter === 'string' && ['openai_compatible', 'zai_native'].includes(body.adapter)) {
      updates.adapter = body.adapter;
    }
    if (body.availableModels !== undefined) {
      if (Array.isArray(body.availableModels)) {
        if (!body.availableModels.every((m: any) => typeof m === 'string' && m.length > 0 && m.length < 100)) {
          return NextResponse.json({ error: 'availableModels doit être un tableau de strings' }, { status: 400 });
        }
        updates.availableModels = JSON.stringify(body.availableModels);
      }
    }

    const updated = await db.assistantLlmProvider.update({ where: { id }, data: updates });
    return NextResponse.json({ provider: { id: updated.id, updatedAt: updated.updatedAt } });
  } catch (error: any) {
    console.error('PATCH /api/assistant/llm/providers/[id] error:', error);
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
    // Verify it exists first
    const existing = await db.assistantLlmProvider.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Provider introuvable' }, { status: 404 });
    }
    // Cascade delete happens automatically (apiKeys relation has onDelete: Cascade)
    await db.assistantLlmProvider.delete({ where: { id } });
    return NextResponse.json({ success: true, deleted: id });
  } catch (error: any) {
    console.error('DELETE /api/assistant/llm/providers/[id] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
