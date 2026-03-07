#!/bin/bash

echo "🏦 Integrating Mini Banking System with AgriSense..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Backend Integration
echo -e "${BLUE}📦 Copying Backend Files...${NC}"

# Copy Models
echo "Copying models..."
cp mini-banking-system/backend/models/Ledger.js farmer_ai-backend/models/
cp mini-banking-system/backend/models/Transaction.js farmer_ai-backend/models/
cp mini-banking-system/backend/models/Bill.js farmer_ai-backend/models/
cp mini-banking-system/backend/models/SavingsGoal.js farmer_ai-backend/models/
cp mini-banking-system/backend/models/FixedDeposit.js farmer_ai-backend/models/
cp mini-banking-system/backend/models/VirtualCard.js farmer_ai-backend/models/
cp mini-banking-system/backend/models/OTP.js farmer_ai-backend/models/
cp mini-banking-system/backend/models/Notification.js farmer_ai-backend/models/

# Copy Controllers
echo "Copying controllers..."
mkdir -p farmer_ai-backend/controllers
cp mini-banking-system/backend/controllers/walletController.js farmer_ai-backend/controllers/
cp mini-banking-system/backend/controllers/transactionController.js farmer_ai-backend/controllers/
cp mini-banking-system/backend/controllers/paymentController.js farmer_ai-backend/controllers/
cp mini-banking-system/backend/controllers/billController.js farmer_ai-backend/controllers/
cp mini-banking-system/backend/controllers/savingsController.js farmer_ai-backend/controllers/
cp mini-banking-system/backend/controllers/fdController.js farmer_ai-backend/controllers/
cp mini-banking-system/backend/controllers/cardController.js farmer_ai-backend/controllers/
cp mini-banking-system/backend/controllers/notificationController.js farmer_ai-backend/controllers/
cp mini-banking-system/backend/controllers/securityController.js farmer_ai-backend/controllers/

# Copy Utils
echo "Copying utilities..."
mkdir -p farmer_ai-backend/utils
cp mini-banking-system/backend/utils/scheduledTasks.js farmer_ai-backend/utils/
cp mini-banking-system/backend/utils/validators.js farmer_ai-backend/utils/

# Frontend Integration
echo -e "${BLUE}🎨 Copying Frontend Files...${NC}"

# Copy Components
echo "Copying components..."
mkdir -p farmer_ai-frontend/src/components/banking/wallet
mkdir -p farmer_ai-frontend/src/components/banking/transactions
mkdir -p farmer_ai-frontend/src/components/banking/savings

cp mini-banking-system/frontend/src/components/wallet/WalletCard.jsx farmer_ai-frontend/src/components/banking/wallet/
cp mini-banking-system/frontend/src/components/transactions/TransactionList.jsx farmer_ai-frontend/src/components/banking/transactions/
cp mini-banking-system/frontend/src/components/savings/SavingsGoalCard.jsx farmer_ai-frontend/src/components/banking/savings/

echo -e "${GREEN}✅ Files copied successfully!${NC}"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "1. Add banking route to farmer_ai-backend/server.js:"
echo "   const bankingRoutes = require('./routes/banking');"
echo "   app.use('/api/banking', bankingRoutes);"
echo ""
echo "2. Add banking environment variables to farmer_ai-backend/.env:"
echo "   FD_INTEREST_RATE=7.5"
echo "   DAILY_TRANSACTION_LIMIT=100000"
echo "   SINGLE_TRANSACTION_LIMIT=50000"
echo ""
echo "3. Add banking routes to farmer_ai-frontend/src/main.jsx"
echo ""
echo "4. Install additional dependencies:"
echo "   cd farmer_ai-backend && npm install qrcode node-cron"
echo "   cd farmer_ai-frontend && npm install qrcode.react"
echo ""
echo -e "${GREEN}🎉 Integration files ready!${NC}"
