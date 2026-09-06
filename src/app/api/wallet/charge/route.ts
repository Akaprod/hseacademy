import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';

// ============================================================================
// POST /api/wallet/charge — Créer une DEMANDE de rechargement (PENDING)
// ============================================================================
//
// IMPORTANT : Le solde n'est PAS crédité immédiatement.
// Le client doit d'abord payer (PayPal/virement), envoyer la preuve,
// et l'admin doit valider la demande. Le solde est crédité uniquement
// après validation admin.
//
// Flux :
//   1. Client choisit montant + méthode → demande créée (statut pending)
//   2. Instructions de paiement affichées (email PayPal / RIB / WhatsApp)
//   3. Client envoie preuve (via site ou WhatsApp)
//   4. Admin valide → solde crédité + bonus
//   5. Si admin refuse → demande annulée
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
    const validMethods = ['paypal', 'bank_transfer'];
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

    // Récupérer les paramètres de paiement pour afficher les instructions
    const paymentSettings = await db.paymentSettings.findUnique({
      where: { id: 'default' },
    });

    // Calcul du bonus promotionnel (pour info uniquement — appliqué à la validation)
    let bonus = 0;
    if (numAmount >= 1000) bonus = numAmount * 0.10;
    else if (numAmount >= 500) bonus = numAmount * 0.05;

    // Créer la transaction en statut PENDING (ne PAS créditer le solde)
    const transaction = await db.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'charge',
        amount: numAmount,
        paymentMethod: method,
        description: `Demande de rechargement de ${numAmount} MAD via ${method} — EN ATTENTE DE VALIDATION`,
      },
    });

    // Préparer les instructions de paiement pour le client
    const instructions: Record<string, any> = {
      paypal: {
        title: 'Paiement PayPal',
        amount: numAmount,
        email: paymentSettings?.paypalEmail || 'ouamrhar@gmail.com',
        steps: [
          `Connectez-vous à PayPal et envoyez ${numAmount} MAD à l'adresse : ${paymentSettings?.paypalEmail || 'ouamrhar@gmail.com'}`,
          'Ajoutez en note : "Rechargement Wallet HSE Academy"',
          'Après le paiement, envoyez la capture d\'écran sur WhatsApp ou téléchargez-la ci-dessous',
        ],
      },
      bank_transfer: {
        title: 'Virement bancaire',
        amount: numAmount,
        bankName: paymentSettings?.bankName || 'À contacter',
        accountName: paymentSettings?.bankAccountName || 'À contacter',
        iban: paymentSettings?.bankIban || 'À contacter',
        swift: paymentSettings?.bankSwift || '',
        notes: paymentSettings?.bankNotes || '',
        steps: [
          `Effectuez un virement de ${numAmount} MAD vers :`,
          `Banque : ${paymentSettings?.bankName || 'À contacter'}`,
          `Titulaire : ${paymentSettings?.bankAccountName || 'À contacter'}`,
          `RIB : ${paymentSettings?.bankIban || 'À contacter'}`,
          'Après le virement, envoyez la preuve sur WhatsApp ou téléchargez-la ci-dessous',
        ],
      },
    };

    return NextResponse.json({
      success: true,
      pending: true,
      message: 'Demande de rechargement créée. Suivez les instructions pour payer.',
      transactionId: transaction.id,
      bonus: bonus > 0 ? bonus : null,
      instructions: instructions[method] || null,
      whatsapp: paymentSettings?.whatsappNumber || '+212728986565',
    });
  } catch (error) {
    console.error('POST /api/wallet/charge error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
