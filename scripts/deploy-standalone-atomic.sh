#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# Atomic deploy for Next standalone
# - Build locally
# - Copy standalone into a new release folder
# - Symlink .next/standalone -> releases/current
# - Restart PM2 and run health check
# Usage: PORT=3001 HOSTNAME=0.0.0.0 ./scripts/deploy-standalone-atomic.sh

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

PORT="${PORT:-3001}"
HOSTNAME="${HOSTNAME:-0.0.0.0}"
APP_NAME="royaleditions"
RELEASES_DIR="releases"

# Check required tools
for cmd in rsync pm2 ln rm mv date; do
  if ! command -v $cmd >/dev/null 2>&1; then
    echo "[deploy-atomic] ERROR: required command not found: $cmd"
    exit 1
  fi
done

# Create release dir
timestamp=$(date +%s)
RELEASE_DIR="$RELEASES_DIR/$timestamp"
mkdir -p "$RELEASE_DIR"

# Build
echo "[deploy-atomic] Installing and building"
npm ci --prefer-offline --no-audit --no-fund || true
npm run build

if [ ! -d .next/standalone ]; then
  echo "[deploy-atomic] ERROR: standalone output missing: .next/standalone"
  exit 2
fi

# Rsync standalone output into release folder (fs-friendly copy)
echo "[deploy-atomic] Copying standalone -> $RELEASE_DIR"
rsync -a --delete .next/standalone/ "$RELEASE_DIR/" 

# Validate release artifacts
if [ ! -f "$RELEASE_DIR/server.js" ]; then
  echo "[deploy-atomic] ERROR: server.js missing in release"
  exit 3
fi

if [ ! -f "$RELEASE_DIR/.next/server/client-reference-manifest.json" ] && [ ! -f "$RELEASE_DIR/.next/server/server-reference-manifest.json" ]; then
  echo "[deploy-atomic] WARNING: reference-manifest missing in release. Client/Server may mismatch."
fi

# Save previous release for rollback
PREV_RELEASE=""
if [ -L .next/standalone ]; then
  current_target=$(readlink -f .next/standalone)
  if [ -n "$current_target" ]; then
    PREV_RELEASE="$current_target"
  fi
fi

# Switch symlink atomically
mkdir -p "$RELEASES_DIR"
ln -sfn "$RELEASE_DIR" .next/standalone

# Ensure PM2 loads new code
if pm2 describe "$APP_NAME" &>/dev/null; then
  echo "[deploy-atomic] Restarting PM2 app"
  pm2 restart "$APP_NAME" || true
else
  echo "[deploy-atomic] Starting PM2 app"
  PORT=$PORT HOSTNAME=$HOSTNAME pm2 start ecosystem.config.js --update-env --name "$APP_NAME"
fi

# Health check quickly
if command -v curl >/dev/null; then
  echo "[deploy-atomic] Waiting for app to boot..."
  sleep 2
  status_code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/" || true)
  echo "[deploy-atomic] Root endpoint returned: $status_code"
  if [ "$status_code" != "200" ]; then
    echo "[deploy-atomic] Health check failed, attempting rollback"
    if [ -n "$PREV_RELEASE" ] && [ -d "$PREV_RELEASE" ]; then
      ln -sfn "$PREV_RELEASE" .next/standalone
      pm2 restart "$APP_NAME" || true
      echo "[deploy-atomic] Rollback performed to $PREV_RELEASE"
    else
      echo "[deploy-atomic] No previous release available, inspect PM2 logs"
    fi
  fi
fi

# Dump pm2 logs last lines for visibility
pm2 logs "$APP_NAME" --lines 50 --nostream || true

echo "[deploy-atomic] Done. Release: $RELEASE_DIR"
exit 0
