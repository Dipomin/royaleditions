# Guide de migration de la base de données vers le VPS

## 📦 Migration MySQL : Local → VPS

Ce guide explique comment transférer votre base de données MySQL locale (avec toutes vos données) vers votre VPS.

---

## 🎯 Méthode 1 : Export/Import SQL (RECOMMANDÉ)

### Étape 1 : Exporter la base de données locale

```bash
# Sur votre machine locale
cd /Users/inoverfly/Documents/qg-projects/Royal\ Editions/WEBSITE/dev/royaledition

# Exporter toute la base de données
mysqldump -u royaledition_user -p royaledition > royaledition_backup.sql

# Ou avec mysqldump si installé via Homebrew
/opt/homebrew/bin/mysqldump -u royaledition_user -p royaledition > royaledition_backup.sql

# Alternative : exporter avec compression (recommandé pour grandes bases)
mysqldump -u royaledition_user -p royaledition | gzip > royaledition_backup.sql.gz
```

Entrez le mot de passe : `Logik1981`

### Étape 2 : Vérifier l'export

```bash
# Vérifier que le fichier existe et n'est pas vide
ls -lh royaledition_backup.sql

# Voir les premières lignes
head -20 royaledition_backup.sql

# Compter les tables exportées
grep -c "CREATE TABLE" royaledition_backup.sql
```

### Étape 3 : Transférer vers le VPS

```bash
# Transférer le fichier SQL vers le VPS
scp royaledition_backup.sql user@178.18.254.232:~/

# Ou si compressé
scp royaledition_backup.sql.gz user@178.18.254.232:~/
```

### Étape 4 : Importer sur le VPS

```bash
# Se connecter au VPS
ssh user@178.18.254.232

# Sur le VPS, créer la base de données si elle n'existe pas
sudo mysql -u root << 'EOF'
CREATE DATABASE IF NOT EXISTS royaledition CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'royaledition_user'@'localhost' IDENTIFIED BY 'Logik1981';
GRANT ALL PRIVILEGES ON royaledition.* TO 'royaledition_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# Importer les données
mysql -u royaledition_user -p royaledition < ~/royaledition_backup.sql

# Ou si compressé
gunzip < ~/royaledition_backup.sql.gz | mysql -u royaledition_user -p royaledition

# Vérifier l'import
mysql -u royaledition_user -p royaledition -e "SHOW TABLES;"
```

---

## 🎯 Méthode 2 : Utiliser Prisma (Automatisé)

### Étape 1 : Préparer le VPS

```bash
# Sur le VPS, créer la base de données vide
ssh user@178.18.254.232

sudo mysql -u root << 'EOF'
CREATE DATABASE IF NOT EXISTS royaledition CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'royaledition_user'@'localhost' IDENTIFIED BY 'Logik1981';
GRANT ALL PRIVILEGES ON royaledition.* TO 'royaledition_user'@'localhost';
FLUSH PRIVILEGES;
EOF
```

### Étape 2 : Créer un script de migration

Créez `prisma/migrate-data.ts` :

```typescript
import { PrismaClient } from '@prisma/client'

// Base de données source (locale)
const sourceDb = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://royaledition_user:Logik1981@localhost:3306/royaledition'
    }
  }
})

// Base de données destination (VPS)
const targetDb = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://royaledition_user:Logik1981@178.18.254.232:3306/royaledition'
    }
  }
})

async function migrateData() {
  console.log('🚀 Début de la migration...')

  try {
    // 1. Migrer les catégories
    console.log('📁 Migration des catégories...')
    const categories = await sourceDb.category.findMany()
    for (const category of categories) {
      await targetDb.category.upsert({
        where: { id: category.id },
        update: category,
        create: category,
      })
    }
    console.log(`✓ ${categories.length} catégories migrées`)

    // 2. Migrer les livres
    console.log('📚 Migration des livres...')
    const books = await sourceDb.book.findMany()
    for (const book of books) {
      await targetDb.book.upsert({
        where: { id: book.id },
        update: book,
        create: book,
      })
    }
    console.log(`✓ ${books.length} livres migrés`)

    // 3. Migrer les commandes
    console.log('🛒 Migration des commandes...')
    const orders = await sourceDb.order.findMany({
      include: { items: true }
    })
    for (const order of orders) {
      await targetDb.order.upsert({
        where: { id: order.id },
        update: {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          shippingCity: order.shippingCity,
          shippingArea: order.shippingArea,
          shippingAddress: order.shippingAddress,
          observations: order.observations,
          status: order.status,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        },
        create: {
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          shippingCity: order.shippingCity,
          shippingArea: order.shippingArea,
          shippingAddress: order.shippingAddress,
          observations: order.observations,
          status: order.status,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        },
      })

      // Migrer les items de commande
      for (const item of order.items) {
        await targetDb.orderItem.upsert({
          where: { id: item.id },
          update: item,
          create: item,
        })
      }
    }
    console.log(`✓ ${orders.length} commandes migrées`)

    // 4. Migrer les articles de blog
    console.log('📝 Migration des articles de blog...')
    const blogPosts = await sourceDb.blogPost.findMany()
    for (const post of blogPosts) {
      await targetDb.blogPost.upsert({
        where: { id: post.id },
        update: post,
        create: post,
      })
    }
    console.log(`✓ ${blogPosts.length} articles migrés`)

    // 5. Migrer les pages légales
    console.log('⚖️ Migration des pages légales...')
    const legalPages = await sourceDb.legalPage.findMany()
    for (const page of legalPages) {
      await targetDb.legalPage.upsert({
        where: { id: page.id },
        update: page,
        create: page,
      })
    }
    console.log(`✓ ${legalPages.length} pages légales migrées`)

    // 6. Migrer les conversations de chat
    console.log('💬 Migration des conversations...')
    const conversations = await sourceDb.chatConversation.findMany({
      include: { messages: true }
    })
    for (const conv of conversations) {
      await targetDb.chatConversation.upsert({
        where: { id: conv.id },
        update: {
          visitorId: conv.visitorId,
          visitorName: conv.visitorName,
          visitorEmail: conv.visitorEmail,
          status: conv.status,
          lastMessageAt: conv.lastMessageAt,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        },
        create: {
          id: conv.id,
          visitorId: conv.visitorId,
          visitorName: conv.visitorName,
          visitorEmail: conv.visitorEmail,
          status: conv.status,
          lastMessageAt: conv.lastMessageAt,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        },
      })

      // Migrer les messages
      for (const msg of conv.messages) {
        await targetDb.chatMessage.upsert({
          where: { id: msg.id },
          update: msg,
          create: msg,
        })
      }
    }
    console.log(`✓ ${conversations.length} conversations migrées`)

    console.log('✨ Migration terminée avec succès!')
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    throw error
  } finally {
    await sourceDb.$disconnect()
    await targetDb.$disconnect()
  }
}

migrateData()
```

### Étape 3 : Exécuter la migration

```bash
# Sur votre machine locale
npx tsx prisma/migrate-data.ts
```

---

## 🎯 Méthode 3 : Script automatisé complet

Créez `migrate-to-vps.sh` :

```bash
#!/bin/bash

# Configuration
LOCAL_USER="royaledition_user"
LOCAL_PASS="Logik1981"
LOCAL_DB="royaledition"
VPS_HOST="178.18.254.232"
VPS_USER="votre_user_ssh"
VPS_DB_USER="royaledition_user"
VPS_DB_PASS="Logik1981"
VPS_DB="royaledition"
BACKUP_FILE="royaledition_backup_$(date +%Y%m%d_%H%M%S).sql"

echo "🚀 Début de la migration de la base de données"
echo "=============================================="
echo ""

# 1. Export local
echo "📦 Étape 1/5 : Export de la base de données locale..."
mysqldump -u $LOCAL_USER -p$LOCAL_PASS $LOCAL_DB > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✓ Export réussi : $BACKUP_FILE"
    echo "  Taille : $(ls -lh $BACKUP_FILE | awk '{print $5}')"
else
    echo "❌ Erreur lors de l'export"
    exit 1
fi
echo ""

# 2. Compression
echo "🗜️  Étape 2/5 : Compression du fichier..."
gzip $BACKUP_FILE
BACKUP_FILE="${BACKUP_FILE}.gz"
echo "✓ Fichier compressé : $BACKUP_FILE"
echo "  Taille : $(ls -lh $BACKUP_FILE | awk '{print $5}')"
echo ""

# 3. Transfert vers VPS
echo "📤 Étape 3/5 : Transfert vers le VPS..."
scp $BACKUP_FILE $VPS_USER@$VPS_HOST:~/
if [ $? -eq 0 ]; then
    echo "✓ Transfert réussi"
else
    echo "❌ Erreur lors du transfert"
    exit 1
fi
echo ""

# 4. Import sur VPS
echo "📥 Étape 4/5 : Import sur le VPS..."
ssh $VPS_USER@$VPS_HOST << ENDSSH
    # Décompresser
    gunzip ~/$BACKUP_FILE
    BACKUP_FILE=\${BACKUP_FILE%.gz}
    
    # Créer la base de données si elle n'existe pas
    sudo mysql -u root << 'EOF'
CREATE DATABASE IF NOT EXISTS $VPS_DB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$VPS_DB_USER'@'localhost' IDENTIFIED BY '$VPS_DB_PASS';
GRANT ALL PRIVILEGES ON $VPS_DB.* TO '$VPS_DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF
    
    # Importer
    mysql -u $VPS_DB_USER -p$VPS_DB_PASS $VPS_DB < ~/$BACKUP_FILE
    
    if [ \$? -eq 0 ]; then
        echo "✓ Import réussi"
        # Nettoyer
        rm ~/$BACKUP_FILE
    else
        echo "❌ Erreur lors de l'import"
        exit 1
    fi
ENDSSH
echo ""

# 5. Vérification
echo "✅ Étape 5/5 : Vérification..."
ssh $VPS_USER@$VPS_HOST "mysql -u $VPS_DB_USER -p$VPS_DB_PASS $VPS_DB -e 'SHOW TABLES;'"
echo ""

# Nettoyage local
echo "🧹 Nettoyage..."
rm $BACKUP_FILE

echo ""
echo "✨ Migration terminée avec succès!"
echo "=============================================="
```

Rendez-le exécutable et lancez-le :

```bash
chmod +x migrate-to-vps.sh
./migrate-to-vps.sh
```

---

## 🔍 Vérification après migration

### Sur le VPS

```bash
# Se connecter au VPS
ssh user@178.18.254.232

# Vérifier les tables
mysql -u royaledition_user -p royaledition -e "SHOW TABLES;"

# Vérifier le nombre d'enregistrements
mysql -u royaledition_user -p royaledition << 'EOF'
SELECT 'Books' as Table_Name, COUNT(*) as Count FROM Book
UNION ALL
SELECT 'Categories', COUNT(*) FROM Category
UNION ALL
SELECT 'Orders', COUNT(*) FROM \`Order\`
UNION ALL
SELECT 'BlogPosts', COUNT(*) FROM BlogPost
UNION ALL
SELECT 'LegalPages', COUNT(*) FROM LegalPage;
EOF
```

---

## 🔄 Migration incrémentale (pour mises à jour)

Si vous voulez synchroniser uniquement les nouvelles données :

```bash
# Exporter uniquement les données récentes (exemple : derniers 7 jours)
mysqldump -u royaledition_user -p royaledition \
  --where="createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)" \
  Order OrderItem > recent_orders.sql

# Transférer et importer
scp recent_orders.sql user@178.18.254.232:~/
ssh user@178.18.254.232 "mysql -u royaledition_user -p royaledition < ~/recent_orders.sql"
```

---

## ⚙️ Automatisation avec cron (sauvegardes régulières)

Sur votre machine locale, créez un cron job pour sauvegarder automatiquement :

```bash
# Ouvrir crontab
crontab -e

# Ajouter une ligne pour sauvegarder tous les jours à 2h du matin
0 2 * * * /usr/local/bin/mysqldump -u royaledition_user -pLogik1981 royaledition | gzip > ~/backups/royaledition_$(date +\%Y\%m\%d).sql.gz
```

---

## 🚨 Résolution de problèmes

### Erreur "Access denied"

```bash
# Vérifier les permissions
sudo mysql -u root
SHOW GRANTS FOR 'royaledition_user'@'localhost';
```

### Erreur "Unknown database"

```bash
# Créer la base de données
sudo mysql -u root -e "CREATE DATABASE royaledition CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Import très lent

```bash
# Désactiver temporairement les checks pour accélérer
mysql -u royaledition_user -p royaledition << 'EOF'
SET FOREIGN_KEY_CHECKS=0;
SET UNIQUE_CHECKS=0;
SOURCE ~/royaledition_backup.sql;
SET FOREIGN_KEY_CHECKS=1;
SET UNIQUE_CHECKS=1;
EOF
```

### Problème d'encodage

```bash
# Forcer UTF-8 lors de l'import
mysql -u royaledition_user -p --default-character-set=utf8mb4 royaledition < royaledition_backup.sql
```

---

## 📋 Checklist finale

- [ ] Base de données locale exportée
- [ ] Fichier SQL transféré sur le VPS
- [ ] Base de données créée sur le VPS
- [ ] Données importées avec succès
- [ ] Nombre d'enregistrements vérifié (local vs VPS)
- [ ] Application Next.js testée avec la BDD du VPS
- [ ] Fichier de backup conservé localement
- [ ] Variables `.env` mises à jour sur le VPS

---

## 🔐 Sécurité

⚠️ **Important** :
- Ne commitez JAMAIS les fichiers de backup SQL dans Git
- Chiffrez les backups si vous les stockez dans le cloud
- Changez les mots de passe après la migration
- Restreignez l'accès SSH au VPS
- Utilisez des connexions SSH avec clé plutôt que mot de passe

---

## 📚 Ressources

- Documentation Prisma : https://www.prisma.io/docs
- Guide mysqldump : https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html
- Tutoriel MySQL : https://www.mysqltutorial.org/
