# Royal Editions - Site E-Commerce Premium

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)

Un site e-commerce moderne et professionnel pour la vente de livres avec paiement à la livraison, développé avec les dernières technologies web.

## ✨ Caractéristiques

- 🎨 **Design Premium** - Interface minimaliste luxueuse (Or & Bleu Roi)
- 🛒 **E-Commerce Complet** - Catalogue, panier, checkout optimisé
- 📦 **Paiement à la livraison** - Aucun paiement en ligne requis
- 🎛️ **Dashboard Admin** - Gestion complète (livres, commandes, blog)
- 📱 **Responsive Design** - Parfait sur mobile, tablette et desktop
- ⚡ **Performance** - Core Web Vitals optimisés, Next.js 16
- 🔍 **SEO Optimisé** - Meta tags dynamiques, Open Graph, schema.org
- 🎭 **Animations fluides** - Framer Motion pour l'UX
- 📝 **Éditeur riche** - TipTap pour la gestion du contenu
- 🔐 **Authentification** - Clerk pour l'espace admin

## 🛠️ Stack Technique

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, TypeScript, Tailwind CSS v4
- **Base de données**: MySQL avec Prisma ORM
- **Authentification**: Clerk
- **Composants**: Shadcn UI
- **État global**: Zustand
- **Animations**: Framer Motion
- **Validation**: Zod + React Hook Form

## 🚀 Démarrage Rapide

\`\`\`bash
# Cloner le projet
git clone <repository-url>
cd royaledition

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditez .env avec vos valeurs

# Initialiser la base de données
npx prisma db push
npm run db:seed

# Lancer le serveur de développement
npm run dev
\`\`\`

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📖 Documentation

Pour une documentation complète, consultez [DOCUMENTATION.md](./DOCUMENTATION.md) qui contient :

- Guide d'installation détaillé
- Structure du projet
- Guide d'utilisation admin
- Instructions de déploiement
- Configuration avancée

## 🎨 Design System

- **Couleurs principales**:
  - Or: #FFD700
  - Bleu Roi: #001F6D
- **Typographies**:
  - Titres: Playfair Display
  - Corps: Inter
- **Composants**: Basés sur Shadcn UI avec personnalisation premium

## 📦 Scripts Disponibles

\`\`\`bash
npm run dev          # Serveur de développement
npm run build        # Build production
npm run start        # Serveur production
npm run lint         # Linter ESLint
npm run db:push      # Synchroniser le schéma Prisma
npm run db:seed      # Peupler la base de données
npm run db:studio    # Ouvrir Prisma Studio
\`\`\`

## 📱 Pages Principales

- `/` - Page d'accueil
- `/boutique` - Catalogue des livres
- `/boutique/[slug]` - Détail d'un livre
- `/panier` - Panier d'achat
- `/commander` - Checkout
- `/blog` - Articles de blog
- `/a-propos` - À propos
- `/contact` - Contact
- `/faq` - Questions fréquentes
- `/admin` - Dashboard administrateur (protégé)

## 🔐 Administration

Accédez au dashboard admin sur `/admin/sign-in` avec vos identifiants Clerk.

**Fonctionnalités admin** :
- ✅ Gestion des livres (CRUD avec éditeur riche)
- ✅ Gestion des commandes (statuts, exports CSV)
- ✅ Gestion du blog (éditeur TipTap)
- ✅ Gestion des catégories
- ✅ Analytics et statistiques
- ✅ SEO avancé (meta tags, Open Graph)

## 🌐 Déploiement

### Option 1: VPS Neuf (Installation Complète)

Pour un VPS Ubuntu/Debian fraîchement installé :

```bash
# Télécharger et exécuter le script d'installation
wget https://raw.githubusercontent.com/Dipomin/royaleditions/main/install-vps.sh
chmod +x install-vps.sh
sudo bash install-vps.sh
```

📖 **Guide complet**: [DEPLOYMENT-VPS.md](./DEPLOYMENT-VPS.md)

### Option 2: VPS Existant (Multi-Applications)

Pour un VPS qui héberge déjà d'autres applications :

```bash
# Cloner dans votre home directory
cd ~
git clone https://github.com/Dipomin/royaleditions.git royal-editions
cd royal-editions

# Configurer avec un port différent
cp .env.example .env
nano .env  # Définir PORT=3001 (ou autre port libre)

# Déployer
chmod +x deploy.sh
./deploy.sh production
```

📖 **Guide complet**: [DEPLOYMENT-EXISTING-VPS.md](./DEPLOYMENT-EXISTING-VPS.md)

### Option 3: Vercel (Déploiement Rapide)

```bash
npm i -g vercel
vercel
```

### Scripts de Déploiement

```bash
# Déploiement automatisé (production)
./deploy.sh production

# Déploiement staging
./deploy.sh staging

# Avec répertoire personnalisé
./deploy.sh production /chemin/vers/app
```

📖 **Documentation des scripts**: [DEPLOYMENT-SCRIPTS.md](./DEPLOYMENT-SCRIPTS.md)

## 🔄 Migration Base de Données

Deux méthodes pour migrer vos données locales vers le VPS :

### Méthode 1: Script Shell Automatisé (Recommandé)

```bash
# Migration complète en une commande
./migrate-db-to-vps.sh

# Ou via npm
npm run db:export
```

Ce script interactif gère :
- Export de la base de données locale
- Compression et transfert vers le VPS
- Import automatique sur le serveur distant
- Vérification de l'intégrité des données

### Méthode 2: Script Prisma TypeScript

```bash
# Configurer les URLs dans .env
SOURCE_DATABASE_URL="mysql://user:pass@localhost:3306/royaledition"
TARGET_DATABASE_URL="mysql://user:pass@vps_ip:3306/royaledition"

# Exécuter la migration
npm run db:migrate-to-vps
```

Cette méthode offre :
- Migration granulaire par table
- Gestion des relations (commandes → items)
- Barres de progression en temps réel
- Upserts pour éviter les doublons

📖 **Guide complet**: [docs/DATABASE-MIGRATION.md](./docs/DATABASE-MIGRATION.md)

## 📚 Documentation

- 📘 [Guide de Déploiement VPS Neuf](./DEPLOYMENT-VPS.md) - Installation complète étape par étape
- 📗 [Guide VPS Existant](./DEPLOYMENT-EXISTING-VPS.md) - Déploiement multi-applications
- 📙 [Scripts de Déploiement](./DEPLOYMENT-SCRIPTS.md) - Documentation des scripts automatisés
- 📕 [Documentation Complète](./DOCUMENTATION.md) - Architecture et développement

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez ouvrir une issue pour discuter des changements majeurs.

## 📄 Licence

© 2025 Royal Editions. Tous droits réservés.

## 📞 Support

- Email: contact@royaleditions.ci
- Téléphone: +225 XX XX XX XX XX

---

Développé avec ❤️ par Royal Editions
# royaleditions
