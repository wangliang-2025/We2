# =====================================================
#   Love Diary - One-click launcher for Windows
# =====================================================
# First run: auto installs deps + initializes database.
# Subsequent runs: instant start.

$ErrorActionPreference = "Continue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSNativeCommandUseErrorActionPreference = $false

$PORT = 1314

function Invoke-Cmd($exe, $argList) {
    & $exe @argList 2>&1 | Out-Null
    return $LASTEXITCODE
}

function Fail($msg) {
    Write-Host "XX $msg" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

function Write-Step($msg) { Write-Host ">> $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "OK $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "!! $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "XX $msg" -ForegroundColor Red }
function Write-T($msg)    { Write-Host $msg -ForegroundColor Magenta }

Set-Location $PSScriptRoot

Write-Host ""
Write-T "============================================="
Write-T "    Love Diary - starting..."
Write-T "============================================="
Write-Host ""

# ===== 1. Check Node.js =====
$nodeVer = & node --version 2>$null
if (-not $nodeVer) {
    Write-Err "Node.js not found! Please install from:"
    Write-Host "   https://nodejs.org  (pick LTS, click next-next-finish)" -ForegroundColor White
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Ok "Node.js $nodeVer"

# ===== 2. .env file =====
if (-not (Test-Path .env)) {
    Write-Step "First run: generating .env config..."
    $bytes = New-Object byte[] 32
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $secret = ($bytes | ForEach-Object { $_.ToString("x2") }) -join ""
    $envLines = @(
        'DATABASE_URL="file:./dev.db"'
        ('JWT_SECRET="' + $secret + '"')
        'UPLOAD_DIR="./uploads"'
        ''
        '# AI config: leave blank to use local templates; fill to enable real AI'
        '# Recommended: deepseek (cheap) or zhipu (free tier)'
        'AI_PROVIDER=""'
        'AI_API_KEY=""'
        'AI_BASE_URL=""'
        'AI_MODEL=""'
    )
    $envLines -join "`n" | Out-File -FilePath .env -Encoding ascii -NoNewline
    Write-Ok ".env created (random JWT_SECRET generated)"
}

# ===== 3. Install dependencies =====
$needInstall = $false
if (-not (Test-Path node_modules)) {
    $needInstall = $true
} elseif (Test-Path package-lock.json) {
    $lock = (Get-Item package-lock.json).LastWriteTime
    $mods = (Get-Item node_modules).LastWriteTime
    if ($lock -gt $mods) { $needInstall = $true }
}

if ($needInstall) {
    Write-Step "Installing dependencies (first run takes 1-3 min)..."
    cmd /c "npm install --no-audit --no-fund --loglevel=error 2>&1" | Out-Null
    if ($LASTEXITCODE -ne 0) { Fail "npm install failed - check your network" }
    Write-Ok "Dependencies installed"
} else {
    Write-Ok "Dependencies up to date"
}

# ===== 4. Prisma client =====
if (-not (Test-Path "node_modules\.prisma\client")) {
    Write-Step "Generating Prisma client..."
    cmd /c "npx prisma generate 2>&1" | Out-Null
    Write-Ok "Prisma client ready"
}

# ===== 5. Database migration =====
if (-not (Test-Path "prisma\dev.db")) {
    Write-Step "First run: initializing database..."
    cmd /c "npx prisma migrate deploy 2>&1" | Out-Null
    Write-Ok "Database ready"
} else {
    # Apply any pending migrations silently
    cmd /c "npx prisma migrate deploy 2>&1" | Out-Null
}

# ===== 6. Free up port =====
$conns = Get-NetTCPConnection -LocalPort $PORT -ErrorAction SilentlyContinue
if ($conns) {
    Write-Warn "Port $PORT is in use, releasing..."
    $conns | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {
        try { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } catch {}
    }
    Start-Sleep 2
    Write-Ok "Port released"
}

# ===== 7. Auto-open browser when ready =====
Start-Job -ScriptBlock {
    param($url)
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Milliseconds 1000
        try {
            $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            if ($r.StatusCode -eq 200) {
                Start-Process $url
                break
            }
        } catch {}
    }
} -ArgumentList "http://localhost:$PORT" | Out-Null

# ===== 8. Start dev server =====
Write-Host ""
Write-T "============================================="
Write-Host "  URL: " -NoNewline
Write-Host "http://localhost:$PORT" -ForegroundColor Green
Write-Host "  Browser will auto-open in 6-15 seconds"
Write-Host "  Press Ctrl + C to stop"
Write-T "============================================="
Write-Host ""

cmd /c "npm run dev"
