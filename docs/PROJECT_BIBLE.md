# HSE Academy --- Project Bible

## Identité

-   Site : https://hseacademy.online
-   Repository : https://github.com/Akaprod/hseacademy
-   Branche : main
-   Projet indépendant de AETHER, AETHON et IICP.

## Vision

Plateforme LMS professionnelle HSE/QHSE : formations, examens, paiements
et attestations vérifiables.

## Stack de référence

-   Hostinger / Passenger
-   Node.js 20.x
-   Next.js 16.1.3
-   Prisma 6.x
-   SQLite
-   Next.js standalone
-   Déploiement via architecture hbuilds/current.

## Sources de vérité

Code → GitHub V1. Architecture/décisions → documentation du Projet.
Règles métier → Business Rules. Production → état réel Hostinger. DB →
DB production. Déploiement → Deployment Guide.

En cas de contradiction : signaler la contradiction et utiliser la
source la plus récente. Ne jamais réconcilier silencieusement.

## Sécurité

Authentification serveur avec session, cookie httpOnly, AUTH_SECRET,
requireUser() et requireAdmin(). Le frontend/localStorage n'est jamais
une source de vérité de sécurité.

ROOT ADMIN : admin@institutqhse.com Il ne doit jamais être supprimé ou
rétrogradé.

## Attestations

Le système actuel est la référence : - serial unique ; - signature HMAC
; - QR Code ; - vérification publique sans authentification ; - valid /
revoked / not_found ; - PDF A4 professionnel d'une seule page.

URL : https://hseacademy.online/verify/{serialNumber}

Ne pas réintroduire le système legacy sans justification.

## Paiements

Règle fondamentale : COURSE COMPLETED ≠ PAYMENT VALIDATED ≠ ATTESTATION
ELIGIBLE

Premier cours de chaque utilisateur : gratuit. Tous les suivants : 120
MAD. Examens : gratuits. 120 MAD inclut l'attestation numérique.
Attestation imprimée : 190 MAD supplémentaires. Paiement validé
manuellement. Preuves privées, jamais dans public/.

## DB connue

DB production : /home/u398373271/hseacademy-data/backups/custum.db
Attention à l'orthographe historique `custum.db`. Ne pas la remplacer
automatiquement.

## Méthode

AUDIT → DIAGNOSTIC → CORRECTION → VALIDATION → COMMIT → PUSH →
DÉPLOIEMENT → VÉRIFICATION PRODUCTION

Privilégier les corrections minimales. Ne pas refactoriser inutilement.
