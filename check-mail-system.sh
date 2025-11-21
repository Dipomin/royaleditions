#!/bin/bash

# Script de diagnostic du système de messagerie VPS
# Usage: bash check-mail-system.sh

echo "=========================================="
echo "🔍 Diagnostic du système de messagerie VPS"
echo "=========================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 est installé : $(which $1)"
        return 0
    else
        echo -e "${RED}✗${NC} $1 n'est pas installé"
        return 1
    fi
}

check_service() {
    if systemctl is-active --quiet $1; then
        echo -e "${GREEN}✓${NC} Service $1 est actif"
        systemctl status $1 --no-pager | grep "Active:" | sed 's/^/  /'
        return 0
    else
        echo -e "${RED}✗${NC} Service $1 n'est pas actif"
        return 1
    fi
}

check_port() {
    if ss -tulpn 2>/dev/null | grep -q ":$1 "; then
        echo -e "${GREEN}✓${NC} Port $1 ($2) est ouvert"
        ss -tulpn | grep ":$1 " | sed 's/^/  /'
        return 0
    else
        echo -e "${RED}✗${NC} Port $1 ($2) n'est pas ouvert"
        return 1
    fi
}

# 1. Vérification des serveurs mail
echo "1️⃣  Serveurs mail installés :"
echo "----------------------------"
check_command postfix
check_command sendmail
check_command exim4
check_command dovecot
echo ""

# 2. Vérification des webmails
echo "2️⃣  Webmails installés :"
echo "----------------------"
check_command roundcube
if [ -d "/usr/share/roundcube" ]; then
    echo -e "${GREEN}✓${NC} Roundcube trouvé dans /usr/share/roundcube"
fi
if [ -d "/var/www/html/roundcube" ]; then
    echo -e "${GREEN}✓${NC} Roundcube trouvé dans /var/www/html/roundcube"
fi
if [ -d "/var/www/html/webmail" ]; then
    echo -e "${GREEN}✓${NC} Webmail trouvé dans /var/www/html/webmail"
fi
check_command squirrelmail
echo ""

# 3. Vérification des services
echo "3️⃣  Services mail actifs :"
echo "------------------------"
check_service postfix
check_service dovecot
check_service opendkim
check_service spamassassin
echo ""

# 4. Vérification des ports
echo "4️⃣  Ports mail ouverts :"
echo "----------------------"
check_port 25 "SMTP"
check_port 587 "SMTP STARTTLS"
check_port 465 "SMTPS"
check_port 143 "IMAP"
check_port 993 "IMAPS"
check_port 110 "POP3"
check_port 995 "POP3S"
echo ""

# 5. Vérification des certificats SSL
echo "5️⃣  Certificats SSL :"
echo "-------------------"
if [ -d "/etc/letsencrypt/live" ]; then
    echo -e "${GREEN}✓${NC} Let's Encrypt installé"
    ls -la /etc/letsencrypt/live/ 2>/dev/null | grep -v "^total" | grep -v "README" | sed 's/^/  /'
else
    echo -e "${RED}✗${NC} Let's Encrypt non trouvé"
fi
echo ""

# 6. Vérification des logs
echo "6️⃣  Logs mail récents :"
echo "---------------------"
if [ -f "/var/log/mail.log" ]; then
    echo -e "${GREEN}✓${NC} Fichier mail.log existe"
    echo "  Dernières lignes :"
    tail -n 5 /var/log/mail.log 2>/dev/null | sed 's/^/    /'
elif [ -f "/var/log/maillog" ]; then
    echo -e "${GREEN}✓${NC} Fichier maillog existe"
    echo "  Dernières lignes :"
    tail -n 5 /var/log/maillog 2>/dev/null | sed 's/^/    /'
else
    echo -e "${RED}✗${NC} Aucun fichier de log mail trouvé"
fi
echo ""

# 7. Vérification du hostname
echo "7️⃣  Configuration hostname :"
echo "--------------------------"
echo "  Hostname : $(hostname)"
echo "  FQDN : $(hostname -f)"
echo ""

# 8. Résumé et recommandations
echo "=========================================="
echo "📋 RÉSUMÉ ET RECOMMANDATIONS"
echo "=========================================="
echo ""

MAIL_SERVER_FOUND=false
if command -v postfix &> /dev/null || command -v sendmail &> /dev/null || command -v exim4 &> /dev/null; then
    MAIL_SERVER_FOUND=true
fi

if [ "$MAIL_SERVER_FOUND" = true ]; then
    echo -e "${GREEN}✓ Un serveur mail est installé${NC}"
    echo ""
    echo "📝 Prochaines étapes :"
    echo "  1. Vérifiez que les services sont actifs (systemctl status postfix dovecot)"
    echo "  2. Configurez les enregistrements DNS (MX, SPF, DKIM, DMARC)"
    echo "  3. Créez vos adresses email"
    echo "  4. Installez un certificat SSL si nécessaire"
    echo "  5. Testez l'envoi et la réception d'emails"
else
    echo -e "${YELLOW}⚠ Aucun serveur mail n'est installé${NC}"
    echo ""
    echo "📝 Options d'installation :"
    echo "  1. Mail-in-a-Box (Recommandé - Installation automatique) :"
    echo "     curl -s https://mailinabox.email/setup.sh | sudo bash"
    echo ""
    echo "  2. iRedMail (Configuration guidée) :"
    echo "     wget https://github.com/iredmail/iRedMail/archive/1.6.8.tar.gz"
    echo ""
    echo "  3. Configuration manuelle Postfix + Dovecot :"
    echo "     sudo apt install postfix dovecot-core dovecot-imapd roundcube"
    echo ""
    echo "  4. Service SMTP tiers (Plus simple) :"
    echo "     - SendGrid : https://sendgrid.com"
    echo "     - Mailgun : https://mailgun.com"
    echo "     - Amazon SES : https://aws.amazon.com/ses"
fi

echo ""
echo "📚 Consultez le guide complet : docs/VPS-EMAIL-SETUP.md"
echo ""
