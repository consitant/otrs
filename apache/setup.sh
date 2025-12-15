#!/bin/bash

# ============================================
# Apache VirtualHost Setup Script
# Fuer: otr.consitant.com auf Ubuntu
# ============================================

set -e

# Farben fuer Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN} Apache VirtualHost Setup${NC}"
echo -e "${GREEN}========================================${NC}"

# Root-Pruefung
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Bitte als root ausfuehren: sudo ./setup.sh${NC}"
    exit 1
fi

# Schritt 1: System aktualisieren
echo -e "\n${YELLOW}[1/8] System aktualisieren...${NC}"
apt update && apt upgrade -y

# Schritt 2: Apache installieren
echo -e "\n${YELLOW}[2/8] Apache installieren...${NC}"
apt install apache2 -y

# Schritt 3: Module aktivieren
echo -e "\n${YELLOW}[3/8] Apache-Module aktivieren...${NC}"
a2enmod ssl
a2enmod proxy
a2enmod proxy_http
a2enmod proxy_connect
a2enmod headers
a2enmod rewrite

# Schritt 4: SSL-Zertifikat
echo -e "\n${YELLOW}[4/8] SSL-Zertifikat Konfiguration...${NC}"
echo ""
echo "Welche SSL-Option moechtest du verwenden?"
echo "1) Let's Encrypt (empfohlen fuer Produktion)"
echo "2) Selbstsigniertes Zertifikat (nur fuer Tests)"
echo "3) Eigene Zertifikate (bereits vorhanden)"
echo ""
read -p "Auswahl [1/2/3]: " SSL_CHOICE

case $SSL_CHOICE in
    1)
        echo -e "${YELLOW}Let's Encrypt wird installiert...${NC}"
        apt install certbot python3-certbot-apache -y

        # Apache starten damit Certbot funktioniert
        systemctl start apache2

        echo -e "${YELLOW}Zertifikat wird angefordert...${NC}"
        certbot --apache -d otr.consitant.com

        # Pfade in Config aktualisieren
        sed -i 's|/etc/ssl/certs/server.cer|/etc/letsencrypt/live/otr.consitant.com/fullchain.pem|g' /etc/apache2/sites-available/otr.consitant.com.conf
        sed -i 's|/etc/ssl/private/server.key|/etc/letsencrypt/live/otr.consitant.com/privkey.pem|g' /etc/apache2/sites-available/otr.consitant.com.conf
        ;;
    2)
        echo -e "${YELLOW}Selbstsigniertes Zertifikat wird erstellt...${NC}"
        mkdir -p /etc/ssl/certs
        mkdir -p /etc/ssl/private

        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout /etc/ssl/private/server.key \
            -out /etc/ssl/certs/server.cer \
            -subj "/C=DE/ST=Germany/L=Berlin/O=Consitant/CN=otr.consitant.com"

        chmod 600 /etc/ssl/private/server.key
        chmod 644 /etc/ssl/certs/server.cer

        echo -e "${GREEN}Selbstsigniertes Zertifikat erstellt.${NC}"
        ;;
    3)
        echo -e "${YELLOW}Bitte stelle sicher, dass die Zertifikate hier liegen:${NC}"
        echo "  - /etc/ssl/certs/server.cer"
        echo "  - /etc/ssl/private/server.key"
        read -p "Druecke Enter wenn bereit..."
        ;;
    *)
        echo -e "${RED}Ungueltige Auswahl. Breche ab.${NC}"
        exit 1
        ;;
esac

# Schritt 5: VirtualHost kopieren
echo -e "\n${YELLOW}[5/8] VirtualHost-Konfiguration kopieren...${NC}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cp "$SCRIPT_DIR/otr.consitant.com.conf" /etc/apache2/sites-available/

# Schritt 6: Seite aktivieren
echo -e "\n${YELLOW}[6/8] Seite aktivieren...${NC}"
a2ensite otr.consitant.com.conf
a2dissite 000-default.conf 2>/dev/null || true

# Schritt 7: Konfiguration testen
echo -e "\n${YELLOW}[7/8] Konfiguration testen...${NC}"
apache2ctl configtest

# Schritt 8: Apache neu starten
echo -e "\n${YELLOW}[8/8] Apache neu starten...${NC}"
systemctl restart apache2
systemctl enable apache2

# Firewall (falls UFW aktiv)
if command -v ufw &> /dev/null; then
    echo -e "\n${YELLOW}Firewall konfigurieren...${NC}"
    ufw allow 'Apache Full'
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN} Setup abgeschlossen!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Teste deine Seite: ${YELLOW}https://otr.consitant.com${NC}"
echo ""
echo -e "Logs pruefen:"
echo -e "  ${YELLOW}sudo tail -f /var/log/apache2/error.log${NC}"
echo -e "  ${YELLOW}sudo tail -f /var/log/apache2/access.log${NC}"
