@echo off
echo ========================================
echo  Loan Approval System - Quick Start
echo ========================================
echo.

echo Step 1: Seeding test loan data...
cd farmer_ai-backend
call node seed_test_loans.js
echo.

echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start backend: cd farmer_ai-backend ^&^& npm start
echo 2. Start frontend: cd farmer_ai-frontend ^&^& npm run dev
echo 3. Login as admin
echo 4. Navigate to /admin/loans
echo.
echo Press any key to exit...
pause >nul
