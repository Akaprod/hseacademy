import paramiko, time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('82.29.189.89', port=65002, username='u398373271', password='Ba@Yassine@x1983', timeout=30)

REMOTE_DIR = '/home/u398373271/institut-qhse'

proxy_php = '''<?php
$target = "http://127.0.0.1:54321";
$url = $target . $_SERVER["REQUEST_URI"];
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 300);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);

$headers = [];
foreach (getallheaders() as $key => $value) {
    $lk = strtolower($key);
    if ($lk === "host") continue;
    if ($lk === "accept-encoding") continue;
    $headers[] = "$key: $value";
}
$headers[] = "Accept-Encoding: identity";
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$method = $_SERVER["REQUEST_METHOD"];
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
if (in_array($method, ["POST","PUT","PATCH"])) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents("php://input"));
}

$response_headers = [];
curl_setopt($ch, CURLOPT_HEADERFUNCTION, function($ch, $header) use (&$response_headers) {
    $len = strlen($header);
    $hl = strtolower($header);
    if (preg_match("/^transfer-encoding:/i", $header)) return $len;
    if (preg_match("/^connection:/i", $header)) return $len;
    if (preg_match("/^keep-alive:/i", $header)) return $len;
    $response_headers[] = $header;
    header($header, false);
    return $len;
});

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerCT = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$headerCL = curl_getinfo($ch, CURLINFO_SIZE_DOWNLOAD);
curl_close($ch);

// CDN cache control
$is_html = ($headerCT && strpos($headerCT, "text/html") !== false);
$is_api = (strpos($_SERVER["REQUEST_URI"], "/api/") !== false);
$is_static = (strpos($_SERVER["REQUEST_URI"], "/_next/static/") !== false);

if ($is_html || $is_api) {
    // Vary: * prevents ALL CDN caching (RFC says must not cache)
    header("Vary: *");
    header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0, s-maxage=0");
    header("Pragma: no-cache");
    header("Expires: Wed, 11 Jan 1984 05:00:00 GMT");
} elseif (!$is_static) {
    header("Vary: *");
    header("Cache-Control: no-cache, must-revalidate");
}

http_response_code($httpCode);
if ($headerCT && !$is_html) header("Content-Type: " . $headerCT);
if ($headerCL > 0) header("Content-Length: " . $headerCL);
echo $response;
?>
'''

sftp = client.open_sftp()
with sftp.file(f'{REMOTE_DIR}/public_html/index.php', 'w') as f:
    f.write(proxy_php)
sftp.close()

print('PHP proxy updated with Vary: * for HTML/API')

# Verify after a few seconds
print('Waiting for CDN propagation...')
time.sleep(5)

# Test via localhost first
stdin, stdout, stderr = client.exec_command('curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:54321/ 2>&1', timeout=15)
print(f'Server: {stdout.read().decode().strip()}')

client.close()
print('Done! Try https://hseacademy.online/ now (hard refresh Ctrl+Shift+R)')
