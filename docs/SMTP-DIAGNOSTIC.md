# Diagnostic et configuration du serveur SMTP iRedMail

## Problème rencontré

```
❌ Erreur lors de l'envoi de l'email de commande: Error: connect ECONNREFUSED 178.18.254.232:587
```

Cette erreur signifie que le serveur SMTP refuse la connexion sur le port 587.

## Diagnostic à effectuer sur le VPS

### 1. Vérifier que le port 587 est ouvert et écoute

```bash
# Vérifier les ports en écoute
sudo netstat -tlnp | grep :587

# Résultat attendu :
# tcp        0      0 0.0.0.0:587             0.0.0.0:*               LISTEN      12345/master
```

Si rien n'apparaît, le port 587 n'est pas en écoute.

### 2. Vérifier le service Postfix (serveur SMTP)

```bash
# Statut du service
sudo systemctl status postfix

# Démarrer si arrêté
sudo systemctl start postfix

# Activer au démarrage
sudo systemctl enable postfix
```

### 3. Vérifier la configuration Postfix

```bash
# Afficher la configuration du port submission (587)
sudo postconf -n | grep submission

# Vérifier le fichier master.cf
sudo cat /etc/postfix/master.cf | grep -A 10 "^submission"
```

Le port 587 doit être configuré dans `/etc/postfix/master.cf` :

```
submission inet n       -       y       -       -       smtpd
  -o syslog_name=postfix/submission
  -o smtpd_tls_security_level=encrypt
  -o smtpd_sasl_auth_enable=yes
  -o smtpd_relay_restrictions=permit_sasl_authenticated,reject
```

### 4. Vérifier les logs Postfix

```bash
# Logs en temps réel
sudo tail -f /var/log/mail.log

# Rechercher des erreurs
sudo grep "error\|warning" /var/log/mail.log | tail -20
```

### 5. Tester la connexion SMTP depuis le VPS

```bash
# Test de connexion local
telnet localhost 587

# Si ça fonctionne, vous devriez voir :
# Trying 127.0.0.1...
# Connected to localhost.
# Escape character is '^]'.
# 220 mail.royaleditions.com ESMTP Postfix

# Tapez : QUIT
```

### 6. Vérifier le pare-feu

```bash
# UFW
sudo ufw status
sudo ufw allow 587/tcp

# iptables
sudo iptables -L -n | grep 587
```

## Solutions

### Solution A : Réparer la configuration iRedMail

Si le port 587 n'écoute pas :

```bash
# 1. Vérifier la configuration Postfix
sudo postconf mail_version

# 2. Activer le port submission
sudo nano /etc/postfix/master.cf

# Décommentez ou ajoutez ces lignes :
submission inet n       -       y       -       -       smtpd
  -o syslog_name=postfix/submission
  -o smtpd_tls_security_level=encrypt
  -o smtpd_sasl_auth_enable=yes
  -o smtpd_sasl_type=dovecot
  -o smtpd_sasl_path=private/auth
  -o smtpd_relay_restrictions=permit_sasl_authenticated,reject
  -o smtpd_client_restrictions=permit_sasl_authenticated,reject

# 3. Recharger Postfix
sudo systemctl reload postfix

# 4. Vérifier que le port écoute
sudo netstat -tlnp | grep :587
```

### Solution B : Utiliser Gmail (recommandé temporairement)

Dans `.env.local` :

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=contact@royaleditions.com
SMTP_PASS=mot_de_passe_application_gmail
SMTP_FROM=contact@royaleditions.com
```

**Configuration Gmail requise :**
1. Activez la validation en deux étapes : https://myaccount.google.com/security
2. Générez un mot de passe d'application :
   - "Validation en deux étapes" → "Mots de passe d'application"
   - Sélectionnez "Mail" et "Autre (Royal Editions)"
   - Copiez le mot de passe (16 caractères sans espaces)
   - Utilisez-le dans `SMTP_PASS`

### Solution C : Utiliser un service SMTP externe

#### Sendinblue / Brevo (300 emails/jour gratuits)

1. Créez un compte sur https://www.brevo.com/
2. Obtenez votre clé API SMTP
3. Configurez :

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre_email@royaleditions.com
SMTP_PASS=votre_cle_api_brevo
SMTP_FROM=contact@royaleditions.com
```

#### Mailgun (5000 emails/mois gratuits - 3 premiers mois)

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@mg.royaleditions.com
SMTP_PASS=votre_cle_api_mailgun
SMTP_FROM=contact@royaleditions.com
```

## Test après configuration

### 1. Tester depuis le VPS

```bash
# Test avec swaks (outil de test SMTP)
sudo apt install swaks -y

swaks --to kd_landry@yahoo.fr \
  --from contact@royaleditions.com \
  --server mail.royaleditions.com \
  --port 587 \
  --auth LOGIN \
  --auth-user contact@royaleditions.com \
  --auth-password '+DD3786kj2' \
  --tls
```

### 2. Tester depuis l'application

```bash
# Redémarrer l'application en développement
npm run dev

# Passer une commande test
# Vérifier les logs dans la console
```

### 3. Tester l'API directement

```bash
curl http://localhost:3000/api/test-email
```

## Recommandation

Pour une mise en production rapide, je recommande **Solution B (Gmail)** car :
- ✅ Configuration immédiate (5 minutes)
- ✅ Fiable et stable
- ✅ Gratuit jusqu'à 500 emails/jour
- ✅ Pas de configuration serveur nécessaire

Pour une solution à long terme, utilisez **Solution C (Sendinblue/Brevo)** car :
- ✅ Spécialisé dans l'envoi d'emails transactionnels
- ✅ Meilleure délivrabilité que Gmail
- ✅ Statistiques d'envoi et tracking
- ✅ 300 emails/jour gratuits (suffisant pour commencer)

La **Solution A (iRedMail)** nécessite plus de configuration et de maintenance.

## Support

Si vous avez besoin d'aide :
1. Partagez les résultats des commandes de diagnostic
2. Partagez les logs : `sudo tail -50 /var/log/mail.log`
3. Je pourrai vous guider pour réparer iRedMail
