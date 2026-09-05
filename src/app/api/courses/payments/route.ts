import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { COURSE_PRICE_MAD, CURRENCY, PAYMENT_METHODS, PROOF_UPLOAD_DIR, MAX_PROOF_SIZE, ALLOWED_MIME_TYPES } from '@/lib/payment';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

// ============================================================================
// POST /api/courses/payments — Créer ou soumettre un paiement cours
// ============================================================================
// Body (JSON) :
//   { enrollmentId: string, method: "bank_transfer" | "paypal" }
//
// Si un fichier de preuve est fourni (multipart/form-data) :
//   formData: enrollmentId, method, proof (File)
// ============================================================================

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const contentType = req.headers.get('content-type') || '';

    let enrollmentId: string;
    let method: string;
    let proofFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      enrollmentId = String(formData.get('enrollmentId') || '');
      method = String(formData.get('method') || '');
      const file = formData.get('proof');
      if (file && file instanceof File) {
        proofFile = file;
      }
    } else {
      const body = await req.json();
      enrollmentId = body.enrollmentId;
      method = body.method;
    }

    if (!enrollmentId || !method) {
      return NextResponse.json({ error: 'enrollmentId et method requis' }, { status: 400 });
    }

    if (!PAYMENT_METHODS.includes(method as any)) {
      return NextResponse.json({ error: 'Méthode de paiement invalide' }, { status: 400 });
    }

    // Vérifier que l'enrollment appartient à auth.id
    const enrollment = await db.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment || enrollment.userId !== auth.id) {
      return NextResponse.json({ error: 'Inscription non trouvée' }, { status: 404 });
    }

    // Vérifier que le paiement est requis (courseOrderIndex > 1)
    if (enrollment.courseOrderIndex <= 1) {
      return NextResponse.json({ error: 'Ce cours est gratuit — aucun paiement requis' }, { status: 400 });
    }

    // Le montant est TOUJOURS déterminé côté serveur
    const amount = COURSE_PRICE_MAD;

    // Vérifier s'il existe déjà un paiement pour cet enrollment
    const existingPayment = await db.coursePayment.findUnique({
      where: { enrollmentId },
    });

    if (existingPayment && existingPayment.status === 'validated') {
      return NextResponse.json({ error: 'Paiement déjà validé', payment: existingPayment }, { status: 400 });
    }

    // Traiter le fichier de preuve si fourni
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

      // Générer un nom de fichier sécurisé
      const ext = path.extname(proofFile.name) || (proofFile.type === 'application/pdf' ? '.pdf' : '.jpg');
      const safeName = `${randomBytes(16).toString('hex')}${ext}`;
      proofPath = `${PROOF_UPLOAD_DIR}/${safeName}`;
      proofOriginalName = proofFile.name;
      proofMimeType = proofFile.type;
      proofSize = proofFile.size;

      // Créer le répertoire si nécessaire
      await fs.mkdir(PROOF_UPLOAD_DIR, { recursive: true });

      // Écrire le fichier
      const buffer = Buffer.from(await proofFile.arrayBuffer());
      await fs.writeFile(proofPath, buffer);
    }

    // Créer ou mettre à jour le paiement
    const status = proofFile ? 'submitted' : 'pending';
    const submittedAt = proofFile ? new Date() : null;

    if (existingPayment) {
      // Mettre à jour le paiement existant
      const updated = await db.coursePayment.update({
        where: { enrollmentId },
        data: {
          method,
          status,
          proofPath,
          proofOriginalName,
          proofMimeType,
          proofSize,
          submittedAt,
          rejectionReason: null, // Reset rejection on resubmit
        },
      });

      // Mettre à jour enrollment.paymentStatus
      await db.enrollment.update({
        where: { id: enrollmentId },
        data: { paymentStatus: status },
      });

      return NextResponse.json({ payment: updated });
    }

    // Créer un nouveau paiement
    const payment = await db.coursePayment.create({
      data: {
        userId: auth.id,
        enrollmentId,
        courseId: enrollment.courseId,
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

    // Mettre à jour enrollment.paymentStatus
    await db.enrollment.update({
      where: { id: enrollmentId },
      data: { paymentStatus: status },
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    console.error('POST /api/courses/payments error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// ============================================================================
// GET /api/courses/payments — Lister SES paiements (utilisateur connecté)
// ============================================================================

export async function GET() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const payments = await db.coursePayment.findMany({
      where: { userId: auth.id },
      include: {
        enrollment: {
          include: {
            course: {
              select: { title: true, slug: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('GET /api/courses/payments error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
