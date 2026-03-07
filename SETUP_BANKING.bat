@echo off
echo ========================================
echo Banking System Integration for Windows
echo ========================================
echo.

echo Step 1: Installing Backend Dependencies...
cd farmer_ai-backend
call npm install qrcode node-cron
cd ..
echo ✓ Backend dependencies installed
echo.

echo Step 2: Installing Frontend Dependencies...
cd farmer_ai-frontend
call npm install qrcode.react
cd ..
echo ✓ Frontend dependencies installed
echo.

echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Run: .\INTEGRATE_BANKING_WINDOWS.ps1
echo 2. Update farmer_ai-backend/server.js (see WINDOWS_SETUP_COMMANDS.md)
echo 3. Update farmer_ai-backend/.env (see WINDOWS_SETUP_COMMANDS.md)
echo 4. Update farmer_ai-frontend/src/main.jsx (see WINDOWS_SETUP_COMMANDS.md)
echo.
echo Then start servers:
echo - Backend: cd farmer_ai-backend ^&^& npm run dev
echo - Frontend: cd farmer_ai-frontend ^&^& npm start
echo.
pause
