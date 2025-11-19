#!/bin/bash

###############################################################################
# Script d'Installation Initiale - Royal Editions
# À exécuter sur un VPS Ubuntu/Debian fraîchement installé
# Usage: bash install-vps.sh
###############################################################################

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Banner
clear
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║     ROYAL EDITIONS - INSTALLATION INITIALE VPS       ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Vérifier qu'on est sur Ubuntu/Debian
if [ ! -f /etc/debian_version ] && [ ! -f /etc/lsb-release ]; then
    error "Ce script nécessite Ubuntu ou Debian"
fi

log "Installation sur $(lsb_release -d | cut -f2)"

# Vérifier les droits root/sudo
if [ "$EUID" -ne 0 ]; then 
    if ! sudo -v; then
        error "Ce script nécessite les droits sudo"
    fi
    SUDO="sudo"
else
    SUDO=""
fi

# Questions interactives
echo ""
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Configuration"
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

read -p "Nom de domaine (ex: royaleditions.com): " DOMAIN
read -p "Adresse email pour Let's Encrypt: " EMAIL
read -p "Mot de passe MySQL pour l'utilisateur 'royaledition_user': " -s DB_PASSWORD
echo ""

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ] || [ -z "$DB_PASSWORD" ]; then
    error "Toutes les informations sont requises"
fi

# 1. Mise à jour du système
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Étape 1/12: Mise à jour du système..."
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

$SUDO apt update
$SUDO apt upgrade -y
log "✓ Système mis à jour"

# 2. Installation des outils de base
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Étape 2/12: Installation des outils de base..."
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

$SUDO apt install -y \
    curl \
    wget \
    git \
    build-essential \
    software-properties-common \
    ufw \
    htop \
    unzip

log "✓ Outils de base installés"

# 3. Configuration du pare-feu
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Étape 3/12: Configuration du pare-feu UFW..."
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

$SUDO ufw allow OpenSSH
$SUDO ufw allow 'Nginx Full'
echo "y" | $SUDO ufw enable
$SUDO ufw status
log "✓ Pare-feu configuré"

# 4. Création de l'utilisateur deploy
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Étape 4/12: Création de l'utilisateur deploy..."
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if id "deploy" &>/dev/null; then
    warning "L'utilisateur deploy existe déjà"
else
    $SUDO adduser --disabled-password --gecos "" deploy
    $SUDO usermod -aG sudo deploy
    log "✓ Utilisateur deploy créé"
fi

# 5. Installation de Node.js
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Étape 5/12: Installation de Node.js 20..."
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Installer NVM pour l'utilisateur deploy
$SUDO -u deploy bash << 'EOF'
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20
nvm alias default 20
EOF

log "✓ Node.js installé"

# 6. Installation de MySQL
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Étape 6/12: Installation de MySQL..."
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

$SUDO apt install -y mysql-server

# Démarrer MySQL
$SUDO systemctl start mysql
$SUDO systemctl enable mysql

log "✓ MySQL installé"

# 7. Configuration de MySQL
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Étape 7/12: Configuration de la base de données..."
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

$SUDO mysql << EOF
CREATE DATABASE IF NOT EXISTS royaledition CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'royaledition_user'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON royaledition.* TO 'royaledition_user'@'localhost';
FLUSH PRIVILEGES;
EOF

log "✓ Base de données configurée"

# 8. Installation de Nginx
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Étape 8/12: Installation de Nginx..."
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

$SUDO apt install -y nginx
$SUDO systemctl start nginx
$SUDO systemctl enable nginx
log "✓ Nginx installé"

# 9. Installation de PM2
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Étape 9/12: Installation de PM2..."
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

$SUDO -u deploy bash << 'EOF'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm install -g pm2
EOF

log "✓ PM2 installé"

# 10. Création des répertoires
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Étape 10/12: Création des répertoires..."
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

$SUDO mkdir -p /var/www
$SUDO chown -R deploy:deploy /var/www
$SUDO -u deploy mkdir -p /home/deploy/backups
$SUDO -u deploy mkdir -p /home/deploy/logs
log "✓ Répertoires créés"

# 11. Configuration Nginx de base
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Étape 11/12: Configuration Nginx..."
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

$SUDO tee /etc/nginx/sites-available/royaledition > /dev/null << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    access_log /var/log/nginx/royaledition-access.log;
    error_log /var/log/nginx/royaledition-error.log;

    client_max_body_size 20M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

$SUDO ln -sf /etc/nginx/sites-available/royaledition /etc/nginx/sites-enabled/
$SUDO rm -f /etc/nginx/sites-enabled/default
$SUDO nginx -t
$SUDO systemctl reload nginx
log "✓ Nginx configuré"

# 12. Installation de Certbot pour SSL
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Étape 12/12: Installation de Certbot..."
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

$SUDO apt install -y certbot python3-certbot-nginx
log "✓ Certbot installé"

# Créer le fichier .env template
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Création du fichier .env template..."
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cat > /tmp/env-template << EOF
# Base de données MySQL
DATABASE_URL="mysql://royaledition_user:$DB_PASSWORD@localhost:3306/royaledition"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_VOTRE_CLE
CLERK_SECRET_KEY=sk_live_VOTRE_CLE
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/admin/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/admin/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/admin/dashboard

# Configuration App
NEXT_PUBLIC_APP_URL=https://$DOMAIN
NEXT_PUBLIC_DELIVERY_FEE=0

# Admin
ADMIN_EMAIL=admin@$DOMAIN

# AWS S3
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=VOTRE_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=VOTRE_SECRET_KEY
AWS_S3_BUCKET_NAME=royale-edition-content

# Node Environment
NODE_ENV=production
EOF

log "✓ Template .env créé dans /tmp/env-template"

# Rapport final
echo ""
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                       ║${NC}"
echo -e "${GREEN}║       ✓ INSTALLATION INITIALE TERMINÉE               ║${NC}"
echo -e "${GREEN}║                                                       ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

log "Le VPS est prêt pour le déploiement"

echo -e "${BLUE}Prochaines étapes:${NC}"
echo ""
echo "1. Cloner votre dépôt Git:"
echo "   ${YELLOW}su - deploy${NC}"
echo "   ${YELLOW}cd /var/www${NC}"
echo "   ${YELLOW}git clone https://github.com/votre-compte/royal-editions.git royaledition${NC}"
echo ""
echo "2. Créer le fichier .env:"
echo "   ${YELLOW}cd /var/www/royaledition${NC}"
echo "   ${YELLOW}cp /tmp/env-template .env${NC}"
echo "   ${YELLOW}nano .env${NC}"
echo "   (Remplir les valeurs manquantes: Clerk, AWS S3)"
echo ""
echo "3. Installer les dépendances et build:"
echo "   ${YELLOW}npm install${NC}"
echo "   ${YELLOW}npx prisma generate${NC}"
echo "   ${YELLOW}npx prisma db push${NC}"
echo "   ${YELLOW}npm run build${NC}"
echo ""
echo "4. Démarrer avec PM2:"
echo "   ${YELLOW}pm2 start ecosystem.config.js${NC}"
echo "   ${YELLOW}pm2 save${NC}"
echo ""
echo "5. Configurer SSL:"
echo "   ${YELLOW}sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN${NC}"
echo ""
echo -e "${BLUE}Informations:${NC}"
echo "  Domaine: $DOMAIN"
echo "  Base de données: royaledition"
echo "  Utilisateur DB: royaledition_user"
echo "  Répertoire app: /var/www/royaledition"
echo ""
echo -e "${YELLOW}Template .env disponible:${NC} /tmp/env-template"
echo ""

exit 0
