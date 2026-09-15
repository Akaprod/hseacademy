import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { computeAttestationSignature } from '@/lib/attestation';

// ============================================================================
// AT-P1 : Vérification PUBLIQUE d'une CourseAttestation par serialNumber.
// ============================================================================
//
// Route : GET /api/courses/attestations/verify?serialNumber=HSEA-2026-XXXXXXXX
//
// Publique : aucun cookie, aucun login, aucun rôle requis.
//
// Sécurité :
//   - serialNumber est le seul identifiant accepté depuis le client.
//   - userId, courseId, enrollmentId, fullName, courseName, overallScore,
//     issuedDate, status ne sont JAMAIS trustés depuis la query string.
//   - La DB est l'unique source de vérité.
//   - La signature HMAC-SHA256 est re-vérifiée côté serveur à chaque requête
//     pour détecter toute altération des données DB (falsification interne
//     ou modification directe en DB).
//
// Réponses :
//   - 200 + { found:true, valid:true, status:"valid", attestation:{...} }
//   - 200 + { found:true, valid:false, status:"revoked", attestation:{...} }
//   - 200 + { found:true, valid:false, status:"invalid" }   (signature mismatch)
//   - 400 + { error:"serialNumber is required" }
//   - 404 + { found:false, valid:false, status:"not_found" }
//   - 500 + { error:"Erreur serveur" }
//
// Données publiques retournées (attestation valide ou révoquée) :
//   - serialNumber, fullName, courseName, overallScore, issuedDate
//
// Ne JAMAIS exposer : userId, courseId, enrollmentId, signatureHash,
// revokedBy, revokedReason, password, données privées de User.
// ============================================================================

const MAX_SERIAL_LENGTH = 64;

export async function GET(req: NextRequest) {
  try {
    const rawSerial = req.nextUrl.searchParams.get('serialNumber');

    // --- Validation de l'input ---
    if (rawSerial === null || rawSerial.trim() === '') {
      return NextResponse.json(
        { error: 'serialNumber is required' },
        { status: 400 }
      );
    }

    // Trim + length max pour éviter abus
    const serialNumber = rawSerial.trim().slice(0, MAX_SERIAL_LENGTH);

    // --- Recherche en DB ---
    const attestation = await db.courseAttestation.findUnique({
      where: { serialNumber },
      select: {
        // Champs nécessaires à la vérification cryptographique
        serialNumber: true,
        userId: true,
        courseId: true,
        enrollmentId: true,
        overallScore: true,
        issuedDate: true,
        signatureHash: true,
        status: true,
        // Champs publics à retourner
        fullName: true,
        courseName: true,
      },
    });

    if (!attestation) {
      // Ne pas indiquer si le numéro est "proche" d'un numéro existant.
      return NextResponse.json(
        {
          found: false,
          valid: false,
          status: 'not_found',
        },
        { status: 404 }
      );
    }

    // --- Vérification cryptographique : recalculer la signature à partir
    //     des données réelles en DB et comparer à signatureHash stocké.
    //     Ceci détecte toute altération des données DB.
    const expectedSignature = computeAttestationSignature({
      serialNumber: attestation.serialNumber,
      userId: attestation.userId,
      courseId: attestation.courseId,
      enrollmentId: attestation.enrollmentId,
      overallScore: attestation.overallScore,
      issuedDate: attestation.issuedDate,
    });

    const signatureValid = constantTimeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(attestation.signatureHash, 'hex')
    );

    if (!signatureValid) {
      // La signature ne correspond plus aux données DB — attestation potentiellement
      // falsifiée (modification directe en DB, migration corrompue, etc.).
      // On ne retourne PAS les données publiques dans ce cas.
      return NextResponse.json(
        {
          found: true,
          valid: false,
          status: 'invalid',
        },
        { status: 200 }
      );
    }

    // --- Statut : revoked ?
    if (attestation.status === 'revoked') {
      return NextResponse.json({
        found: true,
        valid: false,
        status: 'revoked',
        attestation: {
          serialNumber: attestation.serialNumber,
          fullName: attestation.fullName,
          courseName: attestation.courseName,
          overallScore: attestation.overallScore,
          issuedDate: attestation.issuedDate,
        },
      });
    }

    // --- Cas nominal : attestation valide et authentique
    return NextResponse.json({
      found: true,
      valid: true,
      status: 'valid',
      attestation: {
        serialNumber: attestation.serialNumber,
        fullName: attestation.fullName,
        courseName: attestation.courseName,
        overallScore: attestation.overallScore,
        issuedDate: attestation.issuedDate,
      },
    });
  } catch (error) {
    console.error('GET /api/courses/attestations/verify error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// ============================================================================
// Comparaison en temps constant pour éviter les timing attacks.
// ============================================================================
function constantTimeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}
