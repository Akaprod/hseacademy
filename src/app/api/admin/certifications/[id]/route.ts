import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

import { requireAdmin } from '@/lib/auth';
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const cert = await db.certification.findUnique({ where: { id } });
    if (!cert) return NextResponse.json({ error: 'Certificat non trouvé' }, { status: 404 });
    return NextResponse.json({ certification: cert });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const body = await request.json();
    const existing = await db.certification.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Certificat non trouvé' }, { status: 404 });

    const cert = await db.certification.update({
      where: { id },
      data: {
        ...(body.certificateNo && { certificateNo: body.certificateNo.toUpperCase().trim() }),
        ...(body.type && { type: body.type }),
        ...(body.fullName && { fullName: body.fullName }),
        ...(body.programName && { programName: body.programName }),
        ...(body.level && { level: body.level }),
        ...(body.issuedDate && { issuedDate: new Date(body.issuedDate) }),
        ...(body.expirationDate !== undefined && { expirationDate: body.expirationDate ? new Date(body.expirationDate) : null }),
        ...(body.status && { status: body.status }),
      },
    });
    return NextResponse.json({ certification: cert });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    if (msg.includes('Unique')) return NextResponse.json({ error: 'Numéro déjà utilisé' }, { status: 409 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    await db.certification.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}