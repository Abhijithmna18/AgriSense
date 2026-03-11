@echo off
echo ========================================
echo   Starting Python AI Service
echo ========================================
echo.
echo This service provides AI predictions for:
echo - Farm Health Scoring
echo - Yield Prediction
echo - Pest Risk Analysis
echo - Irrigation Advice
echo - Market Price Intelligence
echo.

cd farmer_ai-python

echo Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

echo.
echo Installing/Updating dependencies...
pip install -r requirements.txt

echo.
echo ========================================
echo   Starting AI Service on port 8000
echo ========================================
echo.
echo The service will be available at:
echo http://localhost:8000
echo.
echo Press Ctrl+C to stop the service
echo.

python main.py

pause
