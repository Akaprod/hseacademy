import { createHmac, randomBytes } from 'node:crypto';
import { db } from './db';

// ============================================================================
// AT-P5 : Numéro de série public professionnel + signature cryptographique
// ============================================================================
//
// serialNumber : identifiant public non prédictible.
//   Format : HSEA-YYYY-XXXXXXXX où XXXXXXXX = 8 chars alphanumériques
//   aléatoires cryptographiquement sûrs (32^8 = ~10^12 combinaisons).
//
// signatureHash : HMAC-SHA256 d'un payload canonique avec AUTH_SECRET.
//   Payload : serialNumber|userId|courseId|enrollmentId|overallScore|issuedDate
//   Stocké en hex (64 chars).
//
// Le AUTH_SECRET vient exclusivement de process.env.AUTH_SECRET (jamais de
// DATABASE_URL, jamais hardcodé). Si absent en prod, l'app doit crasher
// proprement (déjà géré dans src/lib/auth.ts).
// ============================================================================

const SERIAL_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans 0/O/1/I/L pour éviter confusion visuelle
const SERIAL_RANDOM_LENGTH = 8;

// ============================================================================
// Génération du numéro de série (non prédictible)
// ============================================================================
function generateRandomSuffix(length: number): string {
  const bytes = randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += SERIAL_ALPHABET[bytes[i] % SERIAL_ALPHABET.length];
  }
  return out;
}

export function buildSerialNumber(year: number, suffix: string): string {
  return `HSEA-${year}-${suffix}`;
}

/**
 * Génère un serialNumber unique en DB.
 * Réessaie avec un nouveau suffixe en cas de collision (très improbable).
 */
export async function generateUniqueSerialNumber(maxAttempts = 10): Promise<string> {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const suffix = generateRandomSuffix(SERIAL_RANDOM_LENGTH);
    const candidate = buildSerialNumber(year, suffix);
    const exists = await db.courseAttestation.findUnique({
      where: { serialNumber: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
  }
  throw new Error(
    `Impossible de générer un serialNumber unique après ${maxAttempts} tentatives.`
  );
}

// ============================================================================
// Signature cryptographique
// ============================================================================
/**
 * Vérifie que AUTH_SECRET est disponible. Échec explicite sinon.
 */
function requireAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'FATAL: AUTH_SECRET manquant ou trop court (<32 chars) pour signature attestation. ' +
        'Générer avec: openssl rand -hex 32, puis ajouter au .env.'
      );
    }
    // En dev : on jette aussi — pas de fallback DATABASE_URL ou autre.
    throw new Error(
      'AUTH_SECRET manquant en dev. Ajoutez AUTH_SECRET=<valeur> au .env local.'
    );
  }
  return secret;
}

/**
 * Construit le payload canonique et stable pour la signature.
 * Format : serialNumber|userId|courseId|enrollmentId|overallScore|issuedDate
 *
 * IMPORTANT : issuedDate doit être lue en DB (ISO string) — ne PAS utiliser
 * new Date() à chaque fois, sinon la signature changerait à chaque calcul.
 */
export function buildSignaturePayload(args: {
  serialNumber: string;
  userId: string;
  courseId: string;
  enrollmentId: string;
  overallScore: number;
  issuedDate: Date;
}): string {
  // issuedDate.toISOString() donne toujours le même format canonique "YYYY-MM-DDTHH:mm:ss.sssZ"
  const isoDate = args.issuedDate instanceof Date ? args.issuedDate.toISOString() : String(args.issuedDate);
  return [
    args.serialNumber,
    args.userId,
    args.courseId,
    args.enrollmentId,
    String(args.overallScore),
    isoDate,
  ].join('|');
}

/**
 * Calcule la signature HMAC-SHA256 hex (64 chars).
 */
export function computeSignatureHash(payload: string): string {
  const secret = requireAuthSecret();
  return createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
}

/**
 * Helper : calcule la signature pour une attestation à partir de ses données.
 */
export function computeAttestationSignature(args: {
  serialNumber: string;
  userId: string;
  courseId: string;
  enrollmentId: string;
  overallScore: number;
  issuedDate: Date;
}): string {
  return computeSignatureHash(buildSignaturePayload(args));
}

/**
 * Vérifie qu'une signature correspond à un payload. Constant-time comparison.
 */
export function verifySignature(payload: string, expectedHash: string): boolean {
  const actual = computeSignatureHash(payload);
  if (actual.length !== expectedHash.length) return false;
  const a = Buffer.from(actual, 'hex');
  const b = Buffer.from(expectedHash, 'hex');
  if (a.length !== b.length) return false;
  // timingSafeEqual nécessite des buffers de même taille
  return a.equals(b) && constantTimeEqual(a, b);
}

function constantTimeEqual(a: Buffer, b: Buffer): boolean {
  // Compare fixe-timing ; évite early-return sur premier byte différent
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}
