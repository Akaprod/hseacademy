import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// POST /api/admin/formations/[id]/archive — archive (soft delete)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const existing = await db.formation.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Formation non trouvée' }, { status: 404 });

    await db.formation.update({ where: { id }, data: { archived: true } });
    return NextResponse.json({ success: true, archived: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
