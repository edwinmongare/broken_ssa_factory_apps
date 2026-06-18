#Requires -RunAsAdministrator
<#
  Run this ON THE IIS SERVER (elevated PowerShell) to diagnose the 500 error.
  It is read-only except for a short, controlled "node server.js" test run that
  it starts and then kills, used to surface the real startup error.

  Usage:
    .\diagnose-server.ps1
    .\diagnose-server.ps1 -DeployPath "C:\inetpub\wwwroot\factory-screens" -Port 3001
#>
[CmdletBinding()]
param(
  [string]$DeployPath = "C:\inetpub\wwwroot\factory-screens",
  [string]$SiteName   = "FactoryScreens",
  [string]$AppPool    = "FactoryScreens",
  [int]   $Port       = 3001,
  [string]$NodePath   = "C:\Program Files\nodejs\node.exe"
)

function Section($m) { Write-Host "`n=== $m ===" -ForegroundColor Cyan }
function OK($m) { Write-Host "  [OK]  $m" -ForegroundColor Green }
function BAD($m){ Write-Host "  [!!]  $m" -ForegroundColor Red }
function INFO($m){ Write-Host "  $m" -ForegroundColor Gray }

Import-Module WebAdministration -ErrorAction SilentlyContinue

# 1. IIS + HttpPlatformHandler module ------------------------------------------
Section "1. HttpPlatformHandler module"
$hph = Get-WebGlobalModule -ErrorAction SilentlyContinue | Where-Object { $_.Name -like '*httpPlatform*' }
if ($hph) {
  OK "Installed: $($hph.Name)  ($($hph.Image))"
  if ($hph.Image -and -not (Test-Path $hph.Image)) { BAD "Module DLL path does not exist: $($hph.Image)" }
} else {
  BAD "HttpPlatformHandler is NOT installed. THIS is almost certainly the 500."
  INFO "Download: https://www.iis.net/downloads/microsoft/httpplatformhandler"
  INFO "Install the x64 MSI, then re-run the deploy script."
}

# 2. Node runtime --------------------------------------------------------------
Section "2. Node.js"
if (Test-Path $NodePath) {
  OK "node.exe found at $NodePath  (version: $(& $NodePath -v))"
} else {
  BAD "node.exe NOT found at $NodePath"
  $alt = (Get-Command node -ErrorAction SilentlyContinue).Source
  if ($alt) { INFO "But 'node' resolves to: $alt  -> pass -NodePath '$alt' to deploy.ps1" }
}

# 3. Deploy folder contents ----------------------------------------------------
Section "3. Deploy folder: $DeployPath"
if (-not (Test-Path $DeployPath)) {
  BAD "Deploy folder does not exist. The deploy script did not place files here."
} else {
  foreach ($f in @("server.js","web.config",".env")) {
    if (Test-Path (Join-Path $DeployPath $f)) { OK "$f present" } else { BAD "$f MISSING" }
  }
  foreach ($d in @(".next",".next\static","public","node_modules")) {
    if (Test-Path (Join-Path $DeployPath $d)) { OK "$d\ present" } else { BAD "$d\ MISSING" }
  }
}

# 4. .env contents (keys only, never prints secret values) ---------------------
Section "4. .env keys (values hidden)"
$envFile = Join-Path $DeployPath ".env"
if (Test-Path $envFile) {
  $keys = (Get-Content $envFile | Where-Object { $_ -match '^\s*[A-Za-z_]' }) | ForEach-Object { ($_ -split '=')[0].Trim() }
  foreach ($req in @("PAYLOAD_SECRET","MONGODB_URL","DATABASE_URI")) {
    if ($keys -contains $req) { OK "$req is set" } else { INFO "$req not present (ok if unused)" }
  }
  if (-not ($keys -contains "PAYLOAD_SECRET")) { BAD "PAYLOAD_SECRET missing -> Payload will crash on boot." }
  if (-not ($keys -contains "MONGODB_URL") -and -not ($keys -contains "DATABASE_URI")) { BAD "No Mongo connection string -> DB connect will fail." }
} else {
  BAD ".env missing -> create it with PAYLOAD_SECRET and MONGODB_URL."
}

# 5. web.config processPath ----------------------------------------------------
Section "5. web.config processPath"
$wc = Join-Path $DeployPath "web.config"
if (Test-Path $wc) {
  $pp = ([regex]'processPath="([^"]*)"').Match((Get-Content $wc -Raw)).Groups[1].Value
  if ($pp) {
    if (Test-Path $pp) { OK "processPath -> $pp (exists)" } else { BAD "processPath -> $pp (DOES NOT EXIST)" }
  } else { BAD "processPath not found in web.config" }
}

# 6. App pool + site -----------------------------------------------------------
Section "6. IIS site + app pool"
if (Test-Path "IIS:\AppPools\$AppPool") {
  $ap = Get-Item "IIS:\AppPools\$AppPool"
  OK "App pool '$AppPool' state=$($ap.state) managedRuntime='$($ap.managedRuntimeVersion)' startMode=$($ap.startMode)"
  if ($ap.managedRuntimeVersion -ne "") { BAD "managedRuntimeVersion should be '' (No Managed Code)." }
} else { BAD "App pool '$AppPool' does not exist." }
if (Test-Path "IIS:\Sites\$SiteName") {
  $site = Get-Item "IIS:\Sites\$SiteName"
  OK "Site '$SiteName' state=$($site.state) path=$($site.physicalPath)"
  Get-WebBinding -Name $SiteName | ForEach-Object { INFO "binding: $($_.bindingInformation) ($($_.protocol))" }
} else { BAD "Site '$SiteName' does not exist." }

# 7. Tail the node startup log -------------------------------------------------
Section "7. logs\node.log (last 40 lines)"
$log = Join-Path $DeployPath "logs\node.log"
if (Test-Path $log) { Get-Content $log -Tail 40 } else { INFO "No node.log yet (process may never have started)." }

# 8. Controlled manual run: the real startup error -----------------------------
Section "8. Test run: node server.js (captures the real crash, then stops)"
if ((Test-Path $NodePath) -and (Test-Path (Join-Path $DeployPath "server.js"))) {
  $testPort = 38123
  $out = Join-Path $env:TEMP "fs_node_test_out.txt"
  $err = Join-Path $env:TEMP "fs_node_test_err.txt"
  Remove-Item $out,$err -ErrorAction SilentlyContinue
  Push-Location $DeployPath
  try {
    $env:PORT = "$testPort"; $env:HOSTNAME = "127.0.0.1"; $env:NODE_ENV = "production"
    $p = Start-Process -FilePath $NodePath -ArgumentList "server.js" -WorkingDirectory $DeployPath `
          -RedirectStandardOutput $out -RedirectStandardError $err -PassThru -NoNewWindow
    # give it time to either bind or crash
    for ($i=0; $i -lt 12 -and -not $p.HasExited; $i++) { Start-Sleep -Milliseconds 500 }
    if ($p.HasExited) {
      BAD "node exited early (code $($p.ExitCode)). Startup error below:"
    } else {
      OK "node started and is listening (no startup crash). Stopping test process."
      Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
    }
  } finally { Pop-Location }
  Write-Host "`n--- STDOUT ---" -ForegroundColor Yellow; if (Test-Path $out) { Get-Content $out }
  Write-Host "`n--- STDERR ---" -ForegroundColor Yellow; if (Test-Path $err) { Get-Content $err }
} else {
  INFO "Skipped (node.exe or server.js missing)."
}

Section "Done"
Write-Host "Fix the first [!!] lines above, then re-run deploy.ps1." -ForegroundColor Cyan
