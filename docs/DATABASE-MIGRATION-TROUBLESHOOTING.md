# Guide de Dépannage - Migration Base de Données

Ce guide vous aide à résoudre les problèmes courants lors de la migration de votre base de données vers le VPS.

## 📋 Table des Matières

1. [Erreurs de Connexion](#erreurs-de-connexion)
2. [Erreurs SSH](#erreurs-ssh)
3. [Erreurs MySQL](#erreurs-mysql)
4. [Problèmes de Performance](#problèmes-de-performance)
5. [Problèmes de Données](#problèmes-de-données)
6. [Récupération d'Urgence](#récupération-durgence)

---

## 🔌 Erreurs de Connexion

### Erreur: "Can't connect to MySQL server"

**Symptômes:**
```
Error [PrismaClientInitializationError]: Can't reach database server at `178.18.254.232:3306`
```

**Solutions:**

1. **Vérifier que MySQL écoute sur l'IP externe:**

```bash
# Sur le VPS
ssh root@178.18.254.232
mysql -u root -p
SHOW VARIABLES LIKE 'bind_address';
```

Si `bind_address = 127.0.0.1`, MySQL n'accepte que les connexions locales.

**Correction:**
```bash
# Éditer la configuration MySQL
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Chercher et modifier:
bind-address = 0.0.0.0
# ou
bind-address = 178.18.254.232

# Redémarrer MySQL
sudo systemctl restart mysql
```

2. **Vérifier le pare-feu:**

```bash
# Vérifier si le port 3306 est ouvert
sudo ufw status

# Ouvrir le port si nécessaire (ATTENTION: risque de sécurité)
sudo ufw allow from YOUR_IP_ADDRESS to any port 3306

# Meilleure pratique: utiliser uniquement SSH tunnel
```

3. **Utiliser un tunnel SSH (Recommandé):**

```bash
# Créer un tunnel SSH (dans un terminal séparé)
ssh -L 3307:localhost:3306 root@178.18.254.232

# Puis utiliser localhost:3307 au lieu de l'IP distante
TARGET_DATABASE_URL="mysql://user:pass@localhost:3307/royaledition"
```

---

## 🔐 Erreurs SSH

### Erreur: "Permission denied (publickey)"

**Solution:**

```bash
# Vérifier que votre clé SSH est ajoutée
ssh-add -l

# Si vide, ajouter votre clé
ssh-add ~/.ssh/id_rsa

# Ou utiliser le mot de passe
ssh -o PreferredAuthentications=password root@178.18.254.232
```

### Erreur: "Connection timed out"

**Solutions:**

1. Vérifier l'IP du VPS:
```bash
ping 178.18.254.232
```

2. Vérifier le pare-feu local:
```bash
# macOS - vérifier si le pare-feu bloque SSH
sudo pfctl -s rules | grep 22
```

3. Essayer un autre port SSH si changé:
```bash
ssh -p 2222 root@178.18.254.232
```

---

## 🗄️ Erreurs MySQL

### Erreur: "Access denied for user"

**Symptômes:**
```
Error: Access denied for user 'royaledition_user'@'178.18.xxx.xxx'
```

**Solution:**

```bash
# Sur le VPS
mysql -u root -p

# Accorder les droits depuis n'importe quelle IP
GRANT ALL PRIVILEGES ON royaledition.* TO 'royaledition_user'@'%' IDENTIFIED BY 'PASSWORD';
FLUSH PRIVILEGES;

# Ou seulement depuis votre IP (plus sécurisé)
GRANT ALL PRIVILEGES ON royaledition.* TO 'royaledition_user'@'YOUR_IP' IDENTIFIED BY 'PASSWORD';
FLUSH PRIVILEGES;
```

### Erreur: "Table doesn't exist"

**Solution:**

```bash
# Vérifier que la base de données existe
mysql -u root -p -e "SHOW DATABASES;"

# Si elle n'existe pas, la créer
mysql -u root -p -e "CREATE DATABASE royaledition CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Puis réexécuter la migration
```

### Erreur: "Duplicate entry" lors de l'import

**Solution:**

```bash
# Option 1: Vider la base avant import
mysql -u root -p royaledition -e "DROP DATABASE IF EXISTS royaledition; CREATE DATABASE royaledition CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Option 2: Utiliser le script Prisma qui fait des upserts
npm run db:migrate-to-vps
```

---

## ⚡ Problèmes de Performance

### Migration très lente

**Solutions:**

1. **Désactiver les index temporairement:**

```sql
-- Avant l'import
SET FOREIGN_KEY_CHECKS=0;
SET UNIQUE_CHECKS=0;
SET AUTOCOMMIT=0;

-- Après l'import
COMMIT;
SET FOREIGN_KEY_CHECKS=1;
SET UNIQUE_CHECKS=1;
SET AUTOCOMMIT=1;
```

2. **Augmenter les buffers MySQL:**

```bash
# Sur le VPS
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Ajouter/modifier:
max_allowed_packet = 256M
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M

# Redémarrer
sudo systemctl restart mysql
```

3. **Compresser le fichier SQL:**

```bash
# Au lieu de transférer le .sql directement
gzip royaledition_backup.sql
scp royaledition_backup.sql.gz root@178.18.254.232:/tmp/
ssh root@178.18.254.232 "gunzip /tmp/royaledition_backup.sql.gz"
```

### Timeout lors du transfert

**Solution:**

```bash
# Augmenter le timeout SSH
scp -o ServerAliveInterval=60 -o ServerAliveCountMax=3 backup.sql root@178.18.254.232:/tmp/

# Ou utiliser rsync qui reprend en cas d'interruption
rsync -avz --progress backup.sql root@178.18.254.232:/tmp/
```

---

## 📊 Problèmes de Données

### Encodage incorrect (caractères accentués cassés)

**Solution:**

```bash
# Vérifier l'encodage de la base
mysql -u root -p -e "SHOW VARIABLES LIKE 'character_set%';"

# Si pas UTF-8, convertir:
mysql -u root -p
ALTER DATABASE royaledition CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Pour chaque table:
ALTER TABLE Book CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE Category CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
# etc...
```

### Images manquantes après migration

**Problème:** Les chemins d'images pointent vers S3 mais les images n'existent pas.

**Solution:**

1. **Vérifier la configuration AWS S3:**

```bash
# Dans .env sur le VPS
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET_NAME="royaleditions-media"
AWS_REGION="eu-north-1"
```

2. **Migrer les images S3:**

```bash
# Si vous utilisez un nouveau bucket
aws s3 sync s3://old-bucket s3://new-bucket --region eu-north-1

# Ou mettre à jour les URLs dans la base
UPDATE Book SET images = REPLACE(images, 'old-bucket', 'new-bucket');
```

### Relations brisées (Foreign Key Errors)

**Symptômes:**
```
Error: Cannot add or update a child row: a foreign key constraint fails
```

**Solution:**

```bash
# Désactiver temporairement les contraintes
mysql -u root -p royaledition

SET FOREIGN_KEY_CHECKS=0;
SOURCE /tmp/backup.sql;
SET FOREIGN_KEY_CHECKS=1;

# Vérifier l'intégrité après import
SELECT * FROM OrderItem oi 
LEFT JOIN `Order` o ON oi.orderId = o.id 
WHERE o.id IS NULL;  -- Ne devrait rien retourner
```

---

## 🚨 Récupération d'Urgence

### Rollback après migration ratée

**Si vous avez créé un backup avant:**

```bash
# Sur le VPS
mysql -u root -p royaledition < /var/backups/royaledition_before_migration.sql
```

**Si pas de backup:**

```bash
# Refaire la migration depuis le local
./migrate-db-to-vps.sh
```

### Base de données corrompue

**Solution:**

```bash
# Vérifier et réparer
mysqlcheck -u root -p --auto-repair --check --optimize --all-databases

# Ou pour une base spécifique
mysqlcheck -u root -p --auto-repair royaledition
```

### Récupérer depuis le dump

**Si vous avez le fichier .sql:**

```bash
# Créer une nouvelle base
mysql -u root -p -e "DROP DATABASE IF EXISTS royaledition_restore; CREATE DATABASE royaledition_restore;"

# Importer dans la nouvelle base
mysql -u root -p royaledition_restore < backup.sql

# Vérifier que tout est OK, puis renommer
mysql -u root -p
DROP DATABASE royaledition;
RENAME DATABASE royaledition_restore TO royaledition;
```

---

## 🔍 Commandes de Diagnostic

### Vérifier l'état de MySQL

```bash
# État du service
sudo systemctl status mysql

# Logs MySQL
sudo tail -f /var/log/mysql/error.log

# Connexions actives
mysql -u root -p -e "SHOW PROCESSLIST;"

# Espace disque
df -h
du -sh /var/lib/mysql/royaledition
```

### Tester la connexion

```bash
# Depuis le local
mysql -h 178.18.254.232 -u royaledition_user -p royaledition -e "SELECT COUNT(*) FROM Book;"

# Avec Prisma
npx prisma db pull --schema=./prisma/schema-vps.prisma
```

### Comparer les bases (local vs VPS)

```bash
# Compter les enregistrements
mysql -u root -p royaledition -e "
  SELECT 'Books' AS table_name, COUNT(*) AS count FROM Book
  UNION ALL
  SELECT 'Orders', COUNT(*) FROM \`Order\`
  UNION ALL
  SELECT 'Categories', COUNT(*) FROM Category;
"

# Sur le VPS, exécuter la même commande et comparer
```

---

## 📞 Support

Si le problème persiste après avoir essayé ces solutions:

1. **Vérifier les logs:** Consultez les logs MySQL et SSH
2. **Forum Prisma:** [github.com/prisma/prisma/discussions](https://github.com/prisma/prisma/discussions)
3. **Stack Overflow:** Recherchez l'erreur exacte
4. **Contact:** admin@royaleditions.com

---

## 📚 Ressources

- [Documentation MySQL](https://dev.mysql.com/doc/)
- [Guide SSH](https://www.ssh.com/academy/ssh)
- [Prisma Troubleshooting](https://www.prisma.io/docs/guides/database/troubleshooting-orm)
- [Guide Sécurité MySQL](https://dev.mysql.com/doc/refman/8.0/en/security-guidelines.html)
