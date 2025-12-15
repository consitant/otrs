<?php
// Datei aus THEORG 16.43

function setupCacheSession()
{
    @ini_set("session.use_cookies", 0);
    session_id("OTRS-GATEWAY-CACHE");
    session_start();
}

function getProxyHost()
{
    return isset($_SESSION["proxyhost"]) ? $_SESSION["proxyhost"] : null;
}

function setProxyHost($host)
{
    if ($host === null)
        unset($_SESSION["proxyhost"]);
    else
        $_SESSION["proxyhost"] = $host;
}

function getUnavailabilityMessage()
{
    global $serviceUnavailableMessage;
    return $serviceUnavailableMessage;
}

function debug($title, $content = null)
{
    global $debugLog;

    if ($debugLog !== null) {
        $entry = array();
        $entry["title"] = $title;
        $entry["content"] = $content ? print_r($content, true) : null;
        $debugLog[] = $entry;
    }
}

function setupDebugging($debugging)
{
    global $debugLog;
    $debugLog = $debugging ? array() : null;
    @error_reporting($debugging ? E_ALL : 0);
    @ini_set("display_errors", $debugging ? "On" : "Off");
}

function generateDebugOutput($debugLog)
{
    $output = "<style>.debug{padding:.8em;margin-bottom:1em;color:#000;font:81.25% Verdana,Arial,Helvetica,sans-serif;color:#4b4b4b;font-size:13px;background-color:#f8f9fa;border:1px solid;border-color:#ccc;border-radius:5px}.debug-title{display:inline-block;margin:0 0 .5em 0;color:#800}.debug-content{display:block;padding:.8em;color:#000;background-color:#dcdcdc;border:1px solid;border-color:#ccc;border-radius:5px;unicode-bidi:embed;font-family:monospace;overflow:scroll}</style>"
        . "<div class=\"debug\">"
        . "<h1 class=\"debug-title\">Debug-Modus aktiv!</h1> <strong>Bitte anschlie&szlig;end in <code>otrs.php.conf</code> deaktivieren.</strong>";

    foreach ($debugLog as $debugEntry) {
        $title = $debugEntry["title"];
        $content = $debugEntry["content"];

        $output .= "<div>&gt;&nbsp;" . $title;

        if ($content)
            $output .= "<pre class=\"debug-content\">" . $content . "</pre>";

        $output .= "</div>";
    }

    $output .= "</div>";

    return $output;
}

function getUri($queryString)
{
    $uri = "/otrs";
    if (!empty($queryString))
        $uri .= "?" . $queryString;

    return $uri;
}

function requestProxyHost($gatewayID)
{
    $curl = curl_init();
    try {
        curl_setopt($curl, CURLOPT_URL, "https://wm-th.sovd.cloud/c/assign");
        curl_setopt($curl, CURLOPT_HEADER, true);
        curl_setopt($curl, CURLOPT_NOBODY, true);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HTTPHEADER, array(
            "X-App-Id: $gatewayID",
        ));

        $headers = array();
        curl_setopt(
            $curl,
            CURLOPT_HEADERFUNCTION,
            function ($curl, $header) use (&$headers) {
                return parseCurlHeader($header, $headers);
            }
        );

        curl_exec($curl);
        $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    } finally {
        curl_close($curl);
    }

    switch ($status) {
        case HTTP_TEMPORARY_REDIRECT:
            return $headers["x-host"][0];
        default:
            return null;
    }
}

function parseCurlHeader($header, &$headers)
{
    $len = strlen($header);
    $parts = preg_split("/: */", $header, 2);

    if (count($parts) === 2)
        $headers[strtolower(trim($parts[0]))][] = trim($parts[1]);

    return $len;
}

function isGatewayResponse($headers)
{
    return !isset($headers["x-forwared-for-app-id"]) && !isset($headers["x-forwarded-for-app-id"]);
}

function forwardRequest($gatewayID, $host, $port, $ssl, $sslConfig)
{
    $hasGatewayID = !empty($gatewayID);
    $tryGatewayAgain = false;

    $requestMethod = $_SERVER["REQUEST_METHOD"];

    if ($requestMethod != "GET" && $requestMethod != "POST")
        throw new Exception("Invalid request method");

    $requestUri = getUri($_SERVER["QUERY_STRING"]);
    $requestContent = file_get_contents("php://input");
    $requestHeaders = array(
        "X-App-Id: $gatewayID",
    );
    $protocol = $ssl ? "https" : "http";

    while (true) {
        if ($tryGatewayAgain) {
            debug("Proxy-Host neu ermitteln nach Fehler 502, Anfragen beim LoadBalancer");
            $host = requestProxyHost($gatewayID);
            setProxyHost($host);
            if (!$host) {
                debug("Proxy-Host konnte nicht ermittelt werden");
                throw new Exception("Gateway could not be identified");
            }
            debug("Verwende neuen Proxy-Host", $host);
        }

        $url = "$protocol://$host:$port$requestUri";
        debug($requestMethod . "-Anfrage", $url);

        $curl = curl_init();
        try {
            curl_setopt($curl, CURLOPT_URL, $url);
            curl_setopt($curl, CURLOPT_HEADER, true);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($curl, CURLOPT_ENCODING, "gzip");
            curl_setopt($curl, CURLOPT_HTTPHEADER, $requestHeaders);

            if ($ssl && isset($sslConfig["cafile"]))
                curl_setopt($curl, CURLOPT_CAINFO, $sslConfig["cafile"]);

            $headers = array();
            curl_setopt(
                $curl,
                CURLOPT_HEADERFUNCTION,
                function ($curl, $header) use (&$headers) {
                    return parseCurlHeader($header, $headers);
                }
            );

            if ($requestMethod === "POST") {
                debug("POST-Daten", $requestContent);

                curl_setopt($curl, CURLOPT_POST, true);
                curl_setopt($curl, CURLOPT_POSTFIELDS, $requestContent);
            }

            $response = curl_exec($curl);
            $statusCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
            $headerSize = curl_getinfo($curl, CURLINFO_HEADER_SIZE);
        } finally {
            curl_close($curl);
        }

        if ($response === false)
            throw new Exception("curl_exec failed");

        if ($hasGatewayID && isGatewayResponse($headers)) {
            debug("Gateway-HTTP-Status (" . $statusCode . ") auswerten");

            switch ($statusCode) {
                case HTTP_BAD_GATEWAY:
                    setProxyHost(null);

                    if ($tryGatewayAgain)
                        throw new Exception("Bad Gateway");

                    $tryGatewayAgain = true;
                    break;
                default:
                    return substr($response, $headerSize);
            }
        } else {
            debug("SovdWeb-HTTP-Status (" . $statusCode . ") auswerten");

            switch ($statusCode) {
                case HTTP_SERVICE_UNAVAILABLE:
                    throw new Exception("Service Unavailable");
                case HTTP_NOT_FOUND:
                    throw new Exception("Not Found");
                default:
                    return substr($response, $headerSize);
            }
        }
    }
}

function execute($gatewayID, $host, $port, $ssl, $sslConfig)
{
    if ($gatewayID) {
        $host = getProxyHost();

        if (!$host) {
            debug("Kein Proxy-Host zwischengespeichert, Anfragen beim LoadBalancer");
            $host = requestProxyHost($gatewayID);
            setProxyHost($host);
        } else
            debug("Verwende zwischengespeicherten Proxy-Host", $host);

        if (!$host)
            throw new Exception("No host provided");

        $port = 443;
        $ssl = true;
        $sslConfig = null;
    }

    return forwardRequest($gatewayID, $host, $port, $ssl, $sslConfig);
}

function assureValue(&$variable)
{
    if (!isset($variable))
        $variable = null;
}

header("Content-Type: text/html; charset=Windows-1252");

if (!include_once "otrs.conf.php") {
    setupDebugging(false);
    die("Die Konfigurationsdatei <code>otrs.conf.php</code> konnte nicht gefunden werden. Bitte schlie&szlig;en Sie die Konfiguration vollst&auml;ndig ab.");
}

define("HTTP_TEMPORARY_REDIRECT", 307);
define("HTTP_NOT_FOUND", 404);
define("HTTP_BAD_GATEWAY", 502);
define("HTTP_SERVICE_UNAVAILABLE", 503);

setupDebugging($debugging);
setupCacheSession();
assureValue($gatewayID);
assureValue($host);

if (empty($gatewayID) && empty($host))
    die("Die Konfiguration der Online-Terminreservierung ist unvollst&auml;ndig.");

assureValue($port);
assureValue($ssl);
assureValue($sslConfig);

if (empty($gatewayID))
    setProxyHost(null);

debug("PHP-Sitzungsdaten", array(
    "session_id" => session_id(),
    "session" => $_SESSION
));

$content = null;

ob_start();
try {
    $content = execute($gatewayID, $host, $port, $ssl, $sslConfig);
} catch (Exception $error) {
    debug("Exception occured", $error);
    $content = getUnavailabilityMessage();
} finally {
    $scriptOutput = ob_get_contents();
    ob_end_clean();

    if (!empty($scriptOutput))
        debug("Script-Ausgabe", $scriptOutput);
}

if ($debugLog !== null)
    echo generateDebugOutput($debugLog);

echo $content;
