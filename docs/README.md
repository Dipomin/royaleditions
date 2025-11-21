# 📚 Documentation Royal Editions

Bienvenue dans la documentation complète du projet Royal Editions.

---

## 🎯 Navigation Rapide

### Pour Migrer vers la Production
👉 **[MIGRATION-CHECKLIST.md](../MIGRATION-CHECKLIST.md)** - Checklist pas à pas complète  
👉 **[MIGRATION-SUMMARY.md](../MIGRATION-SUMMARY.md)** - Résumé de la migration

### Pour la Base de Données
👉 **[DATABASE-MIGRATION.md](./DATABASE-MIGRATION.md)** - Guide migration BDD  
👉 **[DATABASE-MIGRATION-TROUBLESHOOTING.md](./DATABASE-MIGRATION-TROUBLESHOOTING.md)** - Dépannage

### Pour le Système Email
👉 **[VPS-EMAIL-SETUP.md](./VPS-EMAIL-SETUP.md)** - Installation email VPS  
👉 **[SMTP-CONFIGURATION.md](./SMTP-CONFIGURATION.md)** - Configuration SMTP

---

## 📖 Documentation par Catégorie

### 🚀 Déploiement & Infrastructure

| Document | Description | Niveau |
|----------|-------------|--------|
| [MIGRATION-CHECKLIST.md](../MIGRATION-CHECKLIST.md) | Checklist complète de migration (600+ lignes) | ⭐⭐⭐ |
| [DEPLOYMENT-VPS.md](../DEPLOYMENT-VPS.md) | Installation VPS neuf | ⭐⭐⭐ |
| [DEPLOYMENT-EXISTING-VPS.md](../DEPLOYMENT-EXISTING-VPS.md) | Déploiement VPS existant | ⭐⭐ |
| [QUICK-START-VPS.md](../QUICK-START-VPS.md) | Setup rapide 10 minutes | ⭐ |
| [DEPLOYMENT-SCRIPTS.md](../DEPLOYMENT-SCRIPTS.md) | Documentation des scripts | ⭐⭐ |

### 🗄️ Base de Données

| Document | Description | Lignes |
|----------|-------------|--------|
| [DATABASE-MIGRATION.md](./DATABASE-MIGRATION.md) | Guide migration complet (3 méthodes) | 520+ |
| [DATABASE-MIGRATION-TROUBLESHOOTING.md](./DATABASE-MIGRATION-TROUBLESHOOTING.md) | Résolution erreurs migration | 350+ |

**Scripts disponibles:**
- `migrate-db-to-vps.sh` - Migration automatisée
- `prisma/migrate-data.ts` - Migration TypeScript
- `npm run db:migrate-to-vps` - Commande NPM

### 📧 Système Email

| Document | Description | Lignes |
|----------|-------------|--------|
| [VPS-EMAIL-SETUP.md](./VPS-EMAIL-SETUP.md) | Installation Mail-in-a-Box & SMTP | 400+ |
| [SMTP-CONFIGURATION.md](./SMTP-CONFIGURATION.md) | Configuration nodemailer | 250+ |

**Scripts disponibles:**
- `check-mail-system.sh` - Diagnostic système email

### 🎨 Fonctionnalités & Marketing

| Document | Description |
|----------|-------------|
| [MARKETING-FEATURES.md](./MARKETING-FEATURES.md) | Widgets marketing (notifications, chat) |
| [ANALYTICS-SETUP.md](./ANALYTICS-SETUP.md) | Google Analytics & Meta Pixel |
| [CHAT-SYSTEM.md](./CHAT-SYSTEM.md) | Système de chat en direct |
| [PRODUCT-PAGE-IMPROVEMENTS.md](./PRODUCT-PAGE-IMPROVEMENTS.md) | Améliorations page produit |

### ☁️ Services Cloud

| Document | Description |
|----------|-------------|
| [AWS-S3-CONFIGURATION.md](./AWS-S3-CONFIGURATION.md) | Configuration stockage images |
| [IMAGE-MANAGER-GUIDE.md](./IMAGE-MANAGER-GUIDE.md) | Gestionnaire d'images admin |

### 💻 Développement

| Document | Description |
|----------|-------------|
| [DOCUMENTATION.md](../DOCUMENTATION.md) | Architecture technique complète |
| [README.md](../README.md) | Guide démarrage développement |
| [GUIDE-CLERK-ADMIN.md](../GUIDE-CLERK-ADMIN.md) | Configuration authentification |
| [IMPLEMENTATION-SUMMARY.md](./IMPLEMENTATION-SUMMARY.md) | Résumé implémentations |

---

## 🔍 Index par Sujet

### Migration & Production
- Checklist migration: [MIGRATION-CHECKLIST.md](../MIGRATION-CHECKLIST.md)
- Résumé migration: [MIGRATION-SUMMARY.md](../MIGRATION-SUMMARY.md)
- Migration BDD: [DATABASE-MIGRATION.md](./DATABASE-MIGRATION.md)
- Dépannage BDD: [DATABASE-MIGRATION-TROUBLESHOOTING.md](./DATABASE-MIGRATION-TROUBLESHOOTING.md)
- Email VPS: [VPS-EMAIL-SETUP.md](./VPS-EMAIL-SETUP.md)
- SMTP: [SMTP-CONFIGURATION.md](./SMTP-CONFIGURATION.md)

### Configuration & Setup
- VPS neuf: [DEPLOYMENT-VPS.md](../DEPLOYMENT-VPS.md)
- VPS existant: [DEPLOYMENT-EXISTING-VPS.md](../DEPLOYMENT-EXISTING-VPS.md)
- Quick Start: [QUICK-START-VPS.md](../QUICK-START-VPS.md)
- Scripts: [DEPLOYMENT-SCRIPTS.md](../DEPLOYMENT-SCRIPTS.md)
- AWS S3: [AWS-S3-CONFIGURATION.md](./AWS-S3-CONFIGURATION.md)

### Fonctionnalités
- Marketing: [MARKETING-FEATURES.md](./MARKETING-FEATURES.md)
- Analytics: [ANALYTICS-SETUP.md](./ANALYTICS-SETUP.md)
- Chat: [CHAT-SYSTEM.md](./CHAT-SYSTEM.md)
- Images: [IMAGE-MANAGER-GUIDE.md](./IMAGE-MANAGER-GUIDE.md)
- Admin: [GUIDE-CLERK-ADMIN.md](../GUIDE-CLERK-ADMIN.md)

### Architecture & Dev
- Architecture: [DOCUMENTATION.md](../DOCUMENTATION.md)
- Dev local: [README.md](../README.md)
- Changelog: [CHANGELOG.md](../CHANGELOG.md)

---

## 📊 Statistiques de la Documentation

### Fichiers de Documentation
- **25+ fichiers** markdown
- **5 scripts** exécutables
- **4000+ lignes** de documentation
- **100+ commandes** documentées
- **50+ cas d'usage** couverts

### Guides Complets
- ✅ Migration complète (MIGRATION-CHECKLIST.md - 600 lignes)
- ✅ Migration BDD (DATABASE-MIGRATION.md - 520 lignes)
- ✅ Dépannage BDD (DATABASE-MIGRATION-TROUBLESHOOTING.md - 350 lignes)
- ✅ Email VPS (VPS-EMAIL-SETUP.md - 400 lignes)
- ✅ SMTP (SMTP-CONFIGURATION.md - 250 lignes)

### Scripts Disponibles
```bash
# Migration
./migrate-db-to-vps.sh              # Migration BDD automatisée
npm run db:migrate-to-vps           # Migration Prisma TypeScript
npm run db:export                   # Export shell

# Email
./check-mail-system.sh              # Diagnostic email VPS

# Déploiement
./deploy.sh production              # Déploiement automatisé
./install-vps.sh                    # Installation VPS neuf
./quick-setup.sh                    # Setup rapide VPS existant

# Base de données
npm run db:push                     # Sync schema
npm run db:seed                     # Seed data
npm run db:studio                   # Prisma Studio
```

---

## 🎓 Parcours d'Apprentissage

### Débutant - Je découvre le projet

1. Lire [README.md](../README.md) - Vue d'ensemble (10 min)
2. Lire [DOCUMENTATION.md](../DOCUMENTATION.md) - Architecture (20 min)
3. Installer localement (suivre README.md)

### Intermédiaire - Je veux déployer

1. Lire [MIGRATION-SUMMARY.md](../MIGRATION-SUMMARY.md) - Aperçu (10 min)
2. Lire [MIGRATION-CHECKLIST.md](../MIGRATION-CHECKLIST.md) - Checklist complète (30 min)
3. Suivre la checklist étape par étape

### Avancé - Je personnalise

1. Lire [DEPLOYMENT-SCRIPTS.md](../DEPLOYMENT-SCRIPTS.md) - Comprendre les scripts
2. Modifier les scripts selon besoins
3. Personnaliser la configuration

---

## 🔧 Maintenance & Troubleshooting

### Problèmes Fréquents

| Problème | Solution |
|----------|----------|
| Migration BDD échoue | [DATABASE-MIGRATION-TROUBLESHOOTING.md](./DATABASE-MIGRATION-TROUBLESHOOTING.md) |
| Email ne fonctionne pas | [SMTP-CONFIGURATION.md](./SMTP-CONFIGURATION.md) - Dépannage |
| Erreur 502 Nginx | [DEPLOYMENT-VPS.md](../DEPLOYMENT-VPS.md) - Dépannage |
| PM2 crash | [DEPLOYMENT-SCRIPTS.md](../DEPLOYMENT-SCRIPTS.md) - Troubleshooting |
| Images ne chargent pas | [AWS-S3-CONFIGURATION.md](./AWS-S3-CONFIGURATION.md) |

### Commandes de Diagnostic

```bash
# Application
pm2 logs royal-editions --lines 100
pm2 monit
pm2 describe royal-editions

# Nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log

# MySQL
mysql -u royaledition_user -p royaledition -e "SHOW TABLES;"
sudo tail -f /var/log/mysql/error.log

# Système
df -h                          # Espace disque
free -h                        # Mémoire
top                            # Processus
```

---

## 📦 Templates & Configuration

### Fichiers de Configuration

```
.env.example                   # Variables d'environnement générales
.env.vps.example              # Variables pour VPS multi-app
.env.migration.example        # Variables pour migration BDD
ecosystem.config.js           # Configuration PM2
prisma/schema.prisma          # Schema base de données
next.config.ts               # Configuration Next.js
```

### Scripts Shell

```
migrate-db-to-vps.sh         # Migration BDD automatisée
check-mail-system.sh         # Diagnostic email
deploy.sh                    # Déploiement automatisé
install-vps.sh              # Installation VPS neuf
quick-setup.sh              # Setup rapide
```

### Scripts Prisma

```
prisma/seed.ts              # Seed données
prisma/migrate-data.ts      # Migration TypeScript
prisma/seed-legal.ts        # Seed pages légales
```

---

## 🆘 Support & Contact

### Documentation Officielle
- **Index principal:** [DOCS-INDEX.md](../DOCS-INDEX.md)
- **Changelog:** [CHANGELOG.md](../CHANGELOG.md)

### Communauté
- **GitHub:** [Dipomin/royaleditions](https://github.com/Dipomin/royaleditions)
- **Email:** admin@royaleditions.com

### Ressources Externes
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [PM2 Documentation](https://pm2.keymetrics.io/docs)

---

## 🎯 Quick Links

| Action | Lien |
|--------|------|
| Migrer vers VPS | [MIGRATION-CHECKLIST.md](../MIGRATION-CHECKLIST.md) |
| Migrer BDD | [DATABASE-MIGRATION.md](./DATABASE-MIGRATION.md) |
| Configurer Email | [VPS-EMAIL-SETUP.md](./VPS-EMAIL-SETUP.md) |
| Dépannage BDD | [DATABASE-MIGRATION-TROUBLESHOOTING.md](./DATABASE-MIGRATION-TROUBLESHOOTING.md) |
| Installer VPS neuf | [DEPLOYMENT-VPS.md](../DEPLOYMENT-VPS.md) |
| Setup rapide VPS | [QUICK-START-VPS.md](../QUICK-START-VPS.md) |

---

**Dernière mise à jour:** Janvier 2025  
**Version:** 1.3.0  
**Projet:** Royal Editions E-Commerce Platform

---

*Cette documentation est maintenue activement. Pour toute question ou suggestion d'amélioration, contactez-nous à admin@royaleditions.com*
