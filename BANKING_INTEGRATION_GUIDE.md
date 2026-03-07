# Mini Banking Integration with AgriSense

## Overview
Integrating the Mini Banking System into the existing AgriSense farmer_ai-backend and farmer_ai-frontend.

## Integration Steps

### 1. Backend Integration (farmer_ai-backend)

#### Copy Models
```bash
cp -r mini-banking-system/backend/models/* farmer_ai-backend/models/
```

Models to copy:
- Wallet.js
- Ledger.js
- Transaction.js
- Bill.js
- SavingsGoal.js
- FixedDeposit.js
- VirtualCard.js
- OTP.js
- Notification.js

#### Copy Controllers
```bash
cp -r mini-banking-system/backend/controllers/* farmer_ai-backend/controllers/
```

Controllers to copy:
- walletController.js
- transactionController.js
- paymentController.js
- billController.js
- savingsController.js
- fdController.js
- cardController.js
- notificationController.js
- securityController.js

#### Copy Routes
```bash
cp -r mini-banking-system/backend/routes/* farmer_ai-backend/routes/
```

Routes to copy:
- wallet.js
- transactions.js
- payments.js
- bills.js
- savings.js
- fixedDeposits.js
- cards.js
- notifications.js
- security.js

#### Copy Utils
```bash
cp mini-banking-system/backend/utils/scheduledTasks.js farmer_ai-backend/utils/
cp mini-banking-system/backend/utils/validators.js farmer_ai-backend/utils/
```

### 2. Update Backend Server (farmer_ai-backend/server.js)

Add these imports and routes to your existing server.js

### 3. Frontend Integration (farmer_ai-frontend)

#### Copy Components
```bash
mkdir -p farmer_ai-frontend/src/components/banking
cp -r mini-banking-system/frontend/src/components/* farmer_ai-frontend/src/components/banking/
```

#### Update API Service
Add banking API endpoints to your existing API service

#### Add Routes
Add banking routes to your existing React Router setup

### 4. Environment Variables

Add to farmer_ai-backend/.env:
```env
# Banking Configuration
FD_INTEREST_RATE=7.5
SAVINGS_INTEREST_RATE=4.0
DAILY_TRANSACTION_LIMIT=100000
SINGLE_TRANSACTION_LIMIT=50000
OTP_EXPIRY_MINUTES=10
```

### 5. Database

The banking models will use the same MongoDB connection.
No additional database setup needed.

## File Structure After Integration

```
farmer_ai-backend/
├── models/
│   ├── (existing models)
│   ├── Wallet.js ← NEW
│   ├── Ledger.js ← NEW
│   ├── Transaction.js ← NEW
│   ├── Bill.js ← NEW
│   ├── SavingsGoal.js ← NEW
│   ├── FixedDeposit.js ← NEW
│   ├── VirtualCard.js ← NEW
│   ├── OTP.js ← NEW
│   └── Notification.js ← NEW
├── controllers/
│   ├── (existing controllers)
│   ├── walletController.js ← NEW
│   ├── transactionController.js ← NEW
│   ├── paymentController.js ← NEW
│   ├── billController.js ← NEW
│   ├── savingsController.js ← NEW
│   ├── fdController.js ← NEW
│   ├── cardController.js ← NEW
│   ├── notificationController.js ← NEW
│   └── securityController.js ← NEW
├── routes/
│   ├── (existing routes)
│   ├── wallet.js ← NEW
│   ├── transactions.js ← NEW
│   ├── payments.js ← NEW
│   ├── bills.js ← NEW
│   ├── savings.js ← NEW
│   ├── fixedDeposits.js ← NEW
│   ├── cards.js ← NEW
│   ├── notifications.js ← NEW
│   └── security.js ← NEW
└── utils/
    ├── (existing utils)
    ├── scheduledTasks.js ← NEW
    └── validators.js ← NEW

farmer_ai-frontend/
├── src/
│   ├── components/
│   │   ├── (existing components)
│   │   └── banking/ ← NEW
│   │       ├── wallet/
│   │       ├── transactions/
│   │       └── savings/
│   ├── pages/
│   │   ├── (existing pages)
│   │   ├── BankingDashboard.jsx ← NEW
│   │   ├── Wallet.jsx ← NEW
│   │   ├── Transactions.jsx ← NEW
│   │   ├── Bills.jsx ← NEW
│   │   ├── Savings.jsx ← NEW
│   │   ├── FixedDeposits.jsx ← NEW
│   │   └── Cards.jsx ← NEW
│   └── services/
│       └── bankingApi.js ← NEW
```

## Quick Integration Commands

Run these commands from the project root:

```bash
# Backend Integration
cp mini-banking-system/backend/models/*.js farmer_ai-backend/models/
cp mini-banking-system/backend/controllers/*.js farmer_ai-backend/controllers/
cp mini-banking-system/backend/routes/*.js farmer_ai-backend/routes/
cp mini-banking-system/backend/utils/*.js farmer_ai-backend/utils/

# Frontend Integration
mkdir -p farmer_ai-frontend/src/components/banking
cp -r mini-banking-system/frontend/src/components/* farmer_ai-frontend/src/components/banking/
cp mini-banking-system/frontend/src/services/api.js farmer_ai-frontend/src/services/bankingApi.js
```

## Testing After Integration

1. Start backend: `cd farmer_ai-backend && npm run dev`
2. Start frontend: `cd farmer_ai-frontend && npm start`
3. Navigate to `/banking` route
4. Test wallet creation
5. Test transactions
6. Test all banking features

## Notes

- All banking features will use the existing authentication system
- User model needs to be extended with banking fields (accountNumber, vpa, ifscCode)
- Existing users will need wallet creation on first banking access
- All banking routes are protected with existing auth middleware
