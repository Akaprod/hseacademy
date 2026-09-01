import paramiko
import re

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('82.29.189.89', port=65002, username='u398373271', password='Ba@Yassine@x1983', timeout=30)

# Get the full HTML
stdin, stdout, stderr = client.exec_command('curl -s http://localhost:54321/ 2>&1', timeout=15)
html = stdout.read().decode()

# Extract all static file references
js_files = re.findall(r'(/_next/static/[^"\'>\s]+\.js)', html)
css_files = re.findall(r'(/_next/static/[^"\'>\s]+\.css)', html)
font_files = re.findall(r'(/_next/static/[^"\'>\s]+\.woff2)', html)

print(f'JS files: {len(js_files)}')
for f in js_files[:3]: print(f'  {f}')
print(f'CSS files: {len(css_files)}')
for f in css_files: print(f'  {f}')
print(f'Font files: {len(font_files)}')
for f in font_files: print(f'  {f}')

# Check each static file on server filesystem and via HTTP
print()
print('=== FILE CHECKS ===')
all_static = js_files + css_files + font_files
for f in all_static:
    # File exists?
    stdin, stdout, stderr = client.exec_command(f'test -f /home/u398373271/institut-qhse{f} && echo OK || echo MISSING', timeout=5)
    exists = stdout.read().decode().strip()
    
    # HTTP accessible?
    stdin, stdout, stderr = client.exec_command(f'curl -s -o /dev/null -w "%{{http_code}}" http://localhost:54321{f}', timeout=10)
    http_code = stdout.read().decode().strip()
    
    status = 'OK' if exists == 'OK' and http_code == '200' else 'PROBLEM'
    if status != 'OK':
        print(f'  {status} {f} (exists={exists}, http={http_code})')

print(f'\nChecked {len(all_static)} files')

# Check for any JS errors by looking at the main page chunk
print('\n=== CHECK MAIN CHUNK ===')
if js_files:
    main_js = js_files[0]
    stdin, stdout, stderr = client.exec_command(f'wc -c /home/u398373271/institut-qhse{main_js}', timeout=5)
    print(f'{main_js}: {stdout.read().decode().strip()}')

# Check .next/static directory
stdin, stdout, stderr = client.exec_command('ls /home/u398373271/institut-qhse/.next/static/chunks/ 2>&1 | wc -l', timeout=5)
print(f'\nTotal chunks in .next/static/chunks/: {stdout.read().decode().strip()}')

stdin, stdout, stderr = client.exec_command('du -sh /home/u398373271/institut-qhse/.next/static/ 2>&1', timeout=5)
print(f'Static dir size: {stdout.read().decode().strip()}')

client.close()
