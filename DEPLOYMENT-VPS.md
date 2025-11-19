# 🚀 Guide de Déploiement VPS - Royal Editions

Ce guide vous accompagne pas à pas pour déployer l'application Royal Editions sur un VPS Ubuntu/Debian.

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Configuration du VPS](#configuration-du-vps)
3. [Installation des Dépendances](#installation-des-dépendances)
4. [Configuration de l'Application](#configuration-de-lapplication)
5. [Configuration de la Base de Données](#configuration-de-la-base-de-données)
6. [Déploiement avec PM2](#déploiement-avec-pm2)
7. [Configuration Nginx](#configuration-nginx)
8. [SSL avec Let's Encrypt](#ssl-avec-lets-encrypt)
9. [Monitoring et Maintenance](#monitoring-et-maintenance)
10. [Dépannage](#dépannage)

---

## 🔧 Prérequis

### Serveur VPS
- **OS**: Ubuntu 20.04+ ou Debian 11+
- **RAM**: Minimum 2GB (4GB recommandé)
- **CPU**: 2 cores minimum
- **Stockage**: 20GB minimum
- **Nom de domaine**: Configuré avec DNS pointant vers votre VPS

### Services Externes
- Compte Clerk (authentification)
- Bucket AWS S3 (stockage images)
- Base de données MySQL (peut être sur le VPS ou externe)

### Accès Requis
- Accès SSH root ou sudo
- Ports ouverts: 22 (SSH), 80 (HTTP), 443 (HTTPS), 3306 (MySQL si externe)

---

## 🖥️ Configuration du VPS

### 1. Connexion au VPS

```bash
ssh root@votre-ip-vps
# ou
ssh votre-user@votre-ip-vps
```

### 2. Mise à jour du système

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Configuration du pare-feu (UFW)

```bash
# Installer UFW si nécessaire
sudo apt install ufw -y

# Autoriser SSH (IMPORTANT: à faire en premier)
sudo ufw allow OpenSSH

# Autoriser HTTP et HTTPS
sudo ufw allow 'Nginx Full'

# Activer le pare-feu
sudo ufw enable

# Vérifier le statut
sudo ufw status
```

### 4. Création d'un utilisateur de déploiement

```bash
# Créer l'utilisateur
sudo adduser deploy

# Ajouter aux sudoers
sudo usermod -aG sudo deploy

# Passer à l'utilisateur deploy
su - deploy
```

---

## 📦 Installation des Dépendances

### 1. Installation de Node.js (v20+)

```bash
# Installer NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recharger le profil
source ~/.bashrc

# Installer Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# Vérifier l'installation
node -v
npm -v
```

### 2. Installation de MySQL

```bash
# Installer MySQL Server
sudo apt install mysql-server -y

# Sécuriser l'installation
sudo mysql_secure_installation

# Répondre aux questions:
# - Set root password? [Y/n] Y
# - Remove anonymous users? [Y/n] Y
# - Disallow root login remotely? [Y/n] Y
# - Remove test database? [Y/n] Y
# - Reload privilege tables? [Y/n] Y
```

### 3. Installation de Nginx

```bash
sudo apt install nginx -y

# Vérifier que Nginx fonctionne
sudo systemctl status nginx
```

### 4. Installation de PM2 (Process Manager)

```bash
npm install -g pm2

# Configurer PM2 pour démarrer au boot
pm2 startup systemd
# Exécuter la commande suggérée par PM2
```

### 5. Installation de Git

```bash
sudo apt install git -y
git --version
```

---

## ⚙️ Configuration de l'Application

### 1. Cloner le dépôt

```bash
# Créer le répertoire de l'application
sudo mkdir -p /var/www
sudo chown -R deploy:deploy /var/www

# Cloner le projet
cd /var/www
git clone https://github.com/votre-compte/royal-editions.git royaledition
cd royaledition
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
# Créer le fichier .env
nano .env
```

**Contenu du fichier `.env` (PRODUCTION):**

```env
# Base de données MySQL
DATABASE_URL="mysql://royaledition_user:VOTRE_MOT_DE_PASSE@localhost:3306/royaledition"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_VOTRE_CLE
CLERK_SECRET_KEY=sk_live_VOTRE_CLE
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/admin/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/admin/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/admin/dashboard

# Configuration App
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
NEXT_PUBLIC_DELIVERY_FEE=0

# Admin
ADMIN_EMAIL=admin@royaleditions.com

# AWS S3
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=VOTRE_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=VOTRE_SECRET_KEY
AWS_S3_BUCKET_NAME=royale-edition-content

# Node Environment
NODE_ENV=production
```

**⚠️ Important:** Ne jamais committer ce fichier dans Git!

---

## 🗄️ Configuration de la Base de Données

### 1. Créer la base de données et l'utilisateur

```bash
# Se connecter à MySQL
sudo mysql -u root -p
```

**Dans MySQL:**

```sql
-- Créer la base de données
CREATE DATABASE royaledition CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Créer l'utilisateur
CREATE USER 'royaledition_user'@'localhost' IDENTIFIED BY 'VOTRE_MOT_DE_PASSE_FORT';

-- Accorder les privilèges
GRANT ALL PRIVILEGES ON royaledition.* TO 'royaledition_user'@'localhost';

-- Appliquer les changements
FLUSH PRIVILEGES;

-- Quitter
EXIT;
```

### 2. Appliquer les migrations Prisma

```bash
cd /var/www/royaledition

# Générer le client Prisma
npx prisma generate

# Pousser le schéma vers la base de données
npx prisma db push

# (Optionnel) Seed initial
npm run db:seed
```

### 3. Vérifier la connexion

```bash
# Tester la connexion
npx prisma db pull
```

---

## 🚀 Déploiement avec PM2

### 1. Build de l'application

```bash
cd /var/www/royaledition

# Build Next.js
npm run build
```

### 2. Créer le fichier de configuration PM2

```bash
nano ecosystem.config.js
```

**Contenu `ecosystem.config.js`:**

```javascript
module.exports = {
  apps: [
    {
      name: 'royal-editions',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/royaledition',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/www/royaledition/logs/err.log',
      out_file: '/var/www/royaledition/logs/out.log',
      log_file: '/var/www/royaledition/logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
```

### 3. Créer le dossier de logs

```bash
mkdir -p /var/www/royaledition/logs
```

### 4. Démarrer l'application avec PM2

```bash
# Démarrer l'app
pm2 start ecosystem.config.js

# Sauvegarder la configuration PM2
pm2 save

# Vérifier le statut
pm2 status

# Voir les logs
pm2 logs royal-editions
```

### 5. Commandes PM2 utiles

```bash
# Redémarrer l'app
pm2 restart royal-editions

# Arrêter l'app
pm2 stop royal-editions

# Voir les métriques
pm2 monit

# Voir les logs en temps réel
pm2 logs royal-editions --lines 100
```

---

## 🌐 Configuration Nginx

### 1. Créer la configuration Nginx

```bash
sudo nano /etc/nginx/sites-available/royaledition
```

**Contenu (sans SSL - temporaire):**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name votre-domaine.com www.votre-domaine.com;

    # Logs
    access_log /var/log/nginx/royaledition-access.log;
    error_log /var/log/nginx/royaledition-error.log;

    # Client upload size
    client_max_body_size 20M;

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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Cache static files
    location /_next/static {
        proxy_cache_valid 60m;
        proxy_pass http://localhost:3000;
    }

    # Cache images
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:3000;
    }
}
```

### 2. Activer le site

```bash
# Créer un lien symbolique
sudo ln -s /etc/nginx/sites-available/royaledition /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

### 3. Vérifier

Visitez `http://votre-domaine.com` - vous devriez voir votre site (sans HTTPS pour l'instant).

---

## 🔒 SSL avec Let's Encrypt

### 1. Installer Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Obtenir le certificat SSL

```bash
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

**Répondre aux questions:**
- Email: votre-email@exemple.com
- Accepter les termes: Y
- Partager l'email: N (optionnel)
- Rediriger HTTP vers HTTPS: 2 (Oui)

### 3. Vérifier le renouvellement automatique

```bash
# Tester le renouvellement (dry-run)
sudo certbot renew --dry-run

# Le cron job est automatiquement créé
sudo systemctl status certbot.timer
```

### 4. Configuration Nginx finale (avec SSL)

Certbot modifie automatiquement la config, mais vérifiez:

```bash
sudo nano /etc/nginx/sites-available/royaledition
```

**Configuration finale complète:**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name votre-domaine.com www.votre-domaine.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name votre-domaine.com www.votre-domaine.com;

    # SSL certificates (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logs
    access_log /var/log/nginx/royaledition-access.log;
    error_log /var/log/nginx/royaledition-error.log;

    # Client upload size
    client_max_body_size 20M;

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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Cache static files
    location /_next/static {
        proxy_cache_valid 60m;
        proxy_pass http://localhost:3000;
    }

    # Cache images
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:3000;
    }
}
```

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📊 Monitoring et Maintenance

### 1. Monitoring avec PM2

```bash
# Voir le dashboard
pm2 monit

# Voir les logs
pm2 logs

# Voir les métriques
pm2 describe royal-editions
```

### 2. Installation de PM2 Web Dashboard (optionnel)

```bash
# Installer PM2 Web
pm2 install pm2-logrotate

# Configurer la rotation des logs
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 10
```

### 3. Surveillance des ressources

```bash
# CPU et RAM
htop

# Espace disque
df -h

# Logs Nginx
sudo tail -f /var/log/nginx/royaledition-access.log
sudo tail -f /var/log/nginx/royaledition-error.log
```

### 4. Backup de la base de données

**Script de backup automatique:**

```bash
# Créer le script
nano /home/deploy/backup-db.sh
```

**Contenu:**

```bash
#!/bin/bash

# Configuration
DB_NAME="royaledition"
DB_USER="royaledition_user"
DB_PASS="VOTRE_MOT_DE_PASSE"
BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/royaledition_$DATE.sql.gz"

# Créer le dossier si nécessaire
mkdir -p $BACKUP_DIR

# Dump de la base
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_FILE

# Garder seulement les 7 derniers backups
find $BACKUP_DIR -name "royaledition_*.sql.gz" -type f -mtime +7 -delete

echo "Backup terminé: $BACKUP_FILE"
```

**Rendre exécutable et ajouter au cron:**

```bash
chmod +x /home/deploy/backup-db.sh

# Ajouter au crontab (backup quotidien à 2h du matin)
crontab -e

# Ajouter cette ligne:
0 2 * * * /home/deploy/backup-db.sh >> /home/deploy/backup.log 2>&1
```

### 5. Mise à jour de l'application

```bash
cd /var/www/royaledition

# Pull les dernières modifications
git pull origin main

# Installer les nouvelles dépendances
npm install

# Rebuild
npm run build

# Appliquer les migrations Prisma si nécessaire
npx prisma generate
npx prisma db push

# Redémarrer PM2
pm2 restart royal-editions

# Vérifier les logs
pm2 logs royal-editions --lines 50
```

---

## 🔧 Dépannage

### Problème: L'application ne démarre pas

**Solution:**

```bash
# Vérifier les logs PM2
pm2 logs royal-editions --err

# Vérifier le port 3000
sudo netstat -tulpn | grep 3000

# Vérifier les variables d'environnement
cat /var/www/royaledition/.env

# Redémarrer
pm2 restart royal-editions
```

### Problème: Erreur 502 Bad Gateway

**Solution:**

```bash
# Vérifier que l'app tourne
pm2 status

# Vérifier Nginx
sudo nginx -t
sudo systemctl status nginx

# Vérifier les logs Nginx
sudo tail -f /var/log/nginx/royaledition-error.log

# Redémarrer Nginx
sudo systemctl restart nginx
```

### Problème: Erreur de connexion à la base de données

**Solution:**

```bash
# Vérifier MySQL
sudo systemctl status mysql

# Tester la connexion
mysql -u royaledition_user -p royaledition

# Vérifier DATABASE_URL dans .env
cat /var/www/royaledition/.env | grep DATABASE_URL

# Régénérer le client Prisma
cd /var/www/royaledition
npx prisma generate
```

### Problème: Out of Memory

**Solution:**

```bash
# Ajouter un swap file (2GB)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Rendre permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Ajuster les instances PM2
pm2 scale royal-editions 2
```

### Problème: Images ne s'affichent pas

**Solution:**

```bash
# Vérifier les credentials AWS dans .env
cat /var/www/royaledition/.env | grep AWS_

# Vérifier les permissions S3
# Aller sur AWS Console > S3 > Bucket > Permissions

# Vérifier les domaines dans next.config.ts
cat /var/www/royaledition/next.config.ts
```

### Problème: Clerk authentication ne fonctionne pas

**Solution:**

```bash
# Vérifier les URLs Clerk
cat /var/www/royaledition/.env | grep CLERK

# S'assurer que NEXT_PUBLIC_APP_URL est correct
# Vérifier sur Clerk Dashboard que le domaine est autorisé
```

---

## 📝 Checklist de Déploiement

- [ ] VPS configuré avec Ubuntu/Debian
- [ ] Nom de domaine configuré (DNS A record)
- [ ] Pare-feu UFW activé (ports 22, 80, 443)
- [ ] Node.js 20+ installé
- [ ] MySQL installé et sécurisé
- [ ] Nginx installé
- [ ] PM2 installé globalement
- [ ] Dépôt cloné dans `/var/www/royaledition`
- [ ] Fichier `.env` créé avec toutes les variables
- [ ] Base de données créée
- [ ] Migrations Prisma appliquées
- [ ] Application buildée (`npm run build`)
- [ ] PM2 configuré et démarré
- [ ] Nginx configuré avec proxy vers port 3000
- [ ] SSL Let's Encrypt installé
- [ ] HTTPS actif et redirect HTTP → HTTPS
- [ ] Backup automatique configuré
- [ ] Monitoring PM2 actif
- [ ] Tests: Site accessible en HTTPS
- [ ] Tests: Admin accessible (`/admin`)
- [ ] Tests: Upload d'images fonctionne
- [ ] Tests: Chat en temps réel fonctionne

---

## 🎉 Félicitations !

Votre application Royal Editions est maintenant déployée en production sur votre VPS !

**Accès:**
- Site public: `https://votre-domaine.com`
- Admin: `https://votre-domaine.com/admin`
- PM2 Dashboard: `pm2 monit` (via SSH)

**Support:**
- Documentation: `/docs` dans le projet
- Logs PM2: `pm2 logs royal-editions`
- Logs Nginx: `/var/log/nginx/royaledition-*.log`

---

## 📞 Ressources Supplémentaires

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/docs/)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
