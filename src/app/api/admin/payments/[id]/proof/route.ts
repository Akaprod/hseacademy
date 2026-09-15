import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { promises as fs } from 'node:fs';

// ============================================================================
// GET /api/admin/payments/[id]/proof — Télécharger la preuve (admin only)
// ============================================================================
// Query: ?type=course|attestation
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'course';

    let proofPath: string | null = null;
    let proofMimeType: string | null = null;
    let proofOriginalName: string | null = null;

    if (type === 'course') {
      const payment = await db.coursePayment.findUnique({ where: { id } });
      if (!payment) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });
      proofPath = payment.proofPath;
      proofMimeType = payment.proofMimeType;
      proofOriginalName = payment.proofOriginalName;
    } else {
      const payment = await db.attestationPayment.findUnique({ where: { id } });
      if (!payment) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });
      proofPath = payment.proofPath;
      proofMimeType = payment.proofMimeType;
      proofOriginalName = payment.proofOriginalName;
    }

    if (!proofPath) {
      return NextResponse.json({ error: 'Aucune preuve' }, { status: 404 });
    }

    const fileBuffer = await fs.readFile(proofPath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': proofMimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${proofOriginalName || 'proof'}"`,
        'Cache-Control': 'private, no-cache, no-store',
      },
    });
  } catch (error) {
    console.error('GET /api/admin/payments/[id]/proof error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
