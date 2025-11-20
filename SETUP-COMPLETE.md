# ✅ Setup Terminé - Prochaines Étapes

## 🎉 Le script quick-setup.sh a fonctionné !

Configuration actuelle :
- ✅ Port : 3000
- ✅ Base de données : royaledition
- ✅ Domaine : royaleditions.com
- ✅ Prisma Client généré
- ✅ Fichier .env créé

## 🔧 Actions Immédiates Requises

### 1. Corriger la Connexion MySQL

Votre `.env` local utilise un serveur distant :
```
DATABASE_URL="mysql://c24meeyo:WUYJPgx5ys_p@vps72807.serveur-vps.net:3306/royaledi"
```

Sur le VPS, vous devez utiliser :

**Option A : Base de données locale (sur le même VPS)**
```bash
# Éditer .env sur le VPS
nano .env

# Remplacer la ligne DATABASE_URL par :
DATABASE_URL="mysql://royaledition_user:Logik1981@localhost:3306/royaledition"

# Créer la base de données
mysql -u root -p
# Entrer le mot de passe root MySQL puis :
CREATE DATABASE royaledition CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'royaledition_user'@'localhost' IDENTIFIED BY 'Logik1981';
GRANT ALL PRIVILEGES ON royaledition.* TO 'royaledition_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Option B : Utiliser votre base distante (vps72807.serveur-vps.net)**
```bash
# Éditer .env sur le VPS
nano .env

# Remplacer DATABASE_URL par :
DATABASE_URL="mysql://c24meeyo:WUYJPgx5ys_p@vps72807.serveur-vps.net:3306/royaledi"

# Note : Assurez-vous que le firewall autorise la connexion depuis votre VPS
```

### 2. Créer les Tables Prisma

```bash
cd ~/royal-editions  # ou /root/royal-editions
npx prisma db push
```

### 3. Compléter le .env avec Clerk et AWS

```bash
nano .env
```

Ajoutez vos vraies clés :
```env
# Clerk (utilisez vos clés de production)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_VOTRE_CLE
CLERK_SECRET_KEY=sk_live_VOTRE_CLE

# AWS S3 (vous avez déjà ces valeurs)
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=AKIAS2F6LWF65NK3Z44C
AWS_SECRET_ACCESS_KEY=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
AWS_S3_BUCKET_NAME=royale-edition-content
```

### 4. Build et Démarrer

```bash
# Build Next.js
npm run build

# Démarrer avec PM2
pm2 start ecosystem.config.js
pm2 save

# Vérifier
pm2 status
pm2 logs royal-editions
```

### 5. Configurer Nginx

```bash
sudo nano /etc/nginx/sites-available/royaleditions
```

Collez :
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name royaleditions.com www.royaleditions.com;

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
    }

    location /_next/static {
        proxy_cache_valid 60m;
        proxy_pass http://localhost:3000;
    }
}
```

Activez :
```bash
sudo ln -s /etc/nginx/sites-available/royaleditions /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL avec Let's Encrypt

```bash
sudo certbot --nginx -d royaleditions.com -d www.royaleditions.com
```

## 🚀 Déploiement Rapide (Alternative)

Si vous préférez utiliser le script automatisé :

```bash
cd ~/royal-editions

# 1. Corriger DATABASE_URL dans .env
nano .env

# 2. Ajouter Clerk et AWS
nano .env

# 3. Déployer en une commande
./deploy.sh production
```

Le script fera automatiquement :
- Backup de la DB
- Installation des dépendances
- Génération Prisma
- Build Next.js
- Redémarrage PM2

## 📊 Vérification

```bash
# Statut PM2
pm2 status

# Logs en temps réel
pm2 logs royal-editions

# Test local
curl http://localhost:3000

# Test domaine (après Nginx + SSL)
curl -I https://royaleditions.com
```

## 🐛 Dépannage

### MySQL ne se connecte pas
```bash
# Vérifier que MySQL tourne
sudo systemctl status mysql

# Tester la connexion
mysql -u royaledition_user -p -h localhost royaledition
```

### Port 3000 déjà utilisé
```bash
# Voir qui utilise le port
sudo lsof -i :3000

# Changer le port dans .env
echo "PORT=3001" >> .env
pm2 restart royal-editions
```

## 📚 Documentation

- **Guide Complet** : [DEPLOYMENT-EXISTING-VPS.md](./DEPLOYMENT-EXISTING-VPS.md)
- **Scripts** : [DEPLOYMENT-SCRIPTS.md](./DEPLOYMENT-SCRIPTS.md)
- **Quick Start** : [QUICK-START-VPS.md](./QUICK-START-VPS.md)

---

**Temps estimé pour finir** : 10-15 minutes
**Prochaine étape** : Corriger DATABASE_URL → Prisma db push → Build → PM2
