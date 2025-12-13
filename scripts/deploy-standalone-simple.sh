#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# Déploiement minimal pour Next.js standalone (simple & sûr)
# Usage: PORT=3001 HOSTNAME=0.0.0.0 ./scripts/deploy-standalone-simple.sh
# - Stoppe/relance PM2
# - Build
# - Copie .next/static et public vers standalone si nécessaire
# - Démarre PM2 via ecosystem.config.js

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"
PORT="${PORT:-3001}"
HOSTNAME="${HOSTNAME:-0.0.0.0}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"

# Support CLI flags like --keep-last=N
for arg in "$@"; do
  case $arg in
    --keep-last=* ) KEEP_RELEASES="${arg#*=}"; shift ;;
  esac
done
APP_NAME="royaleditions"

echo "[deploy-simple] Répertoire: $REPO_ROOT"
echo "[deploy-simple] PORT=$PORT HOSTNAME=$HOSTNAME"

# Stop app si en cours
if pm2 describe "$APP_NAME" &>/dev/null; then
  echo "[deploy-simple] Arrêt de $APP_NAME (pm2)"
  pm2 stop "$APP_NAME" || true
  pm2 delete "$APP_NAME" || true
fi

# Installation + build
echo "[deploy-simple] Installation des dépendances"
npm ci --prefer-offline --no-audit --no-fund || true

echo "[deploy-simple] Build"
npm run build

# Vérification minimale
if [ ! -f .next/standalone/server.js ]; then
  echo "[deploy-simple] ERREUR: .next/standalone/server.js introuvable. Assurez-vous que next.config.ts contient output: 'standalone' et que le build a réussi."
  exit 1
fi

# Copier les fichiers statiques s'ils existent
if [ -d .next/static ]; then
  echo "[deploy-simple] Copie .next/static → .next/standalone/.next/static"
  mkdir -p .next/standalone/.next/static
  rsync -a --delete .next/static/ .next/standalone/.next/static/ || true
fi

if [ -d public ]; then
  echo "[deploy-simple] Copie public → .next/standalone/public"
  mkdir -p .next/standalone/public
  rsync -a --delete public/ .next/standalone/public/ || true
fi

# Kill old node processes on port (conservatif)
if command -v lsof >/dev/null; then
  pids=$(lsof -ti tcp:"$PORT" | tr '\n' ' ' || true)
  if [ -n "$pids" ]; then
    echo "[deploy-simple] Port $PORT occupé par: $pids - tentative d'arrêt des processus node"
    for pid in $pids; do
      if ps -p "$pid" -o comm= | grep -qi node; then
        kill -9 "$pid" || true
      fi
    done
  fi
fi

# Lancement PM2
echo "[deploy-simple] Démarrage avec PM2"
PORT=$PORT HOSTNAME=$HOSTNAME pm2 start ecosystem.config.js --update-env --name "$APP_NAME"
pm2 save

# Vérification rapide HTTP (optionnelle) - nécessite curl
if command -v curl >/dev/null; then
  sleep 2
  health_url="http://localhost:$PORT/api/health"
  echo "[deploy-simple] Vérification HTTP (health): $health_url"
  status_code=$(curl -s -o /dev/null -w "%{http_code}" "$health_url" || true)
  echo "[deploy-simple] Health Code HTTP: $status_code"
  if [ "$status_code" != "200" ]; then
    echo "[deploy-simple] Attention: health retourne $status_code. Vérifiez pm2 logs --lines 50"
  fi
fi

pm2 logs "$APP_NAME" --lines 30 --nostream || true

echo "[deploy-simple] Terminé. Consultez les logs PM2 en cas d'erreur."

# Cleanup old releases
if [ -d "releases" ]; then
  releases=( $(ls -1 releases | sort -n) )
  total=${#releases[@]}
  if [ $total -gt $KEEP_RELEASES ]; then
    to_remove=$((total - KEEP_RELEASES))
    echo "[deploy-simple] Cleaning $to_remove old releases; keeping last $KEEP_RELEASES"
    for ((i=0; i<to_remove; i++)); do
      old=${releases[$i]}
      echo "[deploy-simple] Removing releases/$old"
      rm -rf "releases/$old" || true
    done
  fi
fi

exit 0
