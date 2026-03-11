@echo off
echo ========================================
echo AgriSense Feature Flags Setup
echo ========================================
echo.

echo Step 1: Seeding Feature Flags...
cd farmer_ai-backend
node src/scripts/seedFeatureFlags.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to seed feature flags
    echo Please check your MongoDB connection and try again
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo 12 default feature flags have been created:
echo.
echo 1. AI Crop Predictions (ENABLED)
echo 2. Vendor Marketplace (ENABLED)
echo 3. Warehouse Booking (ENABLED)
echo 4. Advanced Analytics (ENABLED)
echo 5. Weather Alerts (ENABLED)
echo 6. Loan Management System (ENABLED)
echo 7. Community Forum (ENABLED)
echo 8. Disease Detection (ENABLED)
echo 9. Smart Irrigation (ENABLED - 50%% rollout)
echo 10. New Dashboard Beta (DISABLED - staging only)
echo 11. Payment Gateway (ENABLED)
echo 12. Crop Rotation Planner (ENABLED - 75%% rollout)
echo.
echo Next steps:
echo 1. Restart your backend server (if running)
echo 2. Login as admin
echo 3. Navigate to Feature Flags page
echo 4. You should see all 12 flags
echo.
pause
