# Configuration des emails de notification de commandes

## Vue d'ensemble

Lorsqu'une commande est passée sur le site Royal Editions, un email de notification est automatiquement envoyé aux adresses suivantes :
- `kd_landry@yahoo.fr`
- `bkone.andre@gmail.com`
- `support@royaleditions.com`

## Configuration SMTP

### Variables d'environnement requises

Ajoutez ces variables dans votre fichier `.env.local` :

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=support@royaleditions.com
SMTP_PASS=votre_mot_de_passe_application_gmail
SMTP_FROM=support@royaleditions.com

# URL de base du site (pour les liens dans les emails)
NEXT_PUBLIC_BASE_URL=https://royaleditions.com
```

### Configuration Gmail (recommandée)

Pour utiliser Gmail comme serveur SMTP, vous devez :

1. **Activer la validation en deux étapes** sur votre compte Gmail
2. **Générer un mot de passe d'application** :
   - Allez sur https://myaccount.google.com/security
   - Cliquez sur "Validation en deux étapes"
   - En bas de la page, cliquez sur "Mots de passe d'application"
   - Sélectionnez "Mail" et "Autre (nom personnalisé)"
   - Nommez-le "Royal Editions Website"
   - Copiez le mot de passe généré (16 caractères)
   - Utilisez ce mot de passe dans `SMTP_PASS`

### Autres fournisseurs SMTP

#### Sendinblue / Brevo
```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre_email@royaleditions.com
SMTP_PASS=votre_cle_api_brevo
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@mg.royaleditions.com
SMTP_PASS=votre_cle_api_mailgun
```

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=votre_cle_api_sendgrid
```

## Contenu de l'email

L'email de notification contient :

### Informations de la commande
- Numéro de commande (ex: RE000001)
- Date et heure de la commande

### Informations client
- Nom du client
- Téléphone
- Email (si fourni)

### Adresse de livraison
- Ville
- Commune
- Adresse complète
- Observations (si fournies)

### Articles commandés
Tableau détaillé avec :
- Titre du livre
- Quantité
- Prix unitaire
- Total par ligne
- **Total général de la commande**

### Bouton d'action
Lien direct vers la commande dans le tableau de bord admin

## Format de l'email

L'email est envoyé en **deux formats** :
1. **HTML** : Version riche avec mise en forme, couleurs Royal Editions (bleu royal et or)
2. **Texte brut** : Version sans formatage pour les clients email qui ne supportent pas HTML

## Test de la configuration

### 1. Vérifier la configuration SMTP

```bash
curl http://localhost:3000/api/test-email
```

Réponse attendue :
```json
{
  "success": true,
  "message": "Configuration SMTP vérifiée avec succès"
}
```

### 2. Tester avec une vraie commande

1. Allez sur le site : http://localhost:3000/boutique
2. Ajoutez un livre au panier
3. Passez une commande de test
4. Vérifiez les boîtes mail des destinataires

### 3. Vérifier les logs

Les emails envoyés sont loggés dans la console :
```
✅ Email de commande #RE000001 envoyé avec succès
```

En cas d'erreur :
```
❌ Erreur lors de l'envoi de l'email de commande: [détails de l'erreur]
```

## Gestion des erreurs

L'envoi d'email est **non-bloquant** : si l'email échoue, la commande est quand même créée avec succès. Cela garantit que :
- Les clients peuvent toujours passer des commandes
- Les problèmes SMTP n'affectent pas l'expérience utilisateur
- Les commandes sont enregistrées dans la base de données

Les erreurs d'envoi sont loggées mais ne font pas échouer la requête API.

## Fichiers modifiés

### Nouveaux fichiers
- `lib/email.ts` - Module de gestion des emails avec Nodemailer
- `app/api/test-email/route.ts` - Route de test de la configuration SMTP

### Fichiers modifiés
- `app/api/orders/route.ts` - Ajout de l'envoi d'email après création de commande
- `.env.local` - Ajout de `NEXT_PUBLIC_BASE_URL`

## Dépendances

Le package `nodemailer` est déjà installé dans le projet :

```json
"nodemailer": "^7.0.10"
```

Aucune installation supplémentaire n'est nécessaire.

## Production

### Sur VPS avec Nginx

1. Copiez les variables d'environnement SMTP dans `.env` sur le VPS
2. Redémarrez l'application :
   ```bash
   pm2 restart royaledition
   ```
3. Testez la configuration :
   ```bash
   curl https://royaleditions.com/api/test-email
   ```

### Sur Vercel

1. Ajoutez les variables d'environnement dans le dashboard Vercel :
   - Project Settings → Environment Variables
   - Ajoutez toutes les variables `SMTP_*` et `NEXT_PUBLIC_BASE_URL`
2. Redéployez l'application

## Sécurité

⚠️ **Important** :
- Ne commitez JAMAIS les vraies valeurs de `SMTP_USER` et `SMTP_PASS` dans Git
- Ces valeurs doivent rester dans `.env.local` (ignoré par Git)
- Utilisez des variables d'environnement sur le serveur de production
- Utilisez des mots de passe d'application, pas votre mot de passe Gmail principal

## Support

En cas de problème :
1. Vérifiez les logs de l'application
2. Testez la configuration SMTP avec `/api/test-email`
3. Vérifiez que les variables d'environnement sont correctement définies
4. Assurez-vous que le pare-feu autorise les connexions sortantes sur le port 587

## Personnalisation

Pour modifier les destinataires des emails, éditez le fichier `lib/email.ts` :

```typescript
const recipients = [
  'kd_landry@yahoo.fr',
  'bkone.andre@gmail.com',
  'support@royaleditions.com',
  // Ajoutez d'autres adresses ici
]
```
