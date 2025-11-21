# Guide de Déploiement Post-Migration - Royal Editions

## ⚠️ Situation Actuelle

La base de données a été migrée avec succès sur le VPS, mais l'application Next.js n'est pas encore déployée.

## 🚀 Étapes de Déploiement

### 1. Connexion au VPS

```bash
ssh root@178.18.254.232
```

### 2. Création du dossier de l'application

```bash
mkdir -p /var/www/royaledition
cd /var/www/royaledition
```

### 3. Installation de Node.js et PM2 (si pas déjà fait)

```bash
# Installer Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

# Installer PM2 globalement
npm install -g pm2

# Vérifier les versions
node --version
npm --version
pm2 --version
```

### 4. Clonage du projet depuis votre machine locale

**Option A : Via Git (recommandé)**

Sur votre machine locale :
```bash
cd /Users/inoverfly/Documents/qg-projects/Royal\ Editions/WEBSITE/dev/royaledition

# Initialiser le dépôt Git si ce n'est pas fait
git init
git add .
git commit -m "Initial commit after database migration"

# Pousser vers GitHub
git remote add origin https://github.com/Dipomin/royaleditions.git
git branch -M main
git push -u origin main
```

Sur le VPS :
```bash
cd /var/www/royaledition
git clone https://github.com/Dipomin/royaleditions.git .
```

**Option B : Transfert direct via SCP**

Sur votre machine locale :
```bash
cd /Users/inoverfly/Documents/qg-projects/Royal\ Editions/WEBSITE/dev/royaledition

# Créer une archive (exclure node_modules et .next)
tar --exclude='node_modules' --exclude='.next' --exclude='.git' -czf royaledition-app.tar.gz .

# Transférer vers le VPS
scp royaledition-app.tar.gz root@178.18.254.232:/var/www/royaledition/

# Sur le VPS, décompresser
ssh root@178.18.254.232
cd /var/www/royaledition
tar -xzf royaledition-app.tar.gz
rm royaledition-app.tar.gz
```

### 5. Configuration de l'environnement sur le VPS

```bash
cd /var/www/royaledition

# Créer le fichier .env
cat > .env << 'EOF'
# Database
DATABASE_URL="mysql://royaledition_user:Logik1981@localhost:3306/royaledition"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# AWS S3 (si configuré)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET_NAME=your_bucket_name
AWS_REGION=eu-north-1
AWS_CLOUDFRONT_DOMAIN=your_cloudfront_domain

# URL de production
NEXT_PUBLIC_APP_URL=https://royaleditions.com
EOF

# Éditer le fichier avec vos vraies clés
nano .env
```

### 6. Installation et build

```bash
# Installer les dépendances
npm ci

# Générer le Prisma Client
npx prisma generate

# Synchroniser le schéma Prisma (déjà fait avec la migration, mais par sécurité)
npx prisma db push

# Build de l'application
npm run build
```

### 7. Configuration de PM2

Le fichier `ecosystem.config.js` existe déjà dans le projet. Lancez :

```bash
# Démarrer l'application
pm2 start ecosystem.config.js

# Sauvegarder la configuration PM2
pm2 save

# Configurer PM2 pour démarrer au boot
pm2 startup

# Exécuter la commande affichée par pm2 startup
```

### 8. Configuration Nginx (si pas encore fait)

```bash
# Créer la configuration Nginx
cat > /etc/nginx/sites-available/royaleditions << 'EOF'
server {
    listen 80;
    server_name royaleditions.com www.royaleditions.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Activer le site
ln -s /etc/nginx/sites-available/royaleditions /etc/nginx/sites-enabled/

# Tester la configuration
nginx -t

# Recharger Nginx
systemctl reload nginx
```

### 9. Configuration SSL avec Certbot

```bash
# Installer Certbot
apt-get install -y certbot python3-certbot-nginx

# Obtenir le certificat SSL
certbot --nginx -d royaleditions.com -d www.royaleditions.com

# Le renouvellement automatique est configuré par défaut
```

### 10. Vérifications

```bash
# Vérifier le statut PM2
pm2 status

# Voir les logs
pm2 logs royaleditions

# Tester l'API localement
curl -X GET http://localhost:3000/api/books

# Tester depuis l'extérieur
curl -X GET https://royaleditions.com/api/books
```

## 🔧 Dépannage

### L'API retourne 500

1. Vérifier les logs PM2 :
   ```bash
   pm2 logs royaleditions --lines 100
   ```

2. Vérifier la connexion à la base de données :
   ```bash
   cd /var/www/royaledition
   node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('OK')).catch(console.error);"
   ```

3. Régénérer Prisma Client :
   ```bash
   npx prisma generate
   pm2 restart royaleditions
   ```

### Build échoue

1. Vérifier la version de Node.js (doit être 18+) :
   ```bash
   node --version
   ```

2. Nettoyer et rebuilder :
   ```bash
   rm -rf .next node_modules
   npm ci
   npm run build
   ```

### PM2 ne démarre pas

1. Vérifier la configuration :
   ```bash
   cat ecosystem.config.js
   ```

2. Démarrer en mode debug :
   ```bash
   pm2 start npm --name "royaleditions" -- start
   pm2 logs
   ```

## 📝 Fichiers Importants

- **Configuration** : `/var/www/royaledition/.env`
- **Logs PM2** : `~/.pm2/logs/`
- **Configuration Nginx** : `/etc/nginx/sites-available/royaleditions`
- **Certificats SSL** : `/etc/letsencrypt/live/royaleditions.com/`

## 🔄 Déploiement des Mises à Jour

Pour déployer une nouvelle version :

```bash
cd /var/www/royaledition
git pull origin main  # ou transférer les nouveaux fichiers
npm ci
npx prisma generate
npm run build
pm2 restart royaleditions
```

## ⚡ Script Automatique

Vous pouvez utiliser le script `post-migration-vps.sh` une fois l'application déployée :

```bash
cd /var/www/royaledition
./post-migration-vps.sh
```

Ce script effectue automatiquement :
- Installation des dépendances
- Génération du Prisma Client
- Synchronisation du schéma
- Build de l'application
- Redémarrage PM2
