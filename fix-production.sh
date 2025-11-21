#!/bin/bash

# Script rapide pour corriger l'erreur 500 en production

VPS_HOST="178.18.254.232"
VPS_USER="root"

echo "🔧 Correction de l'application en production..."
echo ""

# Créer un script temporaire à exécuter sur le VPS
cat > /tmp/fix-prod.sh << 'SCRIPT'
#!/bin/bash

# Trouver le dossier de l'application
if [ -d "/var/www/royaledition" ]; then
    APP_DIR="/var/www/royaledition"
elif [ -d "/root/royaledition" ]; then
    APP_DIR="/root/royaledition"
elif [ -d "~/royaledition" ]; then
    APP_DIR="~/royaledition"
else
    echo "❌ Dossier de l'application non trouvé"
    exit 1
fi

cd $APP_DIR
echo "📍 Dossier: $APP_DIR"
echo ""

echo "1️⃣ Vérification de la connexion à la base de données..."
if npx prisma db pull --force > /dev/null 2>&1; then
    echo "✅ Base de données accessible"
else
    echo "⚠️  Problème de connexion à la base de données"
fi
echo ""

echo "2️⃣ Synchronisation du schéma Prisma..."
npx prisma db push --accept-data-loss
echo ""

echo "3️⃣ Régénération du Prisma Client..."
npx prisma generate
echo ""

echo "4️⃣ Redémarrage de l'application..."
if command -v pm2 &> /dev/null; then
    pm2 restart royaleditions 2>/dev/null || pm2 restart all
    echo ""
    echo "📊 Statut:"
    pm2 list
else
    echo "⚠️  PM2 non trouvé. Redémarrez manuellement l'application."
fi
echo ""

echo "5️⃣ Test de l'API..."
sleep 2
curl -s http://localhost:3000/api/books | head -c 100
echo ""
echo ""

echo "✅ Terminé!"
SCRIPT

# Transférer et exécuter le script
echo "📤 Transfert du script..."
scp /tmp/fix-prod.sh $VPS_USER@$VPS_HOST:/tmp/

echo ""
echo "🚀 Exécution sur le VPS..."
ssh $VPS_USER@$VPS_HOST "chmod +x /tmp/fix-prod.sh && /tmp/fix-prod.sh && rm /tmp/fix-prod.sh"

# Nettoyage local
rm /tmp/fix-prod.sh

echo ""
echo "🌐 Testez maintenant: https://royaleditions.com/api/books"
