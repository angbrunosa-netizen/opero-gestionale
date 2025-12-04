<?php
/**
 * PROXY PER TRACKING EMAIL - Host Pubblico
 *
 * Questo file PHP può essere caricato su un hosting pubblico
 * per reindirizzare le richieste di tracking al server locale.
 *
 * Installazione:
 * 1. Carica questo file su un hosting PHP pubblico
 * 2. Aggiorna PUBLIC_API_URL nel .env con l'URL pubblico
 * 3. Il proxy reindirizzerà le richieste al server locale
 */

// Configurazione
define('LOCAL_SERVER_URL', 'http://192.168.1.19:3001');
define('ENABLE_LOGGING', true);

// Logging function
function logRequest($trackingId, $action, $details = '') {
    if (ENABLE_LOGGING) {
        $logMessage = sprintf(
            "[%s] %s - %s - %s - IP: %s, UA: %s\n",
            date('Y-m-d H:i:s'),
            $trackingId,
            $action,
            $details,
            $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        );

        // Scrivi su file di log
        file_put_contents('tracking-proxy.log', $logMessage, FILE_APPEND | LOCK_EX);
    }
}

// Function per fare una richiesta HTTP
function makeProxyRequest($url) {
    $ch = curl_init();

    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_USERAGENT => $_SERVER['HTTP_USER_AGENT'] ?? 'Opero-Tracking-Proxy/1.0'
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);

    curl_close($ch);

    if ($error) {
        logRequest('proxy', 'ERROR', 'Curl error: ' . $error);
        return ['success' => false, 'error' => $error];
    }

    return ['success' => true, 'httpCode' => $httpCode, 'response' => $response];
}

// Parsing della richiesta
$requestUri = $_SERVER['REQUEST_URI'];
$parsedUrl = parse_url($requestUri);
$path = $parsedUrl['path'] ?? '';

// Estrai il tracking ID dal path
if (preg_match('/\/track\/(open|download)\/([^\/\?]+)/', $path, $matches)) {
    $trackingType = $matches[1]; // 'open' o 'download'
    $trackingId = $matches[2];

    // Costruisci URL locale
    $localUrl = LOCAL_SERVER_URL . '/api/track/' . $trackingType . '/' . $trackingId;

    // Aggiungi query string se presente
    if (!empty($_SERVER['QUERY_STRING'])) {
        $localUrl .= '?' . $_SERVER['QUERY_STRING'];
    }

    // Log della richiesta
    logRequest($trackingId, 'PROXY_REQUEST', 'Forwarding to: ' . $localUrl);

    // Fai la richiesta proxy
    $result = makeProxyRequest($localUrl);

    if ($result['success']) {
        // Invia headers appropriati
        if ($trackingType === 'open') {
            // Per tracking apertura, invia pixel trasparente
            header('Content-Type: image/gif');
            header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
            header('Pragma: no-cache');
            header('Expires: 0');

            // Pixel GIF trasparente 1x1
            echo base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
        } else {
            // Per download, reindirizza la risposta
            $contentType = $result['httpCode'] === 200 ? 'application/json' : 'text/plain';
            header('Content-Type: ' . $contentType);
            echo $result['response'];
        }

        logRequest($trackingId, 'PROXY_SUCCESS', 'HTTP ' . $result['httpCode']);

    } else {
        // Errore nel proxy
        header('HTTP/1.1 502 Bad Gateway');
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Proxy error: ' . $result['error']]);

        logRequest($trackingId, 'PROXY_ERROR', $result['error']);
    }

} else {
    // Path non valido per tracking
    header('HTTP/1.1 404 Not Found');
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Invalid tracking path']);

    logRequest('unknown', 'INVALID_PATH', $path);
}

?>