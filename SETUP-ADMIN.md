# 🚀 Guide de Configuration Rapide - Royal Editions Admin

## ✅ Ce qui est déjà fait

### 1. Installation et Configuration
- ✅ Clerk installé et configuré
- ✅ Middleware de protection des routes admin créé
- ✅ Layout admin avec navigation
- ✅ Pages d'authentification (sign-in, sign-up)

### 2. Dashboard Admin Fonctionnel
- ✅ Page dashboard avec statistiques en temps réel
- ✅ Navigation admin complète
- ✅ Gestion des livres (liste + création)
- ✅ Gestion des commandes (liste + détails + changement de statut)
- ✅ Éditeur riche TipTap intégré

### 3. Composants Créés
- ✅ `AdminNav` - Navigation admin
- ✅ `BookForm` - Formulaire création de livre
- ✅ `RichTextEditor` - Éditeur TipTap
- ✅ `OrderDetailClient` - Détail commande

## 🔑 Configuration Clerk (IMPORTANT)

### Étape 1 : Créer un compte Clerk
1. Allez sur https://clerk.com
2. Créez un compte gratuit
3. Créez une nouvelle application "Royal Editions"

### Étape 2 : Obtenir les clés API
Dans le dashboard Clerk :
1. Allez dans **API Keys**
2. Copiez vos clés

### Étape 3 : Créer le fichier `.env`
Créez un fichier `.env` à la racine du projet :

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/royaledition"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/admin/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/admin/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/admin/dashboard

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DELIVERY_FEE=2000
```

### Étape 4 : Configurer Clerk dans le Dashboard
1. Dans **Email, Phone, Username** :
   - Activez **Email address** (requis)
   - Désactivez le reste si vous voulez uniquement l'email

2. Dans **Paths** :
   - Sign-in URL: `/admin/sign-in`
   - Sign-up URL: `/admin/sign-up`
   - After sign-in: `/admin/dashboard`
   - After sign-up: `/admin/dashboard`

3. Dans **Restrictions** (optionnel) :
   - Vous pouvez restreindre les inscriptions à certains domaines email

## 🎯 Tester l'Admin

### 1. Démarrer le serveur
```bash
npm run dev
```

### 2. Accéder aux pages
- **Site public** : http://localhost:3000
- **Admin Sign-in** : http://localhost:3000/admin/sign-in
- **Admin Dashboard** : http://localhost:3000/admin/dashboard

### 3. Créer votre compte admin
1. Allez sur `/admin/sign-in`
2. Cliquez sur "Sign up" (S'inscrire)
3. Créez votre compte avec votre email
4. Vérifiez votre email
5. Vous serez redirigé vers `/admin/dashboard`

## 📊 Fonctionnalités Admin Disponibles

### Dashboard (`/admin/dashboard`)
- Statistiques en temps réel :
  - Nombre total de livres
  - Nombre total de commandes
  - Commandes en attente
  - Chiffre d'affaires total
- Commandes récentes (5 dernières)
- Actions rapides (ajouter livre, voir commandes, etc.)

### Gestion Livres (`/admin/livres`)
- **Liste des livres** avec :
  - Image, titre, auteur
  - Catégorie
  - Prix et stock
  - Badges (Featured, Bestseller)
  - Actions : Éditer, Supprimer

- **Création de livre** (`/admin/livres/nouveau`) :
  - Formulaire complet avec validation
  - Éditeur riche TipTap pour la description
  - Upload d'images (URLs pour l'instant)
  - Gestion stock et prix
  - Options Featured/Bestseller

### Gestion Commandes (`/admin/commandes`)
- **Liste des commandes** avec :
  - Numéro de commande
  - Informations client
  - Montant total
  - Statut actuel
  - Date de création

- **Détail commande** (`/admin/commandes/[id]`) :
  - Articles commandés avec images
  - Informations client complètes
  - Adresse de livraison
  - **Changement de statut en temps réel** :
    - En attente (PENDING)
    - En cours (PROCESSING)
    - Livrée (DELIVERED)
    - Annulée (CANCELLED)

## 🔄 Prochaines Étapes

### Priorité 1 : Base de données
```bash
# Si vous n'avez pas encore de base de données MySQL
npm run db:push

# Ajouter des données de test
npm run db:seed
```

### Priorité 2 : Pages restantes
- [ ] Gestion du blog (`/admin/blog`)
- [ ] Gestion des catégories (`/admin/categories`)
- [ ] Pages blog publiques (`/blog`, `/blog/[slug]`)

### Priorité 3 : Améliorations
- [ ] Upload d'images (Cloudinary)
- [ ] Export CSV des commandes
- [ ] Notifications email
- [ ] Analytics avancées

## 🎨 Personnalisation Clerk

Dans le dashboard Clerk, allez dans **Customization** pour :
- Personnaliser les couleurs (utilisez #FFD700 pour l'or et #001F6D pour le bleu)
- Ajouter votre logo
- Personnaliser les textes
- Changer la langue en français

## ✨ Points Forts

1. **Protection complète** : Toutes les routes `/admin/*` sont protégées
2. **Éditeur riche** : TipTap intégré pour descriptions riches
3. **Temps réel** : Statistiques et données à jour
4. **Responsive** : Fonctionne sur mobile et desktop
5. **Validation** : Formulaires avec Zod + React Hook Form
6. **UX moderne** : Animations Framer Motion, toasts Sonner

## 🐛 Dépannage

### Erreur "Missing Clerk keys"
- Vérifiez que votre `.env` contient les bonnes clés Clerk
- Redémarrez le serveur après avoir ajouté les clés

### Erreur de base de données
- Vérifiez que MySQL est démarré
- Vérifiez votre `DATABASE_URL` dans `.env`
- Exécutez `npm run db:push`

### Page admin redirige vers sign-in
- C'est normal ! Créez d'abord votre compte admin
- Une fois connecté, vous aurez accès à tout l'admin

## 📞 Support

Consultez la documentation :
- `DOCUMENTATION.md` - Guide complet
- `RECAPITULATIF.md` - État du projet
- `GUIDE-CLERK-ADMIN.md` - Guide détaillé Clerk

Bon développement ! 🚀
