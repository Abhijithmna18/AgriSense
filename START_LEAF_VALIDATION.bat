@echo off
echo ========================================
echo  Leaf Validation System - Quick Start
echo ========================================
echo.

echo [1/3] Checking Python ML Service...
cd plant_disease_ml

echo.
echo Installing/Updating Python dependencies...
pip install -q torch torchvision pillow opencv-python numpy fastapi uvicorn python-multipart

echo.
echo [2/3] Starting ML Service with Leaf Validation...
echo Service will run on http://localhost:8000
echo.
echo Available endpoints:
echo   - GET  /health           (Health check)
echo   - POST /validate-leaf    (Leaf validation)
echo   - POST /predict-disease  (Disease detection with auto-validation)
echo.
echo Press Ctrl+C to stop the service
echo.

start "Plant Disease ML Service" cmd /k "python main.py"

timeout /t 3 /nobreak >nul

echo.
echo [3/3] Testing ML Service...
curl -s http://localhost:8000/health

echo.
echo ========================================
echo  ML Service Started Successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Start the backend: cd farmer_ai-backend ^&^& npm start
echo 2. Start the frontend: cd farmer_ai-frontend ^&^& npm run dev
echo 3. Navigate to Disease Detection page
echo 4. Upload an image to test validation
echo.
echo The system will now automatically validate images before diagnosis.
echo.
pause
