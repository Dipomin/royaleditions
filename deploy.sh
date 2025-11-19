#!/bin/bash

###############################################################################
# Script de Déploiement Automatisé - Royal Editions
# Usage: ./deploy.sh [production|staging] [app_directory]
# Exemple: ./deploy.sh production /home/deploy/royal-editions
###############################################################################

set -e  # Arrêter le script en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
APP_DIR=${2:-$(pwd)}  # Utilise le répertoire courant si non spécifié
APP_NAME="royal-editions"
BACKUP_DIR="${HOME}/backups/royaledition"
LOG_FILE="${HOME}/deploy-royaledition.log"

# Détection automatique du user home
USER_HOME=$(eval echo ~${SUDO_USER:-$USER})

# Créer les dossiers nécessaires s'ils n'existent pas
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

# Fonction pour logger
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    echo "[ERROR] $1" >> "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    echo "[WARNING] $1" >> "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║        ROYAL EDITIONS - SCRIPT DE DÉPLOIEMENT        ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

log "Début du déploiement - Environnement: $ENVIRONMENT"
log "Répertoire de l'application: $APP_DIR"
log "Répertoire de backup: $BACKUP_DIR"

# Vérifier si on est sur le bon serveur
if [ ! -d "$APP_DIR" ]; then
    error "Le répertoire $APP_DIR n'existe pas. Spécifiez le bon chemin: ./deploy.sh $ENVIRONMENT /chemin/vers/app"
fi

# Vérifier les droits
if [ ! -w "$APP_DIR" ]; then
    error "Vous n'avez pas les droits d'écriture sur $APP_DIR"
fi

# Vérifier que c'est bien un projet Next.js
if [ ! -f "$APP_DIR/package.json" ]; then
    error "package.json introuvable dans $APP_DIR. Est-ce le bon répertoire ?"
fi

# Vérifier que PM2 est installé
if ! command -v pm2 &> /dev/null; then
    warning "PM2 n'est pas installé. Installation..."
    npm install -g pm2 || error "Impossible d'installer PM2"
fi

# Détecter le port utilisé (depuis .env ou ecosystem.config.js)
APP_PORT=3000
if [ -f "$APP_DIR/.env" ]; then
    ENV_PORT=$(grep -E "^PORT=" "$APP_DIR/.env" | cut -d'=' -f2 | tr -d ' "'"'" || echo "")
    if [ ! -z "$ENV_PORT" ]; then
        APP_PORT=$ENV_PORT
    fi
fi

log "Port détecté: $APP_PORT"

# 1. Backup de la base de données
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Étape 1/10: Backup de la base de données..."
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Charger les variables d'environnement pour obtenir les credentials DB
if [ -f "$APP_DIR/.env" ]; then
    export $(cat "$APP_DIR/.env" | grep -v '^#' | xargs)
else
    warning "Fichier .env introuvable, backup de la base ignoré"
fi

# Extraire les informations de DATABASE_URL
if [ ! -z "$DATABASE_URL" ]; then
    DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
    DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/royaledition_$(date +%Y%m%d_%H%M%S).sql.gz"
    
    if mysqldump -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" | gzip > "$BACKUP_FILE"; then
        log "✓ Backup créé: $BACKUP_FILE"
    else
        warning "Échec du backup de la base de données"
    fi
else
    warning "DATABASE_URL non trouvée, backup ignoré"
fi

# 2. Vérifier que PM2 tourne
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Étape 2/10: Vérification de PM2..."
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ! command -v pm2 &> /dev/null; then
    error "PM2 n'est pas installé. Exécutez: npm install -g pm2"
fi

log "✓ PM2 est installé"

# 3. Pull du code depuis Git
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Étape 3/10: Récupération du code depuis Git..."
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$APP_DIR"

# Vérifier s'il y a des modifications locales
if [[ -n $(git status -s) ]]; then
    warning "Modifications locales détectées:"
    git status -s
    read -p "Voulez-vous les écraser ? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Suppression des modifications locales..."
        git reset --hard
    else
        error "Déploiement annulé par l'utilisateur"
    fi
fi

# Pull depuis la branche appropriée
BRANCH="main"
if [ "$ENVIRONMENT" == "staging" ]; then
    BRANCH="staging"
fi

log "Pull depuis la branche $BRANCH..."
if git pull origin "$BRANCH"; then
    log "✓ Code mis à jour depuis Git"
else
    error "Échec du git pull"
fi

# Afficher le dernier commit
LAST_COMMIT=$(git log -1 --pretty=format:"%h - %s (%an, %ar)")
log "Dernier commit: $LAST_COMMIT"

# 4. Installation des dépendances
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Étape 4/10: Installation des dépendances npm..."
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if npm install --production; then
    log "✓ Dépendances installées"
else
    error "Échec de l'installation des dépendances"
fi

# 5. Génération du client Prisma
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Étape 5/10: Génération du client Prisma..."
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if npx prisma generate; then
    log "✓ Client Prisma généré"
else
    error "Échec de la génération du client Prisma"
fi

# 6. Migrations de la base de données
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Étape 6/10: Application des migrations..."
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

read -p "Appliquer les migrations de la base de données ? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if npx prisma db push; then
        log "✓ Migrations appliquées"
    else
        error "Échec des migrations"
    fi
else
    warning "Migrations ignorées"
fi

# 7. Build de l'application
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Étape 7/10: Build de l'application Next.js..."
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Supprimer l'ancien build
if [ -d ".next" ]; then
    log "Suppression de l'ancien build..."
    rm -rf .next
fi

if npm run build; then
    log "✓ Build terminé avec succès"
else
    error "Échec du build"
fi

# 8. Redémarrage de l'application avec PM2
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Étape 8/10: Redémarrage de l'application..."
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Vérifier si l'app tourne déjà
if pm2 list | grep -q "$APP_NAME"; then
    log "Redémarrage de l'application existante..."
    if pm2 restart "$APP_NAME"; then
        log "✓ Application redémarrée"
    else
        error "Échec du redémarrage"
    fi
else
    log "Démarrage de la nouvelle application..."
    
    # Vérifier si ecosystem.config.js existe
    if [ -f "ecosystem.config.js" ]; then
        if pm2 start ecosystem.config.js; then
            log "✓ Application démarrée avec ecosystem.config.js"
        else
            error "Échec du démarrage avec ecosystem.config.js"
        fi
    else
        warning "ecosystem.config.js introuvable, démarrage manuel..."
        # Démarrer manuellement avec npm start
        if pm2 start npm --name "$APP_NAME" -- start; then
            log "✓ Application démarrée avec 'npm start'"
        else
            error "Échec du démarrage"
        fi
    fi
fi

# Sauvegarder la configuration PM2
pm2 save

# 9. Vérification de l'état de l'application
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Étape 9/10: Vérification de l'état..."
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

sleep 3  # Attendre que l'app démarre

pm2 list

# Vérifier que l'app est online
if pm2 list | grep "$APP_NAME" | grep -q "online"; then
    log "✓ L'application est en ligne"
else
    error "L'application n'est pas en ligne. Consultez les logs: pm2 logs $APP_NAME"
fi

# 10. Tests de santé
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Étape 10/10: Tests de santé..."
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test local avec le port détecté
if curl -f -s http://localhost:$APP_PORT > /dev/null; then
    log "✓ L'application répond sur localhost:$APP_PORT"
else
    warning "L'application ne répond pas sur localhost:$APP_PORT (peut prendre quelques secondes...)"
    sleep 5
    if curl -f -s http://localhost:$APP_PORT > /dev/null; then
        log "✓ L'application répond sur localhost:$APP_PORT"
    else
        warning "L'application ne répond toujours pas. Vérifiez: pm2 logs $APP_NAME"
    fi
fi

# Test du domaine (si configuré)
if [ ! -z "$NEXT_PUBLIC_APP_URL" ]; then
    DOMAIN=$(echo $NEXT_PUBLIC_APP_URL | sed 's|https://||' | sed 's|http://||')
    log "Test du domaine: $DOMAIN"
    
    if curl -f -s "$NEXT_PUBLIC_APP_URL" > /dev/null; then
        log "✓ L'application est accessible via $NEXT_PUBLIC_APP_URL"
    else
        warning "L'application n'est pas accessible via $NEXT_PUBLIC_APP_URL"
    fi
fi

# Nettoyage des anciens backups (garder les 7 derniers)
if [ -d "$BACKUP_DIR" ]; then
    log "Nettoyage des anciens backups..."
    find "$BACKUP_DIR" -name "royaledition_*.sql.gz" -type f -mtime +7 -delete
    log "✓ Anciens backups supprimés"
fi

# Rapport final
echo ""
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                       ║${NC}"
echo -e "${GREEN}║          ✓ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS           ║${NC}"
echo -e "${GREEN}║                                                       ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

log "Déploiement terminé avec succès"

echo -e "${BLUE}Informations:${NC}"
echo "  Environnement: $ENVIRONMENT"
echo "  Dernier commit: $LAST_COMMIT"
echo "  Date: $(date +'%Y-%m-%d %H:%M:%S')"
echo ""

echo -e "${BLUE}Commandes utiles:${NC}"
echo "  Voir les logs:        pm2 logs $APP_NAME"
echo "  Statut PM2:           pm2 status"
echo "  Monitoring:           pm2 monit"
echo "  Redémarrer:           pm2 restart $APP_NAME"
echo "  Arrêter:              pm2 stop $APP_NAME"
echo ""

echo -e "${YELLOW}Pour consulter les logs complets:${NC}"
echo "  tail -f $LOG_FILE"
echo ""

# Afficher les derniers logs de l'application
echo -e "${BLUE}Derniers logs de l'application:${NC}"
pm2 logs "$APP_NAME" --lines 20 --nostream

exit 0
