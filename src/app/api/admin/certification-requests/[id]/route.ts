// ============================================================================
// GET    /api/admin/certification-requests/[id] — Détail (ADMIN)
// PATCH  /api/admin/certification-requests/[id] — Update statut + notes (ADMIN)
// DELETE /api/admin/certification-requests/[id] — Supprimer (ADMIN)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const item = await db.certificationRequest.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error('GET /api/admin/certification-requests/[id] error:', error);
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
    const { status, adminNotes } = body || {};

    const existing = await db.certificationRequest.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });
    }

    const data: any = {};
    if (status && ['pending', 'contacted', 'liste_attente', 'confirmed', 'rejected'].includes(status)) {
      data.status = status;
      if (status !== 'pending' && status !== existing.status) {
        data.reviewedBy = auth.id;
        data.reviewedAt = new Date();
      }
    }
    if (typeof adminNotes === 'string') {
      data.adminNotes = adminNotes;
    }

    const updated = await db.certificationRequest.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PATCH /api/admin/certification-requests/[id] error:', error);
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
    const existing = await db.certificationRequest.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });
    }

    await db.certificationRequest.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/certification-requests/[id] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
