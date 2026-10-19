# Build Nouri bundle for Food Maps (sync JSX from backend/ai + esbuild).
# Usage (from repo root):
#   .\backend\scripts\build_nouri.ps1
#
# After build, bump the ?v= cache-bust tag on nouri-ai.js / nouri-ai.css in
# frontend/index.html, landing.html and voice-search.html (all six must match).

$ErrorActionPreference = "Stop"
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$NouriDir = Join-Path $Root "frontend\nouri"

Set-Location $NouriDir
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm dependencies..."
    npm ci
}
Write-Host "Building Nouri bundle (prebuild syncs sources from backend/ai)..."
npm run build
Write-Host ""
Write-Host "Done. Output: frontend/assets/nouri/nouri-ai.js and nouri-ai.css"
Write-Host "Remember to commit built assets and bump cache-bust ?v= in HTML if needed."
