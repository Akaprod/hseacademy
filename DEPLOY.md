# Institut QHSE - Guide de Déploiement

## Version 01 - Site Complet

### Contenu du site
- 37 articles QHSE (SEO optimisés)
- 19 formations (5 diplômantes + 14 certifiantes)
- 6 catégories QHSE
- 18 témoignages
- Dashboard admin complet
- Système de newsletter
- Vérification de certificats/diplômes

---

## Prérequis
- Node.js 18+ (recommandé: 20+)
- npm ou pnpm

## Déploiement rapide (production)

### 1. Installer les dépendances
```bash
npm install --production
```

### 2. Configurer la base de données
Le fichier `db/custom.db` (SQLite) est déjà inclus avec toutes les données.

Si vous voulez repartir de zéro :
```bash
npx prisma migrate deploy
npx tsx prisma/seed.ts
npx tsx scripts/add_certifying_trainings.ts
```

### 3. Configurer l'environnement
Le fichier `.env` est déjà configuré. Modifiez-le si nécessaire :
```
DATABASE_URL=file:./db/custom.db
NEXTAUTH_SECRET=votre-secret-securise
NEXTAUTH_URL=https://votre-domaine.com
ADMIN_PASSWORD=votre-mot-de-passe-admin
```

### 4. Lancer le serveur
```bash
# Mode production (recommandé)
node .next/standalone/server.js -p 3000 -H 0.0.0.0

# Ou avec un process manager (PM2)
npm install -g pm2
pm2 start .next/standalone/server.js --name institut-qhse -p 3000
pm2 save
pm2 startup
```

### 5. Accéder au site
- Site : http://votre-domaine.com
- Admin : http://votre-domaine.com/admin
- Mot de passe admin par défaut : voir `.env` (ADMIN_PASSWORD)

---

## Déploiement avec Nginx (recommandé)

```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Structure du projet

```
institut-qhse-v01/
├── .next/standalone/     # Build production (exécutable)
├── .next/static/         # Assets statiques
├── public/               # Images, favicon, etc.
├── db/custom.db          # Base de données SQLite (avec données)
├── prisma/               # Schéma et migrations
├── scripts/              # Scripts d'initialisation
├── src/                  # Code source
├── .env                  # Variables d'environnement
├── package.json          # Dépendances
├── next.config.ts        # Configuration Next.js
└── DEPLOY.md             # Ce fichier
```

---

## Notes importantes

1. **SQLite** : La base est fichier unique `db/custom.db`. Pour sauvegarder, copiez simplement ce fichier.

2. **Images** : Les images des articles sont stockées dans `public/uploads/`. Assurez-vous que ce dossier est inclus.

3. **Build** : Si vous modifiez le code source, relancez `npx next build` puis réinitialisez la DB.

4. **Port** : Par défaut le serveur écoute sur le port 3000. Changez avec `-p NUMERO`.

---

## Support
Pour toute question sur le déploiement, contactez le développeur.