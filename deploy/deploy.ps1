#Requires -RunAsAdministrator
<#
  Deploy the Next.js (standalone) app to IIS and have it survive server restarts.

  Architecture:
    - IIS site "FactoryScreens" binds to port 3001.
    - HttpPlatformHandler launches `node server.js` on a private loopback port and
      proxies the site binding to it. IIS restarts the process on crash and at boot.
    - App pool is "No Managed Code" + AlwaysRunning + autoStart  -> survives reboot.

  Prerequisites on the server (one time):
    1. IIS installed.
    2. HttpPlatformHandler module installed:  https://www.iis.net/downloads/microsoft/httpplatformhandler
    3. Node.js 24.x installed (used both to build and to run).
    4. (Optional) Application Initialization feature for boot preload:
         Install-WindowsFeature Web-AppInit

  Usage (run from the repo root, in an elevated PowerShell):
    .\deploy\deploy.ps1 -Build          # build + deploy
    .\deploy\deploy.ps1                  # deploy an already-built .next/standalone
#>
[CmdletBinding()]
param(
  [string]$RepoPath   = (Get-Location).Path,
  [string]$DeployPath = "C:\inetpub\wwwroot\factory-screens",
  [string]$SiteName   = "FactoryScreens",
  [string]$AppPool    = "FactoryScreens",
  [int]   $Port       = 3001,
  [string]$NodePath   = "C:\Program Files\nodejs\node.exe",
  [switch]$Build
)

$ErrorActionPreference = "Stop"
function Step($m) { Write-Host "`n=== $m ===" -ForegroundColor Cyan }

if (-not (Test-Path $NodePath)) {
  throw "node.exe not found at '$NodePath'. Pass -NodePath 'C:\path\to\node.exe'."
}

# 1. Build (optional)
if ($Build) {
  Step "Building (npm run build)"
  Push-Location $RepoPath
  try { npm run build } finally { Pop-Location }
}

$standalone = Join-Path $RepoPath ".next\standalone"
if (-not (Test-Path $standalone)) {
  throw "Standalone output not found at $standalone. Run 'npm run build' first (or pass -Build)."
}

Import-Module WebAdministration -ErrorAction SilentlyContinue

# 2. Stop the app pool so files aren't locked
if (Test-Path "IIS:\AppPools\$AppPool") {
  Step "Stopping app pool $AppPool"
  try { Stop-WebAppPool -Name $AppPool -ErrorAction SilentlyContinue } catch {}
  Start-Sleep -Seconds 2
}

# 3. Assemble the deploy folder
Step "Assembling deploy folder at $DeployPath"
New-Item -ItemType Directory -Force -Path $DeployPath | Out-Null

# Mirror standalone output, but never delete the runtime .env / web.config / logs
robocopy $standalone $DeployPath /MIR /XF .env web.config /XD logs /NFL /NDL /NJH /NJS /NP | Out-Null
# Static assets and public/ are NOT included in standalone - copy them in
robocopy (Join-Path $RepoPath ".next\static") (Join-Path $DeployPath ".next\static") /MIR /NFL /NDL /NJH /NJS /NP | Out-Null
if (Test-Path (Join-Path $RepoPath "public")) {
  robocopy (Join-Path $RepoPath "public") (Join-Path $DeployPath "public") /MIR /NFL /NDL /NJH /NJS /NP | Out-Null
}
$global:LASTEXITCODE = 0  # robocopy uses non-zero success codes

# 4. web.config (always refreshed) + patch the node path
$webConfig = Join-Path $DeployPath "web.config"
Copy-Item (Join-Path $RepoPath "web.config") $webConfig -Force
(Get-Content $webConfig) -replace 'processPath="[^"]*"', "processPath=`"$NodePath`"" | Set-Content $webConfig

# 5. .env (preserve production secrets if already deployed)
$deployEnv = Join-Path $DeployPath ".env"
if (-not (Test-Path $deployEnv)) {
  if (Test-Path (Join-Path $RepoPath ".env")) {
    Copy-Item (Join-Path $RepoPath ".env") $deployEnv -Force
    Write-Warning "Copied .env from repo. EDIT $deployEnv with PRODUCTION values (PAYLOAD_SECRET, MONGODB_URL)."
  } else {
    Write-Warning "No .env found. Create $deployEnv with PAYLOAD_SECRET and MONGODB_URL before the app will run."
  }
}

# 6. logs dir
New-Item -ItemType Directory -Force -Path (Join-Path $DeployPath "logs") | Out-Null

# 7. App pool: No Managed Code + AlwaysRunning + autoStart
Step "Configuring IIS app pool + site"
if (-not (Test-Path "IIS:\AppPools\$AppPool")) { New-WebAppPool -Name $AppPool | Out-Null }
Set-ItemProperty "IIS:\AppPools\$AppPool" -Name managedRuntimeVersion -Value ""        # No Managed Code
Set-ItemProperty "IIS:\AppPools\$AppPool" -Name startMode             -Value "AlwaysRunning"
Set-ItemProperty "IIS:\AppPools\$AppPool" -Name autoStart             -Value $true

# 8. Permissions for the app pool identity (read app, write logs)
$id = "IIS AppPool\$AppPool"
icacls $DeployPath /grant "${id}:(OI)(CI)RX" /T /Q | Out-Null
icacls (Join-Path $DeployPath "logs") /grant "${id}:(OI)(CI)M" /T /Q | Out-Null

# 9. Site bound to the port
if (-not (Test-Path "IIS:\Sites\$SiteName")) {
  New-Website -Name $SiteName -PhysicalPath $DeployPath -ApplicationPool $AppPool -Port $Port | Out-Null
} else {
  Set-ItemProperty "IIS:\Sites\$SiteName" -Name physicalPath    -Value $DeployPath
  Set-ItemProperty "IIS:\Sites\$SiteName" -Name applicationPool -Value $AppPool
  $hasBinding = Get-WebBinding -Name $SiteName | Where-Object { $_.bindingInformation -like "*:$($Port):*" }
  if (-not $hasBinding) { New-WebBinding -Name $SiteName -Protocol http -Port $Port | Out-Null }
}
Set-ItemProperty "IIS:\Sites\$SiteName" -Name serverAutoStart -Value $true

# 10. Start
Step "Starting"
Start-WebAppPool -Name $AppPool
Start-Website   -Name $SiteName

Write-Host "`nDeployed. Browse:  http://<server-ip>:$Port" -ForegroundColor Green
Write-Host "Runtime log:        $DeployPath\logs\node.log"  -ForegroundColor Green
