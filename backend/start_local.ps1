# Start Food Maps locally — no AWS required by default.
#
# Local dev (SQLite, your machine only):
#   .\backend\start_local.ps1
#
# Use production RDS from your machine (needs network access to RDS):
#   $env:USE_RDS = "1"
#   .\backend\start_local.ps1
#
# Recommended: copy .env.local.example to .env.local for persistent local DB settings.

$ErrorActionPreference = "Stop"

$BackendDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent $BackendDir

function Import-DotEnvFile {
    param([string]$Path)
    if (-not (Test-Path $Path)) { return }
    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if ($line -eq "" -or $line.StartsWith("#")) { return }
        $idx = $line.IndexOf("=")
        if ($idx -lt 1) { return }
        $key = $line.Substring(0, $idx).Trim()
        $val = $line.Substring($idx + 1).Trim().Trim('"')
        Set-Item -Path "Env:$key" -Value $val
    }
}

$EnvFile = Join-Path $Root ".env"
if (-not (Test-Path $EnvFile)) {
    Write-Error ".env not found. Copy .env.example to .env and add your API keys."
}

$LocalEnvFile = Join-Path $Root ".env.local"
$LocalExample = Join-Path $Root ".env.local.example"
$wantRds = ($env:USE_RDS -eq "1") -or ($env:USE_RDS -eq "true")
if (-not $wantRds -and -not (Test-Path $LocalEnvFile)) {
    if (Test-Path $LocalExample) {
        Copy-Item $LocalExample $LocalEnvFile
        Write-Host "Created .env.local for local SQLite dev" -ForegroundColor Green
    }
}

Import-DotEnvFile $EnvFile
if (-not $wantRds) {
    Import-DotEnvFile $LocalEnvFile
}

$useRds = ($env:USE_RDS -eq "1") -or ($env:USE_RDS -eq "true")

if (-not $useRds) {
    if (-not $env:ALLOW_SQLITE) { $env:ALLOW_SQLITE = "true" }
    if (-not $env:DATABASE_URL -or $env:DATABASE_URL -like "mysql*") {
        $dbFile = Join-Path $BackendDir "food_maps_local.db"
        $dbUri = "sqlite:///" + ($dbFile -replace '\\', '/')
        $env:DATABASE_URL = $dbUri
    }
    Write-Host "Local dev mode: SQLite (no AWS)" -ForegroundColor Green
    Write-Host "  Database: $(Join-Path $BackendDir 'food_maps_local.db')"
    Write-Host "  Tip: copy .env.local.example to .env.local to persist these settings"
} else {
    Write-Host "USE_RDS=1 - connecting to DATABASE_URL from .env" -ForegroundColor Cyan
    if (-not $env:DATABASE_URL) {
        Write-Error "DATABASE_URL missing from .env"
    }
}

$env:PYTHONPATH = $Root
if (-not $env:PUBLIC_BASE_URL) { $env:PUBLIC_BASE_URL = "http://localhost:8000" }
if ($useRds) { $env:USE_RDS = "1" }
Set-Location $BackendDir

Write-Host "Starting Food Maps at http://localhost:8000/index.html"
Write-Host "Press Ctrl+C to stop."
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
