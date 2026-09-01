#!/bin/bash
set -e
cd /home/z/my-project

BUILD_ID=$(cat .next/BUILD_ID)
echo "BUILD_ID = $BUILD_ID"

TMPDIR=$(mktemp -d /tmp/src_pack_XXXXXX)
PACK_DIR="$TMPDIR/hseacademy-src"
mkdir -p "$PACK_DIR"

# Source code
echo "Copying source code..."
cp -a src "$PACK_DIR/src"

# Config files
echo "Copying config files..."
cp -a package.json "$PACK_DIR/"
cp -a package-lock.json "$PACK_DIR/"
cp -a tsconfig.json "$PACK_DIR/"
cp -a next.config.ts "$PACK_DIR/"
cp -a next-env.d.ts "$PACK_DIR/"
cp -a postcss.config.mjs "$PACK_DIR/"
cp -a tailwind.config.ts "$PACK_DIR/"
cp -a components.json "$PACK_DIR/"
cp -a eslint.config.mjs "$PACK_DIR/"

# Prisma (schema only, no data)
echo "Copying Prisma schema..."
mkdir -p "$PACK_DIR/prisma"
cp -a prisma/schema.prisma "$PACK_DIR/prisma/schema.prisma"

# Public assets
echo "Copying public assets..."
cp -a public "$PACK_DIR/public"

# .env for server (correct DB path)
echo "Creating .env..."
cat > "$PACK_DIR/.env" << 'ENV_EOF'
DATABASE_URL=file:/home/u398373271/institut-qhse/db/custom.db
ENV_EOF

# keepalive.sh + start.sh
cat > "$PACK_DIR/keepalive.sh" << 'KEEPALIVE_EOF'
#!/bin/bash
NODE_BIN="/home/u398373271/node-local/bin/node"
SERVER_DIR="/home/u398373271/institut-qhse"
LOG="$SERVER_DIR/keepalive.log"
while true; do
  if ! pgrep -f "node.*server.js" > /dev/null 2>&1; then
    echo "[$(date)] Server not running, starting..." >> "$LOG"
    cd "$SERVER_DIR" && "$NODE_BIN" server.js >> "$SERVER_DIR/server.log" 2>&1 &
    sleep 5
  fi
  if ! curl -sf -o /dev/null --max-time 10 http://localhost:54321/ 2>/dev/null; then
    echo "[$(date)] Health check failed, killing stuck process..." >> "$LOG"
    pkill -f "node.*server.js" 2>/dev/null || true
    sleep 3
    cd "$SERVER_DIR" && "$NODE_BIN" server.js >> "$SERVER_DIR/server.log" 2>&1 &
  fi
  sleep 30
done
KEEPALIVE_EOF
chmod +x "$PACK_DIR/keepalive.sh"

cat > "$PACK_DIR/start.sh" << 'START_EOF'
#!/bin/bash
NODE_BIN="/home/u398373271/node-local/bin/node"
SERVER_DIR="/home/u398373271/institut-qhse"
cd "$SERVER_DIR"
pkill -f "node.*server.js" 2>/dev/null || true
sleep 2
nohup "$NODE_BIN" server.js >> "$SERVER_DIR/server.log" 2>&1 &
echo "Server PID: $!"
nohup bash "$SERVER_DIR/keepalive.sh" >> "$SERVER_DIR/keepalive.log" 2>&1 &
echo "Keepalive PID: $!"
START_EOF
chmod +x "$PACK_DIR/start.sh"

# PHP proxy
cat > "$PACK_DIR/public_html_index.php" << 'PHP_EOF'
<?php
header('Accept-Encoding: identity');
$target = 'http://127.0.0.1:54321';
$url = $target . $_SERVER['REQUEST_URI'];
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$headers = [];
foreach (getallheaders() as $name => $value) {
    $lower = strtolower($name);
    if ($lower !== 'accept-encoding' && $lower !== 'host' && $lower !== 'connection') {
        $headers[] = "$name: $value";
    }
}
if (!empty($headers)) curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
$method = $_SERVER['REQUEST_METHOD'];
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
if ($method === 'POST' || $method === 'PUT' || $method === 'PATCH') {
    curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
}
if (!empty($_SERVER['CONTENT_TYPE'])) {
    $headers[] = 'Content-Type: ' . $_SERVER['CONTENT_TYPE'];
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
}
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$error = curl_error($ch);
curl_close($ch);
if ($error) { http_response_code(502); echo 'Bad Gateway: ' . $error; exit; }
http_response_code($httpCode);
if ($contentType) header('Content-Type: ' . $contentType);
echo $response;
PHP_EOF

# Instructions
cat > "$PACK_DIR/DEPLOY_INSTRUCTIONS.txt" << INSTR_EOF
============================================================
  HSE ACADEMY — PACK SOURCE CODE (Hostinger Node.js)
============================================================
BUILD_ID: ${BUILD_ID}

CONTENU: Code source complet (SANS base de donnees)
- src/ (tout le code Next.js)
- prisma/schema.prisma
- public/ (assets statiques)
- Config: package.json, next.config.ts, tailwind, etc.
- .env (DATABASE_URL pointe vers le serveur)
- keepalive.sh + start.sh
- public_html_index.php (proxy PHP)

ATTENTION - BASE DE DONNEES:
Ce pack NE contient PAS la DB. Votre DB corrigee
sur le serveur sera preservee.
Assurez-vous que le dossier db/custom.db existe sur le serveur.

DEPLOIEMENT HOSTINGER (Node.js auto-deploy):
1. Uploadez ce dossier comme projet Node.js
2. Hostinger fera: npm install && npm run build
3. Apres le build, le serveur demarre automatiquement

SI DEPLOIEMENT MANUEL (SSH):
1. Uploadez dans /home/u398373271/institut-qhse/
2. Ne supprimez PAS le dossier db/ existant
3. npm install --production=false
4. npx prisma generate
5. npx prisma db push (si la DB est neuve)
6. npm run build
7. bash start.sh

============================================================
INSTR_EOF

# Create archive
echo "Creating source code archive..."
cd "$TMPDIR"
tar -czf "/home/z/my-project/download/hseacademy-SOURCE-CODE.tar.gz" hseacademy-src/

echo ""
echo "============================================================"
echo "  Pack cree: /home/z/my-project/download/hseacademy-SOURCE-CODE.tar.gz"
echo "  Taille: $(du -sh /home/z/my-project/download/hseacademy-SOURCE-CODE.tar.gz | cut -f1)"
echo "  Contient: src/, prisma/, public/, configs, .env"
echo "  BASE DE DONNEES: NON INCLUSE"
echo "============================================================"

rm -rf "$TMPDIR"
echo "Done!"