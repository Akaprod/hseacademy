"""Setup keepalive + restart server on Hostinger."""
import paramiko
import time

host = "82.29.189.89"
port = 65002
username = "u398373271"
password = "Ba@Yassine@x1983"
REMOTE_DIR = "/home/u398373271/institut-qhse"
NODE_BIN = "/home/u398373271/node-local/bin/node"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    client.connect(host, port=port, username=username, password=password, timeout=30)
    print("Connected!")

    # 1. Kill everything first
    print("\n[1/4] Cleaning up...")
    client.exec_command("pkill -f 'node server.js' 2>/dev/null; pkill -f keepalive 2>/dev/null; sleep 2", timeout=10)
    print("  Cleaned")

    # 2. Upload keepalive script
    print("\n[2/4] Creating keepalive script...")
    keepalive = '''#!/bin/bash
# Keepalive script for institut-qhse Node.js server
# Checks every 30 seconds and restarts if down

NODE_BIN="/home/u398373271/node-local/bin/node"
DIR="/home/u398373271/institut-qhse"
LOG="$DIR/logs/keepalive.log"
SERVER_LOG="$DIR/server.log"

mkdir -p "$DIR/logs"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Keepalive started" >> "$LOG"

while true; do
    # Check if node server is running
    if ! pgrep -f "node server.js" > /dev/null 2>&1; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Server DOWN - restarting..." >> "$LOG"
        
        # Kill any zombie/stuck processes
        pkill -9 -f "node server.js" 2>/dev/null
        sleep 2
        
        # Start server
        cd "$DIR"
        NODE_ENV=production PORT=54321 nohup "$NODE_BIN" server.js > "$SERVER_LOG" 2>&1 &
        
        # Wait and verify
        sleep 5
        if pgrep -f "node server.js" > /dev/null 2>&1; then
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] Server restarted successfully (PID: $(pgrep -f 'node server.js' | head -1))" >> "$LOG"
        else
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Server failed to start!" >> "$LOG"
            # Log the error
            tail -5 "$SERVER_LOG" >> "$LOG"
        fi
    fi
    
    # Also do a health check - if server is running but not responding, kill it
    if pgrep -f "node server.js" > /dev/null 2>&1; then
        HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 http://127.0.0.1:54321/ 2>/dev/null)
        if [ "$HTTP_CODE" != "200" ]; then
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] Health check failed (HTTP $HTTP_CODE) - killing stuck process" >> "$LOG"
            pkill -9 -f "node server.js" 2>/dev/null
            sleep 2
        fi
    fi
    
    sleep 30
done
'''

    sftp = client.open_sftp()
    with sftp.file(f"{REMOTE_DIR}/keepalive.sh", "w") as f:
        f.write(keepalive)
    sftp.close()

    # Make executable
    client.exec_command(f"chmod +x {REMOTE_DIR}/keepalive.sh", timeout=5)
    print("  keepalive.sh created")

    # Also create a simple startup script
    startup = '''#!/bin/bash
DIR="/home/u398373271/institut-qhse"
NODE_BIN="/home/u398373271/node-local/bin/node"

# Kill old processes
pkill -f "node server.js" 2>/dev/null
pkill -f keepalive.sh 2>/dev/null
sleep 2

# Start server
mkdir -p "$DIR/logs"
cd "$DIR"
NODE_ENV=production PORT=54321 nohup "$NODE_BIN" server.js > "$DIR/server.log" 2>&1 &
echo "Server started, PID: $!"
sleep 5

# Start keepalive
cd "$DIR"
nohup bash "$DIR/keepalive.sh" > /dev/null 2>&1 &
echo "Keepalive started, PID: $!"

# Verify
sleep 3
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:54321/
'''
    sftp = client.open_sftp()
    with sftp.file(f"{REMOTE_DIR}/start.sh", "w") as f:
        f.write(startup)
    sftp.close()
    client.exec_command(f"chmod +x {REMOTE_DIR}/start.sh", timeout=5)
    print("  start.sh created")

    # 3. Start server + keepalive
    print("\n[3/4] Starting server + keepalive...")
    # Start server directly first
    stdin, stdout, stderr = client.exec_command(f"cd {REMOTE_DIR} && mkdir -p logs && NODE_ENV=production PORT=54321 nohup {NODE_BIN} server.js > {REMOTE_DIR}/server.log 2>&1 &", timeout=5)
    time.sleep(5)
    
    # Start keepalive in background
    client.exec_command(f"cd {REMOTE_DIR} && nohup bash {REMOTE_DIR}/keepalive.sh > /dev/null 2>&1 &", timeout=5)
    print("  Server + keepalive started")
    time.sleep(3)

    # 4. Verify
    print("\n[4/4] Verification...")
    stdin, stdout, stderr = client.exec_command("ps aux | grep -E 'node server|keepalive' | grep -v grep", timeout=10)
    out = stdout.read().decode().strip()
    print(f"Processes:\n{out if out else '  NONE!'}")

    stdin, stdout, stderr = client.exec_command(f"cat {REMOTE_DIR}/server.log 2>&1", timeout=10)
    log = stdout.read().decode().strip()
    print(f"\nServer log: {log[:300]}")

    stdin, stdout, stderr = client.exec_command(f"cat {REMOTE_DIR}/logs/keepalive.log 2>&1", timeout=10)
    klog = stdout.read().decode().strip()
    print(f"Keepalive log: {klog[:300]}")

    # HTTP checks
    print("\nHTTP checks:")
    for label, path in [("Homepage", "/"), ("Courses", "/api/courses"), ("Articles", "/api/articles?limit=1")]:
        stdin, stdout, stderr = client.exec_command(f"curl -s -o /dev/null -w '%{{http_code}}' http://localhost:54321{path} 2>&1", timeout=15)
        code = stdout.read().decode().strip()
        print(f"  {label}: HTTP {code} {'OK' if code == '200' else 'FAIL'}")

    print("\n" + "="*50)
    print("Keepalive is active - server will auto-restart if it crashes.")
    print("Check logs: " + REMOTE_DIR + "/logs/keepalive.log")
    print("="*50)

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    client.close()
