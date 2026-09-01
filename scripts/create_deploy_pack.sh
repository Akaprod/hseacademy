#!/bin/bash
# ============================================================
# create_deploy_pack.sh — Build complete deployment .tar.gz
# ============================================================
set -e

cd /home/z/my-project

BUILD_ID=$(cat .next/BUILD_ID)
echo "BUILD_ID = $BUILD_ID"

# 1) Create a temp directory
TMPDIR=$(mktemp -d /tmp/deploy_pack_XXXXXX)
PACK_DIR="$TMPDIR/hseacademy-deploy"
mkdir -p "$PACK_DIR"

# 2) Copy standalone build
# Note: cp -a * does not copy hidden files/dirs like .env and .next
echo "Copying standalone build..."
cp -a .next/standalone/* "$PACK_DIR/"
cp -a .next/standalone/.env "$PACK_DIR/.env" 2>/dev/null || true
cp -a .next/standalone/.next "$PACK_DIR/.next"

# 3) Copy static & public assets into the .next/static and public folders
echo "Copying static assets..."
mkdir -p "$PACK_DIR/.next/static"
cp -a .next/static/* "$PACK_DIR/.next/static/"
mkdir -p "$PACK_DIR/public"
cp -a public/* "$PACK_DIR/public/"

# 4) Copy the SQLite database with ALL data (articles, formations, courses, etc.)
echo "Copying database..."
mkdir -p "$PACK_DIR/db"
cp -a db/custom.db "$PACK_DIR/db/custom.db"

# 5) Ensure Prisma engine is present (standalone may already have it)
echo "Verifying Prisma engine..."
if [ ! -d "$PACK_DIR/node_modules/.prisma/client" ]; then
  mkdir -p "$PACK_DIR/node_modules/.prisma"
  cp -a node_modules/.prisma "$PACK_DIR/node_modules/.prisma" 2>/dev/null || true
fi

# 5b) Fix DATABASE_URL for server path
echo "Fixing DATABASE_URL for server..."
sed -i 's|file:/home/z/my-project/db/custom.db|file:/home/u398373271/institut-qhse/db/custom.db|g' "$PACK_DIR/.env"

# 6) Create keepalive.sh
echo "Creating keepalive.sh..."
cat > "$PACK_DIR/keepalive.sh" << 'KEEPALIVE_EOF'
#!/bin/bash
# keepalive.sh — Auto-restart Node.js server
NODE_BIN="/home/u398373271/node-local/bin/node"
SERVER_DIR="/home/u398373271/institut-qhse"
LOG="$SERVER_DIR/keepalive.log"

while true; do
  # Check if node process is running on port 54321
  if ! pgrep -f "node.*server.js" > /dev/null 2>&1; then
    echo "[$(date)] Server not running, starting..." >> "$LOG"
    cd "$SERVER_DIR" && "$NODE_BIN" server.js >> "$SERVER_DIR/server.log" 2>&1 &
    sleep 5
  fi
  
  # HTTP health check — if no response in 10s, kill stuck process
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

# 7) Create start.sh
echo "Creating start.sh..."
cat > "$PACK_DIR/start.sh" << 'START_EOF'
#!/bin/bash
# start.sh — Manual startup
NODE_BIN="/home/u398373271/node-local/bin/node"
SERVER_DIR="/home/u398373271/institut-qhse"

cd "$SERVER_DIR"

# Kill any existing node process
pkill -f "node.*server.js" 2>/dev/null || true
sleep 2

# Start the server
nohup "$NODE_BIN" server.js >> "$SERVER_DIR/server.log" 2>&1 &
echo "Server started with PID $!"

# Start keepalive in background
nohup bash "$SERVER_DIR/keepalive.sh" >> "$SERVER_DIR/keepalive.log" 2>&1 &
echo "Keepalive started with PID $!"
START_EOF
chmod +x "$PACK_DIR/start.sh"

# 8) Create PHP proxy (index.php for public_html)
echo "Creating PHP proxy..."
cat > "$PACK_DIR/public_html_index.php" << 'PHP_EOF'
<?php
header('Accept-Encoding: identity');
$target = 'http://127.0.0.1:54321';
$url = $target . $_SERVER['REQUEST_URI'];
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Forward headers
foreach (getallheaders() as $name => $value) {
    $lower = strtolower($name);
    if ($lower !== 'accept-encoding' && $lower !== 'host' && $lower !== 'connection') {
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["$name: $value"]);
    }
}

// Forward method and body
$method = $_SERVER['REQUEST_METHOD'];
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
if ($method === 'POST' || $method === 'PUT' || $method === 'PATCH') {
    $body = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

// Get content type from POST
if (!empty($_SERVER['CONTENT_TYPE'])) {
    curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge(
        curl_getinfo($ch, CURLINFO_HEADER_OUT) ? [] : [],
        ['Content-Type: ' . $_SERVER['CONTENT_TYPE']]
    ));
}

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    http_response_code(502);
    echo 'Bad Gateway: ' . $error;
    exit;
}

http_response_code($httpCode);
if ($contentType) header('Content-Type: ' . $contentType);
echo $response;
PHP_EOF

# 9) Create DEPLOY_INSTRUCTIONS.txt
echo "Creating deployment instructions..."
cat > "$PACK_DIR/DEPLOY_INSTRUCTIONS.txt" << 'INSTR_EOF'
============================================================
  HSE ACADEMY — INSTRUCTIONS DE DEPLOIEMENT MANUEL
============================================================

BUILD_ID: BUILDID_PLACEHOLDER

ETAPE 1 — Upload
-----------
Upload le contenu de ce dossier dans:
  /home/u398373271/institut-qhse/

Via SFTP/File Manager Hostinger:
  - Supprimez l'ancien dossier institut-qhse (ou renommez-le en institut-qhse-old)
  - Uploadez TOUT le contenu de hseacademy-deploy/ dans /home/u398373271/institut-qhse/

ETAPE 2 — Permissions
-------------------
chmod +x /home/u398373271/institut-qhse/keepalive.sh
chmod +x /home/u398373271/institut-qhse/start.sh

ETAPE 3 — PHP Proxy
------------------
Remplacez le fichier /home/u398373271/public_html/index.php
par le fichier public_html_index.php (renommez-le en index.php)

ETAPE 4 — Demarrer le serveur
----------------------------
SSH dans le serveur puis:
  cd /home/u398373271/institut-qhse
  bash start.sh

ETAPE 5 — Verifier
-----------------
  curl -I https://hseacademy.online/

============================================================
INSTR_EOF

# Replace BUILD_ID placeholder
sed -i "s/BUILDID_PLACEHOLDER/$BUILD_ID/g" "$PACK_DIR/DEPLOY_INSTRUCTIONS.txt"

# 10) Create the tar.gz
echo "Creating tar.gz archive..."
cd "$TMPDIR"
tar -czf "/home/z/my-project/download/hseacademy-deploy.tar.gz" hseacademy-deploy/

echo ""
echo "============================================================"
echo "  Pack cree: /home/z/my-project/download/hseacademy-deploy.tar.gz"
echo "  Taille: $(du -sh /home/z/my-project/download/hseacademy-deploy.tar.gz | cut -f1)"
echo "  BUILD_ID: $BUILD_ID"
echo "============================================================"

# Cleanup
rm -rf "$TMPDIR"
echo "Done!"
