# 📚 Configuration AWS S3 pour Royal Editions

Guide complet pour configurer AWS S3 afin de stocker et gérer les images du site Royal Editions.

---

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Création du Bucket S3](#création-du-bucket-s3)
3. [Configuration des Permissions IAM](#configuration-des-permissions-iam)
4. [Configuration CORS](#configuration-cors)
5. [Configuration du Bucket Policy](#configuration-du-bucket-policy)
6. [Configuration CloudFront (Optionnel)](#configuration-cloudfront-optionnel)
7. [Variables d'Environnement](#variables-denvironnement)
8. [Test de la Configuration](#test-de-la-configuration)
9. [Dépannage](#dépannage)

---

## 🎯 Prérequis

- Un compte AWS actif
- Accès à la console AWS (https://console.aws.amazon.com)
- Connaissance de base d'AWS S3
- Node.js et npm installés localement

---

## 🪣 Création du Bucket S3

### Étape 1 : Accéder à S3

1. Connectez-vous à la console AWS
2. Recherchez "S3" dans la barre de recherche
3. Cliquez sur "Create bucket"

### Étape 2 : Configuration du Bucket

**Nom du bucket :**
```
royaleditions-images
```
> ⚠️ Le nom doit être unique globalement sur AWS

**Région :**
```
us-east-1 (Virginie du Nord)
```
> 💡 Choisissez la région la plus proche de vos utilisateurs

**Paramètres de blocage de l'accès public :**

Pour les images publiques (recommandé) :
- ✅ Décochez "Block all public access"
- ✅ Cochez l'avertissement de confirmation

Pour les images privées avec URLs présignées :
- ✅ Gardez "Block all public access" coché

**Versioning :**
- 🔘 Enable (recommandé pour la production)
- 🔘 Disable (acceptable pour le développement)

**Encryption :**
- 🔘 SSE-S3 (Server-side encryption with Amazon S3 managed keys)

**Cliquez sur "Create bucket"**

---

## 🔐 Configuration des Permissions IAM

### Étape 1 : Créer un Utilisateur IAM

1. Allez dans **IAM** → **Users** → **Add users**
2. **Nom d'utilisateur :** `royaleditions-s3-user`
3. **Access type :** ✅ Programmatic access
4. Cliquez sur **Next: Permissions**

### Étape 2 : Créer une Policy Personnalisée

1. Cliquez sur **Attach existing policies directly**
2. Cliquez sur **Create policy**
3. Allez dans l'onglet **JSON**
4. Collez la policy suivante :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "RoyalEditionsS3Access",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::royaleditions-images",
        "arn:aws:s3:::royaleditions-images/*"
      ]
    }
  ]
}
```

5. Nommez la policy : `RoyalEditionsS3Policy`
6. Cliquez sur **Create policy**
7. Retournez à la création de l'utilisateur et attachez cette policy
8. Cliquez sur **Next: Tags** (optionnel)
9. Cliquez sur **Next: Review**
10. Cliquez sur **Create user**

### Étape 3 : Sauvegarder les Credentials

⚠️ **IMPORTANT** : Sauvegardez immédiatement ces informations (elles ne seront plus accessibles après) :

```
Access key ID: AKIA...
Secret access key: wJalrXUt...
```

---

## 🌐 Configuration CORS

### Pourquoi CORS ?

CORS (Cross-Origin Resource Sharing) permet à votre application web d'accéder aux fichiers S3 depuis un domaine différent.

### Configuration

1. Allez dans votre bucket S3 **royaleditions-images**
2. Cliquez sur l'onglet **Permissions**
3. Faites défiler jusqu'à **Cross-origin resource sharing (CORS)**
4. Cliquez sur **Edit**
5. Collez la configuration suivante :

```json
[
  {
    "AllowedHeaders": [
      "*"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://royaleditions.com",
      "https://www.royaleditions.com"
    ],
    "ExposeHeaders": [
      "ETag",
      "x-amz-request-id"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

6. Cliquez sur **Save changes**

### Explications

- `AllowedHeaders`: Autorise tous les headers HTTP
- `AllowedMethods`: Méthodes HTTP autorisées
- `AllowedOrigins`: Domaines autorisés à accéder au bucket
- `ExposeHeaders`: Headers exposés aux clients
- `MaxAgeSeconds`: Durée de cache des règles CORS (50 minutes)

> 💡 **Pour le développement local** : Ajoutez `http://localhost:3000`
> 
> 🚀 **Pour la production** : Ajoutez vos domaines réels

---

## 📜 Configuration du Bucket Policy

### Pour des Images Publiques

Si vous voulez que les images soient accessibles publiquement (sans URL présignée) :

1. Allez dans votre bucket → **Permissions** → **Bucket policy**
2. Cliquez sur **Edit**
3. Collez la policy suivante :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::royaleditions-images/*"
    }
  ]
}
```

4. Cliquez sur **Save changes**

### Pour des Images Privées (URLs Présignées)

Si vous préférez utiliser des URLs présignées :

**Aucune bucket policy nécessaire !** Les permissions IAM de l'utilisateur suffisent.

---

## 🚀 Configuration CloudFront (Optionnel mais Recommandé)

CloudFront est le CDN d'AWS qui améliore les performances et réduit les coûts.

### Avantages

- ⚡ **Performance** : Cache global, latence réduite
- 💰 **Coûts** : Transfert de données moins cher que S3
- 🔒 **Sécurité** : Protection DDoS, HTTPS gratuit
- 📊 **Analytics** : Statistiques détaillées

### Étape 1 : Créer une Distribution CloudFront

1. Allez dans **CloudFront** → **Create distribution**
2. **Origin domain** : Sélectionnez votre bucket S3 `royaleditions-images`
3. **Origin access** :
   - Pour bucket public : `Public`
   - Pour bucket privé : `Origin access control settings (recommended)`
4. **Default cache behavior** :
   - Viewer protocol policy : `Redirect HTTP to HTTPS`
   - Allowed HTTP methods : `GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE`
   - Cache policy : `CachingOptimized`
5. **Settings** :
   - Price class : `Use all edge locations` (meilleure performance)
   - Alternate domain name (CNAME) : `cdn.royaleditions.com` (si vous avez un domaine)
   - SSL Certificate : `Custom SSL certificate` (si vous utilisez un CNAME)
6. Cliquez sur **Create distribution**

### Étape 2 : Attendre le Déploiement

⏱️ Le déploiement prend 15-20 minutes. Le statut passera de "In Progress" à "Deployed".

### Étape 3 : Obtenir le Domain Name

Une fois déployé, copiez le **Distribution domain name** :
```
d111111abcdef8.cloudfront.net
```

---

## 🔧 Variables d'Environnement

Ajoutez ces variables dans votre fichier `.env.local` :

```bash
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA................
AWS_SECRET_ACCESS_KEY=wJalrXUt........................................
AWS_S3_BUCKET_NAME=royaleditions-images

# CloudFront (Optionnel)
AWS_CLOUDFRONT_DOMAIN=d111111abcdef8.cloudfront.net
# OU si vous avez configuré un CNAME
# AWS_CLOUDFRONT_DOMAIN=cdn.royaleditions.com
```

### Sécurité des Variables

⚠️ **IMPORTANT** :

1. ❌ Ne jamais commiter `.env.local` dans Git
2. ✅ Ajoutez `.env.local` dans `.gitignore`
3. 🔒 Sur production, utilisez des variables d'environnement sécurisées (Vercel, AWS Secrets Manager, etc.)

---

## 🧪 Test de la Configuration

### Test 1 : Upload Manuel

1. Allez dans votre bucket S3
2. Cliquez sur **Upload**
3. Uploadez une image de test
4. Vérifiez que l'upload fonctionne

### Test 2 : Test de l'API

Créez un fichier de test `test-s3-upload.ts` :

```typescript
import { uploadToS3 } from './lib/aws-s3';
import fs from 'fs';

async function testUpload() {
  try {
    // Lire une image de test
    const imageBuffer = fs.readFileSync('./public/test-image.jpg');
    
    // Upload vers S3
    const url = await uploadToS3(
      imageBuffer,
      'test/test-image.jpg',
      'image/jpeg'
    );
    
    console.log('✅ Upload réussi !');
    console.log('URL:', url);
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testUpload();
```

Exécutez :
```bash
npx ts-node test-s3-upload.ts
```

### Test 3 : Test dans l'Application

1. Lancez l'application : `npm run dev`
2. Allez dans `/admin/livres/nouveau`
3. Cliquez sur "Ajouter des images"
4. Uploadez une image
5. Vérifiez que l'image apparaît dans la galerie

---

## 🔍 Dépannage

### Erreur : "Access Denied"

**Cause** : Permissions IAM insuffisantes

**Solution** :
1. Vérifiez que la policy IAM est correctement attachée
2. Vérifiez que l'Access Key et Secret Key sont corrects
3. Vérifiez que la bucket policy autorise l'accès (si bucket public)

### Erreur : "CORS Policy Blocked"

**Cause** : Configuration CORS incorrecte

**Solution** :
1. Vérifiez que votre domaine est dans `AllowedOrigins`
2. Vérifiez que les méthodes HTTP sont autorisées
3. Effacez le cache du navigateur

### Erreur : "Bucket Not Found"

**Cause** : Nom de bucket incorrect ou région incorrecte

**Solution** :
1. Vérifiez `AWS_S3_BUCKET_NAME` dans `.env.local`
2. Vérifiez `AWS_REGION` correspond à la région du bucket

### Images Lentes à Charger

**Cause** : Pas de CDN configuré

**Solution** :
1. Configurez CloudFront (voir section CloudFront)
2. Utilisez `AWS_CLOUDFRONT_DOMAIN` au lieu de l'URL S3 directe

---

## 📊 Structure des Dossiers S3

Organisation recommandée dans le bucket :

```
royaleditions-images/
├── books/
│   ├── cover-image-123-abc.jpg
│   ├── cover-image-456-def.jpg
│   └── interior-789-ghi.jpg
├── blog/
│   ├── article-header-123.jpg
│   └── article-inline-456.png
├── categories/
│   ├── fiction-banner.jpg
│   └── non-fiction-banner.jpg
└── uploads/
    └── temp-file-123.jpg
```

---

## 💰 Estimation des Coûts AWS

### S3 Storage (us-east-1)

- **Stockage** : $0.023 par GB/mois
- **Requêtes PUT** : $0.005 par 1,000 requêtes
- **Requêtes GET** : $0.0004 par 1,000 requêtes

**Exemple pour 1000 images (500MB total)** :
- Stockage : $0.012/mois
- Uploads : $0.005 (1000 uploads)
- Téléchargements : $0.004 (10,000 vues)
- **Total** : ~$0.02/mois

### CloudFront

- **Transfert de données** : $0.085 par GB (premiers 10TB/mois)
- **Requêtes HTTP/HTTPS** : $0.0075 par 10,000 requêtes

**Exemple pour 10,000 vues/mois (5GB de transfert)** :
- Transfert : $0.43
- Requêtes : $0.0075
- **Total** : ~$0.44/mois

### Total Estimé

Pour un site avec 1000 images et 10,000 vues/mois :
**~$0.50/mois** 💰

---

## 📝 Checklist de Production

Avant de passer en production, vérifiez :

- [ ] Bucket S3 créé avec le bon nom
- [ ] Utilisateur IAM créé avec les bonnes permissions
- [ ] Bucket policy configurée (si images publiques)
- [ ] CORS configuré avec les bons domaines
- [ ] CloudFront configuré (recommandé)
- [ ] Variables d'environnement définies
- [ ] Tests d'upload réussis
- [ ] Tests de téléchargement réussis
- [ ] Surveillance des coûts activée
- [ ] Backup policy configurée (versionning)

---

## 🔗 Ressources Utiles

- [Documentation AWS S3](https://docs.aws.amazon.com/s3/)
- [Documentation AWS CloudFront](https://docs.aws.amazon.com/cloudfront/)
- [AWS S3 Pricing](https://aws.amazon.com/s3/pricing/)
- [AWS CloudFront Pricing](https://aws.amazon.com/cloudfront/pricing/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)

---

## 🆘 Support

En cas de problème, contactez :
- **Email** : support@royaleditions.com
- **Documentation** : Consultez ce guide
- **AWS Support** : https://console.aws.amazon.com/support/

---

**🎉 Félicitations ! Votre configuration AWS S3 est complète !**
