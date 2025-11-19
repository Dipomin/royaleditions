#!/bin/bash

###############################################################################
# Script de Setup Rapide - Royal Editions
# Pour VPS qui héberge déjà d'autres applications
# Usage: bash quick-setup.sh
###############################################################################

set -e

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}✓${NC} $1"; }
info() { echo -e "${BLUE}ℹ${NC} $1"; }
warning() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; exit 1; }

clear
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║       ROYAL EDITIONS - SETUP RAPIDE VPS              ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Vérification de l'environnement
info "Vérification de l'environnement..."

# Node.js
if ! command -v node &> /dev/null; then
    error "Node.js n'est pas installé. Installez Node.js 20+ d'abord."
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js version $NODE_VERSION détectée. Version 18+ requise."
fi
log "Node.js $(node -v) détecté"

# npm
if ! command -v npm &> /dev/null; then
    error "npm n'est pas installé"
fi
log "npm $(npm -v) détecté"

# MySQL
if ! command -v mysql &> /dev/null; then
    warning "MySQL CLI non trouvé. Assurez-vous que MySQL est installé."
else
    log "MySQL détecté"
fi

# PM2
if ! command -v pm2 &> /dev/null; then
    warning "PM2 n'est pas installé. Installation..."
    npm install -g pm2 || error "Impossible d'installer PM2"
    log "PM2 installé"
else
    log "PM2 $(pm2 -v) détecté"
fi

echo ""
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "Configuration Interactive"
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Détection automatique du port
info "Détection des ports utilisés..."
USED_PORTS=$(sudo netstat -tulpn 2>/dev/null | grep LISTEN | awk '{print $4}' | grep -oP ':\K\d+$' | sort -u | tr '\n' ' ')
echo "Ports utilisés: $USED_PORTS"

# Suggérer un port libre
SUGGESTED_PORT=3000
for port in 3000 3001 3002 3003 8080 8081; do
    if ! echo "$USED_PORTS" | grep -q "$port"; then
        SUGGESTED_PORT=$port
        break
    fi
done

read -p "Port pour Royal Editions (suggéré: $SUGGESTED_PORT): " APP_PORT
APP_PORT=${APP_PORT:-$SUGGESTED_PORT}

# Vérifier si le port est libre
if echo "$USED_PORTS" | grep -q "$APP_PORT"; then
    error "Le port $APP_PORT est déjà utilisé. Choisissez un autre port."
fi
log "Port $APP_PORT sera utilisé"

# Configuration de la base de données
echo ""
read -p "Nom de la base de données (défaut: royaledition): " DB_NAME
DB_NAME=${DB_NAME:-royaledition}

read -p "Utilisateur MySQL (défaut: royaledition_user): " DB_USER
DB_USER=${DB_USER:-royaledition_user}

read -p "Mot de passe MySQL: " -s DB_PASS
echo ""

if [ -z "$DB_PASS" ]; then
    error "Le mot de passe MySQL est requis"
fi

# Configuration du domaine
echo ""
read -p "Domaine ou sous-domaine (ex: royaleditions.votredomaine.com): " DOMAIN

if [ -z "$DOMAIN" ]; then
    warning "Domaine non spécifié. Vous devrez le configurer manuellement."
    DOMAIN="localhost"
fi

# Créer la base de données
echo ""
info "Création de la base de données..."
read -p "Voulez-vous que le script crée la base de données ? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Mot de passe root MySQL: " -s MYSQL_ROOT_PASS
    echo ""
    
    mysql -u root -p"$MYSQL_ROOT_PASS" << EOF 2>/dev/null || warning "Impossible de créer la DB automatiquement. Créez-la manuellement."
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF
    log "Base de données créée"
else
    info "Créez la base de données manuellement:"
    echo "  mysql -u root -p"
    echo "  CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    echo "  CREATE USER '$DB_USER'@'localhost' IDENTIFIED BY 'VOTRE_PASSWORD';"
    echo "  GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
    echo "  FLUSH PRIVILEGES;"
    read -p "Appuyez sur Entrée quand c'est fait..."
fi

# Créer le fichier .env
echo ""
info "Création du fichier .env..."

cat > .env << EOF
# Configuration générée par quick-setup.sh
# Date: $(date)

# Port de l'application
PORT=$APP_PORT

# Base de données
DATABASE_URL="mysql://$DB_USER:$DB_PASS@localhost:3306/$DB_NAME"

# Clerk Authentication (À REMPLIR)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_VOTRE_CLE_PUBLIQUE
CLERK_SECRET_KEY=sk_live_VOTRE_CLE_SECRETE
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/admin/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/admin/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/admin/dashboard

# Configuration App
NEXT_PUBLIC_APP_URL=https://$DOMAIN
NEXT_PUBLIC_DELIVERY_FEE=0
ADMIN_EMAIL=admin@$DOMAIN

# AWS S3 (À REMPLIR)
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=VOTRE_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=VOTRE_SECRET_ACCESS_KEY
AWS_S3_BUCKET_NAME=royale-edition-content

# Environnement
NODE_ENV=production
EOF

chmod 600 .env
log "Fichier .env créé avec permissions 600"

# Installation des dépendances
echo ""
info "Installation des dépendances npm..."
if npm install; then
    log "Dépendances installées"
else
    error "Échec de l'installation des dépendances"
fi

# Prisma
echo ""
info "Configuration Prisma..."
if npx prisma generate; then
    log "Client Prisma généré"
else
    error "Échec de la génération Prisma"
fi

echo ""
read -p "Voulez-vous créer les tables maintenant ? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if npx prisma db push; then
        log "Tables créées"
    else
        warning "Échec de la création des tables. Exécutez 'npx prisma db push' plus tard."
    fi
fi

# Créer le dossier logs
mkdir -p logs

# Résumé et prochaines étapes
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                       ║${NC}"
echo -e "${GREEN}║           ✓ SETUP TERMINÉ AVEC SUCCÈS                ║${NC}"
echo -e "${GREEN}║                                                       ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

info "Configuration:"
echo "  Port: $APP_PORT"
echo "  Base de données: $DB_NAME"
echo "  Domaine: $DOMAIN"
echo ""

warning "ACTIONS REQUISES:"
echo ""
echo "1. ${YELLOW}Configurer Clerk:${NC}"
echo "   - Créez un projet sur https://clerk.com"
echo "   - Copiez vos clés dans .env"
echo "   ${BLUE}nano .env${NC}"
echo ""
echo "2. ${YELLOW}Configurer AWS S3:${NC}"
echo "   - Créez un bucket S3"
echo "   - Créez un utilisateur IAM avec accès au bucket"
echo "   - Ajoutez les credentials dans .env"
echo ""
echo "3. ${YELLOW}Configurer Nginx:${NC}"
cat << NGINXCONF
   sudo nano /etc/nginx/sites-available/royaleditions
   
   # Ajoutez:
   server {
       listen 80;
       server_name $DOMAIN;
       
       location / {
           proxy_pass http://localhost:$APP_PORT;
           proxy_http_version 1.1;
           proxy_set_header Upgrade \$http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host \$host;
           proxy_set_header X-Real-IP \$remote_addr;
       }
   }
   
   # Puis:
   sudo ln -s /etc/nginx/sites-available/royaleditions /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
NGINXCONF
echo ""
echo "4. ${YELLOW}Configurer SSL:${NC}"
echo "   ${BLUE}sudo certbot --nginx -d $DOMAIN${NC}"
echo ""
echo "5. ${YELLOW}Build et démarrer:${NC}"
echo "   ${BLUE}npm run build${NC}"
echo "   ${BLUE}pm2 start ecosystem.config.js${NC}"
echo "   ${BLUE}pm2 save${NC}"
echo ""
echo "   ${GREEN}Ou utilisez le script de déploiement:${NC}"
echo "   ${BLUE}./deploy.sh production${NC}"
echo ""

info "Documentation complète:"
echo "  - DEPLOYMENT-EXISTING-VPS.md  (Guide complet VPS existant)"
echo "  - DEPLOYMENT-SCRIPTS.md       (Documentation scripts)"
echo ""

exit 0
