@echo off
REM Starts the Crop Yield Prediction FastAPI server on port 8001
set AGRI_ROOT=%~dp0..
echo [YIELD-ML] Starting Crop Yield Prediction server on http://0.0.0.0:8001 ...

if exist "%AGRI_ROOT%\.venv\Scripts\activate.bat" (
    call "%AGRI_ROOT%\.venv\Scripts\activate.bat"
)

cd /d "%~dp0"

if not exist "model.pkl" (
    echo [YIELD-ML] model.pkl not found! Running training pipeline...
    echo [YIELD-ML] Step 1: Downloading dataset...
    python download_dataset.py
    echo [YIELD-ML] Step 2: Training model...
    python train.py
)

echo [YIELD-ML] Starting uvicorn on port 8001...
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
