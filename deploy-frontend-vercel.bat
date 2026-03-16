@echo off
REM Vercel Frontend-Only Deployment Script for Windows
REM Usage: deploy-frontend-vercel.bat [deploy|prod]

setlocal enabledelayedexpansion

set DEPLOY_TYPE=%1
if "%DEPLOY_TYPE%"=="" set DEPLOY_TYPE=deploy

set FRONTEND_DIR=farmer_ai-frontend

echo.
echo ========================================
echo   Vercel Frontend Deployment
echo ========================================
echo Deploy Type: %DEPLOY_TYPE%
echo.

REM Check if vercel is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo [!] Vercel CLI not found. Installing...
  call npm install -g vercel
  if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install Vercel CLI
    exit /b 1
  )
)

echo [OK] Vercel CLI found

REM Navigate to frontend directory
cd %FRONTEND_DIR%

echo.
echo [*] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
  echo [ERROR] npm install failed
  exit /b 1
)

echo [OK] Dependencies installed

echo.
echo [*] Building frontend...
call npm run build
if %ERRORLEVEL% NEQ 0 (
  echo [ERROR] Build failed
  exit /b 1
)

echo [OK] Build successful

echo.
echo [*] Deploying to Vercel...

if "%DEPLOY_TYPE%"=="prod" (
  echo [*] Deploying to PRODUCTION...
  call vercel --prod
) else (
  echo [*] Deploying to PREVIEW...
  call vercel
)

if %ERRORLEVEL% NEQ 0 (
  echo [ERROR] Deployment failed
  exit /b 1
)

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Check deployment: vercel logs --follow
echo 2. Add environment variables in Vercel dashboard
echo 3. Configure custom domain (optional)
echo 4. Monitor: https://vercel.com/dashboard
echo.

cd ..

pause
