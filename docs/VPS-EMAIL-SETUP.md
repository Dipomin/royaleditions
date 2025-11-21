# Guide de configuration du système de messagerie sur VPS

## 🎯 Recommandations selon votre distribution

| Distribution VPS | Solution Recommandée | Difficulté |
|------------------|---------------------|------------|
| Ubuntu 24.04 LTS | **Mail-in-a-Box** ou **iRedMail** | ⭐ (Très facile) |
| Ubuntu 22.04 LTS | **Mail-in-a-Box** | ⭐ (Très facile) |
| Ubuntu 20.04 LTS | **iRedMail** ou Service SMTP tiers | ⭐⭐ (Facile) |
| Debian 11/12 | **iRedMail** ou Service SMTP tiers | ⭐⭐ (Facile) |
| CentOS/Rocky Linux | **iRedMail** ou Service SMTP tiers | ⭐⭐ (Facile) |
| Autre | **Service SMTP tiers** (SendGrid, Mailgun) | ⭐ (Très facile) |

💡 **Pour Ubuntu 24.04 LTS** : Mail-in-a-Box est en cours d'adaptation pour Ubuntu 24.04. Si vous rencontrez des problèmes, utilisez **iRedMail** (100% compatible) ou un **service SMTP tiers**.

💡 **Pour la plupart des cas** : Utiliser un **service SMTP tiers** (SendGrid, Mailgun, Amazon SES) est souvent plus simple et plus fiable que gérer son propre serveur mail.

---

## 🔍 Étape 1 : Vérifier le système de messagerie existant

### A. Script de vérification automatique (Recommandé)

Utilisez le script fourni qui vérifie automatiquement votre distribution, les ports, et donne des recommandations :

```bash
# Sur votre VPS
./check-email-compatibility.sh
```

Ce script vous indiquera :
- ✅ Votre distribution et version
- ✅ Compatibilité Mail-in-a-Box
- ✅ Compatibilité iRedMail
- ✅ Ports mail ouverts
- ✅ Services mail existants
- ✅ RAM disponible
- ✅ Recommandation personnalisée

### B. Vérification manuelle

Ou connectez-vous à votre VPS en SSH et exécutez ces commandes :

```bash
# Se connecter au VPS
ssh user@178.18.254.232

# Vérifier si un serveur mail est installé
which postfix
which sendmail
which exim4

# Vérifier si un webmail est installé
which roundcube
which squirrelmail
ls /var/www/html/ | grep -i mail

# Vérifier le statut des services mail
systemctl status postfix
systemctl status dovecot

# Vérifier les ports mail ouverts
netstat -tulpn | grep -E ':(25|587|465|143|993|110|995)'
# ou avec ss
ss -tulpn | grep -E ':(25|587|465|143|993|110|995)'
```

### Ports à vérifier :
- **25** : SMTP (envoi)
- **587** : SMTP avec STARTTLS (envoi sécurisé)
- **465** : SMTPS (envoi SSL/TLS)
- **143** : IMAP (réception)
- **993** : IMAPS (réception sécurisée)
- **110** : POP3 (réception)
- **995** : POP3S (réception sécurisée)

---

## 📧 Étape 2 : Installation d'un système de messagerie complet

Si aucun système n'est installé, voici 3 options :

### ⚙️ Vérifier votre distribution d'abord

```bash
# Connaître votre distribution et version
cat /etc/os-release

# Ou
lsb_release -a

# Exemples de sorties:
# Ubuntu 22.04 LTS  → Mail-in-a-Box OK
# Ubuntu 20.04 LTS  → Utiliser iRedMail ou manuel
# Debian 11/12      → Utiliser iRedMail ou manuel
# CentOS 7/8        → Utiliser iRedMail ou manuel
```

### Option 1 : Mail-in-a-Box (RECOMMANDÉ - Tout automatisé)

**Le plus simple** : Installation automatique complète avec webmail Roundcube.

⚠️ **IMPORTANT** : Versions Ubuntu supportées officiellement : **14.04, 18.04, 22.04**

⚙️ **Ubuntu 24.04 LTS** : Le support est en cours. Vérifiez sur [mailinabox.email](https://mailinabox.email) ou utilisez **iRedMail** (Option 2) qui est 100% compatible.

```bash
# Vérifier la version Ubuntu d'abord
lsb_release -a

# Pour Ubuntu 22.04 LTS (testé et stable):
curl -s https://mailinabox.email/setup.sh | sudo bash

# Pour Ubuntu 24.04 LTS (si supporté) ou utiliser iRedMail:
# Vérifier d'abord: https://mailinabox.email/
# Sinon: Option 2 (iRedMail) recommandée

# Si autre distribution (Debian, CentOS, etc.), utilisez l'Option 2 ou 3
```

✅ **Avantages** :
- Installation en 1 commande
- Configuration automatique (Postfix, Dovecot, Roundcube, etc.)
- Interface admin web complète
- SSL/TLS automatique avec Let's Encrypt
- Anti-spam et antivirus inclus
- Sauvegardes automatiques

❌ **Limitations** :
- Ubuntu uniquement (versions spécifiques)
- Support Ubuntu 24.04 en cours de développement
- Ne fonctionne pas sur Debian, CentOS, ou autres distributions

📝 **Après installation** :
- Webmail : `https://box.royaleditions.com`
- Admin : `https://box.royaleditions.com/admin`

---

---

### Option 2 : iRedMail (RECOMMANDÉ pour Ubuntu 24.04 - Toutes distributions)

**Bon compromis** entre facilité et contrôle. Compatible avec Ubuntu 24.04, Debian, CentOS, Rocky Linux, etc.

⭐ **SOLUTION RECOMMANDÉE pour Ubuntu 24.04 LTS** - 100% compatible et testé.

```bash
# Vérifier que votre système est supporté
# iRedMail supporte: Ubuntu (20.04, 22.04, 24.04), Debian, CentOS, Rocky Linux, OpenBSD, FreeBSD

# Télécharger iRedMail (dernière version stable)
wget https://github.com/iredmail/iRedMail/archive/1.6.8.tar.gz
tar xvf 1.6.8.tar.gz
cd iRedMail-1.6.8

# Lancer l'installation interactive
sudo bash iRedMail.sh
```

✅ **Avantages** :
- ✅ **Compatible Ubuntu 24.04 LTS** (testé)
- Compatible avec la plupart des distributions Linux
- Installation guidée interactive
- Webmail Roundcube ou SOGo
- Interface admin graphique
- Anti-spam et antivirus inclus
- Documentation complète
- Communauté active

📝 **Configuration recommandée durant l'installation** :
- Backend : **MySQL** (plus simple)
- Webmail : **Roundcube** (plus populaire)
- Composants optionnels : Oui à tout (recommandé)
- Domaine : `royaleditions.com`

🔗 **Ressources** :
- Site officiel : https://www.iredmail.org/
- Documentation : https://docs.iredmail.org/
- Forum : https://forum.iredmail.org/

---

### Option 3 : Configuration manuelle Postfix + Dovecot + Roundcube

**Plus de contrôle** mais configuration complexe.

```bash
# Installer les composants
sudo apt update
sudo apt install postfix dovecot-core dovecot-imapd dovecot-pop3d

# Installer Roundcube (webmail)
sudo apt install roundcube roundcube-core roundcube-mysql

# Installer des outils supplémentaires
sudo apt install postfix-mysql dovecot-mysql opendkim opendkim-tools
```

---

## 🎯 Étape 3 : Configuration DNS (OBLIGATOIRE)

Pour que vos emails fonctionnent, vous DEVEZ configurer ces enregistrements DNS :

### A. Enregistrements DNS requis

Allez sur votre registrar de domaine (où vous avez acheté royaleditions.com) :

```dns
# Enregistrement MX (serveur mail)
royaleditions.com.    MX    10    mail.royaleditions.com.

# Enregistrement A pour le serveur mail
mail.royaleditions.com.    A    178.18.254.232

# Enregistrement SPF (anti-spam)
royaleditions.com.    TXT    "v=spf1 mx a ip4:178.18.254.232 ~all"

# Enregistrement DKIM (signature)
default._domainkey.royaleditions.com.    TXT    "v=DKIM1; k=rsa; p=VOTRE_CLE_PUBLIQUE"

# Enregistrement DMARC (politique)
_dmarc.royaleditions.com.    TXT    "v=DMARC1; p=quarantine; rua=mailto:postmaster@royaleditions.com"
```

### B. Vérifier la propagation DNS

```bash
# Vérifier MX
dig royaleditions.com MX +short

# Vérifier SPF
dig royaleditions.com TXT +short | grep spf

# Vérifier DKIM
dig default._domainkey.royaleditions.com TXT +short
```

---

## 👤 Étape 4 : Créer des adresses email

### Avec Mail-in-a-Box

1. Connectez-vous à l'interface admin : `https://box.royaleditions.com/admin`
2. Allez dans **System > Mail > Users**
3. Cliquez sur **Add User**
4. Créez les adresses :
   - `admin@royaleditions.com`
   - `contact@royaleditions.com`
   - `support@royaleditions.com`

### Avec iRedMail

1. Interface admin : `https://mail.royaleditions.com/iredadmin`
2. **Add > User**
3. Créez les adresses nécessaires

### Configuration manuelle (Postfix/Dovecot)

```bash
# Créer un utilisateur système pour l'email
sudo adduser --system --no-create-home --disabled-login --group mailadmin

# Créer les boîtes aux lettres
sudo mkdir -p /var/mail/vhosts/royaleditions.com
sudo chown -R mailadmin:mailadmin /var/mail/vhosts/

# Ajouter les utilisateurs dans une base de données
# (Requiert configuration MySQL avec tables users)
```

---

## 📬 Étape 5 : Configurer le webmail

### Accès Roundcube (selon votre installation)

```
URL : https://mail.royaleditions.com
ou
URL : https://webmail.royaleditions.com
```

**Connexion** :
- Utilisateur : `contact@royaleditions.com`
- Mot de passe : celui défini lors de la création

---

## 🔐 Étape 6 : Configuration SSL/TLS

### Avec Certbot (Let's Encrypt)

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir un certificat pour le domaine mail
sudo certbot certonly --nginx -d mail.royaleditions.com -d webmail.royaleditions.com

# Renouvellement automatique
sudo certbot renew --dry-run
```

---

## ⚙️ Étape 7 : Configuration pour l'application Next.js

Une fois votre serveur mail configuré, ajoutez dans `.env` :

```env
# Configuration SMTP avec votre propre serveur
SMTP_HOST=mail.royaleditions.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=admin@royaleditions.com
SMTP_PASS=votre_mot_de_passe_securise
SMTP_FROM=admin@royaleditions.com
SMTP_TO=contact@royaleditions.com
```

---

## 🧪 Étape 8 : Tester l'envoi d'email

### Test depuis le VPS

```bash
# Envoyer un email de test
echo "Test email from Royal Editions" | mail -s "Test" contact@royaleditions.com

# Vérifier les logs
sudo tail -f /var/log/mail.log
```

### Test depuis l'application

```bash
# Dans votre projet Next.js
npm run dev

# Allez sur http://localhost:3000/contact
# Remplissez et envoyez le formulaire
```

---

## 🚀 Solution Alternative : Service SMTP tiers (RECOMMANDÉ pour la plupart)

**Pourquoi c'est souvent la meilleure option :**
- ✅ Pas de configuration serveur complexe
- ✅ Fonctionne sur n'importe quelle distribution
- ✅ Haute délivrabilité (réputation IP garantie)
- ✅ Statistiques et monitoring inclus
- ✅ Pas de gestion de serveur mail
- ✅ Support technique disponible

Si la configuration d'un serveur mail est trop complexe ou si votre VPS n'est pas sous Ubuntu 22.04, utilisez un service tiers :

### SendGrid (12 000 emails/mois gratuits) ⭐ RECOMMANDÉ

```bash
# S'inscrire sur https://sendgrid.com
# Obtenir une clé API
```

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=votre_cle_api_sendgrid
SMTP_FROM=admin@royaleditions.com
SMTP_TO=contact@royaleditions.com
```

### Mailgun (5 000 emails/mois gratuits)

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@mg.royaleditions.com
SMTP_PASS=votre_mot_de_passe_mailgun
SMTP_FROM=admin@royaleditions.com
SMTP_TO=contact@royaleditions.com
```

### Amazon SES (62 000 emails/mois gratuits via EC2)

```env
SMTP_HOST=email-smtp.eu-west-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre_access_key
SMTP_PASS=votre_secret_key
SMTP_FROM=admin@royaleditions.com
SMTP_TO=contact@royaleditions.com
```

---

## ✅ Checklist de déploiement

- [ ] Serveur mail installé (Mail-in-a-Box, iRedMail, ou manuel)
- [ ] DNS configuré (MX, SPF, DKIM, DMARC)
- [ ] Certificat SSL installé
- [ ] Adresses email créées (admin@, contact@)
- [ ] Webmail accessible
- [ ] Test d'envoi réussi
- [ ] Variables SMTP configurées dans `.env`
- [ ] Test du formulaire de contact fonctionnel

---

## 🆘 Résolution de problèmes courants

### Port 25 bloqué par le fournisseur

Beaucoup de VPS bloquent le port 25. **Solution** : Utilisez le port 587.

```bash
# Vérifier si le port 25 est ouvert
telnet smtp.gmail.com 25
```

### Emails marqués comme spam

- ✅ Configurez SPF, DKIM et DMARC
- ✅ Utilisez un domaine avec bonne réputation
- ✅ Ne pas envoyer trop d'emails d'un coup
- ✅ Incluez un lien de désinscription

### Certificat SSL invalide

```bash
# Renouveler le certificat
sudo certbot renew --force-renewal
sudo systemctl reload postfix dovecot
```

---

## 📚 Ressources utiles

- Mail-in-a-Box : https://mailinabox.email/
- iRedMail : https://www.iredmail.org/
- Test DNS : https://mxtoolbox.com/
- Test spam : https://www.mail-tester.com/
