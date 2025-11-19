# Royal Editions - Site E-Commerce de Livres

Un site e-commerce moderne et professionnel pour la vente de livres avec paiement à la livraison, développé avec Next.js 16, React 19, TypeScript, Tailwind CSS v4, et Prisma.

## 🎨 Caractéristiques

- **Design Premium**: Interface minimaliste luxueuse aux couleurs Or (#FFD700) et Bleu Roi (#001F6D)
- **Expérience utilisateur fluide**: Animations avec Framer Motion, navigation intuitive
- **Paiement à la livraison**: Aucun paiement en ligne requis
- **Dashboard Admin complet**: Gestion des livres, commandes, blog, analytics
- **SEO optimisé**: Meta tags dynamiques, Open Graph, schema.org
- **Performance**: Core Web Vitals optimisés, images Next.js optimisées

## 🛠️ Stack Technique

### Front-end
- **Next.js 16** avec App Router
- **React 19** (Server & Client Components)
- **TypeScript** (strict mode)
- **Tailwind CSS v4** avec PostCSS
- **Framer Motion** pour les animations
- **Shadcn UI** pour les composants
- **Zustand** pour la gestion du panier

### Back-end
- **Next.js API Routes**
- **Prisma ORM** avec MySQL
- **Clerk** pour l'authentification admin

### Outils & Bibliothèques
- **TipTap** - Éditeur riche de texte
- **React Hook Form + Zod** - Validation de formulaires
- **Sonner** - Notifications toast
- **Lucide React** - Icônes
- **Sharp** - Optimisation d'images

## 📦 Installation

### Prérequis
- Node.js 18+ 
- MySQL 8+
- npm ou yarn

### Étapes d'installation

1. **Cloner le projet**
\`\`\`bash
git clone <repository-url>
cd royaledition
\`\`\`

2. **Installer les dépendances**
\`\`\`bash
npm install
\`\`\`

3. **Configuration de l'environnement**
\`\`\`bash
cp .env.example .env
\`\`\`

Éditez `.env` avec vos informations :
\`\`\`env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/royaledition"

# Clerk (pour l'authentification admin)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

4. **Créer la base de données**
\`\`\`bash
# Créer la base de données MySQL
mysql -u root -p
CREATE DATABASE royaledition CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
\`\`\`

5. **Initialiser Prisma**
\`\`\`bash
# Générer le client Prisma
npx prisma generate

# Créer les tables
npx prisma db push

# (Optionnel) Ajouter des données de test
npx prisma db seed
\`\`\`

6. **Lancer le serveur de développement**
\`\`\`bash
npm run dev
\`\`\`

Le site sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🗂️ Structure du Projet

\`\`\`
royaledition/
├── app/                          # Next.js App Router
│   ├── (admin)/                  # Routes admin protégées
│   │   └── admin/
│   │       ├── dashboard/        # Dashboard principal
│   │       ├── livres/           # Gestion des livres
│   │       ├── commandes/        # Gestion des commandes
│   │       └── blog/             # Gestion du blog
│   ├── api/                      # API Routes
│   │   ├── books/                # CRUD livres
│   │   ├── orders/               # CRUD commandes
│   │   ├── categories/           # CRUD catégories
│   │   └── blog/                 # CRUD articles blog
│   ├── boutique/                 # Pages boutique
│   │   ├── page.tsx              # Liste des livres
│   │   └── [slug]/               # Détail d'un livre
│   ├── panier/                   # Page panier
│   ├── commander/                # Page checkout
│   ├── blog/                     # Pages blog
│   ├── a-propos/                 # Page à propos
│   ├── contact/                  # Page contact
│   ├── layout.tsx                # Layout global
│   └── page.tsx                  # Page d'accueil
├── components/                   # Composants React
│   ├── layout/                   # Header, Footer
│   ├── books/                    # Composants livres
│   └── ui/                       # Composants Shadcn UI
├── lib/                          # Utilitaires
│   ├── prisma.ts                 # Client Prisma
│   ├── constants.ts              # Constantes
│   ├── validations.ts            # Schémas Zod
│   └── store/                    # Zustand stores
├── prisma/                       # Configuration Prisma
│   └── schema.prisma             # Schéma de base de données
└── public/                       # Assets statiques
    └── assets/                   # Images, logos
\`\`\`

## 📚 Guide d'utilisation

### Pour les administrateurs

#### Accéder au dashboard
1. Allez sur `/admin/sign-in`
2. Connectez-vous avec vos identifiants Clerk
3. Vous serez redirigé vers `/admin/dashboard`

#### Ajouter un livre
1. Dashboard > Livres > Nouveau livre
2. Remplissez le formulaire :
   - Titre (obligatoire)
   - Auteur (optionnel)
   - Catégorie (obligatoire)
   - Prix (obligatoire)
   - Stock (obligatoire)
   - Description courte et longue
   - Images (minimum 1)
   - Meta tags pour SEO
3. Cliquez sur "Publier"

#### Gérer les commandes
1. Dashboard > Commandes
2. Visualisez toutes les commandes avec filtres par statut
3. Cliquez sur une commande pour voir les détails
4. Changez le statut :
   - **En attente** : Nouvelle commande
   - **En cours** : En préparation/livraison
   - **Livré** : Commande livrée
   - **Annulé** : Commande annulée

#### Gérer le blog
1. Dashboard > Blog > Nouvel article
2. Utilisez l'éditeur riche TipTap pour :
   - Formater le texte (gras, italique, titres)
   - Ajouter des images
   - Créer des liens
   - Ajouter des citations
3. Configurez les meta tags SEO
4. Publiez ou enregistrez comme brouillon

### Pour les clients

#### Commander un livre
1. Parcourez la boutique ou recherchez un livre
2. Cliquez sur "Ajouter au panier"
3. Allez au panier et cliquez "Passer la commande"
4. Remplissez le formulaire de livraison
5. Confirmez la commande
6. Vous recevrez un numéro de commande
7. Payez en espèces à la livraison

## 🚀 Déploiement

### Déploiement sur VPS

1. **Préparer le serveur**
\`\`\`bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Installer MySQL
sudo apt install mysql-server
sudo mysql_secure_installation
\`\`\`

2. **Cloner et configurer**
\`\`\`bash
cd /var/www
git clone <repository-url> royaledition
cd royaledition
npm install
\`\`\`

3. **Configuration production**
\`\`\`bash
# Créer .env
cp .env.example .env
# Éditer avec les valeurs de production

# Build
npm run build
\`\`\`

4. **Utiliser PM2 pour la gestion**
\`\`\`bash
npm install -g pm2
pm2 start npm --name "royaledition" -- start
pm2 save
pm2 startup
\`\`\`

5. **Configurer Nginx**
\`\`\`nginx
server {
    listen 80;
    server_name votredomaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

### Déploiement sur Vercel

\`\`\`bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Production
vercel --prod
\`\`\`

## 🔧 Configuration Avancée

### Personnaliser les couleurs
Éditez `app/globals.css` :
\`\`\`css
@theme inline {
  --color-gold: #FFD700;
  --color-royal-blue: #001F6D;
  /* Vos couleurs personnalisées */
}
\`\`\`

### Configurer les frais de livraison
Éditez `lib/constants.ts` :
\`\`\`typescript
export const DELIVERY_FEE = 2000 // En FCFA
\`\`\`

### Ajouter des méthodes de paiement
Pour ajouter des paiements en ligne (à l'avenir), intégrez :
- FedaPay (Côte d'Ivoire)
- CinetPay
- PayPal

## 📱 Responsive Design
Le site est entièrement responsive :
- **Mobile** : 320px - 768px
- **Tablet** : 768px - 1024px
- **Desktop** : 1024px+

## 🔒 Sécurité
- Authentification admin via Clerk
- Validation des formulaires avec Zod
- Protection CSRF
- SQL injection protection (Prisma ORM)
- Headers de sécurité Next.js

## 🧪 Tests
\`\`\`bash
# Tests (à configurer)
npm run test

# Linting
npm run lint
\`\`\`

## 📈 Analytics
Intégrez Google Analytics dans `app/layout.tsx` :
\`\`\`tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  )
}
\`\`\`

## 🤝 Support
Pour toute assistance :
- Email: support@royaleditions.ci
- Téléphone: +225 XX XX XX XX XX

## 📝 Licence
© 2025 Royal Editions. Tous droits réservés.

## 👥 Crédits
- Design & Développement: [Votre nom]
- Framework: Next.js 16
- UI Components: Shadcn UI
- Icons: Lucide React
