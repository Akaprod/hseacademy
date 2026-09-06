# HSE Academy --- Deployment Guide

## Production

Site : https://hseacademy.online Hostinger + Passenger + Node.js 20.x +
Next.js 16.1.3 + Prisma + SQLite.

Architecture : hbuilds avec version active via `current`. `.env` de
production séparé.

## Build

Build standalone Next.js. Le build doit inclure Prisma generate, next
build, puis la présence de `.next/static` et `public` dans le
standalone.

Démarrage : `node .next/standalone/server.js`

## Contraintes

Un build local réussi ne prouve jamais que la production fonctionne.
Après déploiement, vérifier HTTP, routes, assets, Prisma, Passenger et
logs.

## Prisma

La production nécessite le moteur compatible Hostinger, notamment
`debian-openssl-1.1.x`. Toute modification Prisma doit être validée
avant production.

## DB

DB connue : `/home/u398373271/hseacademy-data/backups/custum.db`

Avant migration : 1. identifier la DB active ; 2. sauvegarder ; 3.
appliquer uniquement la migration nécessaire ; 4. vérifier schéma et
données ; 5. vérifier l'application.

Interdits par défaut : reset, seed, db push destructif, suppression de
données, remplacement de DATABASE_URL.

## Variables sensibles

Ne pas modifier sans autorisation : DATABASE_URL AUTH_SECRET
ROOT_ADMIN_EMAIL

ROOT ADMIN : admin@institutqhse.com

Ne jamais mettre secrets ou `.env` dans Git.

## Passenger

Après mise à jour, redémarrage possible via : `touch tmp/restart.txt`

## Vérification post-déploiement

-   homepage et routes concernées ;
-   APIs ;
-   auth/protections ;
-   assets Next.js ;
-   Prisma ;
-   logs Passenger ;
-   fonctionnalité modifiée.

Surveiller notamment les ChunkLoadError et crash loops.

## Git

Repository : Akaprod/hseacademy Branche : main

Avant commit : diff, status, secrets, backups, fichiers temporaires.
Après push : confirmer le commit exact et déployer exactement cette
version.

## Rollback

Conserver la version défectueuse et les preuves/logs. Revenir à la
version stable selon hbuilds/current puis revérifier HTTP et runtime.
