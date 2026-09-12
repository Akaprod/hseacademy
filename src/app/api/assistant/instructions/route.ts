// GET/PUT /api/assistant/instructions — Admin only
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getAllInstructions, updateInstruction } from '@/assistant/services/instructions';
import type { InstructionCategory } from '@/assistant/types';

const VALID_CATEGORIES: InstructionCategory[] = ['general', 'commercial', 'user', 'admin', 'limits'];

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    return NextResponse.json({ instructions: await getAllInstructions() });
  } catch (error) {
    console.error('GET /api/assistant/instructions error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await req.json();
    const { category, content } = body;
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Catégorie invalide' }, { status: 400 });
    }
    if (typeof content !== 'string' || content.length > 10000) {
      return NextResponse.json({ error: 'Contenu invalide (max 10000 caractères)' }, { status: 400 });
    }
    // ⚠️ 'system_safety' n'est PAS dans VALID_CATEGORIES → ne peut jamais être édité via cet endpoint
    const updated = await updateInstruction(category, content, auth.id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/assistant/instructions error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
