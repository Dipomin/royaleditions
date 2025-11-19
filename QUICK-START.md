# ⚡ Guide de Démarrage Rapide - Royal Editions

## 🚀 En 5 Minutes

### 1️⃣ Configuration Clerk (2 minutes)

**Étape A : Créer compte**
```
1. Allez sur https://clerk.com
2. Créez un compte gratuit
3. Cliquez sur "Create application"
4. Nommez-la "Royal Editions"
5. Sélectionnez "Email" comme méthode d'authentification
```

**Étape B : Obtenir les clés**
```
Dans le dashboard Clerk :
1. Menu de gauche → API Keys
2. Copiez "Publishable key" (commence par pk_test_)
3. Copiez "Secret key" (commence par sk_test_)
```

**Étape C : Configurer .env**
```bash
# Créez le fichier .env à la racine
cp .env.example .env

# Éditez .env et ajoutez :
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_ICI
CLERK_SECRET_KEY=sk_test_VOTRE_CLE_ICI
DATABASE_URL="mysql://root:password@localhost:3306/royaledition"
```

### 2️⃣ Base de Données (1 minute)

```bash
# Créer la base de données
npm run db:push

# Ajouter des données de test
npm run db:seed
```

**Résultat :**
- ✅ 3 catégories créées
- ✅ 1 livre ajouté (1000 Techniques)
- ✅ 3 témoignages
- ✅ 1 article de blog

### 3️⃣ Démarrer l'Application (30 secondes)

```bash
npm run dev
```

**Le site est maintenant accessible sur :**
- 🌐 Frontend : http://localhost:3000
- 🔐 Admin : http://localhost:3000/admin/sign-in

### 4️⃣ Créer votre Compte Admin (1 minute)

```
1. Allez sur http://localhost:3000/admin/sign-in
2. Cliquez sur "Sign up" (en bas)
3. Entrez votre email
4. Vérifiez votre email et confirmez
5. Vous êtes redirigé vers /admin/dashboard
```

### 5️⃣ Tester les Fonctionnalités (30 secondes)

**Frontend :**
- ✅ Visitez http://localhost:3000
- ✅ Cliquez sur "Boutique"
- ✅ Ajoutez un livre au panier
- ✅ Allez au panier
- ✅ Visitez le blog

**Admin :**
- ✅ Allez sur /admin/dashboard
- ✅ Voyez les statistiques
- ✅ Cliquez sur "Livres"
- ✅ Cliquez sur "Ajouter un livre"
- ✅ Explorez le formulaire avec éditeur riche

## 🎯 Checklist de Démarrage

### Configuration Initiale
- [ ] Compte Clerk créé
- [ ] Clés API copiées dans .env
- [ ] Base de données MySQL installée
- [ ] `npm install` exécuté
- [ ] `npm run db:push` exécuté
- [ ] `npm run db:seed` exécuté

### Test Frontend
- [ ] Homepage accessible (/)
- [ ] Boutique fonctionne (/boutique)
- [ ] Panier fonctionne (/panier)
- [ ] Blog accessible (/blog)
- [ ] Pages secondaires OK

### Test Admin
- [ ] Connexion admin fonctionne
- [ ] Dashboard affiche stats
- [ ] Création livre possible
- [ ] Gestion commandes OK
- [ ] Création article blog OK

## 🛠️ Commandes Utiles

### Développement
```bash
npm run dev          # Démarrer en mode développement
npm run build        # Build pour production
npm start            # Démarrer en production
npm run lint         # Vérifier le code
```

### Base de Données
```bash
npm run db:push      # Créer/mettre à jour la DB
npm run db:seed      # Ajouter données de test
npm run db:studio    # Ouvrir Prisma Studio (interface graphique)
```

## 🎨 Personnalisation Clerk

Pour un meilleur look :

```
1. Dashboard Clerk → Customization
2. Theme :
   - Primary color : #FFD700 (Gold)
   - Background : #001F6D (Royal Blue)
3. Logo : Uploadez /public/assets/Logo-Royal-Editions.png
4. Language : Français
```

## 📊 Prisma Studio

Pour visualiser/éditer la base de données graphiquement :

```bash
npm run db:studio
```

S'ouvre sur http://localhost:5555

## 🐛 Problèmes Courants

### Erreur "Missing Clerk keys"
**Solution :** Vérifiez que `.env` contient les bonnes clés et redémarrez le serveur

### Erreur MySQL "Can't connect"
**Solutions :**
```bash
# Vérifier si MySQL tourne
mysql --version

# Démarrer MySQL (macOS)
brew services start mysql

# Vérifier le port (doit être 3306)
mysql -u root -p -e "SHOW VARIABLES LIKE 'port';"
```

### Page admin redirige vers sign-in
**Solution :** C'est normal ! Créez d'abord votre compte admin

### Pas de livres dans la boutique
**Solution :**
```bash
npm run db:seed
```

### Erreur "Module not found"
**Solution :**
```bash
rm -rf node_modules
npm install
```

## 📱 Accès Rapide

### URLs Principales
| Page | URL |
|------|-----|
| Homepage | http://localhost:3000 |
| Boutique | http://localhost:3000/boutique |
| Blog | http://localhost:3000/blog |
| Admin Login | http://localhost:3000/admin/sign-in |
| Admin Dashboard | http://localhost:3000/admin/dashboard |
| Prisma Studio | http://localhost:5555 |

### Credentials Test
Créez votre propre compte admin via `/admin/sign-in`

## 🎯 Prochaines Actions

### Après le démarrage :

1. **Ajouter du contenu :**
   - Créez vos livres dans /admin/livres/nouveau
   - Créez des articles de blog dans /admin/blog/nouveau
   - Ajoutez vos catégories dans /admin/categories

2. **Personnaliser :**
   - Changez le logo dans `/public/assets/`
   - Modifiez les couleurs dans `app/globals.css`
   - Ajustez les textes dans les pages

3. **Configurer la production :**
   - Base de données production
   - Variables d'environnement production
   - Déploiement (Vercel recommandé)

## 🎓 Documentation Complète

Pour plus de détails, consultez :
- `DOCUMENTATION.md` - Guide complet
- `SETUP-ADMIN.md` - Configuration admin détaillée
- `PROJET-FINAL.md` - Vue d'ensemble du projet
- `README.md` - Introduction

## ✅ Vous êtes prêt !

Une fois les 5 étapes ci-dessus complétées, vous avez :
- ✅ Un site e-commerce 100% fonctionnel
- ✅ Un dashboard admin complet
- ✅ Des données de test
- ✅ L'authentification configurée
- ✅ Le SEO optimisé

**Bon développement ! 🚀**
