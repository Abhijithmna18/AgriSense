@echo off
REM Called by npm start / npm run dev via concurrently.
REM Starts BOTH ML servers: Disease (port 8000) + Yield Prediction (port 8001)
REM Uses the .venv Python to avoid sklearn pickle version mismatches.

set AGRI_ROOT=%~dp0..

REM Resolve venv uvicorn path
set VENV_UVICORN=%AGRI_ROOT%\.venv\Scripts\uvicorn.exe
set VENV_PYTHON=%AGRI_ROOT%\.venv\Scripts\python.exe

REM Activate venv
if exist "%AGRI_ROOT%\.venv\Scripts\activate.bat" (
    call "%AGRI_ROOT%\.venv\Scripts\activate.bat"
) else (
    echo [ML] WARNING: .venv not found at %AGRI_ROOT%\.venv — using system Python.
    set VENV_UVICORN=uvicorn
    set VENV_PYTHON=python
)

REM ── Disease ML server (port 8000) in a new window ──
echo [DISEASE-ML] Starting Disease Prediction server on port 8000...
start "Disease ML (Port 8000)" cmd /k "cd /d %AGRI_ROOT%\plant_disease_ml && "%VENV_UVICORN%" main:app --host 0.0.0.0 --port 8000"

REM ── Yield ML server (port 8001) in this window ──
echo [YIELD-ML] Starting Crop Yield Prediction server on port 8001...
cd /d "%AGRI_ROOT%\crop_yield_ml"

if not exist "model.pkl" (
    echo [YIELD-ML] model.pkl not found. Training model with venv Python...
    "%VENV_PYTHON%" train.py
)

"%VENV_UVICORN%" main:app --host 0.0.0.0 --port 8001
