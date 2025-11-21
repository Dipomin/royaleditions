#!/bin/bash

# Script de déploiement automatique de Royal Editions sur VPS

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

VPS_HOST="178.18.254.232"
VPS_USER="root"
VPS_PATH="/var/www/royaledition"
LOCAL_PATH="$(pwd)"

echo -e "${BLUE}=========================================="
echo "🚀 Déploiement Royal Editions"
echo "   Local → VPS (178.18.254.232)"
echo -e "==========================================${NC}"
echo ""

# Vérifier qu'on est dans le bon dossier
if [ ! -f "package.json" ] || [ ! -f "next.config.ts" ]; then
    echo -e "${RED}❌ Ce script doit être exécuté depuis la racine du projet${NC}"
    exit 1
fi

# Demander confirmation
echo -e "${YELLOW}⚠️  Résumé du déploiement :${NC}"
echo "  Source : $LOCAL_PATH"
echo "  Destination : $VPS_USER@$VPS_HOST:$VPS_PATH"
echo ""
read -p "Continuer ? (oui/non) : " CONFIRM
if [ "$CONFIRM" != "oui" ]; then
    echo "❌ Déploiement annulé"
    exit 0
fi
echo ""

# 1. Créer l'archive (exclure node_modules, .next, .git, etc.)
echo -e "${BLUE}📦 Étape 1/6 : Création de l'archive...${NC}"
ARCHIVE_NAME="royaledition-deploy-$(date +%Y%m%d_%H%M%S).tar.gz"

tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='.env.local' \
    --exclude='royaledition-deploy-*.tar.gz' \
    --exclude='royaledition_backup_*.sql*' \
    -czf $ARCHIVE_NAME .

if [ $? -eq 0 ]; then
    SIZE=$(ls -lh $ARCHIVE_NAME | awk '{print $5}')
    echo -e "${GREEN}✓ Archive créée ($SIZE)${NC}"
else
    echo -e "${RED}❌ Erreur lors de la création de l'archive${NC}"
    exit 1
fi
echo ""

# 2. Vérifier la connexion SSH
echo -e "${BLUE}🔌 Étape 2/6 : Test de connexion au VPS...${NC}"
ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "echo 'Connexion établie'" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Connexion SSH réussie${NC}"
else
    echo -e "${RED}❌ Impossible de se connecter au VPS${NC}"
    rm $ARCHIVE_NAME
    exit 1
fi
echo ""

# 3. Créer le dossier sur le VPS si nécessaire
echo -e "${BLUE}📁 Étape 3/6 : Préparation du dossier sur le VPS...${NC}"
ssh $VPS_USER@$VPS_HOST << EOF
    mkdir -p $VPS_PATH
    cd $VPS_PATH
    
    # Sauvegarder .env si existe
    if [ -f .env ]; then
        cp .env .env.backup
        echo "  → .env sauvegardé"
    fi
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dossier prêt${NC}"
else
    echo -e "${RED}❌ Erreur lors de la préparation${NC}"
    rm $ARCHIVE_NAME
    exit 1
fi
echo ""

# 4. Transférer l'archive
echo -e "${BLUE}📤 Étape 4/6 : Transfert vers le VPS...${NC}"
echo "  Cela peut prendre quelques minutes..."
scp -o ConnectTimeout=30 -o StrictHostKeyChecking=no $ARCHIVE_NAME $VPS_USER@$VPS_HOST:$VPS_PATH/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Transfert réussi${NC}"
else
    echo -e "${RED}❌ Erreur lors du transfert${NC}"
    rm $ARCHIVE_NAME
    exit 1
fi
echo ""

# 5. Décompresser et installer sur le VPS
echo -e "${BLUE}📥 Étape 5/6 : Installation sur le VPS...${NC}"
ssh $VPS_USER@$VPS_HOST << EOF
    set -e
    cd $VPS_PATH
    
    echo "  → Décompression..."
    tar -xzf $ARCHIVE_NAME
    rm $ARCHIVE_NAME
    
    # Restaurer .env si existe
    if [ -f .env.backup ]; then
        mv .env.backup .env
        echo "  → .env restauré"
    elif [ ! -f .env ]; then
        echo "  ⚠️  ATTENTION : Fichier .env manquant!"
        echo "  Créez le fichier .env avec DATABASE_URL et les clés Clerk"
    fi
    
    echo "  → Installation des dépendances..."
    npm ci --production 2>&1 | tail -5
    
    echo "  → Génération du Prisma Client..."
    npx prisma generate 2>&1 | tail -5
    
    echo "  → Build de l'application..."
    npm run build 2>&1 | tail -10
    
    echo "  → Redémarrage de l'application..."
    if command -v pm2 &> /dev/null; then
        pm2 restart royaleditions 2>&1 || pm2 start ecosystem.config.js
        pm2 save
    else
        echo "  ⚠️  PM2 non installé. Installez-le avec : npm install -g pm2"
    fi
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Installation terminée${NC}"
else
    echo -e "${RED}❌ Erreur lors de l'installation${NC}"
    rm $ARCHIVE_NAME
    exit 1
fi
echo ""

# 6. Nettoyage local
echo -e "${BLUE}🧹 Étape 6/6 : Nettoyage...${NC}"
rm $ARCHIVE_NAME
echo -e "${GREEN}✓ Nettoyage terminé${NC}"
echo ""

# Résumé final
echo -e "${GREEN}=========================================="
echo "✨ Déploiement terminé avec succès!"
echo -e "==========================================${NC}"
echo ""
echo -e "${YELLOW}📝 Vérifications recommandées :${NC}"
echo ""
echo "1. Vérifier le statut de l'application :"
echo "   ssh $VPS_USER@$VPS_HOST 'pm2 status'"
echo ""
echo "2. Voir les logs :"
echo "   ssh $VPS_USER@$VPS_HOST 'pm2 logs royaleditions --lines 50'"
echo ""
echo "3. Tester l'application :"
echo "   curl https://royaleditions.com/api/books"
echo ""
echo -e "${BLUE}🌐 URL de production : https://royaleditions.com${NC}"
echo ""
