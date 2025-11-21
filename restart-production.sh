#!/bin/bash

# Script de redémarrage propre pour Royal Editions en production

VPS_HOST="178.18.254.232"
VPS_USER="root"

echo "🔄 Redémarrage de Royal Editions en production..."
echo ""

ssh $VPS_USER@$VPS_HOST << 'ENDSSH'
cd /root/royal-editions

echo "1️⃣ Arrêt de tous les processus Next.js zombie..."
pkill -9 next-server || echo "  Aucun processus zombie"
pkill -9 node || echo "  Aucun processus node orphelin"
sleep 2

echo ""
echo "2️⃣ Nettoyage PM2..."
pm2 delete all || echo "  Aucune app PM2 à supprimer"
pm2 kill

echo ""
echo "3️⃣ Vérification du port 3001..."
if lsof -i :3001 > /dev/null 2>&1; then
    echo "  ⚠️  Port 3001 encore occupé, libération forcée..."
    fuser -k 3001/tcp || echo "  Port libéré"
    sleep 2
else
    echo "  ✓ Port 3001 libre"
fi

echo ""
echo "4️⃣ Régénération du Prisma Client..."
npx prisma generate

echo ""
echo "5️⃣ Démarrage de l'application..."
PORT=3001 pm2 start npm --name royaleditions -- start

echo ""
echo "6️⃣ Sauvegarde de la configuration PM2..."
pm2 save
pm2 startup

echo ""
echo "7️⃣ Attente du démarrage (10s)..."
sleep 10

echo ""
echo "8️⃣ Vérification du statut..."
pm2 list
echo ""
pm2 logs royaleditions --lines 20 --nostream

echo ""
echo "9️⃣ Test de l'API..."
curl -s http://localhost:3001/api/books | head -c 200 || echo "⚠️ API non accessible"

echo ""
echo "✅ Redémarrage terminé!"
ENDSSH

echo ""
echo "🌐 Testez: https://royaleditions.com"
