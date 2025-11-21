# Configuration SMTP pour l'envoi d'emails

Ce guide explique comment configurer l'envoi d'emails pour le formulaire de contact.

## Variables d'environnement requises

Ajoutez ces variables dans votre fichier `.env` :

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=admin@royaleditions.com
SMTP_TO=contact@royaleditions.com
```

## Configuration avec Gmail

### 1. Créer un mot de passe d'application

1. Allez sur votre compte Google : https://myaccount.google.com/
2. Sécurité → Validation en deux étapes (activez-la si ce n'est pas déjà fait)
3. Mots de passe des applications : https://myaccount.google.com/apppasswords
4. Sélectionnez "Mail" et "Autre (nom personnalisé)"
5. Nommez-le "Royal Editions"
6. Copiez le mot de passe généré (16 caractères)

### 2. Configuration dans .env

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre.email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # Le mot de passe d'application à 16 caractères
SMTP_FROM=admin@royaleditions.com
SMTP_TO=contact@royaleditions.com
```

## Autres fournisseurs SMTP

### Microsoft Outlook / Office 365

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre.email@outlook.com
SMTP_PASS=votre_mot_de_passe
```

### SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

### Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your_mailgun_password
```

### SMTP Custom (serveur dédié)

```env
SMTP_HOST=mail.votredomaine.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=contact@votredomaine.com
SMTP_PASS=votre_mot_de_passe
```

## Test de configuration

Après avoir configuré vos variables d'environnement :

1. Redémarrez le serveur de développement : `npm run dev`
2. Allez sur la page Contact : http://localhost:3000/contact
3. Remplissez et soumettez le formulaire
4. Vérifiez que l'email arrive à l'adresse `SMTP_TO`

## Résolution de problèmes

### Erreur "Invalid login"

- Vérifiez que `SMTP_USER` et `SMTP_PASS` sont corrects
- Pour Gmail, assurez-vous d'utiliser un mot de passe d'application, pas votre mot de passe Google

### Erreur "Connection timeout"

- Vérifiez que `SMTP_HOST` et `SMTP_PORT` sont corrects
- Certains hébergeurs bloquent le port 25, utilisez 587 ou 465

### Erreur "Self signed certificate"

Pour le développement local uniquement, vous pouvez désactiver la vérification SSL :

```javascript
// Dans app/api/contact/route.ts
const transporter = nodemailer.createTransport({
  // ... autres options
  tls: {
    rejectUnauthorized: false
  }
})
```

⚠️ **Ne faites pas cela en production !**

## Sécurité

- ✅ Ne commitez jamais le fichier `.env`
- ✅ Utilisez des mots de passe d'application, pas des mots de passe principaux
- ✅ Limitez les permissions du compte email utilisé
- ✅ En production, utilisez un service dédié (SendGrid, Mailgun, etc.)

## Fonctionnalités du formulaire de contact

- ✅ Validation des champs obligatoires (nom, email, sujet, message)
- ✅ Validation du format email
- ✅ Validation du numéro de téléphone ivoirien (optionnel)
- ✅ Email formaté en HTML avec design Royal Editions
- ✅ Email de réponse (reply-to) configuré sur l'email du visiteur
- ✅ Message de confirmation après envoi
- ✅ Gestion des erreurs avec notifications toast

## Format de l'email reçu

Les emails reçus contiennent :
- Nom complet du visiteur
- Email du visiteur (cliquable pour répondre)
- Numéro de téléphone (si fourni)
- Sujet du message
- Message complet

L'email est formaté avec le design Royal Editions (couleurs Or et Bleu Roi).
