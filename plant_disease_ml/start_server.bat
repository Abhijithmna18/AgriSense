@echo off
echo.
echo ========================================
echo   AgriSense - Plant Disease ML Server
echo ========================================
echo.

REM --- Activate virtual environment if it exists ---
if exist "%~dp0..\\.venv\\Scripts\\activate.bat" (
    echo [1/2] Activating virtual environment...
    call "%~dp0..\\.venv\\Scripts\\activate.bat"
) else (
    echo [INFO] No .venv found. Using system Python environment.
    echo        If packages are missing, run: pip install -r requirements.txt
)

echo.
echo [2/2] Starting FastAPI Plant Disease Inference Server on port 8000...
echo       Press Ctrl+C to stop.
echo.

cd /d "%~dp0"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause
