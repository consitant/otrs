<?php
// Datei aus THEORG 16.43

// SovdWeb-Verbindungseinstellungen

$gatewayID = "Mjc5MTE6NXBa/KkoQN4elcbg";
// Die Gateway-ID finden Sie in den SovdWeb-Einstellungen unter "Module -> Verbindungseinstellungen".
// Dieser Wert muss in Anführungszeichen ("") $gatewayID zugewiesen werden.
// Wenn $gatewayID nicht null entspricht, werden $host, $port, $ssl und $sslConfig ignoriert.
// Beispiel:
// $gatewayID = "MTY1NjI666JiZYBibuZEqZJlI";

$host = "127.0.0.1";
$port = 59126;

$ssl = false;
$sslConfig = [
    // "cafile" => ""
];

// Zusätzliche Einstellungen

$serviceUnavailableMessage = "Leider steht die Online-Terminreservierung zurzeit nicht zur Verf&uuml;gung.<br>"
    . "Bitte versuchen Sie es zu einem sp&auml;teren Zeitpunkt noch einmal.<br>"
    . "Gerne vereinbaren wir auch telefonisch einen Termin mit Ihnen.";

$debugging = false;
