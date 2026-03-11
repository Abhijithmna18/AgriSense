@echo off
echo ========================================
echo Testing Roles & Permissions Setup
echo ========================================
echo.

echo Checking file existence...
echo.

if exist "farmer_ai-backend\src\models\Role.js" (
    echo [OK] Role model exists
) else (
    echo [ERROR] Role model missing
)

if exist "farmer_ai-backend\src\models\Permission.js" (
    echo [OK] Permission model exists
) else (
    echo [ERROR] Permission model missing
)

if exist "farmer_ai-backend\src\controllers\roleController.js" (
    echo [OK] Role controller exists
) else (
    echo [ERROR] Role controller missing
)

if exist "farmer_ai-backend\src\scripts\seedPermissions.js" (
    echo [OK] Seed script exists
) else (
    echo [ERROR] Seed script missing
)

if exist "farmer_ai-frontend\src\pages\admin\RolesPermissionsAdmin.jsx" (
    echo [OK] Frontend page exists
) else (
    echo [ERROR] Frontend page missing
)

echo.
echo Checking syntax...
echo.

cd farmer_ai-backend
node -c src/models/Role.js 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Role model syntax valid
) else (
    echo [ERROR] Role model has syntax errors
)

node -c src/models/Permission.js 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Permission model syntax valid
) else (
    echo [ERROR] Permission model has syntax errors
)

node -c src/controllers/roleController.js 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Role controller syntax valid
) else (
    echo [ERROR] Role controller has syntax errors
)

cd ..

echo.
echo ========================================
echo Test Complete
echo ========================================
echo.
echo Next steps:
echo 1. Run: SETUP_ROLES_SYSTEM.bat (to seed database)
echo 2. Restart backend server
echo 3. Restart frontend server
echo 4. Check browser console for errors
echo.
pause
