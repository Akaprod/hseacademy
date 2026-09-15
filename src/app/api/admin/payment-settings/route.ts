import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// ============================================================================
// GET /api/admin/payment-settings — Récupère les paramètres de paiement
// PUT /api/admin/payment-settings — Met à jour les paramètres de paiement
// ============================================================================
//
// Auth : requireAdmin()
// Singleton : id="default"
// ============================================================================

const ALLOWED_FIELDS = [
  'attestationPrintPrice',
  'currency',
  'paypalEnabled', 'paypalEmail',
  'stripeEnabled', 'stripePublicKey', 'stripeSecretKey',
  'bankTransferEnabled', 'bankName', 'bankAccountName', 'bankIban', 'bankSwift', 'bankNotes',
  'walletEnabled',
  'whatsappNumber',
] as const;

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const settings = await db.paymentSettings.findUnique({ where: { id: 'default' } });
    return NextResponse.json({ settings: settings || {} });
  } catch (error) {
    console.error('GET /api/admin/payment-settings error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};

    for (const field of ALLOWED_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        const value = body[field];
        if (field === 'attestationPrintPrice') {
          const num = parseFloat(value);
          if (!isNaN(num) && num >= 0) data[field] = num;
        } else if (typeof value === 'boolean') {
          data[field] = value;
        } else if (typeof value === 'string') {
          const trimmed = value.trim();
          data[field] = trimmed.length > 0 ? trimmed : null;
        } else if (value === null) {
          data[field] = null;
        }
      }
    }

    const settings = await db.paymentSettings.upsert({
      where: { id: 'default' },
      create: { id: 'default', ...data },
      update: data,
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('PUT /api/admin/payment-settings error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
