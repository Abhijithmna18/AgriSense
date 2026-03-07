# Windows PowerShell Setup Commands

## Step 1: Run Integration Script

```powershell
.\INTEGRATE_BANKING_WINDOWS.ps1
```

## Step 2: Install Backend Dependencies

```powershell
cd farmer_ai-backend
npm install qrcode node-cron
cd ..
```

## Step 3: Install Frontend Dependencies

```powershell
cd farmer_ai-frontend
npm install qrcode.react
cd ..
```

## Step 4: Update Backend Server

Open `farmer_ai-backend/server.js` and add these lines after your existing routes:

```javascript
// Banking Routes
const bankingRoutes = require('./routes/banking');
app.use('/api/banking', bankingRoutes);
```

## Step 5: Update Environment Variables

Open `farmer_ai-backend/.env` and add:

```env
# Banking Configuration
FD_INTEREST_RATE=7.5
DAILY_TRANSACTION_LIMIT=100000
SINGLE_TRANSACTION_LIMIT=50000
```

## Step 6: Update Frontend Routes

Open `farmer_ai-frontend/src/main.jsx` and add:

```javascript
import BankingDashboard from './pages/BankingDashboard';

// Add this route in your Routes component:
<Route path="/banking" element={<BankingDashboard />} />
```

## Step 7: Start Backend Server

```powershell
cd farmer_ai-backend
npm run dev
```

## Step 8: Start Frontend Server (New Terminal)

Open a new PowerShell terminal and run:

```powershell
cd farmer_ai-frontend
npm start
```

## Step 9: Access Banking System

Open browser: `http://localhost:3000/banking`

---

## Quick Copy-Paste Commands

### All Backend Setup:
```powershell
cd farmer_ai-backend
npm install qrcode node-cron
cd ..
```

### All Frontend Setup:
```powershell
cd farmer_ai-frontend
npm install qrcode.react
cd ..
```

### Start Backend:
```powershell
cd farmer_ai-backend
npm run dev
```

### Start Frontend (in new terminal):
```powershell
cd farmer_ai-frontend
npm start
```

---

## Troubleshooting

### If script execution is disabled:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### If files don't copy:
Run PowerShell as Administrator

### If npm commands fail:
Make sure you're in the correct directory (use `pwd` to check)

---

## ✅ Verification

After setup, verify:
1. Backend running on http://localhost:5000
2. Frontend running on http://localhost:3000
3. Banking dashboard accessible at http://localhost:3000/banking
