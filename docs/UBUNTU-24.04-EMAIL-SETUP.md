# 🚀 Guide Email pour Ubuntu 24.04 LTS - Royal Editions

## ✅ Votre Configuration VPS

- **Distribution**: Ubuntu 24.04.3 LTS
- **IP**: 178.18.254.232
- **Domaine**: royaleditions.com

---

## 🎯 Solution Recommandée pour Ubuntu 24.04

### Option 1: iRedMail (⭐ RECOMMANDÉ)

**Pourquoi iRedMail pour Ubuntu 24.04 ?**
- ✅ 100% compatible avec Ubuntu 24.04 LTS
- ✅ Testé et stable
- ✅ Installation guidée simple
- ✅ Webmail Roundcube intégré
- ✅ Interface admin complète
- ✅ Communauté active et support

#### Installation iRedMail

```bash
# 1. Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# 2. Définir le hostname (important)
sudo hostnamectl set-hostname mail.royaleditions.com

# 3. Vérifier
hostname -f
# Devrait afficher: mail.royaleditions.com

# 4. Télécharger iRedMail
cd /root
wget https://github.com/iredmail/iRedMail/archive/1.6.8.tar.gz
tar xvf 1.6.8.tar.gz
cd iRedMail-1.6.8

# 5. Lancer l'installation
sudo bash iRedMail.sh
```

#### Configuration durant l'installation

L'installateur vous posera des questions. Voici les réponses recommandées :

**1. Chemin de stockage des mailbox**
```
/var/vmail
```
✓ Accepter le chemin par défaut

**2. Serveur web**
```
Nginx
```
✓ Choisir Nginx (plus moderne et léger)

**3. Backend de base de données**
```
MySQL
```
✓ MySQL est plus simple et bien documenté

**4. Mot de passe MySQL root**
```
[Choisir un mot de passe fort et le noter]
```
⚠️ IMPORTANT: Notez ce mot de passe !

**5. Nom de domaine**
```
royaleditions.com
```

**6. Mot de passe administrateur**
```
[Choisir un mot de passe fort]
```
⚠️ Email admin sera: postmaster@royaleditions.com

**7. Composants optionnels**
```
[Tout cocher - Oui à tout]
```
✓ Roundcube (webmail)
✓ SOGo (calendar/contacts)
✓ iRedAdmin (interface admin)
✓ Fail2ban (sécurité)
✓ Awstats (statistiques)

#### Après l'installation

```bash
# 1. Noter les informations affichées
# L'installateur affiche:
# - URL webmail
# - URL admin
# - Identifiants par défaut
# - Chemins importants

# 2. Redémarrer le serveur (recommandé)
sudo reboot

# 3. Après redémarrage, vérifier les services
sudo systemctl status postfix
sudo systemctl status dovecot
sudo systemctl status nginx
```

---

### Option 2: Service SMTP Tiers (Plus Simple)

Si vous ne voulez pas gérer un serveur mail complet, utilisez un service tiers.

#### SendGrid (⭐ RECOMMANDÉ - 100 emails/jour gratuits)

**Avantages:**
- Configuration en 5 minutes
- Aucun serveur à gérer
- Haute délivrabilité garantie
- Statistiques détaillées
- Support technique

**Installation:**

```bash
# 1. Créer un compte sur https://sendgrid.com
# 2. Vérifier votre domaine royaleditions.com
# 3. Générer une clé API
```

**Configuration dans .env:**

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.votre_cle_api_ici
SMTP_FROM=admin@royaleditions.com
SMTP_TO=contact@royaleditions.com
```

**Test:**

```bash
# Sur votre VPS
cd ~/royal-editions
nano .env
# Coller la config ci-dessus

# Redémarrer l'app
pm2 restart royal-editions

# Tester le formulaire de contact
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@test.com",
    "subject": "Test Email",
    "message": "Ceci est un test"
  }'
```

---

## 📧 Configuration DNS (OBLIGATOIRE pour les 2 options)

### Pour votre domaine royaleditions.com

Allez sur votre registrar de domaine et ajoutez ces enregistrements :

```dns
# 1. Enregistrement A pour le serveur mail
Type: A
Name: mail
Value: 178.18.254.232
TTL: 3600

# 2. Enregistrement MX (serveur mail principal)
Type: MX
Name: @
Priority: 10
Value: mail.royaleditions.com
TTL: 3600

# 3. Enregistrement SPF (anti-spam)
Type: TXT
Name: @
Value: v=spf1 mx a ip4:178.18.254.232 ~all
TTL: 3600

# 4. Enregistrement DMARC (politique email)
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:postmaster@royaleditions.com
TTL: 3600
```

### Vérifier la propagation DNS (attendre 1-2h)

```bash
# Vérifier MX
dig royaleditions.com MX +short

# Vérifier SPF
dig royaleditions.com TXT +short | grep spf

# Vérifier A record
dig mail.royaleditions.com A +short
```

---

## 🔐 Configuration SSL/TLS (Si iRedMail)

iRedMail configure automatiquement SSL avec Let's Encrypt durant l'installation.

**Si vous avez besoin de renouveler:**

```bash
# Vérifier les certificats
sudo certbot certificates

# Renouveler manuellement
sudo certbot renew

# Le renouvellement automatique est configuré par défaut
```

---

## 📬 Créer des Adresses Email (Si iRedMail)

### Via l'interface web (Recommandé)

1. Allez sur: `https://mail.royaleditions.com/iredadmin`
2. Connexion:
   - Email: `postmaster@royaleditions.com`
   - Mot de passe: celui défini durant l'installation
3. Cliquez sur **Add → User**
4. Créez les adresses:
   - `admin@royaleditions.com`
   - `contact@royaleditions.com`
   - `support@royaleditions.com`

### Via ligne de commande

```bash
# Format: email quota (en MB)
sudo bash /opt/iredmail/tools/create_user.sh admin@royaleditions.com 1024
sudo bash /opt/iredmail/tools/create_user.sh contact@royaleditions.com 1024
```

---

## 🧪 Tester le Système Email

### Test 1: Webmail

```
URL: https://mail.royaleditions.com
Email: admin@royaleditions.com
Mot de passe: [celui créé]
```

Envoyez un email de test vers votre email personnel.

### Test 2: Depuis l'application

```bash
# Sur le VPS
cd ~/royal-editions
pm2 logs royal-editions

# Dans un autre terminal, tester l'API
curl -X POST https://royaleditions.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Contact",
    "email": "votre-email@gmail.com",
    "subject": "Test depuis Royal Editions",
    "message": "Ceci est un email de test"
  }'
```

### Test 3: Vérifier la délivrabilité

Envoyez un email vers: https://www.mail-tester.com/

Vous devriez obtenir un score > 8/10.

---

## 🛠️ Configuration Application Royal Editions

### Avec iRedMail

```env
# Fichier .env sur le VPS
SMTP_HOST=mail.royaleditions.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=admin@royaleditions.com
SMTP_PASS=mot_de_passe_admin
SMTP_FROM=admin@royaleditions.com
SMTP_TO=contact@royaleditions.com
```

### Avec SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.votre_cle_api
SMTP_FROM=admin@royaleditions.com
SMTP_TO=contact@royaleditions.com
```

### Redémarrer l'application

```bash
cd ~/royal-editions
nano .env
# Coller la config ci-dessus

# Redémarrer
pm2 restart royal-editions

# Vérifier les logs
pm2 logs royal-editions --lines 50
```

---

## 🔍 Dépannage Ubuntu 24.04

### Problème: Port 25 bloqué

```bash
# Vérifier si le port 25 est ouvert
sudo ufw status
sudo ufw allow 25/tcp
sudo ufw allow 587/tcp
sudo ufw allow 465/tcp

# Redémarrer le pare-feu
sudo ufw reload
```

### Problème: Services ne démarrent pas

```bash
# Vérifier Postfix
sudo systemctl status postfix
sudo journalctl -u postfix -n 50

# Vérifier Dovecot
sudo systemctl status dovecot
sudo journalctl -u dovecot -n 50

# Redémarrer les services
sudo systemctl restart postfix dovecot nginx
```

### Problème: Emails marqués comme spam

```bash
# Vérifier la configuration DNS
dig royaleditions.com MX +short
dig royaleditions.com TXT +short

# Vérifier les logs Postfix
sudo tail -f /var/log/mail.log

# Test de délivrabilité
# Envoyer un email vers: https://www.mail-tester.com/
```

---

## 📚 Ressources

### iRedMail
- Documentation: https://docs.iredmail.org/
- Forum: https://forum.iredmail.org/
- GitHub: https://github.com/iredmail/iRedMail

### SendGrid
- Documentation: https://docs.sendgrid.com/
- Dashboard: https://app.sendgrid.com/
- Support: https://support.sendgrid.com/

### Tests et Outils
- Test délivrabilité: https://www.mail-tester.com/
- Test MX: https://mxtoolbox.com/
- Test SPF/DKIM: https://dkimvalidator.com/

---

## ✅ Checklist Finale

### Installation iRedMail
- [ ] Hostname configuré (mail.royaleditions.com)
- [ ] iRedMail installé
- [ ] DNS configurés (MX, A, SPF, DMARC)
- [ ] SSL/TLS actif
- [ ] Adresses email créées (admin@, contact@)
- [ ] Webmail accessible et fonctionnel
- [ ] Test d'envoi réussi
- [ ] Application configurée avec SMTP
- [ ] Formulaire de contact testé

### Installation SendGrid
- [ ] Compte SendGrid créé
- [ ] Domaine vérifié
- [ ] Clé API générée
- [ ] .env configuré sur VPS
- [ ] Application redémarrée
- [ ] Formulaire de contact testé
- [ ] Email reçu avec succès

---

## 🎉 Félicitations !

Votre système email est maintenant opérationnel sur Ubuntu 24.04 LTS !

Pour toute question:
- 📧 Email: admin@royaleditions.com
- 📚 Documentation: docs/VPS-EMAIL-SETUP.md
- 🔧 SMTP Config: docs/SMTP-CONFIGURATION.md

---

**Projet:** Royal Editions E-Commerce Platform  
**VPS:** Ubuntu 24.04.3 LTS  
**Date:** Janvier 2025
