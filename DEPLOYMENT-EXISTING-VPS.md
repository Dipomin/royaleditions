# 🔄 Guide de Déploiement sur VPS Existant - Royal Editions

Ce guide explique comment déployer Royal Editions sur un VPS qui héberge déjà d'autres applications.

## 📋 Prérequis

- VPS avec Node.js 20+, MySQL, Nginx et PM2 déjà installés
- Une application existante tourne dans `/home/` ou ailleurs
- Accès SSH avec droits sudo ou utilisateur avec permissions appropriées
- Nom de domaine ou sous-domaine configuré

---

## 🎯 Scénarios de Déploiement

### Scénario A: Déploiement dans `/home/user/`
✅ Recommandé si vous utilisez déjà ce pattern
✅ Pas besoin de droits root
✅ Isolation par utilisateur

### Scénario B: Déploiement dans `/var/www/`
✅ Convention standard pour les applications web
⚠️ Nécessite configuration des permissions

---

## 🚀 Installation - Scénario A (Déploiement dans `/home/`)

### 1. Préparation du Répertoire

```bash
# Se connecter au VPS
ssh votre-user@votre-vps

# Créer le répertoire de l'application
mkdir -p ~/royal-editions
cd ~/royal-editions

# Cloner le dépôt
git clone https://github.com/Dipomin/royaleditions.git .
# Ou si déjà cloné ailleurs, copier:
# cp -r /chemin/source/* ~/royal-editions/
```

### 2. Configuration de l'Environnement

```bash
# Créer le fichier .env
nano .env
```

**Contenu du `.env`:**

```env
# Base de données MySQL (utiliser une DB différente ou la même selon votre choix)
DATABASE_URL="mysql://votre_user:votre_password@localhost:3306/royaledition"

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

# PORT IMPORTANT: Utiliser un port différent si 3000 est déjà pris
PORT=3001

# Node Environment
NODE_ENV=production
```

**⚠️ IMPORTANT:** Si le port 3000 est déjà utilisé, choisissez un autre port (3001, 3002, etc.)

### 3. Vérification du Port Disponible

```bash
# Voir les ports utilisés
sudo netstat -tulpn | grep LISTEN

# Ou avec lsof
sudo lsof -i -P -n | grep LISTEN

# Si 3000 est pris, choisissez un port libre (ex: 3001)
# Mettez-le dans le .env: PORT=3001
```

### 4. Configuration de la Base de Données

**Option 1: Créer une nouvelle base de données**

```bash
# Se connecter à MySQL
mysql -u root -p

# Dans MySQL:
CREATE DATABASE royaledition CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'royaledition_user'@'localhost' IDENTIFIED BY 'VOTRE_MOT_DE_PASSE';
GRANT ALL PRIVILEGES ON royaledition.* TO 'royaledition_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Option 2: Utiliser une base existante** (si vous avez déjà une base commune)

Modifiez simplement `DATABASE_URL` dans `.env` pour pointer vers votre base existante.

### 5. Installation et Build

```bash
cd ~/royal-editions

# Installer les dépendances
npm install

# Générer le client Prisma
npx prisma generate

# Créer les tables (ou migrer)
npx prisma db push

# (Optionnel) Seed initial
npm run db:seed

# Build de l'application
npm run build
```

### 6. Démarrage avec PM2

```bash
# Créer le dossier de logs
mkdir -p ~/royal-editions/logs

# Démarrer avec PM2
pm2 start ecosystem.config.js

# Sauvegarder la config PM2
pm2 save

# Vérifier
pm2 list
pm2 logs royal-editions
```

Vous devriez voir **2 applications** dans `pm2 list` maintenant :
- Votre application existante
- `royal-editions` (la nouvelle)

### 7. Configuration Nginx

**Créer un nouveau virtual host:**

```bash
sudo nano /etc/nginx/sites-available/royaleditions
```

**Contenu (avec sous-domaine):**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name royaleditions.votredomaine.com;  # Sous-domaine

    access_log /var/log/nginx/royaleditions-access.log;
    error_log /var/log/nginx/royaleditions-error.log;

    client_max_body_size 20M;

    location / {
        proxy_pass http://localhost:3001;  # Utiliser le port configuré dans .env
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static files
    location /_next/static {
        proxy_cache_valid 60m;
        proxy_pass http://localhost:3001;
    }
}
```

**Ou avec un path (sur le même domaine):**

```nginx
# Ajouter dans votre virtual host existant:
location /royal-editions {
    rewrite ^/royal-editions(.*)$ $1 break;
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

**Activer et tester:**

```bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/royaleditions /etc/nginx/sites-enabled/

# Tester la config
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

### 8. Configuration SSL

```bash
# Pour un sous-domaine
sudo certbot --nginx -d royaleditions.votredomaine.com

# Pour un domaine principal
sudo certbot --nginx -d votredomaine.com -d www.votredomaine.com
```

---

## 🔄 Utilisation du Script de Déploiement

Le script `deploy.sh` a été adapté pour fonctionner avec n'importe quel répertoire.

### Configuration Initiale

```bash
cd ~/royal-editions

# Rendre le script exécutable
chmod +x deploy.sh

# Premier déploiement (depuis le répertoire de l'app)
./deploy.sh production
```

Le script détecte automatiquement :
- ✅ Le répertoire courant comme APP_DIR
- ✅ Le port depuis `.env`
- ✅ L'existence de `ecosystem.config.js`
- ✅ L'état de PM2

### Déploiements Suivants

```bash
# Option 1: Depuis le répertoire de l'app
cd ~/royal-editions
./deploy.sh production

# Option 2: Depuis n'importe où
~/royal-editions/deploy.sh production ~/royal-editions
```

### Paramètres du Script

```bash
# Syntaxe:
./deploy.sh [environnement] [chemin_app]

# Exemples:
./deploy.sh production
./deploy.sh production /home/user/royal-editions
./deploy.sh staging ~/royal-editions
```

---

## 📊 Gestion Multi-Applications avec PM2

### Lister Toutes les Applications

```bash
pm2 list
```

Vous verrez quelque chose comme:

```
┌─────┬────────────────────┬─────────┬─────────┬──────────┐
│ id  │ name               │ mode    │ status  │ cpu      │
├─────┼────────────────────┼─────────┼─────────┼──────────┤
│ 0   │ app-existante      │ cluster │ online  │ 0%       │
│ 1   │ royal-editions     │ cluster │ online  │ 0%       │
└─────┴────────────────────┴─────────┴─────────┴──────────┘
```

### Commandes PM2 par Application

```bash
# Redémarrer uniquement Royal Editions
pm2 restart royal-editions

# Arrêter Royal Editions
pm2 stop royal-editions

# Logs de Royal Editions uniquement
pm2 logs royal-editions

# Monitoring
pm2 monit

# Supprimer Royal Editions de PM2
pm2 delete royal-editions
```

---

## 🔧 Configuration Avancée

### Personnaliser le Nom de l'Application PM2

Éditez `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'royal-editions-prod',  // Changer ici
    // ... reste de la config
  }]
};
```

Puis dans `deploy.sh`, ligne 18:

```bash
APP_NAME="royal-editions-prod"  # Correspond au nom dans ecosystem.config.js
```

### Utiliser un Port Différent

**Méthode 1: Fichier `.env`**

```env
PORT=3002
```

**Méthode 2: ecosystem.config.js**

```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3002  // Forcer le port ici
}
```

### Configuration Nginx pour Plusieurs Apps

**Structure recommandée:**

```bash
/etc/nginx/sites-available/
├── app-existante           # Votre app actuelle
├── royaleditions          # Nouvelle app Royal Editions
└── autre-app              # Autre app future
```

Chaque virtual host écoute sur un domaine/sous-domaine différent et proxy vers un port différent.

---

## 🗂️ Structure des Fichiers sur le VPS

### Avec Application dans `/home/`

```
/home/votre-user/
├── royal-editions/              # Application Royal Editions
│   ├── .env                     # Config (PORT=3001)
│   ├── .next/                   # Build Next.js
│   ├── ecosystem.config.js      # Config PM2
│   ├── deploy.sh               # Script de déploiement
│   ├── logs/                    # Logs PM2
│   │   ├── err.log
│   │   ├── out.log
│   │   └── combined.log
│   ├── node_modules/
│   └── ...
├── backups/
│   └── royaledition/           # Backups DB Royal Editions
└── deploy-royaledition.log     # Logs des déploiements

/home/autre-user/
└── app-existante/              # Votre application existante
    ├── .env                     # PORT=3000
    └── ...
```

---

## 🔐 Sécurité et Isolation

### Permissions de Fichiers

```bash
# Permissions correctes pour .env
chmod 600 ~/royal-editions/.env

# Propriétaire correct
chown -R votre-user:votre-user ~/royal-editions/
```

### Isolation des Bases de Données

**Option 1: Bases séparées** (recommandé)
- `app_existante` pour l'application existante
- `royaledition` pour Royal Editions

**Option 2: Même base, schémas différents**
- Utiliser des préfixes de table différents

### Backup Séparés

```bash
# Créer un script de backup pour Royal Editions
nano ~/backup-royaleditions.sh
```

```bash
#!/bin/bash
DB_NAME="royaledition"
DB_USER="royaledition_user"
DB_PASS="VOTRE_MOT_DE_PASSE"
BACKUP_DIR="$HOME/backups/royaledition"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Garder 7 derniers backups
find $BACKUP_DIR -name "backup_*.sql.gz" -type f -mtime +7 -delete
```

```bash
chmod +x ~/backup-royaleditions.sh

# Ajouter au crontab (backup à 3h du matin pour ne pas chevaucher l'autre)
crontab -e
# Ajouter:
0 3 * * * ~/backup-royaleditions.sh >> ~/backup-royaleditions.log 2>&1
```

---

## 🐛 Dépannage Spécifique Multi-App

### Port Déjà Utilisé

```bash
# Erreur: EADDRINUSE port 3000 already in use

# Solution 1: Changer le port dans .env
echo "PORT=3001" >> ~/royal-editions/.env

# Solution 2: Identifier l'app qui utilise le port
sudo lsof -i :3000

# Redémarrer Royal Editions
pm2 restart royal-editions
```

### PM2 Ne Trouve Pas l'Application

```bash
# Vérifier le nom de l'app
pm2 list

# Logs détaillés
pm2 logs royal-editions --lines 100

# Redémarrer depuis le fichier de config
cd ~/royal-editions
pm2 delete royal-editions
pm2 start ecosystem.config.js
pm2 save
```

### Nginx Conflit de Configuration

```bash
# Tester la config
sudo nginx -t

# Si erreur de duplication de server_name:
# Vérifier qu'aucun autre virtual host n'utilise le même domaine
grep -r "server_name votredomaine.com" /etc/nginx/sites-enabled/
```

### Conflit de Base de Données

```bash
# Erreur: Table already exists

# Si vous avez des conflits, utiliser une DB séparée:
mysql -u root -p
DROP DATABASE royaledition;
CREATE DATABASE royaledition CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Puis refaire les migrations
cd ~/royal-editions
npx prisma db push
```

---

## 📝 Checklist de Déploiement VPS Existant

- [ ] Port disponible identifié (ex: 3001)
- [ ] `.env` créé avec PORT correct
- [ ] Base de données créée (ou réutilisée)
- [ ] Dépendances installées (`npm install`)
- [ ] Prisma généré et migrations appliquées
- [ ] Application buildée (`npm run build`)
- [ ] PM2 démarré avec nouveau nom distinct
- [ ] Nginx virtual host créé (domaine/sous-domaine)
- [ ] SSL configuré pour le nouveau domaine
- [ ] Test: Application accessible via HTTPS
- [ ] Test: Les 2 apps tournent simultanément (`pm2 list`)
- [ ] Backup automatique configuré
- [ ] Script `deploy.sh` testé

---

## 🎉 Application Déployée !

Votre application Royal Editions tourne maintenant **en parallèle** de votre application existante.

**Accès:**
- Application existante: `https://ancien-domaine.com` (port 3000)
- Royal Editions: `https://royaleditions.votredomaine.com` (port 3001)

**Commandes Rapides:**

```bash
# Redéployer Royal Editions
cd ~/royal-editions && ./deploy.sh production

# Voir les logs
pm2 logs royal-editions

# Statut des deux apps
pm2 list

# Monitoring
pm2 monit
```

---

## 📞 Support

En cas de problème:

1. Vérifier les logs: `pm2 logs royal-editions --lines 50`
2. Vérifier Nginx: `sudo nginx -t && sudo tail -f /var/log/nginx/royaleditions-error.log`
3. Vérifier le port: `sudo netstat -tulpn | grep 3001`
4. Consulter `DEPLOYMENT-VPS.md` pour le guide complet
