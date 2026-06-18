#Requires -RunAsAdministrator
<#
  Installs the IIS HttpPlatformHandler module on THE SERVER, then restarts IIS.
  This is the module our web.config needs to launch `node server.js`. Without it
  IIS returns HTTP 500 for every request (the app itself is fine).

  The server may not have internet access, so this script installs from a LOCAL
  MSI you download once from the official page:

      https://www.iis.net/downloads/microsoft/httpplatformhandler
      (use the x64 installer: "httpplatformhandler_amd64.msi")

  Usage (elevated PowerShell, on the server):
      .\install-httpplatformhandler.ps1 -MsiPath "C:\path\to\httpplatformhandler_amd64.msi"
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$MsiPath
)

$ErrorActionPreference = "Stop"
function Section($m) { Write-Host "`n=== $m ===" -ForegroundColor Cyan }

Import-Module WebAdministration -ErrorAction SilentlyContinue

# Already installed?
Section "Checking current state"
$existing = Get-WebGlobalModule -ErrorAction SilentlyContinue | Where-Object { $_.Name -like '*httpPlatform*' }
if ($existing) {
  Write-Host "  HttpPlatformHandler already installed: $($existing.Name)" -ForegroundColor Green
  Write-Host "  Nothing to do. If you still get 500, run diagnose-server.ps1." -ForegroundColor Green
  return
}

if (-not (Test-Path $MsiPath)) {
  throw "MSI not found at '$MsiPath'. Download the x64 MSI from https://www.iis.net/downloads/microsoft/httpplatformhandler"
}

# Install silently
Section "Installing $([System.IO.Path]::GetFileName($MsiPath))"
$log = Join-Path $env:TEMP "hph_install.log"
$p = Start-Process msiexec.exe -ArgumentList "/i `"$MsiPath`" /qn /norestart /l*v `"$log`"" -Wait -PassThru
if ($p.ExitCode -ne 0) {
  throw "msiexec failed with exit code $($p.ExitCode). See log: $log"
}
Write-Host "  Installer finished (exit 0). Log: $log" -ForegroundColor Green

# Restart IIS so the module loads
Section "Restarting IIS (iisreset)"
iisreset | Out-Host

# Verify
Section "Verifying"
$now = Get-WebGlobalModule -ErrorAction SilentlyContinue | Where-Object { $_.Name -like '*httpPlatform*' }
if ($now) {
  Write-Host "  [OK] HttpPlatformHandler is now installed: $($now.Name)" -ForegroundColor Green
  Write-Host "`n  Browse:  http://<server-ip>:3001" -ForegroundColor Cyan
  Write-Host "  If anything is still off, re-run diagnose-server.ps1." -ForegroundColor Cyan
} else {
  throw "Module still not detected after install. Check the MSI architecture (must be x64) and the log: $log"
}
