#!/bin/bash
set -e
cd /home/z/my-project
BUILD_ID=$(cat .next/BUILD_ID)
echo "BUILD_ID = $BUILD_ID"

TMPDIR=$(mktemp -d /tmp/deploy_pack_XXXXXX)
PACK_DIR="$TMPDIR/hseacademy-deploy"
mkdir -p "$PACK_DIR"

# Copy standalone build (with hidden files)
echo "Copying standalone build..."
cp -a .next/standalone/* "$PACK_DIR/"
cp -a .next/standalone/.env "$PACK_DIR/.env" 2>/dev/null || true
cp -a .next/standalone/.next "$PACK_DIR/.next"

# Copy static assets
echo "Copying static assets..."
mkdir -p "$PACK_DIR/.next/static"
cp -a .next/static/* "$PACK_DIR/.next/static/"
mkdir -p "$PACK_DIR/public"
cp -a public/* "$PACK_DIR/public/"

# Fix DATABASE_URL for server path
echo "Fixing DATABASE_URL for server..."
sed -i 's|file:/home/z/my-project/db/custom.db|file:/home/u398373271/institut-qhse/db/custom.db|g' "$PACK_DIR/.env"

# keepalive.sh
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

# start.sh
cat > "$PACK_DIR/start.sh" << 'START_EOF'
#!/bin/bash
NODE_BIN="/home/u398373271/node-local/bin/node"
SERVER_DIR="/home/u398373271/institut-qhse"
cd "$SERVER_DIR"
pkill -f "node.*server.js" 2>/dev/null || true
sleep 2
nohup "$NODE_BIN" server.js >> "$SERVER_DIR/server.log" 2>&1 &
echo "Server started with PID $!"
nohup bash "$SERVER_DIR/keepalive.sh" >> "$SERVER_DIR/keepalive.log" 2>&1 &
echo "Keepalive started with PID $!"
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
  HSE ACADEMY — DEPLOIEMENT MANUEL (CODE SEULEMENT)
============================================================
BUILD_ID: ${BUILD_ID}

ATTENTION: Ce pack ne contient PAS la base de donnees.
Votre DB sur le serveur sera preservee.

ETAPE 1 — Upload
  Uploadez le contenu de hseacademy-deploy/ dans:
  /home/u398373271/institut-qhse/
  (Ecrasez les fichiers existants, mais GARDEZ le dossier db/)

ETAPE 2 — Permissions
  chmod +x ~/institut-qhse/keepalive.sh
  chmod +x ~/institut-qhse/start.sh

ETAPE 3 — PHP Proxy
  Remplacez public_html/index.php par public_html_index.php

ETAPE 4 — Demarrer
  cd ~/institut-qhse && bash start.sh

ETAPE 5 — Verifier
  curl -I https://hseacademy.online/
============================================================
INSTR_EOF

# Create archive
echo "Creating tar.gz archive (NO DB)..."
cd "$TMPDIR"
tar -czf "/home/z/my-project/download/hseacademy-deploy-CODE-ONLY.tar.gz" hseacademy-deploy/

echo ""
echo "============================================================"
echo "  Pack cree: /home/z/my-project/download/hseacademy-deploy-CODE-ONLY.tar.gz"
echo "  Taille: $(du -sh /home/z/my-project/download/hseacademy-deploy-CODE-ONLY.tar.gz | cut -f1)"
echo "  BUILD_ID: $BUILD_ID"
echo "  BASE DE DONNEES: NON INCLUSE (preservee sur serveur)"
echo "============================================================"

rm -rf "$TMPDIR"
echo "Done!"
