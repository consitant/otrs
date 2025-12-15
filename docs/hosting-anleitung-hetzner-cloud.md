# OTRS Portal Hosting auf Hetzner Cloud VPS

## Übersicht

Diese Anleitung beschreibt die Einrichtung des OTRS-Portals auf einem Hetzner Cloud VPS mit **fester ausgehender IP-Adresse** für die Firewall-Freischaltung zum On-Premise Backend-Server.

### Warum Hetzner Cloud?

| Feature | Details |
|---------|---------|
| **Feste IPv4** | Jeder VPS erhält eine dedizierte IPv4-Adresse |
| **Kündigung** | Monatlich kündbar (stundengenau abgerechnet) |
| **Standort** | Deutsche Rechenzentren (Falkenstein, Nürnberg, Helsinki) |
| **Preis** | Ab 4,51€/Monat (CX22: 2 vCPU, 4 GB RAM, 40 GB SSD) |
| **DSGVO** | Vollständig DSGVO-konform |

---

## Teil 1: Hetzner Cloud Server erstellen

### Schritt 1.1: Account erstellen

1. Gehe zu [https://console.hetzner.cloud/](https://console.hetzner.cloud/)
2. Klicke auf **"Registrieren"**
3. E-Mail-Adresse und Passwort eingeben
4. E-Mail bestätigen
5. Zahlungsmethode hinterlegen (Kreditkarte, PayPal oder SEPA)

### Schritt 1.2: Neues Projekt erstellen

1. Nach dem Login: Klicke auf **"Neues Projekt"**
2. Projektname eingeben: z.B. `OTRS-Portal`
3. Klicke auf **"Projekt erstellen"**

### Schritt 1.3: Server erstellen

1. Im Projekt: Klicke auf **"Server hinzufügen"**

2. **Standort wählen:**
   - `Falkenstein` oder `Nürnberg` (Deutschland) empfohlen

3. **Image wählen:**
   - **Ubuntu 24.04** (empfohlen) oder Debian 12

4. **Typ wählen:**
   - **CX22** (4,51€/Monat) - ausreichend für dieses Projekt
     - 2 vCPU (Intel)
     - 4 GB RAM
     - 40 GB SSD
     - 20 TB Traffic

5. **Netzwerk:**
   - IPv4-Adresse: ✅ Aktiviert (wichtig!)
   - IPv6-Adresse: ✅ Aktiviert

6. **SSH-Key hinzufügen (empfohlen):**
   ```bash
   # Auf deinem lokalen PC (falls noch kein SSH-Key vorhanden):
   ssh-keygen -t ed25519 -C "deine-email@beispiel.de"

   # Öffentlichen Key anzeigen:
   cat ~/.ssh/id_ed25519.pub
   ```
   - Kopiere den Key und füge ihn bei Hetzner ein

7. **Server-Name:**
   - z.B. `otrs-portal`

8. Klicke auf **"Kostenpflichtig erstellen"**

### Schritt 1.4: Feste IP-Adresse notieren

Nach der Erstellung siehst du die **IPv4-Adresse** deines Servers.

> ⚠️ **WICHTIG:** Diese IP-Adresse musst du in der Firewall deines On-Premise Backend-Servers freischalten!

```
Beispiel: 157.90.xxx.xxx
```

**Diese IP für die Firewall-Freischaltung notieren!**

---

## Teil 2: Server einrichten

### Schritt 2.1: Per SSH verbinden

```bash
# Mit SSH-Key:
ssh root@DEINE-SERVER-IP

# Oder mit Passwort (aus E-Mail von Hetzner):
ssh root@DEINE-SERVER-IP
```

### Schritt 2.2: System aktualisieren

```bash
apt update && apt upgrade -y
```

### Schritt 2.3: Webserver und PHP installieren

```bash
# Apache und PHP mit allen benötigten Erweiterungen installieren
apt install -y apache2 php php-curl libapache2-mod-php

# Apache-Module aktivieren
a2enmod rewrite ssl headers

# Apache neu starten
systemctl restart apache2
systemctl enable apache2
```

### Schritt 2.4: Firewall einrichten (UFW)

```bash
# UFW installieren und konfigurieren
apt install -y ufw

# Regeln hinzufügen
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS

# Firewall aktivieren
ufw enable

# Status prüfen
ufw status
```

---

## Teil 3: OTRS-Portal deployen

### Schritt 3.1: Verzeichnis vorbereiten

```bash
# Webroot-Verzeichnis erstellen
mkdir -p /var/www/otrs
chown -R www-data:www-data /var/www/otrs
```

### Schritt 3.2: Dateien hochladen

**Option A: Per SCP (von deinem lokalen PC)**

```bash
# Vom lokalen PC aus ausführen:
scp -r /pfad/zu/otrs/* root@DEINE-SERVER-IP:/var/www/otrs/
```

**Option B: Per Git**

```bash
# Auf dem Server:
apt install -y git
cd /var/www
git clone https://github.com/consitant/otrs.git
chown -R www-data:www-data /var/www/otrs
```

**Option C: Per SFTP (FileZilla)**

1. FileZilla öffnen
2. Verbinden mit:
   - Host: `DEINE-SERVER-IP`
   - Benutzername: `root`
   - Port: `22`
3. Dateien nach `/var/www/otrs/` hochladen

### Schritt 3.3: Konfiguration anpassen

```bash
# Konfigurationsdatei bearbeiten
nano /var/www/otrs/otrs.conf.php
```

**Wichtige Einstellungen:**

```php
<?php
// Gateway-ID für SovdWeb
$gatewayID = "DEINE-GATEWAY-ID";

// Backend-Server Verbindung (On-Premise)
$host = "DEINE-BACKEND-IP-ODER-HOSTNAME";
$port = 59126;

// SSL-Einstellungen
$ssl = true;  // oder false, je nach Backend
$sslConfig = [
    "cafile" => ""  // Pfad zum CA-Zertifikat falls benötigt
];

// Debug-Modus (für Produktion auf false setzen)
$debugging = false;

// Fehlermeldung bei Nichtverfügbarkeit
$serviceUnavailableMessage = "Der Service ist derzeit nicht verfügbar. Bitte versuchen Sie es später erneut.";
?>
```

### Schritt 3.4: Apache Virtual Host konfigurieren

```bash
# Virtual Host Datei erstellen
nano /etc/apache2/sites-available/otrs.conf
```

**Inhalt:**

```apache
<VirtualHost *:80>
    ServerName deine-domain.de
    ServerAlias www.deine-domain.de
    DocumentRoot /var/www/otrs

    <Directory /var/www/otrs>
        AllowOverride All
        Require all granted
    </Directory>

    # Logging
    ErrorLog ${APACHE_LOG_DIR}/otrs_error.log
    CustomLog ${APACHE_LOG_DIR}/otrs_access.log combined
</VirtualHost>
```

```bash
# Site aktivieren und Standard-Site deaktivieren
a2ensite otrs.conf
a2dissite 000-default.conf

# Apache neu laden
systemctl reload apache2
```

### Schritt 3.5: Berechtigungen setzen

```bash
# Berechtigungen korrigieren
chown -R www-data:www-data /var/www/otrs
chmod -R 755 /var/www/otrs
chmod 640 /var/www/otrs/otrs.conf.php
```

---

## Teil 4: SSL-Zertifikat einrichten (Let's Encrypt)

### Schritt 4.1: Certbot installieren

```bash
apt install -y certbot python3-certbot-apache
```

### Schritt 4.2: Zertifikat erstellen

```bash
# Zertifikat anfordern (Domain muss auf Server zeigen!)
certbot --apache -d deine-domain.de -d www.deine-domain.de
```

**Während der Installation:**
- E-Mail-Adresse eingeben
- Nutzungsbedingungen akzeptieren
- HTTP zu HTTPS Weiterleitung: **Ja (2)**

### Schritt 4.3: Automatische Erneuerung testen

```bash
certbot renew --dry-run
```

---

## Teil 5: Firewall-Freischaltung auf Backend-Server

### Deine ausgehende IP-Adresse

Die feste ausgehende IP deines Hetzner VPS ist die **IPv4-Adresse**, die du in der Hetzner Console siehst.

```bash
# Auf dem Hetzner VPS ausführen, um die IP zu bestätigen:
curl -4 ifconfig.me
```

### Firewall-Regel auf dem On-Premise Backend-Server

**Windows Firewall:**
```powershell
# Eingehende Regel für OTRS-Portal
New-NetFirewallRule -DisplayName "OTRS Portal Hetzner" `
    -Direction Inbound `
    -RemoteAddress DEINE-HETZNER-IP `
    -LocalPort 59126 `
    -Protocol TCP `
    -Action Allow
```

**Linux (iptables):**
```bash
iptables -A INPUT -s DEINE-HETZNER-IP -p tcp --dport 59126 -j ACCEPT
```

**Linux (UFW):**
```bash
ufw allow from DEINE-HETZNER-IP to any port 59126
```

**Fortinet/FortiGate:**
1. Policy & Objects → Addresses → Create New
2. Name: `Hetzner-OTRS-Portal`
3. Type: IP/Netmask
4. IP: `DEINE-HETZNER-IP/32`
5. Neue Firewall-Policy erstellen mit dieser Adresse als Source

---

## Teil 6: Testen

### Schritt 6.1: Verbindung zum Backend testen

```bash
# Auf dem Hetzner VPS:
curl -v http://BACKEND-HOST:59126/
```

### Schritt 6.2: Portal im Browser testen

```
https://deine-domain.de/otrs.php
```

### Schritt 6.3: Logs prüfen

```bash
# Apache Error Log
tail -f /var/log/apache2/otrs_error.log

# Apache Access Log
tail -f /var/log/apache2/otrs_access.log
```

---

## Teil 7: Wartung und Verwaltung

### Server stoppen/starten (Hetzner Console)

- Server kann jederzeit gestoppt werden → Keine Kosten während Stopp
- Feste IP bleibt erhalten

### Monatliche Kündigung

1. Hetzner Console öffnen
2. Server auswählen
3. **"Server löschen"** klicken
4. Bestätigen

> ⚠️ Bei Löschung wird auch die IP-Adresse freigegeben!

### Backup erstellen

```bash
# Manuelles Backup
tar -czvf /root/otrs-backup-$(date +%Y%m%d).tar.gz /var/www/otrs/
```

**Oder über Hetzner:**
- Snapshots: 0,012€/GB/Monat
- Backups: 20% des Serverpreises

---

## Zusammenfassung

| Komponente | Wert |
|------------|------|
| **Anbieter** | Hetzner Cloud |
| **Server-Typ** | CX22 |
| **Kosten** | ~4,51€/Monat |
| **Kündigung** | Jederzeit (stundengenau) |
| **Feste IP** | ✅ Ja |
| **Standort** | Deutschland |
| **OS** | Ubuntu 24.04 |
| **Webserver** | Apache + PHP |
| **SSL** | Let's Encrypt (kostenlos) |

---

## Checkliste

- [ ] Hetzner Account erstellt
- [ ] Server erstellt (CX22, Ubuntu 24.04)
- [ ] **Feste IP notiert: ________________**
- [ ] SSH-Verbindung funktioniert
- [ ] Apache + PHP installiert
- [ ] OTRS-Dateien hochgeladen
- [ ] otrs.conf.php konfiguriert
- [ ] Virtual Host eingerichtet
- [ ] SSL-Zertifikat installiert
- [ ] **Firewall auf Backend-Server freigegeben für IP: ________________**
- [ ] Portal getestet und funktioniert

---

## Support

- **Hetzner Dokumentation:** https://docs.hetzner.com/
- **Hetzner Status:** https://status.hetzner.com/
- **Community:** https://community.hetzner.com/
