// ============================================================================
// URL publique de vérification — module partagé serveur + client.
// ============================================================================
//
// Ce fichier NE DOIT PAS importer node:crypto ou tout module serveur-only.
// Il doit rester importable depuis des 'use client' components.
//
// Utilisé par :
//   - src/lib/pdf-generator.ts (server)
//   - src/components/attestation-qr.tsx (client)
//   - src/app/api/courses/attestations/verify/route.ts (server, si besoin)
// ============================================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hseacademy.online';

export function buildVerifyUrl(serialNumber: string): string {
  return `${SITE_URL}/verify/${encodeURIComponent(serialNumber)}`;
}
