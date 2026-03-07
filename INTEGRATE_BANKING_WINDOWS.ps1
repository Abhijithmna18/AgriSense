# Windows PowerShell Integration Script for Banking System
# Run this in PowerShell: .\INTEGRATE_BANKING_WINDOWS.ps1

Write-Host "🏦 Integrating Mini Banking System with AgriSense..." -ForegroundColor Cyan
Write-Host ""

# Backend Integration
Write-Host "📦 Copying Backend Files..." -ForegroundColor Blue

# Copy Models
Write-Host "Copying models..."
Copy-Item "mini-banking-system\backend\models\Ledger.js" "farmer_ai-backend\models\" -Force
Copy-Item "mini-banking-system\backend\models\Transaction.js" "farmer_ai-backend\models\" -Force
Copy-Item "mini-banking-system\backend\models\Bill.js" "farmer_ai-backend\models\" -Force
Copy-Item "mini-banking-system\backend\models\SavingsGoal.js" "farmer_ai-backend\models\" -Force
Copy-Item "mini-banking-system\backend\models\FixedDeposit.js" "farmer_ai-backend\models\" -Force
Copy-Item "mini-banking-system\backend\models\VirtualCard.js" "farmer_ai-backend\models\" -Force
Copy-Item "mini-banking-system\backend\models\OTP.js" "farmer_ai-backend\models\" -Force
Copy-Item "mini-banking-system\backend\models\Notification.js" "farmer_ai-backend\models\" -Force

# Copy Controllers
Write-Host "Copying controllers..."
New-Item -ItemType Directory -Force -Path "farmer_ai-backend\controllers" | Out-Null
Copy-Item "mini-banking-system\backend\controllers\walletController.js" "farmer_ai-backend\controllers\" -Force
Copy-Item "mini-banking-system\backend\controllers\transactionController.js" "farmer_ai-backend\controllers\" -Force
Copy-Item "mini-banking-system\backend\controllers\paymentController.js" "farmer_ai-backend\controllers\" -Force
Copy-Item "mini-banking-system\backend\controllers\billController.js" "farmer_ai-backend\controllers\" -Force
Copy-Item "mini-banking-system\backend\controllers\savingsController.js" "farmer_ai-backend\controllers\" -Force
Copy-Item "mini-banking-system\backend\controllers\fdController.js" "farmer_ai-backend\controllers\" -Force
Copy-Item "mini-banking-system\backend\controllers\cardController.js" "farmer_ai-backend\controllers\" -Force
Copy-Item "mini-banking-system\backend\controllers\notificationController.js" "farmer_ai-backend\controllers\" -Force
Copy-Item "mini-banking-system\backend\controllers\securityController.js" "farmer_ai-backend\controllers\" -Force

# Copy Utils
Write-Host "Copying utilities..."
New-Item -ItemType Directory -Force -Path "farmer_ai-backend\utils" | Out-Null
Copy-Item "mini-banking-system\backend\utils\scheduledTasks.js" "farmer_ai-backend\utils\" -Force
Copy-Item "mini-banking-system\backend\utils\validators.js" "farmer_ai-backend\utils\" -Force

# Frontend Integration
Write-Host "🎨 Copying Frontend Files..." -ForegroundColor Blue

# Copy Components
Write-Host "Copying components..."
New-Item -ItemType Directory -Force -Path "farmer_ai-frontend\src\components\banking\wallet" | Out-Null
New-Item -ItemType Directory -Force -Path "farmer_ai-frontend\src\components\banking\transactions" | Out-Null
New-Item -ItemType Directory -Force -Path "farmer_ai-frontend\src\components\banking\savings" | Out-Null

Copy-Item "mini-banking-system\frontend\src\components\wallet\WalletCard.jsx" "farmer_ai-frontend\src\components\banking\wallet\" -Force
Copy-Item "mini-banking-system\frontend\src\components\transactions\TransactionList.jsx" "farmer_ai-frontend\src\components\banking\transactions\" -Force
Copy-Item "mini-banking-system\frontend\src\components\savings\SavingsGoalCard.jsx" "farmer_ai-frontend\src\components\banking\savings\" -Force

Write-Host "✅ Files copied successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Blue
Write-Host "1. Install backend dependencies:"
Write-Host "   cd farmer_ai-backend"
Write-Host "   npm install qrcode node-cron"
Write-Host ""
Write-Host "2. Install frontend dependencies:"
Write-Host "   cd farmer_ai-frontend"
Write-Host "   npm install qrcode.react"
Write-Host ""
Write-Host "3. Update farmer_ai-backend/server.js (add these lines):"
Write-Host "   const bankingRoutes = require('./routes/banking');"
Write-Host "   app.use('/api/banking', bankingRoutes);"
Write-Host ""
Write-Host "4. Update farmer_ai-backend/.env (add these lines):"
Write-Host "   FD_INTEREST_RATE=7.5"
Write-Host "   DAILY_TRANSACTION_LIMIT=100000"
Write-Host "   SINGLE_TRANSACTION_LIMIT=50000"
Write-Host ""
Write-Host "🎉 Integration files ready!" -ForegroundColor Green
