# 📦 Scripts de Déploiement - Royal Editions

Ce dossier contient tous les scripts nécessaires pour déployer l'application Royal Editions sur un VPS, que ce soit un VPS neuf ou un VPS hébergeant déjà d'autres applications.

## 🎯 Guides Disponibles

### Pour VPS Hébergeant Déjà des Applications
📘 **[QUICK-START-VPS.md](./QUICK-START-VPS.md)** - Setup ultra-rapide en 5 minutes
📗 **[DEPLOYMENT-EXISTING-VPS.md](./DEPLOYMENT-EXISTING-VPS.md)** - Guide complet et détaillé

### Pour VPS Neuf
📕 **[DEPLOYMENT-VPS.md](./DEPLOYMENT-VPS.md)** - Installation complète étape par étape

## 📁 Fichiers

### 1. `DEPLOYMENT-VPS.md`
Documentation complète du déploiement manuel étape par étape.

**Contenu:**
- Configuration du VPS
- Installation des dépendances (Node.js, MySQL, Nginx, PM2)
- Configuration de l'application et de la base de données
- Configuration Nginx et SSL (Let's Encrypt)
- Monitoring et maintenance
- Guide de dépannage complet

**Usage:** Guide de référence pour comprendre chaque étape du déploiement.

---

### 2. `install-vps.sh`
Script d'installation initiale automatisé pour un VPS fraîchement créé.

**Ce qu'il fait:**
- ✅ Met à jour le système Ubuntu/Debian
- ✅ Installe tous les outils nécessaires (Git, Node.js, MySQL, Nginx, PM2)
- ✅ Configure le pare-feu UFW
- ✅ Crée l'utilisateur `deploy`
- ✅ Configure MySQL avec base de données et utilisateur
- ✅ Configure Nginx avec proxy vers port 3000
- ✅ Installe Certbot pour SSL
- ✅ Crée la structure de répertoires
- ✅ Génère un template .env pré-rempli

**Prérequis:**
- VPS Ubuntu 20.04+ ou Debian 11+
- Accès SSH root ou sudo
- Nom de domaine configuré (DNS A record pointant vers le VPS)

**Usage:**

```bash
# Sur votre VPS fraîchement créé
wget https://raw.githubusercontent.com/votre-compte/royal-editions/main/install-vps.sh
chmod +x install-vps.sh
sudo bash install-vps.sh
```

**Informations demandées:**
- Nom de domaine (ex: royaleditions.com)
- Email pour Let's Encrypt
- Mot de passe MySQL pour l'utilisateur `royaledition_user`

**Durée:** ~10-15 minutes

---

### 3. `deploy.sh`
Script de déploiement automatisé pour mettre à jour l'application en production.

**Ce qu'il fait:**
- ✅ Détection automatique du répertoire de l'application
- ✅ Détection du port depuis `.env`
- ✅ Backup automatique de la base de données avant déploiement
- ✅ Pull du code depuis Git (branche main ou staging)
- ✅ Installation des dépendances npm
- ✅ Génération du client Prisma
- ✅ Application des migrations (avec confirmation)
- ✅ Build de l'application Next.js
- ✅ Redémarrage automatique avec PM2 (gère les apps existantes)
- ✅ Tests de santé (localhost avec port détecté)
- ✅ Nettoyage des anciens backups
- ✅ Logs détaillés avec timestamps
- ✅ Rapport final avec infos utiles

**Prérequis:**
- Node.js 18+, PM2, MySQL installés
- Application déjà clonée et configurée
- Fichier `.env` présent

**Usage:**

```bash
# Depuis le répertoire de l'application
cd ~/royal-editions  # Ou n'importe quel chemin
./deploy.sh production

# Ou depuis n'importe où avec chemin spécifié
./deploy.sh production ~/royal-editions

# Déployer en staging
./deploy.sh staging

# Ou déployer en staging
./deploy.sh staging
```

**Durée:** ~3-5 minutes

**Logs:** Tous les déploiements sont loggés dans `~/deploy-royaledition.log`

**Compatible avec:** VPS neuf, VPS existant, n'importe quel répertoire

---

### 4. `quick-setup.sh`
Script de configuration interactive pour VPS hébergeant déjà des applications.

**Ce qu'il fait:**
- ✅ Détecte automatiquement les ports utilisés et suggère un port libre
- ✅ Configuration interactive (DB, domaine, port)
- ✅ Création automatique de la base de données MySQL
- ✅ Génération du fichier `.env` pré-configuré
- ✅ Installation des dépendances npm
- ✅ Configuration Prisma
- ✅ Instructions Nginx et SSL personnalisées

**Prérequis:**
- VPS avec Node.js, MySQL déjà installés
- Application clonée dans le répertoire

**Usage:**

```bash
cd ~/royal-editions
bash quick-setup.sh
```

Le script vous demandera interactivement :
- Port à utiliser (détection auto des ports libres)
- Nom de la base de données
- Credentials MySQL
- Nom de domaine

**Durée:** ~5 minutes

---

### 5. `ecosystem.config.js`
Configuration PM2 flexible et adaptative.

**Caractéristiques:**
- ✅ Utilise `process.cwd()` pour le répertoire courant
- ✅ Détecte le port depuis `.env` (variable `PORT`)
- ✅ Mode cluster avec max instances
- ✅ Logs dans `./logs/` (relatif au répertoire de l'app)
- ✅ Auto-restart avec protection anti-crash
- ✅ Limite mémoire 1GB

**Fonctionnement:**
Le fichier s'adapte automatiquement selon où il est exécuté, permettant de déployer l'application dans n'importe quel répertoire.

---

### 6. `.env.vps.example`
Template de configuration avec instructions détaillées pour VPS existant.

**Contenu:**
- ✅ Toutes les variables nécessaires
- ✅ Instructions étape par étape
- ✅ Notes sur la configuration Nginx
- ✅ Checklist avant déploiement
- ✅ Exemples de configuration multi-port

**Usage:**

```bash
cp .env.vps.example .env
nano .env  # Remplir les valeurs
```

---

## 🚀 Workflow Complet de Déploiement

### 🆕 Scénario A: VPS Hébergeant Déjà des Applications (Recommandé)

#### Setup Ultra-Rapide (5 minutes)

```bash
# 1. Cloner sur le VPS
ssh votre-user@votre-vps
cd ~
git clone https://github.com/Dipomin/royaleditions.git royal-editions
cd royal-editions

# 2. Setup interactif
bash quick-setup.sh
# Suivre les instructions (port, DB, domaine)

# 3. Compléter .env (Clerk + AWS S3)
nano .env

# 4. Build et démarrer
npm run build
pm2 start ecosystem.config.js
pm2 save

# 5. Configurer Nginx (suivre les instructions du script)
# 6. Configurer SSL
sudo certbot --nginx -d votredomaine.com
```

**Temps total:** ~10 minutes  
**Difficulté:** ⭐⭐ (Facile)  
**Guide complet:** [QUICK-START-VPS.md](./QUICK-START-VPS.md)

---

### 🌟 Scénario B: VPS Neuf (Installation Complète)

#### Étape 1: Préparer le VPS
```bash
# 1. Se connecter au VPS
ssh root@votre-ip-vps

# 2. Télécharger et exécuter le script d'installation
wget https://raw.githubusercontent.com/votre-compte/royal-editions/main/install-vps.sh
chmod +x install-vps.sh
sudo bash install-vps.sh

# Répondre aux questions:
# - Nom de domaine: royaleditions.com
# - Email: votre-email@exemple.com
# - Mot de passe MySQL: [choisir un mot de passe fort]
```

**Durée:** 10-15 minutes

#### Étape 2: Déployer l'application
```bash
# 1. Passer à l'utilisateur deploy
su - deploy

# 2. Cloner le dépôt Git
cd /var/www
git clone https://github.com/votre-compte/royal-editions.git royaledition
cd royaledition

# 3. Configurer les variables d'environnement
cp /tmp/env-template .env
nano .env

# Remplir les valeurs manquantes:
# - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# - CLERK_SECRET_KEY
# - AWS_ACCESS_KEY_ID
# - AWS_SECRET_ACCESS_KEY

# 4. Installer et build
npm install
npx prisma generate
npx prisma db push
npm run build

# 5. Démarrer avec PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Suivre les instructions

# 6. Vérifier
pm2 status
pm2 logs royal-editions
```

**Durée:** 5-10 minutes

#### Étape 3: Configurer SSL
```bash
# Passer en root
exit  # Revenir de l'utilisateur deploy à root

# Obtenir le certificat SSL
sudo certbot --nginx -d royaleditions.com -d www.royaleditions.com

# Répondre aux questions:
# - Email: votre-email@exemple.com
# - Accepter les termes: Y
# - Rediriger HTTP vers HTTPS: 2 (Oui)

# Vérifier
curl -I https://royaleditions.com
```

**Durée:** 2-3 minutes

#### ✅ Application en ligne !
Visitez `https://royaleditions.com` - votre site est maintenant accessible en HTTPS.

---

### Déploiements Suivants (Mise à jour)

**Méthode 1: Automatique avec script (recommandé)**
```bash
# Se connecter au VPS
ssh deploy@votre-vps

# Exécuter le script de déploiement
cd /var/www/royaledition
./deploy.sh production
```

**Méthode 2: Manuelle**
```bash
ssh deploy@votre-vps
cd /var/www/royaledition

# Pull, build, restart
git pull origin main
npm install
npm run build
npx prisma generate
npx prisma db push  # Si nouvelles migrations
pm2 restart royal-editions
pm2 logs royal-editions
```

---

## 🛠️ Commandes Utiles

### PM2 (Gestion de l'application)
```bash
pm2 status                    # Voir le statut
pm2 logs royal-editions       # Voir les logs en temps réel
pm2 restart royal-editions    # Redémarrer l'app
pm2 stop royal-editions       # Arrêter l'app
pm2 start royal-editions      # Démarrer l'app
pm2 monit                     # Monitoring interactif
pm2 delete royal-editions     # Supprimer l'app de PM2
pm2 save                      # Sauvegarder la config PM2
```

### Nginx
```bash
sudo nginx -t                 # Tester la config
sudo systemctl reload nginx   # Recharger Nginx
sudo systemctl restart nginx  # Redémarrer Nginx
sudo systemctl status nginx   # Statut de Nginx

# Logs
sudo tail -f /var/log/nginx/royaledition-access.log
sudo tail -f /var/log/nginx/royaledition-error.log
```

### Base de données
```bash
# Se connecter à MySQL
mysql -u royaledition_user -p royaledition

# Backup manuel
mysqldump -u royaledition_user -p royaledition > backup.sql

# Restore
mysql -u royaledition_user -p royaledition < backup.sql

# Avec Prisma
npx prisma studio              # Interface web pour la DB
npx prisma db pull             # Pull schema depuis DB
npx prisma db push             # Push schema vers DB
```

### Monitoring
```bash
# Ressources système
htop                          # CPU, RAM, processus
df -h                         # Espace disque
free -h                       # Mémoire
netstat -tulpn                # Ports ouverts

# Logs de l'application
tail -f /var/www/royaledition/logs/combined.log
tail -f /home/deploy/deploy.log  # Logs des déploiements
```

### SSL (Let's Encrypt)
```bash
# Renouveler manuellement
sudo certbot renew

# Tester le renouvellement
sudo certbot renew --dry-run

# Voir les certificats
sudo certbot certificates

# Révoquer un certificat
sudo certbot revoke --cert-path /etc/letsencrypt/live/domain.com/cert.pem
```

---

## 🔐 Sécurité

### Fichier .env
**⚠️ IMPORTANT:** Le fichier `.env` contient des informations sensibles.

```bash
# Permissions correctes
chmod 600 /var/www/royaledition/.env
chown deploy:deploy /var/www/royaledition/.env

# Ne JAMAIS committer .env
echo ".env" >> .gitignore
```

### Mots de passe MySQL
```bash
# Changer le mot de passe de l'utilisateur
mysql -u root -p
ALTER USER 'royaledition_user'@'localhost' IDENTIFIED BY 'nouveau_mot_de_passe';
FLUSH PRIVILEGES;

# Mettre à jour .env avec le nouveau mot de passe
nano /var/www/royaledition/.env
```

### Clés SSH
```bash
# Ajouter votre clé publique pour l'utilisateur deploy
ssh-copy-id deploy@votre-vps

# Désactiver l'authentification par mot de passe (optionnel mais recommandé)
sudo nano /etc/ssh/sshd_config
# Changer: PasswordAuthentication no
sudo systemctl restart sshd
```

---

## 🐛 Dépannage Rapide

### L'application ne démarre pas
```bash
# Vérifier les logs PM2
pm2 logs royal-editions --err

# Vérifier le build
cd /var/www/royaledition
npm run build

# Vérifier les variables d'environnement
cat .env | grep -v "^#"
```

### Erreur 502 Bad Gateway
```bash
# L'app ne tourne pas
pm2 restart royal-editions

# Nginx mal configuré
sudo nginx -t
sudo systemctl restart nginx

# Port 3000 utilisé par autre chose
sudo netstat -tulpn | grep 3000
```

### Base de données inaccessible
```bash
# MySQL ne tourne pas
sudo systemctl start mysql
sudo systemctl status mysql

# Mauvais mot de passe
mysql -u royaledition_user -p royaledition

# Régénérer le client Prisma
cd /var/www/royaledition
npx prisma generate
pm2 restart royal-editions
```

### Images ne s'affichent pas
```bash
# Vérifier les credentials AWS
cat /var/www/royaledition/.env | grep AWS_

# Vérifier les domaines autorisés dans next.config.ts
cat /var/www/royaledition/next.config.ts
```

---

## 📊 Structure des Répertoires

```
/var/www/royaledition/          # Application Next.js
├── .env                         # Variables d'environnement (SENSIBLE)
├── .next/                       # Build Next.js
├── app/                         # Code source
├── components/                  # Composants React
├── lib/                         # Utilitaires
├── prisma/                      # Schema et migrations
├── public/                      # Fichiers statiques
├── ecosystem.config.js          # Config PM2
├── deploy.sh                    # Script de déploiement
└── logs/                        # Logs PM2
    ├── err.log
    ├── out.log
    └── combined.log

/home/deploy/backups/            # Backups de la base de données
/home/deploy/deploy.log          # Logs des déploiements
/etc/nginx/sites-available/      # Config Nginx
/var/log/nginx/                  # Logs Nginx
```

---

## 📞 Support

Pour toute question ou problème:

1. Consulter `DEPLOYMENT-VPS.md` pour la documentation complète
2. Vérifier les logs:
   - PM2: `pm2 logs royal-editions`
   - Nginx: `sudo tail -f /var/log/nginx/royaledition-error.log`
   - Déploiement: `tail -f /home/deploy/deploy.log`
3. Consulter la section Dépannage dans `DEPLOYMENT-VPS.md`

---

**Bonne chance avec votre déploiement ! 🚀**
