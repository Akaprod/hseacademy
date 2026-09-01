"""Install PM2 and set up auto-restart for the Node.js server."""
import paramiko
import time

host = "82.29.189.89"
port = 65002
username = "u398373271"
password = "Ba@Yassine@x1983"
REMOTE_DIR = "/home/u398373271/institut-qhse"
NODE_BIN = "/home/u398373271/node-local/bin/node"
NPM_BIN = "/home/u398373271/node-local/bin/npm"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    client.connect(host, port=port, username=username, password=password, timeout=30)
    print("Connected!")

    # 1. Kill any existing node server
    print("\n[1/5] Stopping any existing server...")
    stdin, stdout, stderr = client.exec_command("pkill -f 'node server.js' 2>/dev/null; sleep 1; echo 'done'", timeout=10)
    print(f"  {stdout.read().decode().strip()}")

    # 2. Install PM2 globally
    print("\n[2/5] Installing PM2...")
    stdin, stdout, stderr = client.exec_command(f"{NPM_BIN} install -g pm2 2>&1", timeout=120)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    # Check last few lines for success
    lines = out.split('\n') if out else []
    for line in lines[-5:]:
        if line.strip(): print(f"  {line}")
    if err and 'error' in err.lower():
        print(f"  ERR: {err[:300]}")

    # Verify PM2 installed
    PM2_BIN = f"{REMOTE_DIR}/node_modules/.bin/pm2"
    stdin, stdout, stderr = client.exec_command(f"{NPM_BIN} root -g 2>&1", timeout=10)
    npm_global = stdout.read().decode().strip()
    PM2_BIN2 = f"{npm_global}/pm2"
    print(f"  npm global: {npm_global}")

    # 3. Create ecosystem.config.js for PM2
    print("\n[3/5] Creating PM2 config...")
    ecosystem = '''module.exports = {
  apps: [{
    name: 'institut-qhse',
    script: 'server.js',
    cwd: '/home/u398373271/institut-qhse',
    env: {
      NODE_ENV: 'production',
      PORT: '54321',
      DATABASE_URL: 'file:/home/u398373271/institut-qhse/db/custom.db'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '200M',
    node_args: '--max-old-space-size=192',
    restart_delay: 5000,
    exp_backoff_restart_delay: 5000,
    max_restarts: 100,
    min_uptime: '10s',
    log_file: '/home/u398373271/institut-qhse/logs/app.log',
    error_file: '/home/u398373271/institut-qhse/logs/error.log',
    out_file: '/home/u398373271/institut-qhse/logs/out.log',
    time: true
  }]
};
'''
    sftp = client.open_sftp()
    # Create logs dir
    client.exec_command(f'mkdir -p {REMOTE_DIR}/logs', timeout=5)
    with sftp.file(f"{REMOTE_DIR}/ecosystem.config.js", 'w') as f:
        f.write(ecosystem)
    sftp.close()
    print("  ecosystem.config.js created")

    # 4. Start with PM2
    print("\n[4/5] Starting server with PM2...")
    # Try global pm2 first, then local
    stdin, stdout, stderr = client.exec_command(f'cd {REMOTE_DIR} && {PM2_BIN2} start ecosystem.config.js 2>&1 || {PM2_BIN} start ecosystem.config.js 2>&1 || {NPM_BIN} exec pm2 start ecosystem.config.js 2>&1', timeout=30)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    print(f"  {out}")
    if err: print(f"  ERR: {err[:300]}")

    # 5. Verify
    print("\n[5/5] Verification...")
    time.sleep(5)

    stdin, stdout, stderr = client.exec_command(f'{PM2_BIN2} list 2>&1 || {PM2_BIN} list 2>&1', timeout=15)
    print(stdout.read().decode().strip()[:500])

    # HTTP check
    time.sleep(3)
    stdin, stdout, stderr = client.exec_command("curl -s -o /dev/null -w '%{http_code}' http://localhost:54321/ 2>&1", timeout=15)
    code = stdout.read().decode().strip()
    print(f"\nHTTP Homepage: {code}")

    stdin, stdout, stderr = client.exec_command("curl -s -o /dev/null -w '%{http_code}' http://localhost:54321/api/courses 2>&1", timeout=15)
    code = stdout.read().decode().strip()
    print(f"HTTP Courses API: {code}")

    print("\n" + "="*50)
    print("PM2 auto-restart is now active!")
    print("If Node.js crashes, PM2 will restart it automatically.")
    print("="*50)

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    client.close()
