@echo off
echo ========================================
echo AgriSense Roles & Permissions Setup
echo ========================================
echo.

echo Step 1: Seeding Permissions and Roles...
cd farmer_ai-backend
node src/scripts/seedPermissions.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to seed permissions and roles
    echo Please check your MongoDB connection and try again
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Restart your backend server: cd farmer_ai-backend ^&^& npm start
echo 2. Restart your frontend: cd farmer_ai-frontend ^&^& npm run dev
echo 3. Login as admin and navigate to Roles ^& Permissions
echo.
echo Default roles created:
echo - Admin (Full access)
echo - Vendor (Marketplace access)
echo - Farmer (Farm management)
echo - Loan Officer (Loan approvals)
echo - Manager (Reports and monitoring)
echo.
pause
