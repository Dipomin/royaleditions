# Changelog - Royal Editions

Toutes les modifications importantes du projet sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Versionnement Sémantique](https://semver.org/lang/fr/).

---

## [1.3.0] - 2025-01-XX

### ✨ Ajouté

#### Système de Migration Base de Données
- **Script shell automatisé** (`migrate-db-to-vps.sh`) pour migration complète
  - Export automatique avec mysqldump
  - Compression gzip pour optimiser le transfert
  - Transfert sécurisé via SCP
  - Import automatique sur le VPS distant
  - Vérification d'intégrité des données
  - Nettoyage automatique des fichiers temporaires
  
- **Script Prisma TypeScript** (`prisma/migrate-data.ts`)
  - Migration granulaire par table avec barres de progression
  - Gestion des relations (cascade sur OrderItem, ChatMessage)
  - Upserts pour éviter les doublons
  - Support de toutes les tables (Book, Order, Blog, Legal, Chat, Testimonial)

- **Documentation complète migration**
  - Guide principal: `docs/DATABASE-MIGRATION.md` (3 méthodes détaillées)
  - Guide dépannage: `docs/DATABASE-MIGRATION-TROUBLESHOOTING.md`
  - Fichier config: `.env.migration.example`
  - Scripts NPM: `npm run db:migrate-to-vps` et `npm run db:export`

#### Système Email
- **Guide configuration VPS email** (`docs/VPS-EMAIL-SETUP.md`)
  - Installation Mail-in-a-Box (solution recommandée)
  - Configuration services SMTP tiers (SendGrid, Mailgun, etc.)
  - Configuration DNS (MX, SPF, DKIM, DMARC)
  - Guide création comptes email
  
- **Script diagnostic** (`check-mail-system.sh`)
  - Vérification Postfix, Dovecot, webmail
  - Test envoi email
  - Vérification ports SMTP (25, 587, 465)
  - Diagnostic DNS
  
- **Guide SMTP** (`docs/SMTP-CONFIGURATION.md`)
  - Configuration nodemailer détaillée
  - Exemples pour différents fournisseurs
  - Section dépannage complète

#### Pages Légales
- **Modèle Prisma** (`LegalPage`)
  - Champs: slug, title, content, published
  - Index unique sur slug
  - Timestamps automatiques
  
- **API Routes**
  - GET/POST `/api/legal` - Liste et création
  - GET/PATCH/DELETE `/api/legal/[id]` - Opérations individuelles
  
- **Pages publiques**
  - `/conditions-generales` - CGV complètes (11 sections)
  - `/politique-confidentialite` - Politique RGPD (10 sections)
  - `/mentions-legales` - Mentions légales
  
- **Interface admin**
  - Éditeur riche avec TipTap
  - Interface à onglets (CGV / Confidentialité)
  - Sauvegarde en temps réel avec notifications
  
- **Validation checkout**
  - Case à cocher CGV obligatoire
  - Validation Zod avec message d'erreur en français
  - Lien direct vers les CGV

#### Formulaire de Contact
- **Conversion page contact en formulaire interactif**
  - React Hook Form avec validation Zod
  - États de chargement et messages de succès
  - Bannière de confirmation avec auto-masquage
  
- **API email** (`/api/contact`)
  - Intégration nodemailer
  - Template HTML avec branding Royal Editions
  - Gestion erreurs complète
  - Variables env SMTP_*

#### Documentation Améliorée
- **README.md** - Section migration BDD ajoutée
- **DOCS-INDEX.md** - Références migration et email
- **package.json** - Scripts NPM pour migration
- **.env.example** - Variables SMTP ajoutées

### 🔧 Modifié

- **Footer** - Déjà contenait les liens légaux (aucune modification nécessaire)
- **Middleware** - Routes `/conditions-generales`, `/politique-confidentialite`, `/mentions-legales` ajoutées comme publiques
- **Admin Nav** - Lien "Pages Légales" ajouté avec icône Scale
- **Schema Prisma** - Ajout modèle LegalPage et Testimonial

### 🐛 Corrigé

- **Connexion base de données** - Migration de VPS distant vers MySQL local
  - Installation MySQL via Homebrew
  - Création utilisateur et base locale
  - Mise à jour DATABASE_URL vers localhost:3306
  
- **Erreurs TypeScript** - Composant admin/legal/page.tsx
  - Correction import dynamique → import direct
  - Typage paramètre value (string | boolean)
  
- **Warnings lint** - Suppression imports inutilisés (Phone icon)

### 📚 Documentation

- `docs/DATABASE-MIGRATION.md` (520+ lignes)
- `docs/DATABASE-MIGRATION-TROUBLESHOOTING.md` (350+ lignes)
- `docs/VPS-EMAIL-SETUP.md` (400+ lignes)
- `docs/SMTP-CONFIGURATION.md` (250+ lignes)
- `.env.migration.example` - Template configuration migration
- `DOCS-INDEX.md` - Mise à jour avec nouvelles ressources

---

## [1.2.0] - 2025-01-XX

### ✨ Ajouté

- **AI Coding Instructions** (`.github/copilot-instructions.md`)
  - Guide complet pour agents IA (196 lignes)
  - Architecture et patterns du projet
  - Gotchas spécifiques (parsing images, singleton Prisma)
  - Conventions et workflows

### 🔧 Modifié

- **Configuration développement** - Migration vers base de données locale
  - Meilleure isolation développement/production
  - Pas de dépendance réseau VPS

---

## [1.1.0] - 2025-01-XX

### ✨ Ajouté

- **Système de chat en direct** avec interface admin
- **Analytics** - Google Analytics et Meta Pixel
- **Marketing widgets**
  - Notifications d'achat en temps réel
  - Indicateurs de popularité
  - Badges de confiance
  
- **Tests de produit** - Système de reviews avec notes

### 🔧 Modifié

- **Page produit** - Barre sticky avec CTA "Ajouter au panier"
- **Images** - Optimisation chargement avec Next.js Image
- **SEO** - Meta tags dynamiques, Open Graph, schema.org

---

## [1.0.0] - 2025-01-XX

### ✨ Version Initiale

#### Fonctionnalités E-Commerce
- **Catalogue de livres** avec filtres par catégorie
- **Panier d'achat** persistant (Zustand + localStorage)
- **Checkout** - Formulaire complet avec validation
- **Paiement à la livraison** - Pas de passerelle de paiement
- **Gestion des commandes** - Système de statuts

#### Dashboard Administrateur
- **Authentification Clerk** - Locale française (frFR)
- **CRUD Livres** - Upload multi-images S3
- **CRUD Catégories** - Gestion simple
- **Gestion Commandes** - Vue détaillée, changement statuts
- **Blog** - Éditeur TipTap avec images
- **Analytics** - Statistiques ventes et revenus

#### Technique
- **Next.js 16** - App Router, React 19
- **Prisma ORM** - MySQL avec 5 modèles initiaux
- **AWS S3** - Stockage images avec CloudFront
- **Tailwind CSS v4** - Design system custom
- **Shadcn UI** - Composants réutilisables
- **PM2** - Déploiement production (cluster mode)

#### Pages Publiques
- Page d'accueil avec carousel
- Boutique avec pagination
- Pages produit détaillées
- À propos
- Contact
- FAQ
- Blog

#### Déploiement
- Scripts automatisés (`deploy.sh`, `install-vps.sh`)
- Configuration Nginx
- SSL/TLS avec Certbot
- Documentation complète (VPS neuf, VPS existant)

---

## Types de Changements

- **✨ Ajouté** - Nouvelles fonctionnalités
- **🔧 Modifié** - Changements de fonctionnalités existantes
- **🗑️ Déprécié** - Fonctionnalités bientôt supprimées
- **🐛 Corrigé** - Corrections de bugs
- **🔒 Sécurité** - Corrections de vulnérabilités
- **📚 Documentation** - Changements documentation uniquement
- **⚡ Performance** - Améliorations de performance

---

## Roadmap

### Version 1.4.0 (À venir)

- [ ] Système de newsletter
- [ ] Wishlist utilisateur
- [ ] Codes promo et réductions
- [ ] Export commandes PDF
- [ ] Notifications push admin
- [ ] Multi-devise (FCFA/EUR/USD)
- [ ] Traduction EN/FR
- [ ] Mode sombre

### Version 2.0.0 (Futur)

- [ ] Paiement en ligne (Orange Money, MTN Mobile Money)
- [ ] Espace client (historique commandes)
- [ ] Système de recommandations
- [ ] Programme de fidélité
- [ ] API REST publique
- [ ] Application mobile (React Native)

---

**Mainteneur:** Royal Editions Team  
**Contact:** admin@royaleditions.com  
**Repository:** [Dipomin/royaleditions](https://github.com/Dipomin/royaleditions)
