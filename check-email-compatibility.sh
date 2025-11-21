#!/bin/bash

# Script de vérification de compatibilité pour système email VPS
# Royal Editions - Version 1.0

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Vérification Compatibilité Système Email - Royal Editions  ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Fonction pour afficher les résultats
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

# Détecter la distribution
echo -e "${YELLOW}→${NC} Détection de la distribution..."
if [ -f /etc/os-release ]; then
    . /etc/os-release
    DISTRO_NAME=$NAME
    DISTRO_VERSION=$VERSION_ID
    DISTRO_ID=$ID
    
    echo -e "  Distribution: ${BLUE}$DISTRO_NAME${NC}"
    echo -e "  Version: ${BLUE}$DISTRO_VERSION${NC}"
    echo ""
else
    echo -e "${RED}✗ Impossible de détecter la distribution${NC}"
    exit 1
fi

# Vérifier la compatibilité Mail-in-a-Box
echo -e "${YELLOW}→${NC} Compatibilité Mail-in-a-Box:"
MIAB_COMPATIBLE=0

if [ "$DISTRO_ID" = "ubuntu" ]; then
    case "$DISTRO_VERSION" in
        "22.04"|"18.04"|"14.04")
            echo -e "  ${GREEN}✓ Compatible !${NC} Ubuntu $DISTRO_VERSION est supporté"
            MIAB_COMPATIBLE=1
            ;;
        "24.04")
            echo -e "  ${YELLOW}⚠ Support en cours${NC} (Ubuntu 24.04 - version très récente)"
            echo -e "  ${BLUE}→${NC} Recommandation: Utilisez iRedMail (100% compatible) ou service SMTP tiers"
            ;;
        "20.04")
            echo -e "  ${YELLOW}⚠ Non compatible${NC} (Ubuntu 20.04 non supporté)"
            echo -e "  ${BLUE}→${NC} Utilisez iRedMail ou un service SMTP tiers"
            ;;
        *)
            echo -e "  ${YELLOW}⚠ Non compatible${NC} (Ubuntu $DISTRO_VERSION non supporté)"
            echo -e "  ${BLUE}→${NC} Utilisez iRedMail ou un service SMTP tiers"
            ;;
    esac
else
    echo -e "  ${YELLOW}⚠ Non compatible${NC} (Pas Ubuntu)"
    echo -e "  ${BLUE}→${NC} Utilisez iRedMail ou un service SMTP tiers"
fi
echo ""

# Vérifier la compatibilité iRedMail
echo -e "${YELLOW}→${NC} Compatibilité iRedMail:"
IREDMAIL_COMPATIBLE=0

case "$DISTRO_ID" in
    "ubuntu"|"debian"|"centos"|"rhel"|"rocky"|"almalinux")
        echo -e "  ${GREEN}✓ Compatible !${NC} $DISTRO_NAME est supporté par iRedMail"
        IREDMAIL_COMPATIBLE=1
        ;;
    *)
        echo -e "  ${YELLOW}⚠ Compatibilité incertaine${NC}"
        echo -e "  ${BLUE}→${NC} Vérifiez https://www.iredmail.org/"
        ;;
esac
echo ""

# Vérifier les ports mail
echo -e "${YELLOW}→${NC} Vérification des ports mail..."
check_port() {
    PORT=$1
    DESC=$2
    if command -v nc >/dev/null 2>&1; then
        nc -z localhost $PORT >/dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo -e "  ${GREEN}✓${NC} Port $PORT ($DESC) - Ouvert"
            return 0
        else
            echo -e "  ${BLUE}○${NC} Port $PORT ($DESC) - Fermé (normal si pas encore installé)"
            return 1
        fi
    else
        echo -e "  ${YELLOW}?${NC} Port $PORT ($DESC) - Impossible de vérifier (nc non installé)"
        return 2
    fi
}

check_port 25 "SMTP"
check_port 587 "SMTP/STARTTLS"
check_port 465 "SMTPS"
check_port 143 "IMAP"
check_port 993 "IMAPS"
echo ""

# Vérifier les services mail existants
echo -e "${YELLOW}→${NC} Services mail existants:"
MAIL_INSTALLED=0

check_service() {
    SERVICE=$1
    if command -v $SERVICE >/dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} $SERVICE - Installé ($(which $SERVICE))"
        MAIL_INSTALLED=1
        return 0
    else
        echo -e "  ${BLUE}○${NC} $SERVICE - Non installé"
        return 1
    fi
}

check_service "postfix"
check_service "sendmail"
check_service "exim4"
check_service "dovecot"

if [ $MAIL_INSTALLED -eq 1 ]; then
    echo ""
    echo -e "  ${YELLOW}⚠ Un système mail est déjà installé !${NC}"
    echo -e "  ${BLUE}→${NC} Vérifiez sa configuration avant d'en installer un nouveau"
fi
echo ""

# Vérifier la RAM disponible
echo -e "${YELLOW}→${NC} Ressources système:"
TOTAL_RAM=$(free -m | awk '/^Mem:/{print $2}')
echo -e "  RAM totale: ${BLUE}${TOTAL_RAM}MB${NC}"

if [ $TOTAL_RAM -lt 1024 ]; then
    echo -e "  ${RED}⚠ Attention !${NC} Moins de 1GB RAM - Mail-in-a-Box nécessite 2GB minimum"
    echo -e "  ${BLUE}→${NC} Considérez un service SMTP tiers (SendGrid, Mailgun)"
elif [ $TOTAL_RAM -lt 2048 ]; then
    echo -e "  ${YELLOW}⚠ Attention !${NC} Moins de 2GB RAM - Mail-in-a-Box peut être lent"
    echo -e "  ${BLUE}→${NC} 2GB minimum recommandé pour Mail-in-a-Box"
else
    echo -e "  ${GREEN}✓${NC} RAM suffisante pour Mail-in-a-Box"
fi
echo ""

# Recommandations finales
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                     RECOMMANDATIONS                          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$DISTRO_ID" = "ubuntu" ] && [ "$DISTRO_VERSION" = "24.04" ]; then
    echo -e "${GREEN}✓ iRedMail${NC} - Solution recommandée pour Ubuntu 24.04 LTS ⭐"
    echo -e "  Téléchargement: ${BLUE}wget https://github.com/iredmail/iRedMail/archive/1.6.8.tar.gz${NC}"
    echo -e "  100% compatible et testé avec Ubuntu 24.04"
    echo ""
elif [ $MIAB_COMPATIBLE -eq 1 ] && [ $TOTAL_RAM -ge 2048 ]; then
    echo -e "${GREEN}✓ Mail-in-a-Box${NC} - Solution recommandée pour votre système"
    echo -e "  Installation: ${BLUE}curl -s https://mailinabox.email/setup.sh | sudo bash${NC}"
    echo ""
elif [ $IREDMAIL_COMPATIBLE -eq 1 ]; then
    echo -e "${GREEN}✓ iRedMail${NC} - Solution recommandée pour votre système"
    echo -e "  Téléchargement: ${BLUE}wget https://github.com/iredmail/iRedMail/archive/1.6.8.tar.gz${NC}"
    echo ""
fi

echo -e "${GREEN}✓ Service SMTP tiers${NC} - Solution universelle (recommandée)"
echo -e "  Options:"
echo -e "    • ${BLUE}SendGrid${NC} - 100 emails/jour gratuits"
echo -e "    • ${BLUE}Mailgun${NC} - 5000 emails/mois gratuits"
echo -e "    • ${BLUE}Amazon SES${NC} - 62000 emails/mois gratuits (via EC2)"
echo ""

echo -e "${BLUE}📚 Documentation complète:${NC} docs/VPS-EMAIL-SETUP.md"
echo -e "${BLUE}📧 Configuration SMTP:${NC} docs/SMTP-CONFIGURATION.md"
echo ""

echo -e "${GREEN}✓ Vérification terminée !${NC}"
