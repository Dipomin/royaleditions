# 🎯 Guide Rapide - Déploiement Royal Editions sur VPS Existant

**Situation:** Vous avez un VPS qui héberge déjà une ou plusieurs applications.

**Objectif:** Déployer Royal Editions en parallèle sans perturber les applications existantes.

---

## ⚡ Setup Ultra-Rapide (5 minutes)

### 1️⃣ Cloner et Setup

```bash
# Sur votre VPS
cd ~
git clone https://github.com/Dipomin/royaleditions.git royal-editions
cd royal-editions

# Setup interactif (détecte automatiquement le port libre)
bash quick-setup.sh
```

Le script va :
- ✅ Détecter un port libre (3001, 3002, etc.)
- ✅ Créer la base de données MySQL
- ✅ Générer le fichier `.env` pré-configuré
- ✅ Installer les dépendances npm
- ✅ Configurer Prisma

### 2️⃣ Compléter la Configuration

Éditez `.env` pour ajouter vos clés Clerk et AWS S3 :

```bash
nano .env
```

Remplissez :
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_VOTRE_CLE
CLERK_SECRET_KEY=sk_live_VOTRE_CLE
AWS_ACCESS_KEY_ID=VOTRE_KEY
AWS_SECRET_ACCESS_KEY=VOTRE_SECRET
```

### 3️⃣ Déployer

```bash
# Build et démarrage
npm run build
pm2 start ecosystem.config.js
pm2 save

# Ou en une commande
./deploy.sh production
```

### 4️⃣ Configurer Nginx

```bash
sudo nano /etc/nginx/sites-available/royaleditions
```

Collez (remplacez `VOTRE_DOMAINE` et `PORT`) :

```nginx
server {
    listen 80;
    server_name royaleditions.votredomaine.com;
    
    location / {
        proxy_pass http://localhost:3001;  # Port de l'étape 1
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

Activez :

```bash
sudo ln -s /etc/nginx/sites-available/royaleditions /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5️⃣ SSL

```bash
sudo certbot --nginx -d royaleditions.votredomaine.com
```

---

## ✅ Vérification

```bash
# Vérifier PM2
pm2 list
# Vous devriez voir royal-editions + vos autres apps

# Vérifier les logs
pm2 logs royal-editions

# Tester l'app
curl http://localhost:3001
```

Visitez `https://royaleditions.votredomaine.com` 🎉

---

## 🔄 Mises à Jour Futures

```bash
cd ~/royal-editions
./deploy.sh production
```

C'est tout ! Le script gère automatiquement :
- Backup de la DB
- Git pull
- npm install
- Build
- Redémarrage PM2
- Tests de santé

---

## 📊 Configuration Typique Multi-App

```
VPS avec 2 applications:

App 1 (existante)     → Port 3000 → domaine1.com
Royal Editions (new)  → Port 3001 → royaleditions.domaine.com

PM2:
├── app-existante     (online)
└── royal-editions    (online)

Nginx:
├── domaine1.com      → localhost:3000
└── royaleditions.*   → localhost:3001
```

---

## 🆘 Problèmes Courants

### Port déjà utilisé
```bash
# Voir les ports
sudo netstat -tulpn | grep LISTEN

# Changer le port dans .env
nano .env  # PORT=3002
pm2 restart royal-editions
```

### L'app ne démarre pas
```bash
pm2 logs royal-editions --lines 50
# Vérifiez le fichier .env
cat .env
```

### Nginx 502
```bash
# L'app tourne ?
pm2 list

# Config correcte ?
sudo nginx -t

# Port correct dans Nginx ?
sudo nano /etc/nginx/sites-available/royaleditions
```

---

## 📚 Documentation Complète

- **Setup Rapide (ce fichier)** - Vous êtes ici
- **[DEPLOYMENT-EXISTING-VPS.md](./DEPLOYMENT-EXISTING-VPS.md)** - Guide détaillé complet
- **[DEPLOYMENT-SCRIPTS.md](./DEPLOYMENT-SCRIPTS.md)** - Doc des scripts
- **[DEPLOYMENT-VPS.md](./DEPLOYMENT-VPS.md)** - Installation VPS neuf

---

## 🎓 Commandes Utiles

```bash
# PM2
pm2 list                      # Toutes les apps
pm2 logs royal-editions       # Logs en temps réel
pm2 restart royal-editions    # Redémarrer
pm2 monit                     # Monitoring

# Déploiement
cd ~/royal-editions
./deploy.sh production        # Mise à jour complète

# Logs
tail -f ~/deploy-royaledition.log  # Logs de déploiement
tail -f logs/combined.log          # Logs de l'app

# Nginx
sudo systemctl reload nginx   # Recharger config
sudo nginx -t                 # Tester config
```

---

**Temps total:** ~10 minutes avec le setup interactif
**Difficulté:** ⭐⭐ (Facile)

Pour toute question, consultez [DEPLOYMENT-EXISTING-VPS.md](./DEPLOYMENT-EXISTING-VPS.md) pour le guide complet.
