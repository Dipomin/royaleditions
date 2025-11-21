# 🚀 Checklist Migration vers VPS

Guide étape par étape pour migrer Royal Editions de votre environnement local vers votre VPS de production.

---

## 📋 Avant de Commencer

### Prérequis

- [ ] VPS accessible via SSH (IP: `178.18.254.232`)
- [ ] Accès root ou sudo sur le VPS
- [ ] MySQL installé sur le VPS
- [ ] Node.js et PM2 installés sur le VPS
- [ ] Domaine configuré (`royaleditions.com`)
- [ ] Backup de la base de données locale

### Informations Nécessaires

```bash
# VPS
VPS_IP: 178.18.254.232
VPS_USER: root
DOMAIN: royaleditions.com

# Base de données locale
LOCAL_DB_USER: royaledition_user
LOCAL_DB_PASS: Logik1981
LOCAL_DB_NAME: royaledition

# Base de données VPS
VPS_DB_USER: royaledition_user
VPS_DB_PASS: [À définir]
VPS_DB_NAME: royaledition
```

---

## 🔒 Étape 1: Sécuriser le VPS

### 1.1 Connexion SSH

```bash
# Test de connexion
ssh root@178.18.254.232

# Si première connexion, accepter la clé
# Vérifier l'accès
whoami
# Devrait afficher: root
```

- [ ] Connexion SSH réussie

### 1.2 Créer un utilisateur non-root (Recommandé)

```bash
# Sur le VPS
adduser deploy
usermod -aG sudo deploy

# Tester
su - deploy
sudo ls /root
```

- [ ] Utilisateur créé
- [ ] Sudo fonctionne

### 1.3 Configuration pare-feu

```bash
# Installer ufw si nécessaire
sudo apt-get install ufw

# Autoriser SSH
sudo ufw allow 22/tcp

# Autoriser HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Activer
sudo ufw enable
sudo ufw status
```

- [ ] Pare-feu configuré
- [ ] Ports 22, 80, 443 ouverts

---

## 📦 Étape 2: Préparer l'Environnement VPS

### 2.1 Installer les dépendances système

```bash
# Mise à jour système
sudo apt-get update && sudo apt-get upgrade -y

# Installer Node.js 20 (via nvm recommandé)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Vérifier
node -v  # Doit afficher v20.x.x
npm -v
```

- [ ] Node.js 20 installé
- [ ] npm disponible

### 2.2 Installer PM2

```bash
npm install -g pm2

# Vérifier
pm2 -v

# Configuration auto-démarrage
pm2 startup
# Exécuter la commande affichée
```

- [ ] PM2 installé
- [ ] Auto-démarrage configuré

### 2.3 Installer Nginx

```bash
sudo apt-get install nginx -y

# Vérifier
sudo systemctl status nginx

# Démarrer si nécessaire
sudo systemctl start nginx
sudo systemctl enable nginx
```

- [ ] Nginx installé
- [ ] Nginx actif

### 2.4 Vérifier MySQL

```bash
sudo systemctl status mysql

# Si pas installé:
# sudo apt-get install mysql-server -y

# Sécuriser MySQL
sudo mysql_secure_installation
```

- [ ] MySQL installé et actif

---

## 🗄️ Étape 3: Migration Base de Données

### 3.1 Créer la base de données sur le VPS

```bash
# Se connecter à MySQL sur le VPS
ssh root@178.18.254.232
mysql -u root -p

# Dans MySQL
CREATE DATABASE royaledition CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'royaledition_user'@'localhost' IDENTIFIED BY 'VOTRE_MOT_DE_PASSE_SECURISE';

GRANT ALL PRIVILEGES ON royaledition.* TO 'royaledition_user'@'localhost';

FLUSH PRIVILEGES;

EXIT;
```

- [ ] Base de données créée
- [ ] Utilisateur créé avec droits

### 3.2 Méthode A: Script automatisé (Recommandé)

```bash
# Sur votre machine locale
cd ~/Documents/qg-projects/Royal\ Editions/WEBSITE/dev/royaledition

# Exécuter le script
./migrate-db-to-vps.sh

# Suivre les instructions interactives
# Le script fera:
# 1. Export de la BDD locale
# 2. Compression
# 3. Transfert vers VPS
# 4. Import sur VPS
# 5. Vérification
```

- [ ] Script exécuté
- [ ] Migration réussie
- [ ] Données vérifiées

### 3.3 Méthode B: Manuel

```bash
# 1. Export local
mysqldump -u royaledition_user -p royaledition > royaledition_backup.sql

# 2. Compresser
gzip royaledition_backup.sql

# 3. Transférer
scp royaledition_backup.sql.gz root@178.18.254.232:/tmp/

# 4. Sur le VPS - Import
ssh root@178.18.254.232
gunzip /tmp/royaledition_backup.sql.gz
mysql -u royaledition_user -p royaledition < /tmp/royaledition_backup.sql

# 5. Vérifier
mysql -u royaledition_user -p royaledition -e "SHOW TABLES;"
```

- [ ] Export réussi
- [ ] Transfert réussi
- [ ] Import réussi

---

## 📁 Étape 4: Déployer l'Application

### 4.1 Cloner le projet

```bash
# Sur le VPS
cd ~
git clone https://github.com/VOTRE_USERNAME/royaleditions.git royal-editions
cd royal-editions

# Ou si déjà cloné, mettre à jour
cd ~/royal-editions
git pull origin main
```

- [ ] Code source sur le VPS

### 4.2 Configurer les variables d'environnement

```bash
# Copier le template
cp .env.example .env

# Éditer
nano .env
```

**Remplir avec:**
```env
# Base de données
DATABASE_URL="mysql://royaledition_user:VOTRE_PASSWORD@localhost:3306/royaledition"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/admin/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/admin/sign-up"

# AWS S3
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET_NAME="royaleditions-media"
AWS_REGION="eu-north-1"
AWS_CLOUDFRONT_DOMAIN="xxxxx.cloudfront.net"

# Email (si configuré)
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="SG.xxxxx"
SMTP_FROM="admin@royaleditions.com"

# App
NEXT_PUBLIC_APP_URL="https://royaleditions.com"
NODE_ENV="production"
PORT="3000"
```

- [ ] Fichier .env créé
- [ ] Toutes les variables remplies

### 4.3 Installer les dépendances

```bash
npm install --production

# Ou si besoin de dev dependencies pour build
npm install
```

- [ ] Dependencies installées

### 4.4 Générer Prisma Client

```bash
npx prisma generate
```

- [ ] Prisma Client généré

### 4.5 Build de production

```bash
npm run build
```

- [ ] Build réussi sans erreurs

### 4.6 Démarrer avec PM2

```bash
# Utiliser le script ecosystem.config.js
pm2 start ecosystem.config.js --env production

# Ou manuellement
pm2 start npm --name "royal-editions" -- start

# Vérifier
pm2 list
pm2 logs royal-editions

# Sauvegarder la config PM2
pm2 save
```

- [ ] Application démarrée
- [ ] PM2 liste l'app comme "online"
- [ ] Logs sans erreurs

---

## 🌐 Étape 5: Configuration Nginx

### 5.1 Créer la configuration

```bash
sudo nano /etc/nginx/sites-available/royaleditions
```

**Contenu:**
```nginx
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
```

- [ ] Fichier créé

### 5.2 Activer le site

```bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/royaleditions /etc/nginx/sites-enabled/

# Tester la config
sudo nginx -t

# Si OK, recharger
sudo systemctl reload nginx
```

- [ ] Site activé
- [ ] Config Nginx valide

### 5.3 Configurer SSL avec Let's Encrypt

```bash
# Installer Certbot
sudo apt-get install certbot python3-certbot-nginx -y

# Obtenir le certificat
sudo certbot --nginx -d royaleditions.com -d www.royaleditions.com

# Suivre les instructions
# Choisir: 2 (Redirect HTTP to HTTPS)

# Vérifier auto-renouvellement
sudo certbot renew --dry-run
```

- [ ] SSL configuré
- [ ] Redirection HTTPS active
- [ ] Auto-renouvellement testé

---

## 📧 Étape 6: Configuration Email (Optionnel)

### 6.1 Option A: Mail-in-a-Box (Serveur email complet)

```bash
# Suivre le guide complet:
cat docs/VPS-EMAIL-SETUP.md

# Installation
curl -s https://mailinabox.email/setup.sh | sudo bash
```

- [ ] Mail-in-a-Box installé
- [ ] DNS configuré (MX, SPF, DKIM)
- [ ] Comptes email créés

### 6.2 Option B: SMTP Tiers (Plus simple)

**SendGrid:**
1. Créer un compte sur sendgrid.com
2. Générer une clé API
3. Mettre à jour `.env` avec les credentials SMTP

**Mailgun:**
1. Créer un compte sur mailgun.com
2. Vérifier le domaine
3. Utiliser les credentials SMTP fournis

- [ ] Service SMTP choisi
- [ ] Credentials ajoutés dans .env
- [ ] Email de test envoyé

---

## ✅ Étape 7: Tests Finaux

### 7.1 Vérifier l'accès au site

```bash
# Dans votre navigateur
https://royaleditions.com
```

**Tester:**
- [ ] Page d'accueil charge
- [ ] Images S3 s'affichent
- [ ] Navigation fonctionne
- [ ] Boutique affiche les livres
- [ ] Pages légales accessibles

### 7.2 Tester le dashboard admin

```bash
https://royaleditions.com/admin/sign-in
```

**Tester:**
- [ ] Connexion Clerk fonctionne
- [ ] Dashboard accessible
- [ ] Liste des livres charge
- [ ] Liste des commandes charge
- [ ] Blog accessible

### 7.3 Tester le checkout

**Processus complet:**
- [ ] Ajouter au panier
- [ ] Voir le panier
- [ ] Remplir le formulaire
- [ ] Cocher CGV
- [ ] Valider la commande
- [ ] Voir la confirmation
- [ ] Commande apparaît dans l'admin

### 7.4 Tester le formulaire de contact

- [ ] Remplir le formulaire
- [ ] Envoyer
- [ ] Email reçu à contact@royaleditions.com

### 7.5 Vérifier les performances

```bash
# Temps de réponse
curl -o /dev/null -s -w 'Total: %{time_total}s\n' https://royaleditions.com

# Devrait être < 2s
```

- [ ] Temps de réponse acceptable
- [ ] Pas d'erreurs dans les logs PM2

---

## 📊 Étape 8: Monitoring et Maintenance

### 8.1 Configurer le monitoring PM2

```bash
pm2 install pm2-logrotate

# Voir les stats en temps réel
pm2 monit
```

- [ ] Logs rotation configurée
- [ ] Monitoring actif

### 8.2 Créer un script de backup quotidien

```bash
# Créer le script
sudo nano /usr/local/bin/backup-royaledition.sh
```

**Contenu:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/royaledition"
mkdir -p $BACKUP_DIR

# Backup base de données
mysqldump -u royaledition_user -pVOTRE_PASSWORD royaledition | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Garder seulement les 7 derniers jours
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: db_$DATE.sql.gz"
```

```bash
# Rendre exécutable
sudo chmod +x /usr/local/bin/backup-royaledition.sh

# Ajouter au cron
sudo crontab -e

# Ajouter:
0 2 * * * /usr/local/bin/backup-royaledition.sh >> /var/log/backup-royaledition.log 2>&1
```

- [ ] Script de backup créé
- [ ] Cron configuré
- [ ] Backup testé

---

## 🎉 Migration Terminée !

### Checklist Finale

- [ ] ✅ VPS sécurisé et configuré
- [ ] ✅ Base de données migrée
- [ ] ✅ Application déployée
- [ ] ✅ Nginx et SSL configurés
- [ ] ✅ Email fonctionnel
- [ ] ✅ Tests réussis
- [ ] ✅ Monitoring actif
- [ ] ✅ Backups automatiques

### URLs Importantes

- **Site:** https://royaleditions.com
- **Admin:** https://royaleditions.com/admin
- **Blog:** https://royaleditions.com/blog
- **Contact:** https://royaleditions.com/contact

### Commandes Utiles

```bash
# Redémarrer l'app
pm2 restart royal-editions

# Voir les logs
pm2 logs royal-editions --lines 100

# Monitoring
pm2 monit

# Pull dernières modifications
cd ~/royal-editions && git pull && npm install && npm run build && pm2 restart royal-editions

# Backup manuel
/usr/local/bin/backup-royaledition.sh
```

---

## 🆘 En Cas de Problème

1. **Consulter les logs:**
   ```bash
   pm2 logs royal-editions
   sudo tail -f /var/log/nginx/error.log
   ```

2. **Guides de dépannage:**
   - Migration BDD: `docs/DATABASE-MIGRATION-TROUBLESHOOTING.md`
   - Email: `docs/SMTP-CONFIGURATION.md`
   - Déploiement: `DEPLOYMENT-EXISTING-VPS.md`

3. **Redémarrage complet:**
   ```bash
   pm2 restart royal-editions
   sudo systemctl restart nginx
   sudo systemctl restart mysql
   ```

---

**Félicitations ! Votre site Royal Editions est maintenant en production ! 🚀**

Pour toute question: admin@royaleditions.com
