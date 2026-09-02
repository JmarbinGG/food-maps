# Build Nouri bundle for Food Maps (sync JSX from backend/ai + esbuild).
# Usage (from repo root):
#   .\backend\scripts\build_nouri.ps1
#
# After build, bump ?v=20260902-nouri in index.html, landing.html, voice-search.html if you change the tag.

$ErrorActionPreference = "Stop"
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$NouriDir = Join-Path $Root "frontend\nouri"

Set-Location $NouriDir
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm dependencies..."
    npm ci
}
Write-Host "Syncing Nouri sources from backend/ai..."
npm run sync
Write-Host "Building Nouri bundle..."
npm run build
Write-Host ""
Write-Host "Done. Output: frontend/assets/nouri/nouri-ai.js and nouri-ai.css"
Write-Host "Remember to commit built assets and bump cache-bust ?v= in HTML if needed."
