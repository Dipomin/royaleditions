# Système de notification email pour les commandes

## ✅ Implémentation terminée

Le système d'envoi d'emails automatiques pour les nouvelles commandes a été mis en place avec succès.

## 📧 Destinataires des notifications

Chaque nouvelle commande envoie automatiquement un email aux adresses suivantes :
- **kd_landry@yahoo.fr**
- **bkone.andre@gmail.com**
- **support@royaleditions.com**

## 🎨 Contenu de l'email

L'email contient un design professionnel aux couleurs Royal Editions avec :
- **En-tête** : Logo et titre "Nouvelle commande reçue"
- **Numéro de commande** : Ex. RE000001
- **Date et heure** : Date de réception de la commande
- **Informations client** : Nom, téléphone, email
- **Adresse de livraison** : Ville, commune, adresse complète, observations
- **Tableau des articles** : Liste détaillée avec quantités et prix
- **Total de la commande** : Montant total en FCFA
- **Bouton d'action** : Lien direct vers la commande dans l'admin

## 📂 Fichiers créés/modifiés

### Nouveaux fichiers
1. **`lib/email.ts`** (367 lignes)
   - Module complet de gestion des emails avec Nodemailer
   - Fonction `sendOrderNotificationEmail()` pour envoyer les notifications
   - Template HTML responsive et professionnel
   - Version texte brut pour compatibilité
   - Fonction `verifyEmailConfig()` pour tester la configuration

2. **`app/api/test-email/route.ts`** (31 lignes)
   - Route API pour tester la configuration SMTP
   - Accessible via `GET /api/test-email`

3. **`docs/EMAIL-NOTIFICATIONS.md`** (documentation complète)
   - Guide de configuration SMTP (Gmail, Sendinblue, Mailgun, SendGrid)
   - Instructions de test
   - Gestion des erreurs
   - Configuration production (VPS et Vercel)

### Fichiers modifiés
1. **`app/api/orders/route.ts`**
   - Import du module email
   - Appel automatique de `sendOrderNotificationEmail()` après création de commande
   - Gestion non-bloquante (la commande est créée même si l'email échoue)

2. **`.env.local`**
   - Ajout de `NEXT_PUBLIC_BASE_URL=https://royaleditions.com`
   - Mise à jour des commentaires SMTP

## ⚙️ Configuration requise

### Variables d'environnement à configurer

Dans `.env.local` (local) ou `.env` (production) :

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=support@royaleditions.com
SMTP_PASS=mot_de_passe_application_gmail
SMTP_FROM=support@royaleditions.com

# URL de base
NEXT_PUBLIC_BASE_URL=https://royaleditions.com
```

### Configuration Gmail (recommandée)

1. Activez la validation en deux étapes sur le compte Gmail
2. Générez un mot de passe d'application :
   - https://myaccount.google.com/security
   - "Validation en deux étapes" → "Mots de passe d'application"
   - Sélectionnez "Mail" et "Autre"
   - Nommez "Royal Editions Website"
   - Copiez le mot de passe (16 caractères)
   - Utilisez-le dans `SMTP_PASS`

## 🧪 Tests

### 1. Tester la configuration SMTP

```bash
# En développement
curl http://localhost:3000/api/test-email

# En production
curl https://royaleditions.com/api/test-email
```

Réponse attendue :
```json
{
  "success": true,
  "message": "Configuration SMTP vérifiée avec succès"
}
```

### 2. Tester avec une commande réelle

1. Démarrez l'application : `npm run dev`
2. Allez sur http://localhost:3000/boutique
3. Ajoutez un livre au panier
4. Complétez une commande
5. Vérifiez les 3 boîtes email

### 3. Vérifier les logs

Console lors du succès :
```
✅ Email de commande #RE000001 envoyé avec succès
```

Console lors d'une erreur :
```
❌ Erreur lors de l'envoi de l'email de commande: [détails]
```

## 🚀 Déploiement

### Sur VPS (Ubuntu avec PM2)

1. Copiez les variables SMTP dans `/root/royaledition/.env` sur le VPS
2. Redémarrez l'application :
   ```bash
   pm2 restart royaledition
   ```
3. Testez :
   ```bash
   curl https://royaleditions.com/api/test-email
   ```

### Sur Vercel

1. Dans le dashboard Vercel :
   - Project Settings → Environment Variables
2. Ajoutez toutes les variables `SMTP_*` et `NEXT_PUBLIC_BASE_URL`
3. Redéployez

## 🔒 Sécurité

- ✅ Le mot de passe SMTP n'est jamais committé dans Git
- ✅ Utilisation de mots de passe d'application (non le mot de passe Gmail principal)
- ✅ Variables d'environnement sur le serveur
- ✅ `.env.local` ignoré par Git

## 🎯 Fonctionnalités

### Envoi non-bloquant
L'envoi d'email se fait de manière **asynchrone** et **non-bloquante** :
- Si l'email échoue, la commande est quand même créée
- L'utilisateur reçoit toujours sa confirmation de commande
- Les erreurs SMTP sont loggées mais n'affectent pas l'expérience utilisateur

### Format double
Chaque email est envoyé en **deux formats** :
1. **HTML** : Design professionnel responsive
2. **Texte brut** : Pour les clients email basiques

### Personnalisation facile
Pour modifier les destinataires, éditez `lib/email.ts` ligne 249 :
```typescript
const recipients = [
  'kd_landry@yahoo.fr',
  'bkone.andre@gmail.com',
  'support@royaleditions.com',
  // Ajoutez d'autres emails ici
]
```

## 📊 Statistiques

- **367 lignes** de code pour le module email
- **Template HTML** de 220 lignes avec design professionnel
- **Support** de 4 fournisseurs SMTP (Gmail, Sendinblue, Mailgun, SendGrid)
- **3 destinataires** par défaut
- **Format FCFA** avec séparateurs de milliers
- **Dates françaises** (ex: 22 novembre 2025 à 14:30)

## 📖 Documentation complète

Voir `docs/EMAIL-NOTIFICATIONS.md` pour :
- Guide de configuration détaillé
- Comparaison des fournisseurs SMTP
- Troubleshooting
- Exemples de configuration
- FAQ

## ✨ Prochaines étapes suggérées

Pour améliorer le système :
1. **Email au client** : Envoyer une copie de confirmation au client
2. **Statut de commande** : Notifier lors des changements de statut
3. **Templates** : Créer des templates pour différents types d'emails
4. **Analytics** : Tracer le taux d'ouverture des emails
5. **SMS** : Ajouter des notifications SMS via Twilio

## 🆘 Support

En cas de problème :
1. Vérifiez les logs de l'application (`pm2 logs royaledition`)
2. Testez `/api/test-email`
3. Vérifiez que le port 587 est ouvert (sortant)
4. Consultez `docs/EMAIL-NOTIFICATIONS.md`

---

**Implémenté le** : 22 novembre 2025  
**Technologie** : Nodemailer 7.0.10  
**Status** : ✅ Prêt pour production
