import paramiko
import os
import time

host = "82.29.189.89"
username = "u398373271"
password = "Ba@Yassine@x1983"
REMOTE_DIR = "/home/u398373271/institut-qhse"
LOCAL_PROJECT = "/home/z/my-project"

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print("Connecting to server...")
    client.connect(host, port=22, username=username, password=password, timeout=30)
    sftp = client.open_sftp()
    print("Connected!")

    # 1) Backup DB from server
    print("\n[1/5] Backing up server database...")
    try:
        sftp.stat(f"{REMOTE_DIR}/db/custom.db")
        sftp.get(f"{REMOTE_DIR}/db/custom.db", f"{LOCAL_PROJECT}/download/server-db-backup.db")
        print("  DB backed up to download/server-db-backup.db")
    except FileNotFoundError:
        print("  No DB on server to backup")

    # 2) Stop server
    print("\n[2/5] Stopping existing server...")
    stdin, stdout, stderr = client.exec_command("pkill -f 'node.*server.js' 2>/dev/null; pkill -f 'keepalive' 2>/dev/null; sleep 1; echo done")
    stdout.read()
    print("  Stopped")

    # 3) Clean old code (keep db/ and logs)
    print("\n[3/5] Cleaning old code (preserving db/)...")
    stdin, stdout, stderr = client.exec_command(f"""
        cd {REMOTE_DIR}
        ls -A | grep -v '^db$' | xargs rm -rf 2>/dev/null
        # Also handle hidden files
        find . -maxdepth 1 -name '.*' ! -name '.' -exec rm -rf {{}} + 2>/dev/null
        echo cleaned
    """)
    print("  " + stdout.read().decode().strip())

    # 4) Upload new build
    print("\n[4/5] Uploading new build...")

    def upload_dir(local_dir, remote_dir):
        count = 0
        for item in os.listdir(local_dir):
            if item in ['.git', '__pycache__', '.DS_Store']:
                continue
            local_path = os.path.join(local_dir, item)
            remote_path = f"{remote_dir}/{item}"
            if os.path.isfile(local_path):
                sftp.put(local_path, remote_path)
                count += 1
            elif os.path.isdir(local_path):
                try:
                    sftp.stat(remote_path)
                except FileNotFoundError:
                    sftp.mkdir(remote_path)
                count += upload_dir(local_path, remote_path)
        return count

    # Upload standalone
    standalone = f"{LOCAL_PROJECT}/.next/standalone"
    print("  Uploading standalone build...")
    n = upload_dir(standalone, REMOTE_DIR)
    print(f"  {n} files uploaded")

    # .env with correct DB path
    print("  Writing .env...")
    with sftp.file(f"{REMOTE_DIR}/.env", "w") as f:
        f.write("DATABASE_URL=file:/home/u398373271/institut-qhse/db/custom.db\n")

    # Static assets
    print("  Uploading static assets...")
    try:
        sftp.stat(f"{REMOTE_DIR}/.next/static")
    except FileNotFoundError:
        sftp.mkdir(f"{REMOTE_DIR}/.next/static")
    n2 = upload_dir(f"{LOCAL_PROJECT}/.next/static", f"{REMOTE_DIR}/.next/static")
    print(f"  {n2} static files")

    # Public
    print("  Uploading public/...")
    try:
        sftp.stat(f"{REMOTE_DIR}/public")
    except FileNotFoundError:
        sftp.mkdir(f"{REMOTE_DIR}/public")
    n3 = upload_dir(f"{LOCAL_PROJECT}/public", f"{REMOTE_DIR}/public")
    print(f"  {n3} public files")

    # keepalive.sh
    print("  Writing keepalive.sh...")
    with sftp.file(f"{REMOTE_DIR}/keepalive.sh", "w") as f:
        f.write('''#!/bin/bash
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
''')

    # PHP proxy
    print("  Writing PHP proxy...")
    with sftp.file("/home/u398373271/public_html/index.php", "w") as f:
        f.write('''<?php
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
''')

    # Permissions
    stdin, stdout, stderr = client.exec_command(f"chmod +x {REMOTE_DIR}/keepalive.sh")
    stdout.read()

    sftp.close()

    # 5) Start server
    print("\n[5/5] Starting server...")
    stdin, stdout, stderr = client.exec_command(f"""
        cd {REMOTE_DIR}
        nohup /home/u398373271/node-local/bin/node server.js > {REMOTE_DIR}/server.log 2>&1 &
        echo "Server PID: $!"
        nohup bash {REMOTE_DIR}/keepalive.sh > {REMOTE_DIR}/keepalive.log 2>&1 &
        echo "Keepalive PID: $!"
    """)
    print(stdout.read().decode().strip())

    # Verify
    time.sleep(6)
    print("\nVerifying...")
    stdin, stdout, stderr = client.exec_command("curl -sf -o /dev/null -w '%{http_code}' --max-time 15 http://localhost:54321/ 2>/dev/null || echo FAIL")
    result = stdout.read().decode().strip()
    if result != 'FAIL':
        print(f"  Server responding: HTTP {result}")
    else:
        print("  Server not responding, checking logs...")
        stdin, stdout, stderr = client.exec_command(f"tail -20 {REMOTE_DIR}/server.log 2>/dev/null")
        print(stdout.read().decode()[-1500:])

    client.close()
    print("\nDeploy complete!")

if __name__ == '__main__':
    main()
