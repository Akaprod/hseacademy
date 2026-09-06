# HSE Academy --- Architecture & Technical Reference

## Stack

Next.js 16.1.3, Node.js 20.x, TypeScript, Prisma 6.x, SQLite,
Passenger/Hostinger, Next.js standalone.

## Auth

`requireUser()` et `requireAdmin()` assurent les protections serveur. Le
rôle doit être vérifié côté serveur. localStorage et données frontend ne
sont jamais des sources de vérité de sécurité.

## Root Admin

`admin@institutqhse.com` Protection contre suppression et rétrogradation
du ROOT ADMIN.

## Attestations

Modèle central : `CourseAttestation`.

Principes : - `serialNumber` unique ; - `signatureHash` ; - statut ; -
user/course/enrollment ; - score et date.

Signature : HMAC-SHA256 basée sur AUTH_SECRET. Payload canonique :
`serialNumber|userId|courseId|enrollmentId|overallScore|issuedDate`

QR : `https://hseacademy.online/verify/{serialNumber}`

Endpoint public :
`GET /api/courses/attestations/verify?serialNumber=...`

Page : `/verify/[serialNumber]`

La vérification publique ne nécessite pas d'authentification et ne doit
exposer que les données nécessaires.

## PDF

PDF A4 d'une seule page. Cohérence obligatoire : PDF serial = DB serial
= serial du QR = URL de vérification.

## Paiements

Phase 3 comprend notamment : - `CoursePayment` - `AttestationPayment` -
informations de paiement sur `Enrollment`.

Prix cours payant : 120 MAD. Attestation imprimée : 190 MAD.

Les statuts de paiement et l'ordre des cours sont contrôlés côté
serveur.

Routes principales : - `/api/courses/payments` -
`/api/courses/payments/[id]` - `/api/admin/payments` -
`/api/admin/payments/[id]` - `/api/admin/payments/[id]/proof` -
`/api/attestations/printed`

Routes admin → `requireAdmin()`. Routes utilisateur → contrôle de
propriété.

## Uploads

Preuves de paiement dans une zone privée : `~/private_uploads/payments/`

Jamais dans `public/`.

## DB

Production connue : `/home/u398373271/hseacademy-data/backups/custum.db`

Toute migration production nécessite sauvegarde et validation.

## Développement

Correction minimale, cause racine, tests et contrôle des régressions. Ne
pas mélanger correction ciblée et refonte non demandée.

## Niveau de preuve

Toujours distinguer : - audit statique ; - type-check ; - build ; - test
local ; - test API ; - test production ; - test end-to-end.

Un build réussi ne prouve pas le runtime.
