# OTRS Portal - Synology NAS Hosting Anleitung

Diese Anleitung beschreibt die Installation des OTRS Terminplanungsportals auf einer Synology NAS mit Web Station und Reverse Proxy.

---

## Voraussetzungen

- Synology NAS mit DSM 7.0 oder neuer
- Administratorzugang zur NAS
- Eine Domain oder Subdomain (z.B. `termine.meinedomain.de`)
- Port 443 (HTTPS) muss von außen erreichbar sein (Router-Portweiterleitung)

---

## Schritt 1: Web Station installieren

1. Öffnen Sie das **Paket-Zentrum** auf Ihrer Synology NAS
2. Suchen Sie nach **"Web Station"**
3. Klicken Sie auf **Installieren**
4. Warten Sie bis die Installation abgeschlossen ist

> **Hinweis:** Web Station installiert automatisch einen Webserver (nginx oder Apache)

---

## Schritt 2: Ordnerstruktur anlegen

1. Öffnen Sie **File Station**
2. Navigieren Sie zum Ordner **`web`** (wird automatisch von Web Station erstellt)
3. Erstellen Sie einen neuen Ordner: **`portal`**
   - Rechtsklick → Erstellen → Ordner erstellen → `portal`

Die Struktur sollte so aussehen:
```
/web/
└── portal/
```

---

## Schritt 3: Dateien hochladen

Laden Sie alle Portal-Dateien in den Ordner `/web/portal/` hoch:

### Per File Station:
1. Öffnen Sie **File Station**
2. Navigieren Sie zu `/web/portal/`
3. Klicken Sie auf **Hochladen** → **Hochladen - Überspringen**
4. Wählen Sie alle Dateien aus:
   - `tcal.js`
   - `tcal.css`
   - `otrs.css`
   - `planer.html` (falls vorhanden)
   - Den kompletten `img/` Ordner

### Alternative per SSH/SFTP:
```bash
scp -r * benutzer@nas-ip:/volume1/web/portal/
```

---

## Schritt 4: Index-Datei erstellen

Erstellen Sie eine Weiterleitungs-Datei im Web-Stammverzeichnis:

1. Öffnen Sie **File Station**
2. Navigieren Sie zu `/web/`
3. Erstellen Sie eine neue Datei `index.html` mit folgendem Inhalt:

```html
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=/portal/planer.html">
</head>
<body>
    <p>Weiterleitung zum Portal...</p>
</body>
</html>
```

---

## Schritt 5: SSL-Zertifikat einrichten

### Option A: Let's Encrypt (Empfohlen - Kostenlos)

1. Öffnen Sie **Systemsteuerung** → **Sicherheit** → **Zertifikat**
2. Klicken Sie auf **Hinzufügen**
3. Wählen Sie **Neues Zertifikat hinzufügen** → **Weiter**
4. Wählen Sie **Zertifikat von Let's Encrypt abrufen**
5. Geben Sie ein:
   - **Domainname:** `termine.meinedomain.de`
   - **E-Mail:** Ihre E-Mail-Adresse
6. Klicken Sie auf **Fertig**

> **Wichtig:** Port 80 muss temporär von außen erreichbar sein für die Verifizierung!

### Option B: Eigenes Zertifikat importieren

1. Öffnen Sie **Systemsteuerung** → **Sicherheit** → **Zertifikat**
2. Klicken Sie auf **Hinzufügen**
3. Wählen Sie **Neues Zertifikat hinzufügen** → **Weiter**
4. Wählen Sie **Zertifikat importieren**
5. Laden Sie hoch:
   - Privater Schlüssel (`.key`)
   - Zertifikat (`.crt` oder `.cer`)
   - Zwischenzertifikat (falls vorhanden)

---

## Schritt 6: Web Station Portal konfigurieren

1. Öffnen Sie **Web Station**
2. Gehen Sie zu **Webdienst-Portal**
3. Klicken Sie auf **Erstellen**
4. Konfigurieren Sie:

| Einstellung | Wert |
|-------------|------|
| **Portaltyp** | Namensbasiert |
| **Hostname** | `termine.meinedomain.de` |
| **Port** | HTTPS 443 |
| **Dokumentenstamm** | `web` |
| **HTTP-Backend-Server** | nginx oder Apache |
| **PHP** | Nicht erforderlich (kann deaktiviert bleiben) |

5. Klicken Sie auf **Erstellen**

---

## Schritt 7: Reverse Proxy für Backend einrichten

Dies ist der wichtigste Schritt! Der Proxy leitet Anfragen an den OTRS-Backend-Server weiter.

1. Öffnen Sie **Systemsteuerung** → **Anmeldungsportal** → **Erweitert**
2. Klicken Sie auf **Reverse Proxy**
3. Klicken Sie auf **Erstellen**
4. Konfigurieren Sie die **Quelle**:

| Einstellung | Wert |
|-------------|------|
| **Beschreibung** | OTRS Portal Backend |
| **Protokoll** | HTTPS |
| **Hostname** | `termine.meinedomain.de` |
| **Port** | 443 |
| **Pfad** | `/core/portalservice/msg` |

5. Konfigurieren Sie das **Ziel**:

| Einstellung | Wert |
|-------------|------|
| **Protokoll** | HTTPS |
| **Hostname** | `portal-visio.balnova.de` |
| **Port** | 8444 |
| **Pfad** | `/core/portalservice/msg` |

6. Klicken Sie auf **Benutzerdefinierte Kopfzeile** → **Erstellen** → **WebSocket**
   - Dies fügt automatisch die WebSocket-Header hinzu

7. Klicken Sie auf **Speichern**

---

## Schritt 8: Zertifikat dem Portal zuweisen

1. Öffnen Sie **Systemsteuerung** → **Sicherheit** → **Zertifikat**
2. Klicken Sie auf **Einstellungen**
3. Suchen Sie in der Liste nach `termine.meinedomain.de`
4. Wählen Sie das entsprechende SSL-Zertifikat aus
5. Klicken Sie auf **OK**

---

## Schritt 9: Router/Firewall konfigurieren

Stellen Sie sicher, dass folgende Ports weitergeleitet werden:

| Externer Port | Interner Port | Protokoll | Ziel |
|---------------|---------------|-----------|------|
| 443 | 443 | TCP | IP der Synology NAS |
| 80 | 80 | TCP | IP der Synology NAS (nur für Let's Encrypt) |

### Fritz!Box Beispiel:
1. Internet → Freigaben → Portfreigaben
2. Gerät für Freigaben hinzufügen → Synology NAS auswählen
3. HTTPS-Server (Port 443) aktivieren

---

## Schritt 10: DNS konfigurieren

Erstellen Sie einen DNS-Eintrag bei Ihrem Domain-Anbieter:

| Typ | Name | Wert |
|-----|------|------|
| A | `termine` | Ihre öffentliche IP-Adresse |

**Oder bei dynamischer IP mit DDNS:**
| Typ | Name | Wert |
|-----|------|------|
| CNAME | `termine` | `ihre-nas.synology.me` |

---

## Schritt 11: Testen

1. Öffnen Sie einen Browser
2. Navigieren Sie zu: `https://termine.meinedomain.de/portal/planer.html`
3. Das Terminplanungsportal sollte erscheinen

### Fehlerbehebung:

| Problem | Lösung |
|---------|--------|
| Seite nicht erreichbar | Portweiterleitung und Firewall prüfen |
| SSL-Fehler | Zertifikat-Zuweisung prüfen |
| Portal lädt, aber Termine nicht | Reverse Proxy Konfiguration prüfen |
| 502 Bad Gateway | Backend-Server nicht erreichbar |

---

## Ordnerstruktur (Zusammenfassung)

```
/volume1/web/
├── index.html          (Weiterleitung)
└── portal/
    ├── planer.html     (Hauptseite)
    ├── tcal.js         (Kalender-Script)
    ├── tcal.css        (Kalender-Styles)
    ├── otrs.css        (Portal-Styles)
    └── img/
        ├── arrow-left.png
        ├── arrow-right.png
        └── ... (weitere Bilder)
```

---

## Sicherheitshinweise

1. **Regelmäßige Updates:** Halten Sie DSM und alle Pakete aktuell
2. **Firewall aktivieren:** Systemsteuerung → Sicherheit → Firewall
3. **Nur HTTPS:** HTTP sollte auf HTTPS umgeleitet werden
4. **Backup:** Sichern Sie die Konfiguration regelmäßig

---

## Support

Bei Problemen mit dem Portal selbst wenden Sie sich an den Softwareanbieter.
Bei Problemen mit der Synology-Konfiguration hilft die [Synology Knowledge Base](https://kb.synology.com/).
