@echo off
echo ========================================
echo  Fixing 404 Error - Leaf Validation
echo ========================================
echo.

echo [1/4] Creating required directories...
if not exist "farmer_ai-backend\uploads\temp" mkdir "farmer_ai-backend\uploads\temp"
echo ✓ Temp directory created

echo.
echo [2/4] Checking ML Service...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ ML Service is running
) else (
    echo ✗ ML Service is NOT running
    echo.
    echo Starting ML Service...
    cd plant_disease_ml
    start "ML Service" cmd /k "python main.py"
    cd ..
    timeout /t 5 /nobreak >nul
)

echo.
echo [3/4] Restarting Backend Server...
echo Please stop the backend server (Ctrl+C) and restart it:
echo   cd farmer_ai-backend
echo   npm start
echo.

echo [4/4] Frontend Fix Applied
echo The toast.warning error has been fixed in the code.
echo.

echo ========================================
echo  Fix Summary
echo ========================================
echo.
echo Issues Fixed:
echo 1. ✓ toast.warning → toast.error (code updated)
echo 2. ✓ Temp directory created
echo 3. ⚠ Backend needs restart to load validation route
echo.
echo Next Steps:
echo 1. Stop backend server (Ctrl+C in its terminal)
echo 2. Restart: cd farmer_ai-backend && npm start
echo 3. Refresh browser and test upload
echo.
echo Expected Result:
echo - No more 404 errors on /api/ml/validate-leaf
echo - No more toast.warning errors
echo - Validation works correctly
echo.
pause
