@echo off
echo ========================================
echo Mini Bank Integration Setup
echo ========================================
echo.

echo Step 1: Checking backend environment...
cd farmer_ai-backend
if not exist .env (
    echo ERROR: .env file not found in farmer_ai-backend
    echo Please create .env file first
    pause
    exit /b 1
)

echo Step 2: Adding environment variables...
findstr /C:"FD_INTEREST_RATE" .env >nul
if errorlevel 1 (
    echo FD_INTEREST_RATE=7.5 >> .env
    echo DAILY_TRANSACTION_LIMIT=100000 >> .env
    echo Environment variables added!
) else (
    echo Environment variables already exist
)

echo.
echo Step 3: Verifying server.js integration...
findstr /C:"miniBankRoutes" server.js >nul
if errorlevel 1 (
    echo WARNING: Mini Bank routes not found in server.js
    echo Please add manually:
    echo app.use('/api/finance/minibank', require('./routes/miniBankRoutes'));
) else (
    echo Mini Bank routes found in server.js
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start backend: cd farmer_ai-backend ^&^& npm run dev
echo 2. Start frontend: cd farmer_ai-frontend ^&^& npm run dev
echo 3. Navigate to: http://localhost:3000/financial-services
echo.
echo The Mini Bank section will appear on the Financial Overview page.
echo.
pause
