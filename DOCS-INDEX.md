# 📚 Index de Documentation - Royal Editions

Guide complet pour choisir la bonne documentation selon votre situation.

---

## 🎯 Quelle Documentation Utiliser ?

### Vous avez un VPS qui héberge déjà d'autres applications ?
👉 **[QUICK-START-VPS.md](./QUICK-START-VPS.md)** - Setup en 5 minutes  
📖 Guide détaillé : [DEPLOYMENT-EXISTING-VPS.md](./DEPLOYMENT-EXISTING-VPS.md)

### Vous avez un VPS neuf (Ubuntu/Debian) ?
👉 **[DEPLOYMENT-VPS.md](./DEPLOYMENT-VPS.md)** - Installation complète

### Vous voulez comprendre les scripts ?
👉 **[DEPLOYMENT-SCRIPTS.md](./DEPLOYMENT-SCRIPTS.md)** - Documentation des scripts

### Vous développez localement ?
👉 **[README.md](./README.md)** - Guide de démarrage développement

---

## 📖 Documentation par Cas d'Usage

### 🚀 Déploiement Production

| Situation | Guide | Temps | Difficulté |
|-----------|-------|-------|------------|
| VPS avec apps existantes | [QUICK-START-VPS.md](./QUICK-START-VPS.md) | 10 min | ⭐⭐ |
| VPS neuf | [DEPLOYMENT-VPS.md](./DEPLOYMENT-VPS.md) | 30 min | ⭐⭐⭐ |
| Vercel (PaaS) | [README.md](./README.md#déploiement) | 5 min | ⭐ |

### 🔧 Configuration & Maintenance

| Besoin | Document | Description |
|--------|----------|-------------|
| Scripts de déploiement | [DEPLOYMENT-SCRIPTS.md](./DEPLOYMENT-SCRIPTS.md) | Doc complète de tous les scripts |
| Migration BDD | [docs/DATABASE-MIGRATION.md](./docs/DATABASE-MIGRATION.md) | Guide migration locale → VPS |
| Dépannage migration | [docs/DATABASE-MIGRATION-TROUBLESHOOTING.md](./docs/DATABASE-MIGRATION-TROUBLESHOOTING.md) | Résolution erreurs migration |
| Configuration email | [docs/VPS-EMAIL-SETUP.md](./docs/VPS-EMAIL-SETUP.md) | Installation système email |
| SMTP | [docs/SMTP-CONFIGURATION.md](./docs/SMTP-CONFIGURATION.md) | Configuration nodemailer |
| Variables d'environnement | [.env.example](./.env.example) | Template général |
| Variables VPS | [.env.vps.example](./.env.vps.example) | Template multi-app |
| Variables migration | [.env.migration.example](./.env.migration.example) | Template migration BDD |
| Configuration PM2 | [ecosystem.config.js](./ecosystem.config.js) | Config process manager |

### 💻 Développement

| Besoin | Document |
|--------|----------|
| Installation locale | [README.md](./README.md) |
| Architecture technique | [DOCUMENTATION.md](./DOCUMENTATION.md) |
| Guide admin | [GUIDE-CLERK-ADMIN.md](./GUIDE-CLERK-ADMIN.md) |

---

## 🎓 Parcours Recommandés

### Débutant - Première Installation

1. **Choisir votre infrastructure**
   - VPS existant → [QUICK-START-VPS.md](./QUICK-START-VPS.md)
   - VPS neuf → [DEPLOYMENT-VPS.md](./DEPLOYMENT-VPS.md)
   - Cloud (Vercel) → [README.md](./README.md#déploiement)

2. **Suivre le guide étape par étape**

3. **Tester l'application**

4. **Configurer les sauvegardes** (voir guide correspondant)

### Intermédiaire - Gestion Quotidienne

1. Lire [DEPLOYMENT-SCRIPTS.md](./DEPLOYMENT-SCRIPTS.md) section "Commandes Utiles"

2. Utiliser `./deploy.sh production` pour les mises à jour

3. Monitorer avec `pm2 monit`

### Avancé - Personnalisation

1. Lire [DOCUMENTATION.md](./DOCUMENTATION.md) pour l'architecture

2. Modifier `ecosystem.config.js` selon vos besoins

3. Personnaliser les scripts de déploiement

---

## 🔍 Recherche Rapide

### Problèmes Courants

| Problème | Solution |
|----------|----------|
| Port déjà utilisé | [DEPLOYMENT-EXISTING-VPS.md](./DEPLOYMENT-EXISTING-VPS.md#port-déjà-utilisé) |
| Erreur 502 Nginx | [DEPLOYMENT-VPS.md](./DEPLOYMENT-VPS.md#problème-erreur-502-bad-gateway) |
| PM2 ne démarre pas | [DEPLOYMENT-SCRIPTS.md](./DEPLOYMENT-SCRIPTS.md#pm2-ne-trouve-pas-lapplication) |
| Base de données inaccessible | [DEPLOYMENT-VPS.md](./DEPLOYMENT-VPS.md#problème-erreur-de-connexion-à-la-base-de-données) |
| Images ne s'affichent pas | [DEPLOYMENT-VPS.md](./DEPLOYMENT-VPS.md#problème-images-ne-saffichent-pas) |
| Erreur migration BDD | [docs/DATABASE-MIGRATION-TROUBLESHOOTING.md](./docs/DATABASE-MIGRATION-TROUBLESHOOTING.md) |
| MySQL non accessible | [docs/DATABASE-MIGRATION-TROUBLESHOOTING.md](./docs/DATABASE-MIGRATION-TROUBLESHOOTING.md#erreurs-de-connexion) |
| Email ne s'envoie pas | [docs/SMTP-CONFIGURATION.md](./docs/SMTP-CONFIGURATION.md#dépannage) |

### Commandes Fréquentes

```bash
# Déploiement
cd ~/royal-editions && ./deploy.sh production

# Voir les logs
pm2 logs royal-editions

# Redémarrer
pm2 restart royal-editions

# Monitoring
pm2 monit

# Backup DB manuelle
mysqldump -u royaledition_user -p royaledition > backup.sql

# Migration BDD vers VPS
./migrate-db-to-vps.sh
# ou
npm run db:migrate-to-vps

# Vérifier système email VPS
./check-mail-system.sh
```

---

## 📦 Liste Complète des Fichiers

### Scripts Exécutables
- `deploy.sh` - Déploiement automatisé
- `install-vps.sh` - Installation VPS neuf
- `quick-setup.sh` - Setup interactif VPS existant
- `migrate-db-to-vps.sh` - Migration base de données
- `check-mail-system.sh` - Diagnostic système email (si installé)
- `check-email-compatibility.sh` - Vérification compatibilité email VPS

### Configuration
- `.env.example` - Template général
- `.env.vps.example` - Template multi-app
- `.env.migration.example` - Template migration BDD
- `ecosystem.config.js` - Configuration PM2
- `next.config.ts` - Configuration Next.js
- `tsconfig.json` - Configuration TypeScript
- `prisma/schema.prisma` - Schema base de données
- `prisma/migrate-data.ts` - Script Prisma migration

### Documentation Principale
- `README.md` - Documentation principale
- `QUICK-START-VPS.md` - Guide rapide VPS existant ⭐
- `DEPLOYMENT-EXISTING-VPS.md` - Guide complet VPS existant
- `DEPLOYMENT-VPS.md` - Guide installation VPS neuf
- `DEPLOYMENT-SCRIPTS.md` - Documentation des scripts
- `DOCUMENTATION.md` - Architecture technique
- `GUIDE-CLERK-ADMIN.md` - Configuration authentification

### Documentation Spécialisée (docs/)
- `docs/DATABASE-MIGRATION.md` - Guide migration BDD ⭐
- `docs/DATABASE-MIGRATION-TROUBLESHOOTING.md` - Dépannage migration
- `docs/VPS-EMAIL-SETUP.md` - Installation système email
- `docs/SMTP-CONFIGURATION.md` - Configuration SMTP
- `docs/AWS-S3-CONFIGURATION.md` - Configuration stockage images
- `docs/ANALYTICS-SETUP.md` - Google Analytics & Meta Pixel
- `docs/CHAT-SYSTEM.md` - Système de chat en direct
- `docs/MARKETING-FEATURES.md` - Fonctionnalités marketing

---

## 🎯 Quick Links par Rôle

### Développeur Backend
- [DOCUMENTATION.md](./DOCUMENTATION.md) - Architecture
- [prisma/schema.prisma](./prisma/schema.prisma) - Schema DB
- [README.md](./README.md) - Installation locale

### DevOps / SysAdmin
- [DEPLOYMENT-SCRIPTS.md](./DEPLOYMENT-SCRIPTS.md) - Scripts
- [DEPLOYMENT-VPS.md](./DEPLOYMENT-VPS.md) - Installation serveur
- [ecosystem.config.js](./ecosystem.config.js) - Config PM2

### Propriétaire de Projet
- [QUICK-START-VPS.md](./QUICK-START-VPS.md) - Déploiement rapide
- [README.md](./README.md) - Vue d'ensemble

---

## 🆘 Besoin d'Aide ?

1. **Consultez la section "Dépannage"** du guide correspondant
2. **Vérifiez les logs**:
   ```bash
   pm2 logs royal-editions --lines 50
   tail -f ~/deploy-royaledition.log
   sudo tail -f /var/log/nginx/royaleditions-error.log
   ```
3. **Recherchez dans cette documentation** avec Ctrl+F

---

## 📞 Contact

- Email: contact@royaleditions.ci
- GitHub: [Dipomin/royaleditions](https://github.com/Dipomin/royaleditions)

---

**Dernière mise à jour:** Novembre 2025  
**Version:** 1.0.0
