#Requires -RunAsAdministrator
<#
  Run ON THE SERVER (elevated) to capture the REAL cause of the login 500.

  The app starts fine, but /api/users/login crashes. The Payload config
  (MongoDB + sharp) only loads when an /api/* request arrives, so the error
  shows up only when we actually call the endpoint. This script:

    1. Tails logs\node.log (HttpPlatformHandler captures stdout/stderr here).
    2. Parses the Mongo host:port from .env (NEVER prints credentials) and tests
       TCP reachability from the server -> the #1 "works in dev, 500 in prod" cause.
    3. Calls the live login endpoint locally and prints the status + error body.
    4. Re-tails node.log to show the fresh stack trace produced by step 3.

  Usage:
    .\diagnose-login.ps1
    .\diagnose-login.ps1 -Port 3001 -Email "you@example.com" -Password "yourpass"

  -Email/-Password are optional; with them the login attempt is realistic.
  Without them it sends a dummy attempt purely to trigger and capture the 500.
#>
[CmdletBinding()]
param(
  [string]$DeployPath = "C:\inetpub\wwwroot\factory-screens",
  [int]   $Port       = 3001,
  [string]$Email      = "diagnostic@nobody.local",
  [string]$Password   = "diagnostic-not-a-real-password"
)

function Section($m) { Write-Host "`n=== $m ===" -ForegroundColor Cyan }
function INFO($m) { Write-Host "  $m" -ForegroundColor Gray }
function BAD($m)  { Write-Host "  [!!]  $m" -ForegroundColor Red }
function OK($m)   { Write-Host "  [OK]  $m" -ForegroundColor Green }

$log = Join-Path $DeployPath "logs\node.log"

# 1. Current log tail ----------------------------------------------------------
Section "1. logs\node.log (last 30 lines, BEFORE test)"
if (Test-Path $log) { Get-Content $log -Tail 30 } else { INFO "node.log not found at $log" }

# 2. MongoDB reachability (no secrets printed) ---------------------------------
Section "2. MongoDB reachability from this server"
$envFile = Join-Path $DeployPath ".env"
$mongoLine = $null
if (Test-Path $envFile) {
  $mongoLine = (Get-Content $envFile | Where-Object { $_ -match '^\s*(MONGODB_URL|DATABASE_URI)\s*=' } | Select-Object -First 1)
}
if (-not $mongoLine) {
  BAD "No MONGODB_URL/DATABASE_URI line found in .env"
} else {
  $uri = ($mongoLine -split '=', 2)[1].Trim().Trim('"').Trim("'")
  $isSrv = $uri -match '^mongodb\+srv://'
  # strip credentials + scheme, keep only host[:port] list
  $hostPart = $uri -replace '^mongodb(\+srv)?://', '' -replace '^[^@]*@', '' -replace '[/?].*$', ''
  $hosts = $hostPart -split ','
  if ($isSrv) {
    INFO "Connection type: mongodb+srv (Atlas/DNS SRV). Host: $hostPart"
    INFO "Resolving SRV record _mongodb._tcp.$hostPart ..."
    try {
      $srv = Resolve-DnsName -Type SRV -Name "_mongodb._tcp.$hostPart" -ErrorAction Stop
      foreach ($r in ($srv | Where-Object { $_.QueryType -eq 'SRV' })) {
        $t = Test-NetConnection -ComputerName $r.NameTarget -Port $r.Port -WarningAction SilentlyContinue
        if ($t.TcpTestSucceeded) { OK "Reachable: $($r.NameTarget):$($r.Port)" }
        else { BAD "NOT reachable: $($r.NameTarget):$($r.Port)  (firewall / Atlas IP allowlist?)" }
      }
    } catch {
      BAD "SRV DNS resolution FAILED for $hostPart : $($_.Exception.Message)"
      INFO "The server may lack DNS/internet access to Atlas, or the host is wrong."
    }
  } else {
    foreach ($h in $hosts) {
      $name = ($h -split ':')[0]
      $p    = if ($h -match ':') { [int]($h -split ':')[1] } else { 27017 }
      $t = Test-NetConnection -ComputerName $name -Port $p -WarningAction SilentlyContinue
      if ($t.TcpTestSucceeded) { OK "Reachable: ${name}:$p" }
      else { BAD "NOT reachable: ${name}:$p  (firewall / mongod not running / IP allowlist?)" }
    }
  }
}

# 3. Call the live login endpoint ---------------------------------------------
Section "3. POST http://127.0.0.1:$Port/api/users/login"
$body = @{ email = $Email; password = $Password } | ConvertTo-Json
try {
  $resp = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/api/users/login" -Method POST `
            -ContentType "application/json" -Body $body -UseBasicParsing -TimeoutSec 30
  OK "HTTP $($resp.StatusCode)"
  INFO ($resp.Content)
} catch {
  $r = $_.Exception.Response
  if ($r) {
    $code = [int]$r.StatusCode
    if ($code -eq 401 -or $code -eq 400) {
      OK "HTTP $code (endpoint WORKS - this is just wrong credentials, not a server fault)."
      INFO "=> The 500 you saw was DB/startup related and is now resolved, OR your real creds are wrong."
    } else {
      BAD "HTTP $code"
    }
    try {
      $sr = New-Object System.IO.StreamReader($r.GetResponseStream())
      $errBody = $sr.ReadToEnd()
      INFO "Response body:"; INFO $errBody
    } catch {}
  } else {
    BAD "Request failed with no HTTP response: $($_.Exception.Message)"
  }
}

# 4. Fresh log tail (the stack trace from step 3) ------------------------------
Start-Sleep -Seconds 1
Section "4. logs\node.log (last 40 lines, AFTER test - look here for the stack)"
if (Test-Path $log) { Get-Content $log -Tail 40 } else { INFO "node.log still not found." }

Section "Interpretation"
INFO "If step 2 shows NOT reachable  -> fix firewall / Atlas IP allowlist / Mongo host. (most common)"
INFO "If step 4 shows a sharp/native error -> rebuild on the server, or copy node_modules/sharp."
INFO "If step 3 returns 401/400 -> the server is fine; it was a transient/DB issue or wrong password."
