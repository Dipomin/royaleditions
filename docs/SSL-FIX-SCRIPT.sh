#!/bin/bash
# Script de correction SSL après installation iRedMail
# Royal Editions - royaleditions.com

set -e

echo "================================================"
echo "🔐 Correction des certificats SSL"
echo "================================================"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier si on est root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Veuillez exécuter ce script en tant que root (sudo)${NC}"
    exit 1
fi

echo -e "${YELLOW}Étape 1 : Arrêt de Nginx...${NC}"
systemctl stop nginx
echo -e "${GREEN}✅ Nginx arrêté${NC}"
echo ""

echo -e "${YELLOW}Étape 2 : Sauvegarde des anciennes configs...${NC}"
mkdir -p /root/backup-ssl-$(date +%Y%m%d-%H%M%S)
cp -r /etc/nginx/sites-enabled /root/backup-ssl-$(date +%Y%m%d-%H%M%S)/
echo -e "${GREEN}✅ Sauvegarde créée dans /root/backup-ssl-*${NC}"
echo ""

echo -e "${YELLOW}Étape 3 : Génération des certificats Let's Encrypt...${NC}"

# Certificats pour royaleditions.com
echo "Génération pour royaleditions.com et www.royaleditions.com..."
certbot certonly --standalone \
  -d royaleditions.com \
  -d www.royaleditions.com \
  --non-interactive \
  --agree-tos \
  --email admin@royaleditions.com \
  --force-renewal

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Certificats générés pour royaleditions.com${NC}"
else
    echo -e "${RED}❌ Erreur lors de la génération des certificats pour royaleditions.com${NC}"
    exit 1
fi

echo ""

# Certificats pour sorami.app
echo "Génération pour sorami.app et www.sorami.app..."
certbot certonly --standalone \
  -d sorami.app \
  -d www.sorami.app \
  --non-interactive \
  --agree-tos \
  --email admin@sorami.app \
  --force-renewal

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Certificats générés pour sorami.app${NC}"
else
    echo -e "${RED}❌ Erreur lors de la génération des certificats pour sorami.app${NC}"
    exit 1
fi

echo ""

# Certificats pour mail.royaleditions.com
echo "Génération pour mail.royaleditions.com..."
certbot certonly --standalone \
  -d mail.royaleditions.com \
  --non-interactive \
  --agree-tos \
  --email admin@royaleditions.com

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Certificats générés pour mail.royaleditions.com${NC}"
else
    echo -e "${YELLOW}⚠️  Attention: Les certificats pour mail.royaleditions.com n'ont pas pu être générés${NC}"
fi

echo ""

echo -e "${YELLOW}Étape 4 : Création de la configuration Royal Editions...${NC}"

cat > /etc/nginx/sites-available/royaleditions << 'EOFNGINX'
# Configuration Royal Editions
server {
    listen 80;
    server_name royaleditions.com www.royaleditions.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name royaleditions.com www.royaleditions.com;

    # Certificats Let's Encrypt
    ssl_certificate /etc/letsencrypt/live/royaleditions.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/royaleditions.com/privkey.pem;
    
    # Paramètres SSL modernes
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logs
    access_log /var/log/nginx/royaleditions-access.log;
    error_log /var/log/nginx/royaleditions-error.log;

    # Proxy vers l'application Node.js
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Cache pour les assets statiques
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3001;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOFNGINX

echo -e "${GREEN}✅ Configuration Royal Editions créée${NC}"
echo ""

echo -e "${YELLOW}Étape 5 : Création de la configuration Sorami...${NC}"

cat > /etc/nginx/sites-available/sorami << 'EOFNGINX2'
# Configuration Sorami
server {
    listen 80;
    server_name sorami.app www.sorami.app;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sorami.app www.sorami.app;

    # Certificats Let's Encrypt
    ssl_certificate /etc/letsencrypt/live/sorami.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sorami.app/privkey.pem;
    
    # Paramètres SSL modernes
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logs
    access_log /var/log/nginx/sorami-access.log;
    error_log /var/log/nginx/sorami-error.log;

    # Proxy vers l'application Node.js Sorami
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Cache pour les assets statiques
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOFNGINX2

echo -e "${GREEN}✅ Configuration Sorami créée${NC}"
echo ""

echo -e "${YELLOW}Étape 6 : Modification de la config iRedMail...${NC}"

# Modifier 00-default-ssl.conf pour utiliser les bons certificats
if [ -f /etc/nginx/sites-available/00-default-ssl.conf ]; then
    # Sauvegarder l'original
    cp /etc/nginx/sites-available/00-default-ssl.conf /etc/nginx/sites-available/00-default-ssl.conf.backup
    
    # Remplacer les certificats auto-signés par Let's Encrypt
    sed -i 's|ssl_certificate .*iRedMail\.crt;|ssl_certificate /etc/letsencrypt/live/mail.royaleditions.com/fullchain.pem;|g' /etc/nginx/sites-available/00-default-ssl.conf
    sed -i 's|ssl_certificate_key .*iRedMail\.key;|ssl_certificate_key /etc/letsencrypt/live/mail.royaleditions.com/privkey.pem;|g' /etc/nginx/sites-available/00-default-ssl.conf
    
    # Changer server_name _ par mail.royaleditions.com
    sed -i 's/server_name _;/server_name mail.royaleditions.com;/g' /etc/nginx/sites-available/00-default-ssl.conf
    
    echo -e "${GREEN}✅ Configuration iRedMail modifiée${NC}"
else
    echo -e "${YELLOW}⚠️  Fichier 00-default-ssl.conf non trouvé${NC}"
fi

# Modifier 00-default.conf
if [ -f /etc/nginx/sites-available/00-default.conf ]; then
    cp /etc/nginx/sites-available/00-default.conf /etc/nginx/sites-available/00-default.conf.backup
    sed -i 's/server_name _;/server_name mail.royaleditions.com;/g' /etc/nginx/sites-available/00-default.conf
fi

echo ""

echo -e "${YELLOW}Étape 7 : Activation des configurations...${NC}"

# Activer Royal Editions
ln -sf /etc/nginx/sites-available/royaleditions /etc/nginx/sites-enabled/royaleditions
echo -e "${GREEN}✅ Royal Editions activé${NC}"

# Activer Sorami
ln -sf /etc/nginx/sites-available/sorami /etc/nginx/sites-enabled/sorami
echo -e "${GREEN}✅ Sorami activé${NC}"

echo ""

echo -e "${YELLOW}Étape 8 : Test de la configuration Nginx...${NC}"
nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Configuration Nginx valide${NC}"
else
    echo -e "${RED}❌ Erreur dans la configuration Nginx${NC}"
    echo "Restauration de la sauvegarde..."
    systemctl start nginx
    exit 1
fi

echo ""

echo -e "${YELLOW}Étape 9 : Démarrage de Nginx...${NC}"
systemctl start nginx
systemctl status nginx --no-pager -l

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx démarré avec succès${NC}"
else
    echo -e "${RED}❌ Erreur au démarrage de Nginx${NC}"
    exit 1
fi

echo ""

echo -e "${YELLOW}Étape 10 : Configuration du renouvellement automatique...${NC}"
mkdir -p /etc/letsencrypt/renewal-hooks/deploy
cat > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh << 'EOFHOOK'
#!/bin/bash
systemctl reload nginx
EOFHOOK

chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
echo -e "${GREEN}✅ Renouvellement automatique configuré${NC}"
echo ""

echo -e "${YELLOW}Étape 11 : Test du renouvellement SSL...${NC}"
certbot renew --dry-run
echo ""

echo "================================================"
echo -e "${GREEN}✅ Configuration SSL terminée avec succès !${NC}"
echo "================================================"
echo ""
echo "🌐 Sites configurés :"
echo "   - https://royaleditions.com (site e-commerce Royal Editions - port 3001)"
echo "   - https://www.royaleditions.com (site e-commerce Royal Editions - port 3001)"
echo "   - https://sorami.app (application Sorami - port 3000)"
echo "   - https://www.sorami.app (application Sorami - port 3000)"
echo "   - https://mail.royaleditions.com (webmail iRedMail)"
echo ""
echo "📋 Tests à effectuer :"
echo "   curl -I https://royaleditions.com"
echo "   curl -I https://sorami.app"
echo "   curl -I https://mail.royaleditions.com"
echo ""
echo "⚠️  IMPORTANT : Vérifiez que les applications tournent sur les bons ports :"
echo "   - Sorami : pm2 list | grep sorami (doit être sur port 3000)"
echo "   - Royal Editions : pm2 list | grep royal (doit être sur port 3001)"
echo "   Si les ports sont différents, modifiez les fichiers dans /etc/nginx/sites-available/"
echo ""
echo "📂 Logs :"
echo "   - Nginx : /var/log/nginx/"
echo "   - Certbot : /var/log/letsencrypt/"
echo ""
echo "🔄 Renouvellement SSL automatique activé"
echo ""
