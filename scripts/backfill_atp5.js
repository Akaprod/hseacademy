/**
 * AT-P5 — Script de backfill des attestations existantes
 *
 * Pour chaque CourseAttestation sans serialNumber/signatureHash :
 *   1. Génère un serialNumber unique (HSEA-YYYY-XXXXXXXX)
 *   2. Calcule signatureHash à partir des données réelles en DB
 *      (y compris issuedDate réel, PAS now())
 *   3. Update le row
 *
 * À exécuter UNE SEULE FOIS après la migration AT-P5.
 *
 * Usage:
 *   AUTH_SECRET=<secret> DATABASE_URL=<url> node scripts/backfill_atp5.js
 *
 * NE MODIFIE PAS les autres champs (attestationNo, userId, courseId,
 * enrollmentId, fullName, courseName, overallScore, issuedDate).
 */

const { PrismaClient } = require('@prisma/client');
const { createHmac, randomBytes } = require('node:crypto');

const SERIAL_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateRandomSuffix(length) {
  const bytes = randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += SERIAL_ALPHABET[bytes[i] % SERIAL_ALPHABET.length];
  }
  return out;
}

function buildSerialNumber(year, suffix) {
  return `HSEA-${year}-${suffix}`;
}

function buildSignaturePayload(args) {
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

function computeSignatureHash(payload) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('AUTH_SECRET manquant ou trop court (<32 chars).');
  }
  return createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
}

async function generateUniqueSerialNumber(prisma, maxAttempts = 20) {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const suffix = generateRandomSuffix(8);
    const candidate = buildSerialNumber(year, suffix);
    // Utilise $queryRaw pour éviter que Prisma valide le where NOT NULL
    const exists = await prisma.$queryRaw`
      SELECT id FROM CourseAttestation WHERE serialNumber = ${candidate} LIMIT 1
    `;
    if (!exists || exists.length === 0) return candidate;
  }
  throw new Error(`Collision après ${maxAttempts} tentatives`);
}

async function main() {
  const prisma = new PrismaClient();

  try {
    // Prisma refuse `where: { serialNumber: null }` car le schéma dit serialNumber
    // NOT NULL @unique. Or en DB SQLite, la colonne est encore nullable (migration
    // additive) et les rows existants ont NULL. On utilise $queryRaw pour les
    // récupérer.
    const attestations = await prisma.$queryRaw`
      SELECT id, attestationNo, userId, courseId, enrollmentId, fullName,
             courseName, overallScore, issuedDate, status
      FROM CourseAttestation
      WHERE serialNumber IS NULL OR signatureHash IS NULL
    `;

    console.log(`Attestations à backfiller : ${attestations.length}`);

    if (attestations.length === 0) {
      console.log('Aucune attestation à backfiller. Terminé.');
      return;
    }

    for (const att of attestations) {
      console.log(`\nTraitement de ${att.attestationNo} (id: ${att.id})`);
      // issuedDate est stocké en epoch ms en SQLite via Prisma — convertir en Date
      const issuedDate = new Date(typeof att.issuedDate === 'number' ? att.issuedDate : att.issuedDate);
      console.log(`  issuedDate DB: ${issuedDate.toISOString()}`);

      const serialNumber = await generateUniqueSerialNumber(prisma);
      console.log(`  serialNumber généré: ${serialNumber}`);

      // IMPORTANT : utilise att.issuedDate (valeur DB) — pas new Date()
      const payload = buildSignaturePayload({
        serialNumber,
        userId: att.userId,
        courseId: att.courseId,
        enrollmentId: att.enrollmentId,
        overallScore: att.overallScore,
        issuedDate,
      });
      console.log(`  payload canonique: ${payload}`);

      const signatureHash = computeSignatureHash(payload);
      console.log(`  signatureHash: ${signatureHash.substring(0, 16)}... (${signatureHash.length} chars)`);

      // Update via $executeRaw pour bypasser la validation NOT NULL de Prisma
      // (qui refuserait de lire un row avec serialNumber NULL).
      await prisma.$executeRaw`
        UPDATE CourseAttestation
        SET serialNumber = ${serialNumber},
            signatureHash = ${signatureHash},
            updatedAt = ${new Date()}
        WHERE id = ${att.id}
      `;
      console.log(`  ✓ Mis à jour en DB`);
    }

    console.log('\n=== Backfill terminé ===');
    const updated = await prisma.$queryRaw`
      SELECT attestationNo, serialNumber, signatureHash, issuedDate, userId, overallScore
      FROM CourseAttestation
    `;
    console.table(updated);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('ERREUR FATALE:', e);
  process.exit(1);
});
