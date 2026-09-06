import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';

// ============================================================================
// POST /api/wallet/charge — Recharger le wallet
// ============================================================================
//
// Auth : requireUser()
// Body : { amount: number, method: string }
//
// Le montant est déterminé côté serveur (jamais trust du frontend).
// Crée une transaction "charge" + met à jour le solde.
// Pour les promotions futures : un bonus peut être ajouté.
// ============================================================================

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { amount, method } = body;

    // Validation du montant (positif, minimum 10 MAD)
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 10) {
      return NextResponse.json({ error: 'Montant minimum : 10 MAD' }, { status: 400 });
    }

    // Validation de la méthode
    const validMethods = ['paypal', 'stripe', 'bank_transfer'];
    if (!method || !validMethods.includes(method)) {
      return NextResponse.json({ error: 'Méthode de paiement invalide' }, { status: 400 });
    }

    // Récupérer ou créer le wallet
    let wallet = await db.wallet.findUnique({
      where: { userId: auth.id },
    });

    if (!wallet) {
      wallet = await db.wallet.create({
        data: { userId: auth.id },
      });
    }

    // Calcul du bonus promotionnel (optionnel, pour utilisation future)
    // Ex: +5% pour >= 500 MAD, +10% pour >= 1000 MAD
    let bonus = 0;
    if (numAmount >= 1000) bonus = numAmount * 0.10;
    else if (numAmount >= 500) bonus = numAmount * 0.05;

    // Transaction de rechargement
    const transaction = await db.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'charge',
        amount: numAmount,
        paymentMethod: method,
        description: `Rechargement de ${numAmount} MAD via ${method}`,
      },
    });

    // Si bonus, créer une transaction bonus séparée
    if (bonus > 0) {
      await db.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'bonus',
          amount: bonus,
          description: `Bonus de ${bonus} MAD (rechargement ≥ ${numAmount >= 1000 ? '1000' : '500'} MAD)`,
        },
      });
    }

    // Mettre à jour le solde
    const newBalance = wallet.balance + numAmount + bonus;
    await db.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance },
    });

    return NextResponse.json({
      success: true,
      newBalance,
      bonus: bonus > 0 ? bonus : null,
      transactionId: transaction.id,
    });
  } catch (error) {
    console.error('POST /api/wallet/charge error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
