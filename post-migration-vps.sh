#!/bin/bash

# Script de post-migration à exécuter sur le VPS après la migration de la base de données

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================="
echo "🔧 Post-Migration Royal Editions"
echo -e "==========================================${NC}"
echo ""

# Vérifier si on est sur le VPS
if [ ! -d "/var/www/royaledition" ]; then
    echo -e "${RED}❌ Ce script doit être exécuté sur le VPS${NC}"
    echo "  Chemin attendu : /var/www/royaledition"
    exit 1
fi

cd /var/www/royaledition

echo -e "${BLUE}1. Vérification du fichier .env...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Fichier .env manquant${NC}"
    exit 1
fi

# Vérifier la DATABASE_URL
if ! grep -q "DATABASE_URL" .env; then
    echo -e "${RED}❌ DATABASE_URL manquant dans .env${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Fichier .env présent${NC}"
echo ""

echo -e "${BLUE}2. Installation des dépendances...${NC}"
npm ci --production
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dépendances installées${NC}"
else
    echo -e "${RED}❌ Erreur lors de l'installation des dépendances${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}3. Génération du Prisma Client...${NC}"
npx prisma generate
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Prisma Client généré${NC}"
else
    echo -e "${RED}❌ Erreur lors de la génération du Prisma Client${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}4. Synchronisation du schéma Prisma avec la base de données...${NC}"
npx prisma db push --accept-data-loss
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Schéma synchronisé${NC}"
else
    echo -e "${RED}❌ Erreur lors de la synchronisation du schéma${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}5. Vérification de la connexion à la base de données...${NC}"
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => { console.log('✓ Connexion réussie'); prisma.\$disconnect(); process.exit(0); }).catch(err => { console.error('❌ Erreur de connexion:', err.message); process.exit(1); });"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Base de données accessible${NC}"
else
    echo -e "${RED}❌ Impossible de se connecter à la base de données${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}6. Build de l'application...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build réussi${NC}"
else
    echo -e "${RED}❌ Erreur lors du build${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}7. Redémarrage de l'application avec PM2...${NC}"
pm2 restart royaleditions
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Application redémarrée${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 non disponible ou application non configurée${NC}"
    echo "  Lancez manuellement : pm2 start ecosystem.config.js"
fi
echo ""

echo -e "${GREEN}=========================================="
echo "✨ Post-migration terminée avec succès!"
echo -e "==========================================${NC}"
echo ""
echo -e "${YELLOW}📝 Vérifications recommandées :${NC}"
echo ""
echo "1. Tester l'API des commandes :"
echo "   curl -X POST https://royaleditions.com/api/orders -H 'Content-Type: application/json' -d '{\"items\":[],\"customer\":{}]}'"
echo ""
echo "2. Vérifier les logs PM2 :"
echo "   pm2 logs royaleditions"
echo ""
echo "3. Vérifier le statut :"
echo "   pm2 status"
echo ""
