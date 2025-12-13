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

# Ensure critical artifacts are present in standalone; if missing, copy from build output
# Copy client-reference-manifest.json if standalone is missing it
if [ ! -f .next/standalone/.next/server/client-reference-manifest.json ] && [ -f .next/server/client-reference-manifest.json ]; then
  echo "[deploy] Copying client-reference-manifest.json to standalone"
  mkdir -p .next/standalone/.next/server
  cp .next/server/client-reference-manifest.json .next/standalone/.next/server/
fi

# Copy 500.html if missing
if [ ! -f .next/standalone/.next/server/pages/500.html ] && [ -f .next/server/pages/500.html ]; then
  echo "[deploy] Copying pages/500.html to standalone"
  mkdir -p .next/standalone/.next/server/pages
  cp .next/server/pages/500.html .next/standalone/.next/server/pages/
fi

# Copy .next/static and public into standalone if needed
if [ -d .next/static ]; then
  echo "[deploy] Copying .next/static to .next/standalone/.next/static"
  mkdir -p .next/standalone/.next/static
  rsync -a --delete .next/static/ .next/standalone/.next/static/ || true
fi

if [ -d public ]; then
  echo "[deploy] Copying public to .next/standalone/public"
  mkdir -p .next/standalone/public
  rsync -a --delete public/ .next/standalone/public/ || true
fi

# Check if the port is already in use and kill likely node processes holding it
if command -v lsof >/dev/null; then
  existing_pids=$(lsof -ti tcp:"$PORT") || true
  if [ -n "$existing_pids" ]; then
    echo "[deploy] Port $PORT in use by PIDs: $existing_pids"
    for pid in $existing_pids; do
      owner=$(ps -o comm= -p "$pid" 2>/dev/null || true)
      echo "[deploy] Process $pid: $owner"
      if [[ "$owner" == *node* || "$owner" == *server.js* ]]; then
        echo "[deploy] Killing PID $pid (likely old node process)"
        kill -9 "$pid" || true
      fi
    done
  fi
else
  echo "[deploy] lsof not installed; skipping port check"
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

# Short wait to allow process to initialize
sleep 3

# Capture a brief log snapshot to detect common runtime errors
log_snippet=$(pm2 logs "$PM2_APP_NAME" --lines 200 --nostream 2>/dev/null || true)

echo "[deploy] Log snapshot captured, checking for known errors..."

if echo "$log_snippet" | grep -q "InvariantError"; then
  echo "[deploy] Detected 'InvariantError' in logs. Attempting to repair standalone artifacts and restart PM2."
  # Try to copy server reference manifests from the build if missing
  if [ -f .next/server/client-reference-manifest.json ] && [ ! -f .next/standalone/.next/server/client-reference-manifest.json ]; then
    echo "[deploy] Copying .next/server/client-reference-manifest.json to standalone"
    mkdir -p .next/standalone/.next/server
    cp .next/server/client-reference-manifest.json .next/standalone/.next/server/ || true
  fi
  if [ -f .next/server/server-reference-manifest.json ] && [ ! -f .next/standalone/.next/server/server-reference-manifest.json ]; then
    cp .next/server/server-reference-manifest.json .next/standalone/.next/server/ || true
  fi
  # Copy pages directories if needed
  if [ -d .next/server/pages ] && [ ! -d .next/standalone/.next/server/pages ]; then
    echo "[deploy] Copying .next/server/pages to standalone"
    rsync -a --delete .next/server/pages/ .next/standalone/.next/server/pages/ || true
  fi

  echo "[deploy] Restarting PM2 app to load updated artifacts"
  pm2 restart "$PM2_APP_NAME" || true
  sleep 2
fi

if echo "$log_snippet" | grep -q "Failed to load static file for page: /500"; then
  echo "[deploy] Detected missing 500.html in logs. Attempting to copy 500.html from build output"
  if [ -f .next/server/pages/500.html ]; then
    mkdir -p .next/standalone/.next/server/pages
    cp .next/server/pages/500.html .next/standalone/.next/server/pages/ || true
    pm2 restart "$PM2_APP_NAME" || true
  else
    echo "[deploy] 500.html missing from build output; verify build config and presence of custom 500 page."
  fi
fi

echo "[deploy] Done. Check PM2 logs for runtime errors."

exit 0
