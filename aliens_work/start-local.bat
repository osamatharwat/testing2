@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install Node.js 20+ first.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing dependencies...
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo Failed to install dependencies.
    pause
    exit /b 1
  )
)
start "Aliens Space Dev Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
start "" "http://localhost:3000"
endlocal
