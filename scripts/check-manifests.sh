#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# Compare client/server reference manifests between current release and new release
# Usage: ./scripts/check-manifests.sh releases/NEW_RELEASE_PATH
NEW_RELEASE="$1"

if [ -z "$NEW_RELEASE" ]; then
  echo "Usage: ./scripts/check-manifests.sh <releases/XXXX>"
  exit 1
fi

CURRENT="$(readlink -f .next/standalone || true)"
if [ -z "$CURRENT" ]; then
  echo "No current release symlink .next/standalone"
  exit 1
fi

echo "Current: $CURRENT"
echo "New: $NEW_RELEASE"

for f in client-reference-manifest.json server-reference-manifest.json; do
  curf="$CURRENT/.next/server/$f"
  newf="$NEW_RELEASE/.next/server/$f"
  if [ -f "$curf" ] && [ -f "$newf" ]; then
    echo "Comparing $f"
    if cmp -s "$curf" "$newf"; then
      echo "  OK: manifests identical"
    else
      echo "  MISMATCH: manifests differ"
      echo "  --- current: $curf"
      echo "  --- new:     $newf"
    fi
  else
    echo "Manifest $f missing in current or new release"
  fi
done

exit 0
