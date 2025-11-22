# 🔧 Dépannage après Installation iRedMail - Royal Editions

## 🚨 Problème : Applications ne fonctionnent plus après installation iRedMail

### 📋 Diagnostic Complet

Exécutez ces commandes **dans l'ordre** pour identifier le problème :

#### 1️⃣ Vérifier l'état des services essentiels

```bash
# Vérifier Nginx
sudo systemctl status nginx

# Vérifier PM2 (votre application Node.js)
pm2 status

# Vérifier les ports en écoute
sudo netstat -tulpn | grep LISTEN

# Vérifier les logs système
sudo journalctl -xe --no-pager | tail -50
```

#### 2️⃣ Vérifier les conflits de ports

**Problème probable : iRedMail a pris le contrôle de Nginx sur le port 80/443**

```bash
# Vérifier qui utilise le port 80
sudo lsof -i :80

# Vérifier qui utilise le port 443
sudo lsof -i :443

# Vérifier qui utilise le port 3000 (votre app)
sudo lsof -i :3000
```

#### 3️⃣ Vérifier la configuration Nginx

```bash
# Lister les configurations Nginx actives
ls -la /etc/nginx/sites-enabled/

# Vérifier le fichier de config principal
sudo nginx -t

# Voir les configs iRedMail
ls -la /etc/nginx/sites-available/ | grep -i ired

# Voir votre config Royal Editions
cat /etc/nginx/sites-available/royal-editions 2>/dev/null || echo "Config Royal Editions non trouvée"
```

---

## 🛠️ Solutions selon le Diagnostic

### Solution 1 : Nginx écrase votre configuration (⭐ PLUS PROBABLE)

iRedMail a probablement remplacé votre configuration Nginx par défaut.

#### Étape A : Sauvegarder les configs iRedMail

```bash
# Créer un dossier de sauvegarde
sudo mkdir -p /etc/nginx/backup-iredmail

# Sauvegarder les configs iRedMail
sudo cp /etc/nginx/sites-enabled/* /etc/nginx/backup-iredmail/

# Lister ce qui a été sauvegardé
ls -la /etc/nginx/backup-iredmail/
```

#### Étape B : Restaurer la configuration Royal Editions

```bash
# Désactiver la config par défaut d'iRedMail si elle existe
sudo rm -f /etc/nginx/sites-enabled/default

# Recréer votre configuration Royal Editions
sudo nano /etc/nginx/sites-available/royal-editions
```

**Collez cette configuration :**

```nginx
# Configuration Royal Editions
server {
    listen 80;
    server_name royaleditions.com www.royaleditions.com;

    # Redirection HTTP vers HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name royaleditions.com www.royaleditions.com;

    # Certificats SSL
    ssl_certificate /etc/letsencrypt/live/royaleditions.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/royaleditions.com/privkey.pem;
    
    # Paramètres SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Logs
    access_log /var/log/nginx/royaleditions-access.log;
    error_log /var/log/nginx/royaleditions-error.log;

    # Proxy vers l'application Node.js
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
```

#### Étape C : Configuration iRedMail sur sous-domaine

```bash
# Créer une config séparée pour iRedMail
sudo nano /etc/nginx/sites-available/iredmail-webmail
```

**Collez cette configuration :**

```nginx
# Configuration Webmail iRedMail
server {
    listen 80;
    server_name mail.royaleditions.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mail.royaleditions.com;

    # Certificats SSL (iRedMail les génère automatiquement)
    ssl_certificate /etc/letsencrypt/live/mail.royaleditions.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mail.royaleditions.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Inclure la config webmail iRedMail
    include /etc/nginx/templates/roundcube.tmpl;
    include /etc/nginx/templates/iredadmin.tmpl;
    include /etc/nginx/templates/sogo.tmpl;

    access_log /var/log/nginx/iredmail-access.log;
    error_log /var/log/nginx/iredmail-error.log;
}
```

#### Étape D : Activer les configurations

```bash
# Activer Royal Editions
sudo ln -sf /etc/nginx/sites-available/royal-editions /etc/nginx/sites-enabled/

# Activer iRedMail webmail
sudo ln -sf /etc/nginx/sites-available/iredmail-webmail /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Si OK, recharger Nginx
sudo systemctl reload nginx

# Vérifier le statut
sudo systemctl status nginx
```

---

### Solution 2 : Votre application Node.js ne démarre pas

```bash
# Vérifier PM2
pm2 status

# Si l'app est arrêtée, regarder les logs
pm2 logs royal-editions --lines 50

# Redémarrer l'application
cd ~/royal-editions
pm2 restart royal-editions

# Si PM2 n'est pas en cours d'exécution
pm2 resurrect

# Si ça ne fonctionne toujours pas, relancer manuellement
pm2 delete all
pm2 start npm --name "royal-editions" -- start
pm2 save
```

---

### Solution 3 : Problème de pare-feu

```bash
# Vérifier UFW
sudo ufw status

# Vérifier que les ports nécessaires sont ouverts
sudo ufw status numbered

# Ouvrir les ports si nécessaire
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp  # Port de votre app Node.js

# Recharger le pare-feu
sudo ufw reload
```

---

### Solution 4 : Problème de certificats SSL

```bash
# Vérifier les certificats Let's Encrypt
sudo certbot certificates

# Si les certificats ont expiré ou sont invalides
sudo certbot renew --force-renewal

# Redémarrer Nginx après renouvellement
sudo systemctl restart nginx
```

---

## 🔍 Vérifications Post-Correction

### 1. Tester votre site web

```bash
# Test local
curl -I http://localhost:3000

# Test via Nginx (HTTP)
curl -I http://royaleditions.com

# Test via Nginx (HTTPS)
curl -I https://royaleditions.com
```

### 2. Tester le webmail iRedMail

```bash
# Test local
curl -I http://localhost/mail

# Test via domaine
curl -I https://mail.royaleditions.com
```

### 3. Vérifier les logs

```bash
# Logs Nginx
sudo tail -f /var/log/nginx/royaleditions-error.log

# Logs PM2
pm2 logs royal-editions --lines 30

# Logs système
sudo journalctl -f
```

---

## 🎯 Configuration DNS Recommandée

Assurez-vous que votre DNS est bien configuré :

```dns
# Domaine principal pour le site
Type: A
Name: @
Value: 178.18.254.232
TTL: 3600

Type: A
Name: www
Value: 178.18.254.232
TTL: 3600

# Sous-domaine pour le webmail
Type: A
Name: mail
Value: 178.18.254.232
TTL: 3600

# Enregistrement MX pour les emails
Type: MX
Name: @
Priority: 10
Value: mail.royaleditions.com
TTL: 3600
```

---

## 🚀 Script de Vérification Automatique

Créez et exécutez ce script pour un diagnostic complet :

```bash
# Créer le script
cat > ~/check-services.sh << 'EOF'
#!/bin/bash

echo "==================================="
echo "🔍 DIAGNOSTIC ROYAL EDITIONS + IREDMAIL"
echo "==================================="
echo ""

echo "1️⃣ Services Status"
echo "-------------------"
echo -n "Nginx: "
systemctl is-active nginx
echo -n "Postfix: "
systemctl is-active postfix
echo -n "Dovecot: "
systemctl is-active dovecot
echo ""

echo "2️⃣ Ports en écoute"
echo "-------------------"
echo "Port 80 (HTTP):"
sudo lsof -i :80 | grep LISTEN || echo "  ❌ Rien"
echo "Port 443 (HTTPS):"
sudo lsof -i :443 | grep LISTEN || echo "  ❌ Rien"
echo "Port 3000 (Node.js):"
sudo lsof -i :3000 | grep LISTEN || echo "  ❌ Rien"
echo ""

echo "3️⃣ PM2 Status"
echo "-------------------"
pm2 status
echo ""

echo "4️⃣ Nginx Configuration"
echo "-------------------"
echo "Sites actifs:"
ls -1 /etc/nginx/sites-enabled/
echo ""
echo "Test de configuration:"
sudo nginx -t
echo ""

echo "5️⃣ Tests de connectivité"
echo "-------------------"
echo "Test localhost:3000:"
curl -I http://localhost:3000 2>/dev/null | head -1 || echo "  ❌ Échec"
echo "Test royaleditions.com:"
curl -I http://royaleditions.com 2>/dev/null | head -1 || echo "  ❌ Échec"
echo ""

echo "==================================="
echo "✅ Diagnostic terminé"
echo "==================================="
EOF

# Rendre exécutable
chmod +x ~/check-services.sh

# Exécuter
sudo ~/check-services.sh
```

---

## 📞 Commandes d'Urgence

Si rien ne fonctionne, utilisez ces commandes pour revenir à un état stable :

```bash
# 1. Arrêter tous les services
sudo systemctl stop nginx postfix dovecot

# 2. Désactiver temporairement iRedMail
sudo mv /etc/nginx/sites-enabled/00-default.conf /etc/nginx/sites-available/00-default.conf.disabled 2>/dev/null

# 3. Restaurer uniquement votre config
sudo ln -sf /etc/nginx/sites-available/royal-editions /etc/nginx/sites-enabled/

# 4. Redémarrer Nginx seul
sudo systemctl start nginx

# 5. Redémarrer votre app
pm2 restart royal-editions

# 6. Tester
curl -I http://localhost:3000
curl -I https://royaleditions.com
```

---

## 📚 Ressources Supplémentaires

- **Logs Nginx** : `/var/log/nginx/`
- **Logs iRedMail** : `/var/log/mail.log`
- **Config Nginx** : `/etc/nginx/`
- **PM2 Logs** : `~/.pm2/logs/`

---

## ✅ Checklist de Résolution

- [ ] Services vérifiés (nginx, pm2)
- [ ] Ports vérifiés (80, 443, 3000)
- [ ] Configuration Nginx restaurée
- [ ] iRedMail sur sous-domaine (mail.royaleditions.com)
- [ ] Site principal accessible (royaleditions.com)
- [ ] Application Node.js fonctionne
- [ ] Certificats SSL valides
- [ ] DNS correctement configuré
- [ ] Tests de connectivité réussis

---

**🎉 Après correction, votre setup devrait être :**
- ✅ `royaleditions.com` → Votre site e-commerce
- ✅ `mail.royaleditions.com` → Webmail iRedMail
- ✅ Les deux fonctionnent simultanément sans conflit

**Besoin d'aide ?** Partagez les résultats de `sudo ~/check-services.sh`
