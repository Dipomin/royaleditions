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
KEEP_RELEASES="${KEEP_RELEASES:-5}"

# Support CLI flags like --keep-last=N
for arg in "$@"; do
  case $arg in
    --keep-last=* ) KEEP_RELEASES="${arg#*=}"; shift ;;
  esac
done
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

# Build with embedded build id
echo "[deploy-atomic] Installing and building"
npm ci --prefer-offline --no-audit --no-fund || true
export NEXT_PUBLIC_BUILD_ID="$timestamp"
echo "[deploy-atomic] NEXT_PUBLIC_BUILD_ID=$NEXT_PUBLIC_BUILD_ID"
NEXT_PUBLIC_BUILD_ID="$NEXT_PUBLIC_BUILD_ID" npm run build

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

# Ensure PM2 loads new code, export build id to pm2 process
export NEXT_PUBLIC_BUILD_ID="$NEXT_PUBLIC_BUILD_ID"
if pm2 describe "$APP_NAME" &>/dev/null; then
  echo "[deploy-atomic] Restarting PM2 app with updated env"
  pm2 restart "$APP_NAME" --update-env || true
else
  echo "[deploy-atomic] Starting PM2 app with updated env"
  NEXT_PUBLIC_BUILD_ID="$NEXT_PUBLIC_BUILD_ID" PORT=$PORT HOSTNAME=$HOSTNAME pm2 start ecosystem.config.js --update-env --name "$APP_NAME"
fi

# Health check quickly using /api/health (retries)
if command -v curl >/dev/null; then
  echo "[deploy-atomic] Waiting for app to boot..."
  health_url="http://localhost:$PORT/api/health"
  attempt=1
  max_attempts=6
  success=0
  until [ $attempt -gt $max_attempts ]; do
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$health_url" || true)
    echo "[deploy-atomic] Health check attempt $attempt returned: $status_code"
    if [ "$status_code" = "200" ]; then
      success=1
      break
    fi
    attempt=$((attempt+1))
    sleep 1
  done
  if [ $success -ne 1 ]; then
    echo "[deploy-atomic] Health check ($health_url) failed after $max_attempts attempts, attempting rollback"
    if [ -n "$PREV_RELEASE" ] && [ -d "$PREV_RELEASE" ]; then
      ln -sfn "$PREV_RELEASE" .next/standalone
      pm2 restart "$APP_NAME" || true
      echo "[deploy-atomic] Rollback performed to $PREV_RELEASE"
    else
      echo "[deploy-atomic] No previous release available, inspect PM2 logs"
    fi
  fi
    # verify build id matches
    if [ $success -eq 1 ]; then
      echo "[deploy-atomic] Verifying build id from /api/health"
      if command -v jq >/dev/null; then
        remote_build_id=$(curl -s "http://localhost:$PORT/api/health" | jq -r '.buildId') || true
      else
        remote_build_id=$(curl -s "http://localhost:$PORT/api/health" | sed -e 's/^.*"buildId"[ ]*:[ ]*"\([^"]*\)".*$/\1/' || true)
      fi
      if [ -n "$remote_build_id" ] && [ "$remote_build_id" != "$NEXT_PUBLIC_BUILD_ID" ]; then
        echo "[deploy-atomic] Build id mismatch: server returned $remote_build_id, expected $NEXT_PUBLIC_BUILD_ID. Rolling back."
        if [ -n "$PREV_RELEASE" ] && [ -d "$PREV_RELEASE" ]; then
          ln -sfn "$PREV_RELEASE" .next/standalone
          pm2 restart "$APP_NAME" || true
          echo "[deploy-atomic] Rollback performed to $PREV_RELEASE"
        fi
      fi
    fi
fi

# Dump pm2 logs last lines for visibility
pm2 logs "$APP_NAME" --lines 50 --nostream || true

echo "[deploy-atomic] Done. Release: $RELEASE_DIR"

# Cleanup old releases but keep last $KEEP_RELEASES
if [ -d "$RELEASES_DIR" ]; then
  releases=( $(ls -1 "$RELEASES_DIR" | sort -n) )
  total=${#releases[@]}
  if [ $total -gt $KEEP_RELEASES ]; then
    to_remove=$((total - KEEP_RELEASES))
    echo "[deploy-atomic] Cleaning $to_remove old releases; keeping last $KEEP_RELEASES"
    for ((i=0; i<to_remove; i++)); do
      old=${releases[$i]}
      echo "[deploy-atomic] Removing $RELEASES_DIR/$old"
      rm -rf "$RELEASES_DIR/$old" || true
    done
  fi
fi
exit 0
