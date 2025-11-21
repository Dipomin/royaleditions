#!/bin/bash

# Script de migration de base de données MySQL : Local → VPS
# Royal Editions - Migration automatisée

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
LOCAL_USER="royaledition_user"
LOCAL_PASS="Logik1981"
LOCAL_DB="royaledition"
VPS_HOST="178.18.254.232"
BACKUP_FILE="royaledition_backup_$(date +%Y%m%d_%H%M%S).sql"

echo -e "${BLUE}=========================================="
echo "🚀 Migration de base de données"
echo "   Royal Editions - Local → VPS"
echo -e "==========================================${NC}"
echo ""

# Demander les informations VPS
echo -e "${YELLOW}Configuration VPS :${NC}"
read -p "Nom d'utilisateur SSH pour le VPS [root] : " VPS_USER
VPS_USER=${VPS_USER:-root}

read -p "Utilisateur MySQL sur le VPS [royaledition_user] : " VPS_DB_USER
VPS_DB_USER=${VPS_DB_USER:-royaledition_user}

read -sp "Mot de passe MySQL sur le VPS [Logik1981] : " VPS_DB_PASS
VPS_DB_PASS=${VPS_DB_PASS:-Logik1981}
echo ""

read -p "Nom de la base de données sur le VPS [royaledition] : " VPS_DB
VPS_DB=${VPS_DB:-royaledition}
echo ""

# Demander si utilisation d'une clé SSH ou mot de passe
echo -e "${YELLOW}Méthode d'authentification SSH :${NC}"
echo "  1) Clé SSH (recommandé)"
echo "  2) Mot de passe"
read -p "Choisir [1 ou 2] : " AUTH_METHOD
AUTH_METHOD=${AUTH_METHOD:-1}

USE_PASSWORD=false
if [ "$AUTH_METHOD" = "2" ]; then
    USE_PASSWORD=true
    read -sp "Mot de passe SSH pour $VPS_USER@$VPS_HOST : " SSH_PASS
    echo ""
    echo ""
    
    # Vérifier si sshpass est installé
    if ! command -v sshpass &> /dev/null; then
        echo -e "${YELLOW}⚠️  sshpass n'est pas installé${NC}"
        echo "  Pour installer :"
        echo "    - macOS: brew install sshpass"
        echo "    - Linux: sudo apt-get install sshpass"
        echo ""
        read -p "Voulez-vous continuer sans sshpass (nécessitera de saisir le mot de passe plusieurs fois) ? (oui/non) : " CONTINUE
        if [ "$CONTINUE" != "oui" ]; then
            echo "❌ Migration annulée"
            exit 1
        fi
    fi
fi
echo ""

# Confirmation
echo -e "${YELLOW}⚠️  Résumé de la migration :${NC}"
echo "  Source : localhost/$LOCAL_DB"
echo "  Destination : $VPS_HOST/$VPS_DB"
echo "  Utilisateur SSH : $VPS_USER"
echo ""
read -p "Continuer ? (oui/non) : " CONFIRM
if [ "$CONFIRM" != "oui" ]; then
    echo "❌ Migration annulée"
    exit 0
fi
echo ""

# 1. Export local
echo -e "${BLUE}📦 Étape 1/6 : Export de la base de données locale...${NC}"

# Créer un fichier temporaire avec les options nécessaires
TEMP_SQL="${BACKUP_FILE}.tmp"

# Ajouter les commandes pour désactiver les contraintes
cat > $BACKUP_FILE << 'SQLHEADER'
SET FOREIGN_KEY_CHECKS=0;
SET UNIQUE_CHECKS=0;
SQLHEADER

# Export des données
mysqldump -u $LOCAL_USER -p$LOCAL_PASS \
    --skip-lock-tables \
    --skip-triggers \
    --skip-set-charset \
    --skip-comments \
    --no-tablespaces \
    --compact \
    $LOCAL_DB 2>/dev/null > $TEMP_SQL

if [ $? -eq 0 ] && [ -s $TEMP_SQL ]; then
    # Filtrer les commandes SET qui nécessitent SUPER
    sed '/^SET /d; /^\/\*!.*SET /d' $TEMP_SQL >> $BACKUP_FILE
    
    # Ajouter les commandes pour réactiver les contraintes
    cat >> $BACKUP_FILE << 'SQLFOOTER'
SET FOREIGN_KEY_CHECKS=1;
SET UNIQUE_CHECKS=1;
SQLFOOTER
    
    rm -f $TEMP_SQL
    
    FILE_SIZE=$(ls -lh $BACKUP_FILE | awk '{print $5}')
    echo -e "${GREEN}✓ Export réussi${NC}"
    echo "  Fichier : $BACKUP_FILE"
    echo "  Taille : $FILE_SIZE"
else
    echo -e "${RED}❌ Erreur lors de l'export${NC}"
    echo "  Vérifiez les identifiants MySQL locaux"
    rm -f $TEMP_SQL $BACKUP_FILE
    exit 1
fi
echo ""

# 2. Vérification du contenu
echo -e "${BLUE}🔍 Étape 2/6 : Vérification du contenu...${NC}"
TABLE_COUNT=$(grep -c "CREATE TABLE" $BACKUP_FILE)
echo -e "${GREEN}✓ ${TABLE_COUNT} tables trouvées${NC}"
echo ""

# 3. Compression
echo -e "${BLUE}🗜️  Étape 3/6 : Compression du fichier...${NC}"
gzip $BACKUP_FILE
BACKUP_FILE="${BACKUP_FILE}.gz"
COMPRESSED_SIZE=$(ls -lh $BACKUP_FILE | awk '{print $5}')
echo -e "${GREEN}✓ Fichier compressé${NC}"
echo "  Taille compressée : $COMPRESSED_SIZE"
echo ""

# 4. Test de connexion SSH
echo -e "${BLUE}🔌 Étape 4/6 : Test de connexion au VPS...${NC}"

if [ "$USE_PASSWORD" = true ] && command -v sshpass &> /dev/null; then
    sshpass -p "$SSH_PASS" ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "echo 'Connexion établie'" 2>/dev/null
else
    ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "echo 'Connexion établie'" 2>/dev/null
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Connexion SSH réussie${NC}"
else
    echo -e "${RED}❌ Impossible de se connecter au VPS${NC}"
    echo "  Vérifiez :"
    echo "    - L'adresse IP du VPS : $VPS_HOST"
    echo "    - Le nom d'utilisateur : $VPS_USER"
    if [ "$USE_PASSWORD" = true ]; then
        echo "    - Le mot de passe SSH"
    else
        echo "    - Votre clé SSH"
    fi
    rm $BACKUP_FILE
    exit 1
fi
echo ""

# 5. Transfert vers VPS
echo -e "${BLUE}📤 Étape 5/6 : Transfert vers le VPS...${NC}"
echo "  Cela peut prendre quelques minutes selon la taille..."

if [ "$USE_PASSWORD" = true ] && command -v sshpass &> /dev/null; then
    sshpass -p "$SSH_PASS" scp -o ConnectTimeout=30 -o StrictHostKeyChecking=no $BACKUP_FILE $VPS_USER@$VPS_HOST:~/
else
    scp -o ConnectTimeout=30 -o StrictHostKeyChecking=no $BACKUP_FILE $VPS_USER@$VPS_HOST:~/
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Transfert réussi${NC}"
else
    echo -e "${RED}❌ Erreur lors du transfert${NC}"
    rm $BACKUP_FILE
    exit 1
fi
echo ""

# 6. Import sur VPS
echo -e "${BLUE}📥 Étape 6/6 : Import sur le VPS...${NC}"
REMOTE_BACKUP_FILE=$(basename $BACKUP_FILE)
UNCOMPRESSED_FILE="${REMOTE_BACKUP_FILE%.gz}"

if [ "$USE_PASSWORD" = true ] && command -v sshpass &> /dev/null; then
    sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST << ENDSSH
    set -e
    
    echo "  → Décompression..."
    gunzip ~/${REMOTE_BACKUP_FILE}
    
    echo "  → Suppression de l'ancienne base de données..."
    sudo mysql -u root << 'EOF'
DROP DATABASE IF EXISTS ${VPS_DB};
EOF
    
    echo "  → Création de la base de données..."
    sudo mysql -u root << 'EOF'
CREATE DATABASE ${VPS_DB} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${VPS_DB_USER}'@'localhost' IDENTIFIED BY '${VPS_DB_PASS}';
GRANT ALL PRIVILEGES ON ${VPS_DB}.* TO '${VPS_DB_USER}'@'localhost';
FLUSH PRIVILEGES;
EOF
    
    echo "  → Base de données prête"
    
    echo "  → Import des données..."
    mysql -u ${VPS_DB_USER} -p${VPS_DB_PASS} ${VPS_DB} < ~/${UNCOMPRESSED_FILE}
    
    if [ \$? -eq 0 ]; then
        echo "  → Import terminé"
        rm ~/${UNCOMPRESSED_FILE}
    else
        echo "  ❌ Erreur lors de l'import"
        exit 1
    fi
ENDSSH
else
    ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST << ENDSSH
    set -e
    
    echo "  → Décompression..."
    gunzip ~/${REMOTE_BACKUP_FILE}
    
    echo "  → Suppression de l'ancienne base de données..."
    sudo mysql -u root << 'EOF'
DROP DATABASE IF EXISTS ${VPS_DB};
EOF
    
    echo "  → Création de la base de données..."
    sudo mysql -u root << 'EOF'
CREATE DATABASE ${VPS_DB} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${VPS_DB_USER}'@'localhost' IDENTIFIED BY '${VPS_DB_PASS}';
GRANT ALL PRIVILEGES ON ${VPS_DB}.* TO '${VPS_DB_USER}'@'localhost';
FLUSH PRIVILEGES;
EOF
    
    echo "  → Base de données prête"
    
    echo "  → Import des données..."
    mysql -u ${VPS_DB_USER} -p${VPS_DB_PASS} ${VPS_DB} < ~/${UNCOMPRESSED_FILE}
    
    if [ \$? -eq 0 ]; then
        echo "  → Import terminé"
        rm ~/${UNCOMPRESSED_FILE}
    else
        echo "  ❌ Erreur lors de l'import"
        exit 1
    fi
ENDSSH
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Import réussi${NC}"
else
    echo -e "${RED}❌ Erreur lors de l'import${NC}"
    rm $BACKUP_FILE
    exit 1
fi
echo ""

# 7. Vérification
echo -e "${BLUE}✅ Vérification de la migration...${NC}"
echo ""
ssh $VPS_USER@$VPS_HOST "mysql -u $VPS_DB_USER -p$VPS_DB_PASS $VPS_DB -e 'SELECT COUNT(*) as Tables FROM information_schema.tables WHERE table_schema = \"$VPS_DB\";' 2>/dev/null"
echo ""
ssh $VPS_USER@$VPS_HOST << ENDSSH
mysql -u $VPS_DB_USER -p$VPS_DB_PASS $VPS_DB << 'EOF' 2>/dev/null
SELECT 'Livres' as Type, COUNT(*) as Nombre FROM Book
UNION ALL SELECT 'Catégories', COUNT(*) FROM Category
UNION ALL SELECT 'Commandes', COUNT(*) FROM \`Order\`
UNION ALL SELECT 'Articles blog', COUNT(*) FROM BlogPost
UNION ALL SELECT 'Pages légales', COUNT(*) FROM LegalPage
UNION ALL SELECT 'Conversations', COUNT(*) FROM ChatConversation;
EOF
ENDSSH
echo ""

# 8. Nettoyage local
echo -e "${BLUE}🧹 Nettoyage des fichiers temporaires...${NC}"
rm $BACKUP_FILE
echo -e "${GREEN}✓ Nettoyage terminé${NC}"
echo ""

# Résumé final
echo -e "${GREEN}=========================================="
echo "✨ Migration terminée avec succès!"
echo -e "==========================================${NC}"
echo ""
echo -e "${YELLOW}📝 Prochaines étapes :${NC}"
echo ""
echo "1. Mettre à jour le fichier .env sur le VPS :"
echo -e "   ${BLUE}DATABASE_URL=\"mysql://$VPS_DB_USER:$VPS_DB_PASS@localhost:3306/$VPS_DB\"${NC}"
echo ""
echo "2. Tester la connexion depuis l'application :"
echo "   ssh $VPS_USER@$VPS_HOST"
echo "   cd /chemin/vers/royaledition"
echo "   npx prisma db push"
echo ""
echo "3. Redémarrer l'application sur le VPS :"
echo "   pm2 restart royaleditions"
echo ""
echo -e "${GREEN}✓ Backup local conservé temporairement${NC}"
echo ""
