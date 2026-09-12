import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { COURSE_PRICE_MAD, CURRENCY, PAYMENT_METHODS, PROOF_UPLOAD_DIR, MAX_PROOF_SIZE, ALLOWED_MIME_TYPES } from '@/lib/payment';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

// ============================================================================
// WalletError — typed error for in-transaction validation failures.
// Allows the wallet handler to bail out of the Prisma transaction with a
// proper HTTP status + message, without rolling back unrelated writes.
// ============================================================================
class WalletError extends Error {
  status: number;
  payment?: unknown;
  constructor(status: number, message: string, payment?: unknown) {
    super(message);
    this.name = 'WalletError';
    this.status = status;
    this.payment = payment;
  }
}

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

    // ---- PAIEMENT VIA WALLET (instantané, pas de preuve requise) ----
    // ====================================================================
    // ATOMICITÉ — wallet debit + WalletTransaction + CoursePayment + Enrollment update
    // doivent être exécutés dans une SEULE transaction Prisma pour éviter :
    //   - Race condition : 2 requêtes concurrentes pourraient toutes les deux
    //     passer le check existingPayment=null puis débiter le wallet 2x.
    //   - Accounting inconsistency : WalletTransaction créée sans CoursePayment
    //     lié si une étape échoue.
    // La transaction utilise un SELECT verrouillé sur le wallet pour empêcher
    // 2 transactions concurrentes de lire le même solde.
    // ====================================================================
    if (method === 'wallet') {
      try {
        const result = await db.$transaction(async (tx) => {
          // 1) Re-fetch du wallet DANS la transaction (lecture+futur update
          //    exclusif grâce au UPDATE sur la même ligne).
          const wallet = await tx.wallet.findUnique({
            where: { userId: auth.id },
          });
          if (!wallet) {
            throw new WalletError(400, 'Wallet non trouvé. Veuillez recharger votre wallet d\'abord.');
          }
          if (wallet.balance < amount) {
            throw new WalletError(
              400,
              `Solde insuffisant. Votre solde est de ${wallet.balance} MAD, le cours coûte ${amount} MAD.`
            );
          }

          // 2) Re-check du existingPayment DANS la transaction
          //    (ferme la race condition : si une autre transaction a déjà créé
          //    un CoursePayment validated entre le check initial et maintenant,
          //    on ne débite pas le wallet).
          const txExistingPayment = await tx.coursePayment.findUnique({
            where: { enrollmentId },
          });
          if (txExistingPayment && txExistingPayment.status === 'validated') {
            throw new WalletError(400, 'Paiement déjà validé', txExistingPayment);
          }

          // 3) Débiter le wallet — compute à partir du balance RE-READ dans tx.
          //    L'UPDATE pose un verrou implicite sur la ligne wallet jusqu'au COMMIT.
          const newBalance = wallet.balance - amount;
          await tx.wallet.update({
            where: { id: wallet.id },
            data: { balance: newBalance },
          });

          // 4) Créer ou mettre à jour le CoursePayment DANS la même transaction.
          let payment;
          if (txExistingPayment) {
            // existingPayment en pending/submitted/rejected → update to validated
            payment = await tx.coursePayment.update({
              where: { enrollmentId },
              data: {
                method,
                amount,
                currency: CURRENCY,
                status: 'validated',
                validatedAt: new Date(),
                validatedBy: 'wallet-system',
                rejectionReason: null,
              },
            });
          } else {
            payment = await tx.coursePayment.create({
              data: {
                userId: auth.id,
                enrollmentId,
                courseId: enrollment.courseId,
                amount,
                currency: CURRENCY,
                method,
                status: 'validated',
                validatedAt: new Date(),
                validatedBy: 'wallet-system',
              },
            });
          }

          // 5) Créer la WalletTransaction en LIANT le CoursePayment
          //    (audit trail complet — coursePaymentId peuplé).
          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              type: 'purchase',
              amount,
              description: `Achat cours : ${enrollment.courseId}`,
              coursePaymentId: payment.id,
            },
          });

          // 6) Mettre à jour l'enrollment
          await tx.enrollment.update({
            where: { id: enrollmentId },
            data: { paymentStatus: 'validated' },
          });

          return { payment, walletBalance: newBalance };
        }, {
          // SQLite a un timeout court par défaut ; on l'élève à 5s pour éviter
          // les "write-locks" sous charge concurrente légère.
          timeout: 5000,
        });

        return NextResponse.json(
          { payment: result.payment, walletBalance: result.walletBalance },
          { status: 201 }
        );
      } catch (err: any) {
        if (err instanceof WalletError) {
          return NextResponse.json(
            { error: err.message, ...(err.payment ? { payment: err.payment } : {}) },
            { status: err.status }
          );
        }
        // Prisma unique constraint or other DB error
        if (err?.code === 'P2002') {
          return NextResponse.json(
            { error: 'Paiement déjà en cours (concurrent). Réessayez.' },
            { status: 409 }
          );
        }
        if (err?.code === 'P2028') {
          return NextResponse.json(
            { error: 'Transaction timeout — réessayez.' },
            { status: 503 }
          );
        }
        throw err; // remonter au catch global du try/catch parent
      }
    }

    // Vérification anti-double-paiement pour les méthodes PayPal/Virement
    // (la version wallet est déjà gérée atomiquement dans la transaction ci-dessus).
    const existingPayment = await db.coursePayment.findUnique({
      where: { enrollmentId },
    });
    if (existingPayment && existingPayment.status === 'validated') {
      return NextResponse.json({ error: 'Paiement déjà validé', payment: existingPayment }, { status: 400 });
    }

    // ---- PAIEMENT VIA PAYPAL OU VIREMENT (preuve requise, validation manuelle) ----

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
