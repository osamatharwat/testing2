$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host 'Node.js 20+ is required.' -ForegroundColor Red
  exit 1
}
if (-not (Test-Path node_modules)) {
  npm install --no-audit --no-fund
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
Start-Process powershell -ArgumentList '-NoExit','-Command','npm run dev' -WorkingDirectory $PSScriptRoot
Start-Sleep -Seconds 3
Start-Process 'http://localhost:3000'
