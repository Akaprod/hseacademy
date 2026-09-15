// ============================================================================
// GET    /api/admin/inscriptions/[id] — Détail d'une demande (ADMIN)
// PATCH  /api/admin/inscriptions/[id] — Mettre à jour statut + notes (ADMIN)
// DELETE /api/admin/inscriptions/[id] — Supprimer (ADMIN, soft-fail-safe)
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
    const inscription = await db.inscriptionRequest.findUnique({ where: { id } });
    if (!inscription) {
      return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });
    }
    return NextResponse.json(inscription);
  } catch (error) {
    console.error('GET /api/admin/inscriptions/[id] error:', error);
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

    const existing = await db.inscriptionRequest.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });
    }

    const data: any = {};
    if (status && ['pending', 'reviewing', 'accepted', 'rejected', 'waitlisted'].includes(status)) {
      data.status = status;
      // Si le statut change vers un état "traité", on enregistre qui + quand
      if (status !== 'pending' && status !== existing.status) {
        data.reviewedBy = auth.id;
        data.reviewedAt = new Date();
      }
    }
    if (typeof adminNotes === 'string') {
      data.adminNotes = adminNotes;
    }

    const updated = await db.inscriptionRequest.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PATCH /api/admin/inscriptions/[id] error:', error);
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
    const existing = await db.inscriptionRequest.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });
    }

    await db.inscriptionRequest.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/inscriptions/[id] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
