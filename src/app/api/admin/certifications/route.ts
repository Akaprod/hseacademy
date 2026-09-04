import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

import { requireAdmin } from '@/lib/auth';
export async function GET(request: NextRequest) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  try {
    const url = request.nextUrl.searchParams;
    const page = parseInt(url.get('page') || '1');
    const limit = parseInt(url.get('limit') || '20');
    const search = url.get('search') || '';
    const status = url.get('status') || '';
    const type = url.get('type') || '';

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { certificateNo: { contains: search } },
        { fullName: { contains: search } },
        { programName: { contains: search } },
      ];
    }
    if (status) where.status = status;
    if (type) where.type = type;

    const [certifications, total] = await Promise.all([
      db.certification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.certification.count({ where }),
    ]);

    return NextResponse.json({ certifications, total, page, limit, pages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const { certificateNo, type, fullName, programName, level, issuedDate, expirationDate, status } = body;

    if (!certificateNo || !fullName || !programName) {
      return NextResponse.json({ error: 'Numéro, nom et programme requis' }, { status: 400 });
    }

    const cert = await db.certification.create({
      data: {
        certificateNo: certificateNo.toUpperCase().trim(),
        type: type || 'attestation',
        fullName,
        programName,
        level: level || 'technicien',
        issuedDate: new Date(issuedDate),
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        status: status || 'valid',
      },
    });

    return NextResponse.json({ certification: cert }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    if (msg.includes('Unique')) return NextResponse.json({ error: 'Ce numéro de certificat existe déjà' }, { status: 409 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}