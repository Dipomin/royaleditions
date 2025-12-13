#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# Stop -> Build -> Copy -> Start script
# Usage: PORT=3001 HOSTNAME=0.0.0.0 ./scripts/deploy-standalone-stop-start.sh
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

echo "[deploy-stop-start] Repo: $REPO_ROOT"

# Stop the app completely
if pm2 describe "$APP_NAME" &>/dev/null; then
  echo "[deploy-stop-start] Stopping and deleting PM2 app"
  pm2 stop "$APP_NAME" || true
  pm2 delete "$APP_NAME" || true
fi

# Build
echo "[deploy-stop-start] Installing and building"
npm ci --prefer-offline --no-audit --no-fund || true
npm run build

# Validate output
if [ ! -f .next/standalone/server.js ]; then
  echo "[deploy-stop-start] ERROR: .next/standalone/server.js missing; aborting"
  exit 1
fi

# Atomic copy using release folder
mkdir -p releases
timestamp=$(date +%s)
RELEASE_DIR="releases/$timestamp"
mkdir -p "$RELEASE_DIR"
rsync -a --delete .next/standalone/ "$RELEASE_DIR/"

# Ensure required artifacts present
if [ ! -f "$RELEASE_DIR/server.js" ]; then
  echo "[deploy-stop-start] ERROR: server.js missing in release dir"
  exit 1
fi

# Swap symlink
ln -sfn "$RELEASE_DIR" .next/standalone

# Start PM2
echo "[deploy-stop-start] Starting PM2 app"
PORT=$PORT HOSTNAME=$HOSTNAME pm2 start ecosystem.config.js --update-env --name "$APP_NAME"
pm2 save

# Verify health endpoint
if command -v curl >/dev/null; then
  echo "[deploy-stop-start] Waiting for app to boot..."
  health_url="http://localhost:$PORT/api/health"
  status_code=$(curl -s -o /dev/null -w "%{http_code}" "$health_url" || true)
  echo "[deploy-stop-start] Health returned: $status_code"
  if [ "$status_code" != "200" ]; then
    echo "[deploy-stop-start] Warning: health check failed ($status_code). Check PM2 logs."
  fi
fi

# Cleanup old releases
if [ -d "releases" ]; then
  releases=( $(ls -1 releases | sort -n) )
  total=${#releases[@]}
  if [ $total -gt $KEEP_RELEASES ]; then
    to_remove=$((total - KEEP_RELEASES))
    echo "[deploy-stop-start] Cleaning $to_remove old releases; keeping last $KEEP_RELEASES"
    for ((i=0; i<to_remove; i++)); do
      old=${releases[$i]}
      echo "[deploy-stop-start] Removing releases/$old"
      rm -rf "releases/$old" || true
    done
  fi
fi

echo "[deploy-stop-start] Tail logs (30 lines)"
pm2 logs "$APP_NAME" --lines 30 --nostream || true

echo "[deploy-stop-start] Done."
exit 0
