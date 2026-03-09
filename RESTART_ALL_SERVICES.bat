@echo off
echo ========================================
echo  Restart All Services - Fix Errors
echo ========================================
echo.

echo This script will help you restart all services properly.
echo.
echo IMPORTANT: You need to manually stop running services first!
echo.
echo Step 1: Stop all running services
echo --------------------------------
echo In each terminal window, press Ctrl+C to stop:
echo   1. Backend server (farmer_ai-backend)
echo   2. Frontend server (farmer_ai-frontend)
echo   3. ML service (plant_disease_ml)
echo.
pause
echo.

echo Step 2: Create required directories
echo --------------------------------
if not exist "farmer_ai-backend\uploads\temp" (
    mkdir "farmer_ai-backend\uploads\temp"
    echo ✓ Created farmer_ai-backend\uploads\temp
) else (
    echo ✓ Directory already exists: farmer_ai-backend\uploads\temp
)
echo.

echo Step 3: Start ML Service
echo --------------------------------
echo Starting Python ML service on port 8000...
cd plant_disease_ml
start "ML Service - Port 8000" cmd /k "python main.py"
cd ..
echo ✓ ML Service started in new window
echo   Wait 5 seconds for it to load...
timeout /t 5 /nobreak >nul
echo.

echo Step 4: Start Backend Server
echo --------------------------------
echo Starting Node.js backend on port 5000...
cd farmer_ai-backend
start "Backend Server - Port 5000" cmd /k "npm start"
cd ..
echo ✓ Backend Server started in new window
echo   Wait 5 seconds for it to load...
timeout /t 5 /nobreak >nul
echo.

echo Step 5: Frontend should auto-reload
echo --------------------------------
echo If frontend is running, it should auto-reload.
echo If not, start it manually:
echo   cd farmer_ai-frontend
echo   npm run dev
echo.

echo ========================================
echo  Services Started
echo ========================================
echo.
echo Check the new terminal windows for:
echo   1. ML Service: "Model loaded successfully"
echo   2. Backend: "Server running on port 5000"
echo.
echo Then test in browser:
echo   http://localhost:5173
echo.
echo Expected Results:
echo   ✓ No 404 errors on /api/ml/validate-leaf
echo   ✓ No toast.warning errors
echo   ✓ Validation works correctly
echo.
pause
