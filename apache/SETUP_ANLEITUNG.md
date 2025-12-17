# Apache VirtualHost Setup auf Hetzner Ubuntu VPS

## Voraussetzungen
- Hetzner VPS mit Ubuntu (20.04/22.04/24.04)
- Root-Zugang oder sudo-Berechtigungen
- Domain `otr.consitant.com` zeigt auf die Server-IP

---

## Schritt 1: System aktualisieren

```bash
sudo apt update && sudo apt upgrade -y
```

---

## Schritt 2: Apache installieren

```bash
sudo apt install apache2 -y
```

---

## Schritt 3: Erforderliche Apache-Module aktivieren

```bash
sudo a2enmod ssl
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_connect
sudo a2enmod headers
sudo a2enmod rewrite
```

---

## Schritt 4: SSL-Zertifikat erstellen

### Option A: Let's Encrypt (EMPFOHLEN fuer Produktion)

```bash
# Certbot installieren
sudo apt install certbot python3-certbot-apache -y

# Zertifikat anfordern (Apache muss vorher laufen)
sudo certbot --apache -d otr.consitant.com
```

Nach erfolgreicher Zertifikatserstellung die Pfade in der VirtualHost-Konfiguration anpassen:
```
SSLCertificateFile /etc/letsencrypt/live/otr.consitant.com/fullchain.pem
SSLCertificateKeyFile /etc/letsencrypt/live/otr.consitant.com/privkey.pem
```

### Option B: Selbstsigniertes Zertifikat (nur fuer Tests)

```bash
# Verzeichnisse erstellen falls nicht vorhanden
sudo mkdir -p /etc/ssl/certs
sudo mkdir -p /etc/ssl/private

# Selbstsigniertes Zertifikat erstellen
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/server.key \
    -out /etc/ssl/certs/server.cer \
    -subj "/C=DE/ST=Germany/L=Berlin/O=Consitant/CN=otr.consitant.com"

# Berechtigungen setzen
sudo chmod 600 /etc/ssl/private/server.key
sudo chmod 644 /etc/ssl/certs/server.cer
```

### Option C: Eigene Zertifikate hochladen

Falls du bereits Zertifikate hast:
```bash
# Zertifikat hochladen
sudo nano /etc/ssl/certs/server.cer
# (Inhalt einfuegen und speichern)

# Private Key hochladen
sudo nano /etc/ssl/private/server.key
# (Inhalt einfuegen und speichern)

# Berechtigungen setzen
sudo chmod 600 /etc/ssl/private/server.key
sudo chmod 644 /etc/ssl/certs/server.cer
```

---

## Schritt 5: VirtualHost-Konfiguration kopieren

```bash
# Konfigurationsdatei kopieren
sudo cp otr.consitant.com.conf /etc/apache2/sites-available/

# Seite aktivieren
sudo a2ensite otr.consitant.com.conf

# Standard-Seite deaktivieren (optional)
sudo a2dissite 000-default.conf
```

---

## Schritt 6: Web-Dateien kopieren

```bash
# Projektdateien nach /var/www/html kopieren
sudo cp -r /pfad/zum/projekt/* /var/www/html/

# Berechtigungen setzen
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
```

---

## Schritt 7: Apache-Konfiguration testen

```bash
# Syntax pruefen
sudo apache2ctl configtest

# Bei Erfolg: "Syntax OK"
```

---

## Schritt 8: Apache neu starten

```bash
sudo systemctl restart apache2

# Status pruefen
sudo systemctl status apache2
```

---

## Schritt 9: Firewall konfigurieren (falls UFW aktiv)

```bash
# UFW Status pruefen
sudo ufw status

# Falls aktiv, HTTP und HTTPS erlauben
sudo ufw allow 'Apache Full'
sudo ufw reload
```

---

## Schritt 10: Testen

1. **HTTP zu HTTPS Redirect testen:**
   ```bash
   curl -I http://otr.consitant.com
   # Sollte 301 Redirect zu https:// zeigen
   ```

2. **HTTPS testen:**
   ```bash
   curl -k https://otr.consitant.com
   # Sollte die Webseite zurueckgeben
   ```

3. **Im Browser testen:**
   - Oeffne https://otr.consitant.com

---

## Fehlerbehebung

### Logs pruefen
```bash
# Error Log
sudo tail -f /var/log/apache2/error.log

# Access Log
sudo tail -f /var/log/apache2/access.log
```

### Apache Status
```bash
sudo systemctl status apache2
```

### Module pruefen
```bash
apache2ctl -M | grep -E "(ssl|proxy)"
```

### Ports pruefen
```bash
sudo netstat -tlnp | grep apache2
# Oder
sudo ss -tlnp | grep apache2
```

---

## Automatische Zertifikatserneuerung (Let's Encrypt)

```bash
# Certbot Timer pruefen
sudo systemctl status certbot.timer

# Manueller Test der Erneuerung
sudo certbot renew --dry-run
```

---

## Quick-Setup Script

Fuer eine schnelle Installation kannst du auch das `setup.sh` Script verwenden:

```bash
chmod +x setup.sh
sudo ./setup.sh
```
