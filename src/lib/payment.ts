// ============================================================================
// Phase 3 — Payment system constants and helpers
// ============================================================================
//
// Prix officiels (en MAD — Dirham Marocain)
// Cours payant : 120 MAD (cours 2+ pour chaque utilisateur)
// Attestation imprimée : 190 MAD (option supplémentaire)
//
// Le premier cours suivi par chaque utilisateur est GRATUIT.
// Tous les cours suivants sont à 120 MAD.
//
// Le montant est TOUJOURS déterminé côté serveur.
// Le client ne peut JAMAIS envoyer un montant.
// ============================================================================

export const COURSE_PRICE_MAD = 120;
export const ATTESTATION_PRINT_PRICE_MAD = 190;
export const CURRENCY = 'MAD';

export const PAYMENT_METHODS = ['bank_transfer', 'paypal'] as const;
export type PaymentMethod = typeof PAYMENT_METHODS[number];

export const PAYMENT_STATUSES = [
  'pending',      // Paiement créé, en attente de preuve
  'submitted',    // Preuve soumise, en attente de validation admin
  'validated',    // Paiement validé par admin
  'rejected',     // Paiement refusé par admin
  'cancelled',    // Paiement annulé
] as const;
export type PaymentStatus = typeof PAYMENT_STATUSES[number];

export const ENROLLMENT_PAYMENT_STATUSES = [
  'not_required',  // Premier cours (gratuit)
  'pending',       // Cours payant, paiement en attente
  'submitted',     // Preuve soumise
  'validated',     // Paiement validé
  'rejected',      // Paiement refusé
] as const;
export type EnrollmentPaymentStatus = typeof ENROLLMENT_PAYMENT_STATUSES[number];

// PayPal account for payments
export const PAYPAL_EMAIL = 'ouamrhar@gmail.com';

// WhatsApp contact for payment questions (professional IICP number — NOT OTP)
export const WHATSAPP_NUMBER = '+212728986565';

/**
 * Détermine si un cours nécessite un paiement.
 * Règle : courseOrderIndex === 1 → gratuit, sinon → 120 MAD
 */
export function isPaymentRequired(courseOrderIndex: number): boolean {
  return courseOrderIndex > 1;
}

/**
 * Retourne le montant attendu pour un cours.
 * courseOrderIndex === 1 → 0 (gratuit)
 * courseOrderIndex > 1 → 120 MAD
 */
export function getCourseAmount(courseOrderIndex: number): number {
  return isPaymentRequired(courseOrderIndex) ? COURSE_PRICE_MAD : 0;
}

/**
 * Détermine le paymentStatus initial pour un nouvel enrollment.
 */
export function getInitialPaymentStatus(courseOrderIndex: number): EnrollmentPaymentStatus {
  return isPaymentRequired(courseOrderIndex) ? 'pending' : 'not_required';
}

/**
 * Vérifie si l'attestation numérique peut être délivrée.
 * Conditions :
 *   - enrollment.status === 'completed'
 *   - enrollment.paymentStatus === 'validated' OU 'not_required'
 */
export function canIssueAttestation(
  enrollmentStatus: string,
  paymentStatus: string
): boolean {
  if (enrollmentStatus !== 'completed') return false;
  return paymentStatus === 'validated' || paymentStatus === 'not_required';
}

/**
 * Chemin de base pour le stockage des preuves de paiement.
 * Ce répertoire est PRIVÉ — non accessible via URL publique.
 * Sur Hostinger : ~/private_uploads/payments/
 */
export const PROOF_UPLOAD_DIR = process.env.PROOF_UPLOAD_DIR || `${process.env.HOME}/private_uploads/payments`;

/**
 * Taille maximale des preuves (10 MB)
 */
export const MAX_PROOF_SIZE = 10 * 1024 * 1024;

/**
 * Types MIME autorisés pour les preuves
 */
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
];
