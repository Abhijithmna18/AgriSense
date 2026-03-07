# 🚀 Quick Integration Steps (5 Minutes)

## Step 1: Run Integration Script (30 seconds)

```bash
chmod +x INTEGRATE_BANKING.sh
./INTEGRATE_BANKING.sh
```

This copies all necessary files to your existing projects.

---

## Step 2: Update Backend Server (1 minute)

Open `farmer_ai-backend/server.js` and add:

```javascript
// Add after existing routes (around line 40-50)
const bankingRoutes = require('./routes/banking');
app.use('/api/banking', bankingRoutes);
```

---

## Step 3: Update Environment Variables (30 seconds)

Add to `farmer_ai-backend/.env`:

```env
FD_INTEREST_RATE=7.5
DAILY_TRANSACTION_LIMIT=100000
SINGLE_TRANSACTION_LIMIT=50000
```

---

## Step 4: Install Dependencies (2 minutes)

```bash
# Backend
cd farmer_ai-backend
npm install qrcode node-cron

# Frontend  
cd farmer_ai-frontend
npm install qrcode.react
```

---

## Step 5: Add Frontend Route (1 minute)

Open `farmer_ai-frontend/src/main.jsx` and add:

```javascript
import BankingDashboard from './pages/BankingDashboard';

// In your Routes component, add:
<Route path="/banking" element={<BankingDashboard />} />
```

---

## Step 6: Start Servers

```bash
# Terminal 1 - Backend
cd farmer_ai-backend
npm run dev

# Terminal 2 - Frontend
cd farmer_ai-frontend
npm start
```

---

## Step 7: Test It!

Navigate to: `http://localhost:3000/banking`

---

## ✅ That's It!

Your banking system is now integrated and ready to use!

### What You Get:
- ✅ Digital Wallet
- ✅ Send/Receive Money
- ✅ Bill Payments
- ✅ Savings Goals
- ✅ Fixed Deposits
- ✅ Virtual Cards
- ✅ UPI/QR Payments
- ✅ Transaction History
- ✅ Notifications

### API Endpoints:
All available at `/api/banking/*`

### Documentation:
- `INTEGRATION_COMPLETE.md` - Full integration guide
- `BANKING_INTEGRATION_GUIDE.md` - Detailed documentation
- `PROJECT_COMPLETE.md` - Feature list

---

## 🆘 Quick Troubleshooting

**Issue**: Routes not working
**Fix**: Check if you added `app.use('/api/banking', bankingRoutes);` to server.js

**Issue**: Components not found
**Fix**: Run the integration script again

**Issue**: Dependencies missing
**Fix**: Run `npm install qrcode node-cron` in backend

---

## 🎉 Done!

Banking system is now part of your AgriSense platform!
