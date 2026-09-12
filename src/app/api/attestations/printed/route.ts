import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { ATTESTATION_PRINT_PRICE_MAD, CURRENCY, PAYMENT_METHODS, PROOF_UPLOAD_DIR, MAX_PROOF_SIZE, ALLOWED_MIME_TYPES } from '@/lib/payment';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

// ============================================================================
// POST /api/attestations/printed — Demander une attestation imprimée (190 MAD)
// ============================================================================
// Body (JSON) :
//   { attestationId: string, method: "bank_transfer" | "paypal" }
//
// Si preuve fournie (multipart/form-data) :
//   formData: attestationId, method, proof (File)
// ============================================================================

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const contentType = req.headers.get('content-type') || '';

    let attestationId: string;
    let method: string;
    let proofFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      attestationId = String(formData.get('attestationId') || '');
      method = String(formData.get('method') || '');
      const file = formData.get('proof');
      if (file && file instanceof File) proofFile = file;
    } else {
      const body = await req.json();
      attestationId = body.attestationId;
      method = body.method;
    }

    if (!attestationId || !method) {
      return NextResponse.json({ error: 'attestationId et method requis' }, { status: 400 });
    }

    if (!PAYMENT_METHODS.includes(method as any)) {
      return NextResponse.json({ error: 'Méthode invalide' }, { status: 400 });
    }

    // Vérifier que l'attestation appartient à auth.id
    const attestation = await db.courseAttestation.findUnique({
      where: { id: attestationId },
    });

    if (!attestation || attestation.userId !== auth.id) {
      return NextResponse.json({ error: 'Attestation non trouvée' }, { status: 404 });
    }

    // Vérifier qu'il n'existe pas déjà un paiement validé
    const existingValidated = await db.attestationPayment.findFirst({
      where: { attestationId, status: 'validated' },
    });
    if (existingValidated) {
      return NextResponse.json({ error: 'Impression déjà payée', payment: existingValidated }, { status: 400 });
    }

    // Le montant est TOUJOURS déterminé côté serveur
    const amount = ATTESTATION_PRINT_PRICE_MAD;

    // Traiter la preuve
    let proofPath: string | null = null;
    let proofOriginalName: string | null = null;
    let proofMimeType: string | null = null;
    let proofSize: number | null = null;

    if (proofFile) {
      if (proofFile.size > MAX_PROOF_SIZE) {
        return NextResponse.json({ error: 'Fichier trop volumineux (max 10 MB)' }, { status: 400 });
      }
      if (!ALLOWED_MIME_TYPES.includes(proofFile.type)) {
        return NextResponse.json({ error: 'Type de fichier non autorisé' }, { status: 400 });
      }

      const ext = path.extname(proofFile.name) || (proofFile.type === 'application/pdf' ? '.pdf' : '.jpg');
      const safeName = `${randomBytes(16).toString('hex')}${ext}`;
      proofPath = `${PROOF_UPLOAD_DIR}/${safeName}`;
      proofOriginalName = proofFile.name;
      proofMimeType = proofFile.type;
      proofSize = proofFile.size;

      await fs.mkdir(PROOF_UPLOAD_DIR, { recursive: true });
      const buffer = Buffer.from(await proofFile.arrayBuffer());
      await fs.writeFile(proofPath, buffer);
    }

    const status = proofFile ? 'submitted' : 'pending';
    const submittedAt = proofFile ? new Date() : null;

    // Vérifier s'il existe déjà un paiement pending/rejected
    const existingPending = await db.attestationPayment.findFirst({
      where: { attestationId, status: { in: ['pending', 'submitted', 'rejected'] } },
      orderBy: { createdAt: 'desc' },
    });

    if (existingPending) {
      const updated = await db.attestationPayment.update({
        where: { id: existingPending.id },
        data: {
          method,
          status,
          proofPath,
          proofOriginalName,
          proofMimeType,
          proofSize,
          submittedAt,
          rejectionReason: null,
        },
      });
      return NextResponse.json({ payment: updated });
    }

    const payment = await db.attestationPayment.create({
      data: {
        userId: auth.id,
        attestationId,
        amount,
        currency: CURRENCY,
        method,
        status,
        proofPath,
        proofOriginalName,
        proofMimeType,
        proofSize,
        submittedAt,
      },
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    console.error('POST /api/attestations/printed error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// ============================================================================
// GET /api/attestations/printed — Lister SES paiements d'impression
// ============================================================================

export async function GET() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const payments = await db.attestationPayment.findMany({
      where: { userId: auth.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('GET /api/attestations/printed error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
