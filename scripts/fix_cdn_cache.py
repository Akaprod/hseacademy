import paramiko, time

host = "82.29.189.89"
port = 65002
username = "u398373271"
password = "Ba@Yassine@x1983"
REMOTE_DIR = "/home/u398373271/institut-qhse"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    client.connect(host, port=port, username=username, password=password, timeout=30)
    print("Connected!")

    # Update PHP proxy with no-cache headers for HTML, cache for static assets
    proxy_php = r'''<?php
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
    // Skip hop-by-hop headers
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

// Prevent CDN caching for HTML pages and API responses
if ($httpCode == 200) {
    $is_html = ($headerCT && strpos($headerCT, "text/html") !== false);
    $is_api = (strpos($_SERVER["REQUEST_URI"], "/api/") !== false);
    $is_static = (strpos($_SERVER["REQUEST_URI"], "/_next/static/") !== false);

    if ($is_html || $is_api) {
        header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
        header("Pragma: no-cache");
        header("Expires: 0");
    } elseif (!$is_static) {
        // For non-static, non-API, non-HTML: short cache
        header("Cache-Control: no-cache, must-revalidate");
    }
    // Static assets (_next/static/) keep their original cache headers
}

http_response_code($httpCode);
if ($headerCT) header("Content-Type: " . $headerCT);
if ($headerCL > 0) header("Content-Length: " . $headerCL);
echo $response;
?>
'''

    sftp = client.open_sftp()
    with sftp.file(f"{REMOTE_DIR}/public_html/index.php", "w") as f:
        f.write(proxy_php)
    sftp.close()
    print("PHP proxy updated with cache-control headers")

    # Also add .htaccess to prevent CDN caching of HTML
    htaccess = '''RewriteEngine On

# Prevent CDN caching of HTML and dynamic content
<IfModule mod_headers.c>
    <FilesMatch "\.(html|php)$">
        Header set Cache-Control "no-store, no-cache, must-revalidate"
    </FilesMatch>
</IfModule>

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]
'''
    sftp = client.open_sftp()
    with sftp.file(f"{REMOTE_DIR}/public_html/.htaccess", "w") as f:
        f.write(htaccess)
    sftp.close()
    print(".htaccess updated")

    # Verify
    print("\nVerification:")
    stdin, stdout, stderr = client.exec_command("head -5 " + REMOTE_DIR + "/public_html/index.php", timeout=10)
    print(stdout.read().decode().strip())

    # Test locally that server still works
    time.sleep(1)
    stdin, stdout, stderr = client.exec_command("curl -s -o /dev/null -w 'HTTP %{http_code}' http://localhost:54321/ 2>&1", timeout=15)
    print(f"Local server: {stdout.read().decode().strip()}")

    print("\nLe cache CDN sera invalide au prochain chargement.")
    print("Si l'erreur persiste, faire Ctrl+Shift+R (hard refresh) dans le navigateur.")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    client.close()
