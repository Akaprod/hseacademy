import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';

// ============================================================================
// GET /api/wallet — Récupère le solde et l'historique du wallet utilisateur
// ============================================================================
//
// Auth : requireUser() — l'utilisateur ne voit QUE son propre wallet
// Crée automatiquement un wallet si l'utilisateur n'en a pas encore
// ============================================================================

export async function GET() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    // Récupérer ou créer le wallet
    let wallet = await db.wallet.findUnique({
      where: { userId: auth.id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50, // 50 dernières transactions
        },
      },
    });

    if (!wallet) {
      wallet = await db.wallet.create({
        data: { userId: auth.id },
        include: { transactions: true },
      });
    }

    return NextResponse.json({
      balance: wallet.balance,
      currency: wallet.currency,
      transactions: wallet.transactions,
    });
  } catch (error) {
    console.error('GET /api/wallet error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
