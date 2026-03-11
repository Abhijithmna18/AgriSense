@echo off
echo ========================================
echo Restarting AgriSense Servers
echo ========================================
echo.

echo Step 1: Finding and stopping existing processes...
echo.

REM Find process on port 5002 (backend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5002') do (
    echo Stopping backend process %%a
    taskkill /F /PID %%a 2>nul
)

REM Find process on port 5173 (frontend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    echo Stopping frontend process %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo Step 2: Servers stopped. Please start them manually:
echo.
echo Backend:
echo   cd farmer_ai-backend
echo   npm start
echo.
echo Frontend:
echo   cd farmer_ai-frontend
echo   npm run dev
echo.
echo Or open two separate terminals and run the commands above.
echo.
pause
