@echo off
echo ========================================
echo   Fix Soil Test Data - AgriSense
echo ========================================
echo.
echo This script will add soil test data to farms that don't have it.
echo.

cd farmer_ai-backend

echo Checking if backend dependencies are installed...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
)

echo.
echo Running soil test seeding script...
node seed_soil_tests.js

echo.
echo ========================================
echo   Script completed!
echo ========================================
echo.
echo You can now use the Fertilizer Calculator.
echo.
pause
