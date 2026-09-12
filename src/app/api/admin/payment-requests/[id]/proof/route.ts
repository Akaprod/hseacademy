import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { promises as fs } from 'node:fs';

// ============================================================================
// GET /api/admin/payment-requests/[id]/proof — Voir la preuve d'une demande
// ============================================================================
// Auth : requireAdmin()
// Sert le fichier de preuve (image ou PDF) OU affiche la preuve texte.
// ============================================================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const request = await db.paymentRequest.findUnique({ where: { id } });

    if (!request) {
      return NextResponse.json({ error: 'Demande non trouvée' }, { status: 404 });
    }

    // Si preuve fichier
    if (request.proofPath) {
      try {
        const fileBuffer = await fs.readFile(request.proofPath);
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': request.proofMimeType || 'application/octet-stream',
            'Content-Disposition': `inline; filename="${request.proofOriginalName || 'preuve'}"`,
          },
        });
      } catch {
        return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 });
      }
    }

    // Si preuve texte uniquement
    if (request.description) {
      return new NextResponse(request.description, {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    return NextResponse.json({ error: 'Aucune preuve disponible' }, { status: 404 });
  } catch (error) {
    console.error('GET /api/admin/payment-requests/[id]/proof error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
