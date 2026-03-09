@echo off
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║         LEAF VALIDATION - QUICK FIX                        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo [Step 1/5] Checking current status...
echo.

REM Check ML Service
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ ML Service is running
    set ML_RUNNING=1
) else (
    echo ✗ ML Service is NOT running
    set ML_RUNNING=0
)

REM Check Backend
curl -s http://localhost:5000/api/ml/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Backend is running
    set BACKEND_RUNNING=1
) else (
    echo ✗ Backend is NOT running
    set BACKEND_RUNNING=0
)

echo.
echo [Step 2/5] Creating required directories...
if not exist "farmer_ai-backend\uploads\temp" (
    mkdir "farmer_ai-backend\uploads\temp"
    echo ✓ Created temp directory
) else (
    echo ✓ Temp directory exists
)

echo.
echo [Step 3/5] Starting services...
echo.

if %ML_RUNNING%==0 (
    echo Starting ML Service...
    cd plant_disease_ml
    start "ML Service" cmd /k "python main.py"
    cd ..
    echo ✓ ML Service started in new window
    timeout /t 3 /nobreak >nul
) else (
    echo ML Service already running
)

if %BACKEND_RUNNING%==0 (
    echo Starting Backend...
    cd farmer_ai-backend
    start "Backend Server" cmd /k "npm start"
    cd ..
    echo ✓ Backend started in new window
    timeout /t 3 /nobreak >nul
) else (
    echo.
    echo ⚠️  Backend is running but may need restart
    echo    If you're still getting 404 errors:
    echo    1. Go to backend terminal
    echo    2. Press Ctrl+C
    echo    3. Run: npm start
    echo.
)

echo.
echo [Step 4/5] Waiting for services to initialize...
timeout /t 5 /nobreak >nul

echo.
echo [Step 5/5] Verifying services...
echo.

curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ ML Service is responding
) else (
    echo ✗ ML Service not responding yet (may need more time)
)

curl -s http://localhost:5000/api/ml/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Backend is responding
) else (
    echo ✗ Backend not responding yet (may need more time)
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    FIX COMPLETE                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Next Steps:
echo 1. Open browser: http://localhost:5173
echo 2. Go to Disease Detection page
echo 3. Upload an image to test
echo.
echo Expected Results:
echo   ✓ No 404 errors
echo   ✓ No toast.warning errors
echo   ✓ Validation works correctly
echo.
echo If still having issues:
echo   - Check the new terminal windows for errors
echo   - Run: CHECK_SERVICES.bat
echo   - See: TROUBLESHOOTING_GUIDE.md
echo.
pause
