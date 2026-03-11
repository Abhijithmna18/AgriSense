@echo off
echo ========================================
echo Roles System Diagnostic Tool
echo ========================================
echo.

echo [1/6] Checking file existence...
if exist "farmer_ai-backend\src\models\Role.js" (echo [OK] Role.js) else (echo [FAIL] Role.js missing)
if exist "farmer_ai-backend\src\models\Permission.js" (echo [OK] Permission.js) else (echo [FAIL] Permission.js missing)
if exist "farmer_ai-backend\src\controllers\roleController.js" (echo [OK] roleController.js) else (echo [FAIL] roleController.js missing)
if exist "farmer_ai-backend\src\scripts\seedPermissions.js" (echo [OK] seedPermissions.js) else (echo [FAIL] seedPermissions.js missing)
if exist "farmer_ai-frontend\src\pages\admin\RolesPermissionsAdmin.jsx" (echo [OK] RolesPermissionsAdmin.jsx) else (echo [FAIL] RolesPermissionsAdmin.jsx missing)

echo.
echo [2/6] Checking syntax...
cd farmer_ai-backend
node -c src/models/Role.js 2>nul && echo [OK] Role.js syntax || echo [FAIL] Role.js has errors
node -c src/models/Permission.js 2>nul && echo [OK] Permission.js syntax || echo [FAIL] Permission.js has errors
node -c src/controllers/roleController.js 2>nul && echo [OK] roleController.js syntax || echo [FAIL] roleController.js has errors
cd ..

echo.
echo [3/6] Checking if backend is running...
netstat -an | findstr ":5002" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Backend appears to be running on port 5002
    echo [ACTION NEEDED] You need to RESTART the backend server
    echo Press Ctrl+C in the backend terminal, then run: npm start
) else (
    echo [WARN] Backend not detected on port 5002
    echo [ACTION NEEDED] Start backend: cd farmer_ai-backend ^&^& npm start
)

echo.
echo [4/6] Checking if frontend is running...
netstat -an | findstr ":5173" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Frontend appears to be running on port 5173
) else (
    echo [WARN] Frontend not detected on port 5173
    echo [ACTION NEEDED] Start frontend: cd farmer_ai-frontend ^&^& npm run dev
)

echo.
echo [5/6] Checking MongoDB connection...
if exist "farmer_ai-backend\.env" (
    echo [OK] .env file exists
    findstr /C:"MONGO_URI" farmer_ai-backend\.env >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [OK] MONGO_URI found in .env
    ) else (
        echo [FAIL] MONGO_URI not found in .env
    )
) else (
    echo [FAIL] .env file missing
)

echo.
echo [6/6] Checking adminRoutes.js...
findstr /C:"roleController" farmer_ai-backend\src\routes\adminRoutes.js >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] roleController imported in adminRoutes.js
) else (
    echo [FAIL] roleController not found in adminRoutes.js
)

echo.
echo ========================================
echo Diagnostic Summary
echo ========================================
echo.
echo REQUIRED ACTIONS:
echo.
echo 1. SEED THE DATABASE (if not done yet):
echo    cd farmer_ai-backend
echo    node src/scripts/seedPermissions.js
echo.
echo 2. RESTART BACKEND SERVER:
echo    - Stop current backend (Ctrl+C)
echo    - cd farmer_ai-backend
echo    - npm start
echo.
echo 3. RESTART FRONTEND (if needed):
echo    - Stop current frontend (Ctrl+C)
echo    - cd farmer_ai-frontend
echo    - npm run dev
echo.
echo 4. CLEAR BROWSER CACHE:
echo    - Press F12 (DevTools)
echo    - Right-click refresh button
echo    - Select "Empty Cache and Hard Reload"
echo.
echo 5. TEST:
echo    - Login as admin
echo    - Navigate to Roles ^& Permissions
echo    - Check browser console for errors
echo.
pause
