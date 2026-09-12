import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { generateAttestationPdf } from '@/lib/pdf-generator';

// ============================================================================
// AT-P3 : Téléchargement PDF officiel d'une attestation.
// ============================================================================
//
// Route : GET /api/courses/attestations/[id]/pdf
//
// Auth : requireUser (l'utilisateur doit être connecté).
//
// Contrôle d'accès :
//   - L'utilisateur ne peut télécharger QUE SON PROPRE PDF
//   - Un admin peut télécharger n'importe quel PDF (pour support / vérification)
//   - Aucun IDOR : l'ID dans l'URL est validé contre auth.id
//
// Sécurité :
//   - Toutes les données viennent de la DB (jamais du client)
//   - Pas de body à trust
//   - Le statut reflète la DB (revoked reste identifiable)
//
// Réponse :
//   - 200 + Content-Type: application/pdf + Buffer PDF
//   - 401 si non authentifié
//   - 403 si l'utilisateur tente d'accéder au PDF d'un autre user (non admin)
//   - 404 si l'attestation n'existe pas
//   - 500 en cas d'erreur serveur
// ============================================================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // --- Authentification obligatoire ---
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;

    // --- Récupérer l'attestation en DB ---
    const attestation = await db.courseAttestation.findUnique({
      where: { id },
      select: {
        id: true,
        attestationNo: true,
        serialNumber: true,
        fullName: true,
        courseName: true,
        overallScore: true,
        issuedDate: true,
        status: true,
        userId: true,            // pour contrôle d'accès
        // Pas de signatureHash, revokedBy, revokedReason dans le PDF
      },
    });

    if (!attestation) {
      return NextResponse.json(
        { error: 'Attestation introuvable' },
        { status: 404 }
      );
    }

    // --- Contrôle d'accès : le user ne peut voir QUE son propre PDF ---
    // Un admin peut voir tous les PDF (pour support / vérification).
    const isAdmin = auth.role === 'admin';
    if (!isAdmin && attestation.userId !== auth.id) {
      return NextResponse.json(
        { error: 'Accès refusé — vous ne pouvez télécharger que votre propre attestation' },
        { status: 403 }
      );
    }

    // --- Générer le PDF (à la volée, pas de stockage disque) ---
    const pdfBuffer = await generateAttestationPdf({
      attestationNo: attestation.attestationNo,
      serialNumber: attestation.serialNumber,
      fullName: attestation.fullName,
      courseName: attestation.courseName,
      overallScore: attestation.overallScore,
      issuedDate: attestation.issuedDate,
      status: attestation.status,
    });

    // --- Retourner le PDF ---
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': String(pdfBuffer.length),
        'Content-Disposition': `attachment; filename="attestation-${attestation.serialNumber}.pdf"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        // Pas de header d'expiration : le PDF doit toujours être régénéré
        // à la demande pour refléter le statut courant (revoked / etc.)
      },
    });
  } catch (error) {
    console.error('GET /api/courses/attestations/[id]/pdf error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la génération du PDF' },
      { status: 500 }
    );
  }
}
