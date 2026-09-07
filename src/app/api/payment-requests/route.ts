import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

// ============================================================================
// GET /api/payment-requests — Lister SES demandes de paiement (client)
// POST /api/payment-requests — Créer une demande de paiement
// DELETE /api/payment-requests?id=xxx — Supprimer une demande (si pending)
// ============================================================================

const MAX_ACTIVE_REQUESTS = 10;
const EXPIRY_HOURS = 72;
const PROOF_UPLOAD_DIR = process.env.PROOF_UPLOAD_DIR || `${process.env.HOME}/private_uploads/payments`;
const MAX_PROOF_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

// --- GET ---
export async function GET() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    // Marquer les demandes expirées
    await db.paymentRequest.updateMany({
      where: {
        userId: auth.id,
        reqStatus: 'pending',
        expiresAt: { lt: new Date() },
      },
      data: { reqStatus: 'expired' },
    });

    const requests = await db.paymentRequest.findMany({
      where: { userId: auth.id },
      orderBy: { createdAt: 'desc' },
    });

    // Compter les demandes actives (pending + submitted)
    const activeCount = requests.filter(r => r.reqStatus === 'pending' || r.reqStatus === 'submitted').length;

    return NextResponse.json({ requests, activeCount, maxActive: MAX_ACTIVE_REQUESTS });
  } catch (error) {
    console.error('GET /api/payment-requests error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// --- POST ---
export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const contentType = req.headers.get('content-type') || '';
    let amount: number;
    let method: string;
    let reqType: string;
    let proofFile: File | null = null;
    let proofText: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      amount = parseFloat(String(formData.get('amount') || '0'));
      method = String(formData.get('method') || '');
      reqType = String(formData.get('reqType') || 'wallet_charge');
      const file = formData.get('proof');
      if (file && file instanceof File) proofFile = file;
      proofText = String(formData.get('proofText') || '');
    } else {
      const body = await req.json();
      amount = parseFloat(body.amount || 0);
      method = body.method;
      reqType = body.reqType || 'wallet_charge';
      proofText = body.proofText || null;
    }

    if (isNaN(amount) || amount < 10) {
      return NextResponse.json({ error: 'Montant minimum : 10 MAD' }, { status: 400 });
    }

    if (!method || !['paypal', 'bank_transfer'].includes(method)) {
      return NextResponse.json({ error: 'Méthode invalide' }, { status: 400 });
    }

    // Vérifier la limite de 10 demandes actives
    const activeCount = await db.paymentRequest.count({
      where: {
        userId: auth.id,
        reqStatus: { in: ['pending', 'submitted'] },
      },
    });

    if (activeCount >= MAX_ACTIVE_REQUESTS) {
      return NextResponse.json({
        error: `Vous avez ${activeCount} demandes en cours. Maximum ${MAX_ACTIVE_REQUESTS}. Supprimez les anciennes pour en créer de nouvelles.`,
      }, { status: 400 });
    }

    // Calculer la date d'expiration (72h)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + EXPIRY_HOURS);

    // Traiter la preuve si fournie
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

    // Si preuve texte fournie, la stocker dans la description
    let description = '';
    if (proofText) {
      description = `Preuve: ${proofText}`;
    }

    // Déterminer le statut initial
    const status = (proofFile || proofText) ? 'submitted' : 'pending';
    const submittedAt = (proofFile || proofText) ? new Date() : null;

    // Créer la demande
    const request = await db.paymentRequest.create({
      data: {
        userId: auth.id,
        reqType,
        amount,
        method,
        reqStatus: status,
        description,
        expiresAt,
        proofPath,
        proofOriginalName,
        proofMimeType,
        proofSize,
        submittedAt,
      },
    });

    return NextResponse.json({ request }, { status: 201 });
  } catch (error) {
    console.error('POST /api/payment-requests error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// --- DELETE ---
export async function DELETE(req: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    // Vérifier que la demande appartient à l'utilisateur
    const request = await db.paymentRequest.findUnique({ where: { id } });
    if (!request || request.userId !== auth.id) {
      return NextResponse.json({ error: 'Demande non trouvée' }, { status: 404 });
    }

    // Seulement les demandes pending ou expired peuvent être supprimées
    if (request.reqStatus === 'submitted' || request.reqStatus === 'validated') {
      return NextResponse.json({ error: 'Impossible de supprimer une demande soumise ou validée' }, { status: 400 });
    }

    await db.paymentRequest.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/payment-requests error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
