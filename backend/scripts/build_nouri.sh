#!/usr/bin/env bash
# Build Nouri bundle for Food Maps.
# Usage: ./backend/scripts/build_nouri.sh

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT/frontend/nouri"
if [ ! -d node_modules ]; then
  npm ci
fi
npm run sync
npm run build
echo "Done. Output: frontend/assets/nouri/nouri-ai.js and nouri-ai.css"
