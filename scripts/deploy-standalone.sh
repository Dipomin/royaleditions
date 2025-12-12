#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# Deploy script for Next.js standalone build | Run from repo root
# Usage: sudo PORT=3001 HOSTNAME=0.0.0.0 ./scripts/deploy-standalone.sh

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Environment vars
PORT="${PORT:-3001}"
HOSTNAME="${HOSTNAME:-0.0.0.0}"
PM2_APP_NAME="royaleditions"

echo "[deploy] Repo: $REPO_ROOT"
echo "[deploy] PORT=$PORT HOSTNAME=$HOSTNAME"

# Stop existing PM2 app gracefully
if pm2 describe "$PM2_APP_NAME" &>/dev/null; then
  echo "[deploy] Stopping existing PM2 app: $PM2_APP_NAME"
  pm2 stop "$PM2_APP_NAME" || true
  pm2 delete "$PM2_APP_NAME" || true
fi

# Clean install + build
echo "[deploy] Installing dependencies (npm ci)"
npm ci

echo "[deploy] Building project (npm run build)"
npm run build

# Validate standalone server file exists
if [ ! -f .next/standalone/server.js ]; then
  echo "[error] .next/standalone/server.js not found. Build failed or standalone output missing."
  echo "[error] Check next config (output: 'standalone') and build logs."
  exit 2
fi

# Quick validation for required artifacts
if [ ! -f .next/standalone/.next/server/pages-manifest.json ]; then
  echo "[warn] server/pages-manifest.json missing in standalone. The standalone artifact might be incomplete."
fi

if [ ! -f .next/standalone/.next/server/pages/500.html ]; then
  echo "[warn] 500.html not found in standalone. This may lead to 500 page errors."
fi

if [ ! -f .next/standalone/.next/server/client-reference-manifest.json ] && [ ! -f .next/standalone/.next/server/server-reference-manifest.json ]; then
  echo "[warn] clientReferenceManifest or serverReferenceManifest might be missing. This can cause Next runtime errors."
fi

# Start with PM2
echo "[deploy] Starting PM2 app: $PM2_APP_NAME"
PORT=$PORT HOSTNAME=$HOSTNAME pm2 start ecosystem.config.js --update-env --name "$PM2_APP_NAME"

# Save PM2 process list
pm2 save

# Show status and tail logs for immediate verification
pm2 status | sed -n '1,200p'

echo "[deploy] Tailing logs (first 50 lines)"
pm2 logs "$PM2_APP_NAME" --lines 50 --nostream || true

echo "[deploy] Done. Check PM2 logs for runtime errors."

exit 0
