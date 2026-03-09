@echo off
echo ========================================
echo  Service Status Check
echo ========================================
echo.

echo Checking ML Service (Port 8000)...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ ML Service is RUNNING on port 8000
    curl -s http://localhost:8000/health
) else (
    echo ✗ ML Service is NOT running on port 8000
    echo   Start with: cd plant_disease_ml ^&^& python main.py
)
echo.

echo Checking Backend Server (Port 5000)...
curl -s http://localhost:5000/api/ml/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Backend Server is RUNNING on port 5000
    curl -s http://localhost:5000/api/ml/health
) else (
    echo ✗ Backend Server is NOT running on port 5000
    echo   Start with: cd farmer_ai-backend ^&^& npm start
)
echo.

echo Checking Frontend (Port 5173)...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Frontend is RUNNING on port 5173
) else (
    echo ✗ Frontend is NOT running on port 5173
    echo   Start with: cd farmer_ai-frontend ^&^& npm run dev
)
echo.

echo ========================================
echo  Directory Check
echo ========================================
echo.

if exist "farmer_ai-backend\uploads\temp" (
    echo ✓ Temp directory exists: farmer_ai-backend\uploads\temp
) else (
    echo ✗ Temp directory missing: farmer_ai-backend\uploads\temp
    echo   Creating it now...
    mkdir "farmer_ai-backend\uploads\temp"
    echo ✓ Created
)
echo.

echo ========================================
echo  File Check
echo ========================================
echo.

if exist "plant_disease_ml\leaf_validator.py" (
    echo ✓ leaf_validator.py exists
) else (
    echo ✗ leaf_validator.py missing!
)

if exist "plant_disease_ml\main.py" (
    echo ✓ main.py exists
) else (
    echo ✗ main.py missing!
)

if exist "farmer_ai-backend\src\routes\diseaseRoutes.js" (
    echo ✓ diseaseRoutes.js exists
) else (
    echo ✗ diseaseRoutes.js missing!
)

if exist "farmer_ai-frontend\src\pages\DiseasePredictionPage.jsx" (
    echo ✓ DiseasePredictionPage.jsx exists
) else (
    echo ✗ DiseasePredictionPage.jsx missing!
)
echo.

echo ========================================
echo  Summary
echo ========================================
echo.
echo If any service is not running, use:
echo   RESTART_ALL_SERVICES.bat
echo.
echo Or start manually:
echo   1. ML Service: cd plant_disease_ml ^&^& python main.py
echo   2. Backend: cd farmer_ai-backend ^&^& npm start
echo   3. Frontend: cd farmer_ai-frontend ^&^& npm run dev
echo.
pause
