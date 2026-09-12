# HSE Academy — Source canonique

**BUILD_ID production** : `0Bj5KDik3z4iw1SRaRBfv`
**Date golden snapshot** : 2026-09-12
**Source de vérité** : production active hseacademy.online

## Stack

- **Next.js 16.1.3** (App Router, Turbopack, standalone output)
- **TypeScript 5.x** (strict mode, ignoreBuildErrors=false for legacy compat)
- **Prisma ORM 6.x** (SQLite)
- **Tailwind CSS 4.x**
- **Bun** (package manager + runtime)
- **shadcn/ui** (composants UI)

## Installation

```bash
# 1. Cloner
git clone <this-repo> hseacademy
cd hseacademy

# 2. Installer les dépendances
bun install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env avec les vraies valeurs (DATABASE_URL, AUTH_SECRET, etc.)

# 4. Générer le client Prisma
bun run prisma:generate  # ou npx prisma generate

# 5. Build production
bun run build

# 6. Démarrer
bun run start  # ou node .next/standalone/server.js
```

## Configuration Hostinger CageFS

Pour déployer sur Hostinger CageFS, le `next.config.ts` contient :

```ts
turbopack: {
  root: __dirname,
}
```

Cette directive est **obligatoire** en CageFS — sans elle, Turbopack détecte le
lockfile parent `/home/z/package-lock.json` et calcule un
`RELATIVE_ROOT_PATH = "../../../.."` qui casse la résolution de
`@prisma/client-<hash>` en production.

## Schéma DB

- **DB** : SQLite (`custum.db`)
- **28 tables** (User, Wallet, WalletTransaction, Enrollment, CourseAttestation,
  CoursePayment, AttestationPayment, Course, Chapter, OnlineCourse, etc.)
- **Prisma binaryTargets** : `["native", "debian-openssl-1.1.x"]` (pour compat
  Hostinger)

## Règles métier critiques

1. `COURSE COMPLETED ≠ PAYMENT VALIDATED ≠ ATTESTATION ELIGIBLE`
2. **Wallet payment** = validation instantanée (atomique via `db.$transaction`)
3. **PayPal / Virement** = soumission preuve + validation manuelle admin
4. **Attestation numérique 120 MAD** = générée après paiement validé via
   `canIssueAttestation()` gate
5. **Attestation imprimée 190 MAD** = actuellement DÉSACTIVÉE (DB ne contient pas
   les colonnes `recipientName/Phone/Address`)

## Module Assistant

Le module Assistant IA (chatbot) est présent dans le code mais nécessite une
migration DB séparée (tables `assistant_config`, `assistant_sources`, etc.).
Cette migration n'est PAS incluse par défaut — voir `prisma/migrations/`.

## Sécurité

- **AUTH_SECRET** doit être >= 32 chars (généré via `openssl rand -hex 32`)
- **ROOT_ADMIN_EMAIL** est la seule adresse qui peut tout gérer
- Les cookies de session sont HMAC-signés (format `<base64url(payload)>.<hex(hmac)>`)
- Le rôle n'est JAMAIS stocké dans le cookie — toujours rechargé depuis la DB
- Les paiements Wallet sont atomiques (pas de race condition double-débit)

## Build & Deploy

```bash
# Build
bun run build

# Output
.next/standalone/  →  déployable via `node .next/standalone/server.js`
.next/static/      →  assets statiques (doivent être copiés à côté du standalone)
```

## Golden Snapshot

Ce repo provient d'un **golden snapshot** capturé le 2026-09-12 depuis la
production active hseacademy.online. Le tarball + DB backup + manifeste SHA256
sont archivés hors de ce repo (interdits de commit — secrets + données user).

## License

Propriétaire — HSE Academy / IICP
