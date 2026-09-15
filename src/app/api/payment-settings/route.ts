import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ============================================================================
// GET /api/payment-settings — Récupère les paramètres de paiement PUBLICS
// ============================================================================
//
// Route PUBLIQUE — aucune authentification.
// N'expose QUE les informations nécessaires côté client :
//   - Méthodes activées/désactivées (PayPal, Stripe, RIB, Wallet)
//   - Email PayPal (pour que le client sache où envoyer)
//   - Coordonnées RIB (pour que le client sache où virer)
//   - Numéro WhatsApp (pour preuves)
//   - Prix de l'attestation imprimée
//
// N'expose JAMAIS : stripeSecretKey (géré côté serveur uniquement)
// ============================================================================

export async function GET() {
  try {
    const settings = await db.paymentSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      return NextResponse.json({
        settings: {
          attestationPrintPrice: 190,
          currency: 'MAD',
          paypalEnabled: true,
          paypalEmail: null,
          stripeEnabled: false,
          bankTransferEnabled: true,
          bankName: null,
          bankAccountName: null,
          bankIban: null,
          bankSwift: null,
          bankNotes: null,
          walletEnabled: false,
          whatsappNumber: null,
        },
      });
    }

    const publicSettings = {
      attestationPrintPrice: settings.attestationPrintPrice,
      currency: settings.currency,
      paypalEnabled: settings.paypalEnabled,
      paypalEmail: settings.paypalEmail,
      stripeEnabled: settings.stripeEnabled,
      bankTransferEnabled: settings.bankTransferEnabled,
      bankName: settings.bankName,
      bankAccountName: settings.bankAccountName,
      bankIban: settings.bankIban,
      bankSwift: settings.bankSwift,
      bankNotes: settings.bankNotes,
      walletEnabled: settings.walletEnabled,
      whatsappNumber: settings.whatsappNumber,
    };

    return NextResponse.json({ settings: publicSettings });
  } catch (error) {
    console.error('GET /api/payment-settings error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
