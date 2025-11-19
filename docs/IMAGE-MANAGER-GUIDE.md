# 📸 Guide d'Utilisation du Gestionnaire d'Images

Guide pratique pour utiliser le système de gestion d'images AWS S3 dans l'administration Royal Editions.

---

## 🎯 Accès au Gestionnaire

Le gestionnaire d'images est intégré dans les formulaires d'administration :

- **Ajout de livre** : `/admin/livres/nouveau`
- **Modification de livre** : `/admin/livres/[id]`
- **Articles de blog** : `/admin/blog/nouveau`

---

## 📤 Upload d'Images

### Méthode 1 : Drag & Drop (Glisser-Déposer)

1. Cliquez sur le bouton **"Ajouter des images"**
2. La modal du gestionnaire s'ouvre
3. **Glissez** vos images directement dans la zone de drop
4. Les images s'uploadent automatiquement vers AWS S3
5. Elles apparaissent dans la galerie

### Méthode 2 : Sélection de Fichiers

1. Cliquez sur le bouton **"Ajouter des images"**
2. Cliquez sur **"Cliquez pour uploader"** dans la zone de drop
3. Sélectionnez un ou plusieurs fichiers
4. Les images s'uploadent automatiquement

---

## 🖼️ Formats et Limites

### Formats Acceptés

✅ **JPG/JPEG** - Format standard pour photos  
✅ **PNG** - Format avec transparence  
✅ **WEBP** - Format moderne, léger  
✅ **GIF** - Format animé (si nécessaire)

### Limites

- **Taille maximum** : 5 MB par image
- **Nombre d'images** : Illimité (mais recommandé 3-5 par livre)
- **Upload simultané** : Plusieurs images en une fois

---

## 🎨 Sélection d'Images

### Depuis la Galerie

1. Ouvrez le gestionnaire d'images
2. Toutes vos images uploadées apparaissent en grille
3. **Survolez** une image avec la souris
4. Cliquez sur **"Sélectionner"**
5. L'image est ajoutée au livre
6. La modal se ferme automatiquement

### Images Multiples

Pour ajouter plusieurs images :

1. Cliquez plusieurs fois sur "Ajouter des images"
2. Sélectionnez une image différente à chaque fois
3. Toutes les images sélectionnées apparaissent sous forme de galerie

---

## 🗑️ Suppression d'Images

### Supprimer de S3

**⚠️ Attention : Cette action est irréversible !**

1. Dans le gestionnaire, survolez une image uploadée
2. Cliquez sur le bouton rouge **"Supprimer"**
3. L'image est supprimée de AWS S3
4. Elle disparaît de la galerie

### Retirer du Livre (sans supprimer de S3)

1. Dans le formulaire de livre
2. Cliquez sur le **X** en haut à droite de l'image miniature
3. L'image est retirée de ce livre uniquement
4. Elle reste disponible dans S3 pour d'autres usages

---

## 📋 Ordre des Images

L'ordre des images dans le formulaire détermine leur affichage :

- **Première image** = Image de couverture principale
- **Images suivantes** = Galerie/aperçus secondaires

Pour réordonner :
1. Supprimez les images
2. Ajoutez-les à nouveau dans l'ordre souhaité

---

## 🔍 Recherche et Filtrage

### Filtrage par Dossier

Les images sont organisées par type :

- `books/` - Images de livres
- `blog/` - Images d'articles de blog
- `categories/` - Bannières de catégories

Le système sélectionne automatiquement le bon dossier selon le contexte.

### Informations Affichées

Pour chaque image :
- **Miniature** : Aperçu visuel
- **Taille** : Affichée en KB en bas de l'image
- **Actions** : Sélectionner ou Supprimer

---

## 💡 Bonnes Pratiques

### Optimisation des Images

**Avant l'upload** :

1. **Redimensionnez** vos images :
   - Couverture de livre : 800x1200px recommandé
   - Images blog : 1200x800px recommandé
2. **Compressez** avec des outils comme :
   - [TinyPNG](https://tinypng.com/)
   - [Squoosh](https://squoosh.app/)
   - [ImageOptim](https://imageoptim.com/)
3. **Format** :
   - Photos : JPG (plus léger)
   - Graphiques : PNG (meilleure qualité)
   - Web moderne : WEBP (meilleur compromis)

### Nommage des Fichiers

**Recommandations** :

✅ `1000-techniques-couverture.jpg`  
✅ `livre-histoire-france-apercu-1.jpg`  
✅ `categorie-fiction-banner.png`

❌ `IMG_1234.jpg`  
❌ `Capture d'écran 2024.png`  
❌ `image sans nom (1).jpg`

### Organisation

- **1 image de couverture** minimum par livre
- **2-3 images supplémentaires** maximum (aperçus internes)
- **Qualité > Quantité** : Préférez moins d'images mais de meilleure qualité

---

## 🚀 Performance

### Chargement Rapide

Grâce à AWS S3 et CloudFront CDN :

- ⚡ **Images distribuées globalement**
- 🌍 **Servies depuis le serveur le plus proche**
- 💾 **Mises en cache automatiquement**
- 📱 **Optimisées pour mobile et desktop**

### Monitoring

Les images sont stockées sur AWS avec :

- 🔒 **Sécurité** : Chiffrement automatique
- 💰 **Économie** : Coûts très bas (~$0.50/mois)
- 📊 **Analytics** : Statistiques d'utilisation
- ♻️ **Versionning** : Historique des versions (si activé)

---

## 🛠️ Résolution de Problèmes

### L'Image ne S'Upload Pas

**Causes possibles** :

1. ❌ **Fichier trop volumineux** (> 5MB)
   - **Solution** : Compressez l'image

2. ❌ **Format non supporté**
   - **Solution** : Convertissez en JPG, PNG, ou WEBP

3. ❌ **Connexion lente**
   - **Solution** : Attendez quelques secondes, réessayez

4. ❌ **Erreur serveur**
   - **Solution** : Vérifiez la console, contactez le support

### L'Image ne S'Affiche Pas

**Causes possibles** :

1. ❌ **URL incorrecte**
   - **Solution** : Ré-uploadez l'image

2. ❌ **Image supprimée de S3**
   - **Solution** : Uploadez à nouveau

3. ❌ **Problème de cache**
   - **Solution** : Rafraîchissez la page (Ctrl+F5)

### Erreur "Access Denied"

**Cause** : Problème de permissions AWS

**Solution** :
1. Contactez l'administrateur système
2. Vérifiez la configuration AWS S3 (voir `AWS-S3-CONFIGURATION.md`)

---

## 📊 Statistiques d'Utilisation

### Espace de Stockage

Surveillez l'utilisation de votre bucket S3 :

1. Allez sur [AWS S3 Console](https://console.aws.amazon.com/s3/)
2. Sélectionnez votre bucket `royaleditions-images`
3. Onglet **"Metrics"** → Espace utilisé

### Coûts Mensuels

Consultez vos coûts AWS :

1. [AWS Billing Dashboard](https://console.aws.amazon.com/billing/)
2. Filtrez par service : **S3** et **CloudFront**
3. Configurez des alertes de budget

**Coûts estimés pour 1000 images** : ~$0.50/mois 💰

---

## ✨ Fonctionnalités Avancées

### Upload en Masse

1. Sélectionnez **plusieurs images** en une fois
2. Toutes s'uploadent en parallèle
3. Barre de progression pour chaque upload
4. Notification de succès groupée

### Galerie Réactive

- 📱 **Mobile** : Grille 2 colonnes
- 💻 **Tablette** : Grille 3 colonnes
- 🖥️ **Desktop** : Grille 4 colonnes

### Prévisualisation Instantanée

Après sélection :
- ✅ Miniature affichée immédiatement
- ✅ Bouton de suppression rapide
- ✅ Indicateur de position (1ère image = couverture)

---

## 📞 Support

### Besoin d'Aide ?

**Documentation** :
- Guide de configuration : `docs/AWS-S3-CONFIGURATION.md`
- Guide d'utilisation : Ce document

**Contact** :
- Email : support@royaleditions.com
- Téléphone : [Votre numéro]

### Signaler un Bug

Si vous rencontrez un problème :

1. Notez le **message d'erreur exact**
2. Prenez une **capture d'écran**
3. Notez les **étapes pour reproduire**
4. Contactez le support technique

---

## 🎓 Tutoriel Vidéo (À venir)

Un tutoriel vidéo complet sera bientôt disponible pour :
- Upload d'images
- Gestion de la galerie
- Optimisation des images
- Résolution de problèmes

---

**🎉 Vous êtes maintenant prêt à gérer vos images comme un pro !**

*Dernière mise à jour : Novembre 2025*
