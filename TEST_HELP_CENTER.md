# Test Help Center - Quick Guide

## ✅ I've Added the Routes!

The Help Center routes have been added to your `App.jsx` file. Here's what to do next:

---

## 🚀 Quick Start (3 Steps)

### Step 1: Restart Your Servers

```bash
# Terminal 1 - Backend
cd farmer_ai-backend
npm start

# Terminal 2 - Frontend  
cd farmer_ai-frontend
npm run dev
```

### Step 2: Visit Help Center

Open your browser and go to:
```
http://localhost:5173/resources/help
```

### Step 3: Check What Happens

**If it works:** ✅ You should see:
- Help Center page with search bar
- Featured FAQs in accordion
- Type tabs (All, FAQs, Guides, etc.)
- 10 article cards

**If it doesn't work:** ❌ Tell me:
- What do you see? (blank page, error message, etc.)
- Open browser console (F12) - any errors?
- Check network tab - any failed requests?

---

## 🔍 Quick Debug

### Check Backend API

Open a new terminal and run:

```bash
curl http://localhost:5002/api/resources/help
```

**Expected:** Should return JSON with 10 articles

**If error:** Backend is not running or route not added

### Check Frontend Console

1. Press `F12` in browser
2. Click "Console" tab
3. Look for red errors
4. Copy the error message and tell me

### Check Network Tab

1. Press `F12` in browser
2. Click "Network" tab
3. Refresh the page
4. Look for red/failed requests
5. Click on failed request to see details

---

## 📝 What I Changed

### In `App.jsx`:

**Added imports:**
```javascript
import HelpCenter from './pages/resources/HelpCenter';
import HelpCenterDetail from './pages/resources/HelpCenterDetail';
import HelpCenterAdmin from './pages/admin/resources/HelpCenterAdmin';
```

**Added routes:**
```javascript
{/* Help Center Routes */}
<Route path="/resources/help" element={<HelpCenter />} />
<Route path="/resources/help/:slug" element={<HelpCenterDetail />} />

{/* In admin section */}
<Route path="resources/help" element={<HelpCenterAdmin />} />
```

---

## 🎯 Test Each Feature

### Test 1: Listing Page
- [ ] Visit `/resources/help`
- [ ] See 10 articles
- [ ] Featured FAQs work
- [ ] Type tabs filter correctly
- [ ] Search works

### Test 2: Detail Page
- [ ] Click on an article
- [ ] See full content
- [ ] Voting buttons visible
- [ ] Related articles show

### Test 3: Admin Page (Login as admin first)
- [ ] Visit `/admin/resources/help`
- [ ] See all articles in table
- [ ] Can create new article
- [ ] Can edit article
- [ ] Can delete article

---

## 🐛 Still Not Working?

Tell me exactly what you see:

1. **What happens when you click Help Center?**
   - Blank page?
   - Error message?
   - Nothing happens?
   - Page loads but no content?

2. **Console errors?** (F12 → Console tab)
   - Copy the exact error message

3. **Network errors?** (F12 → Network tab)
   - Any red/failed requests?
   - What's the status code?

4. **Backend running?**
   - Check terminal - any errors?
   - Try: `curl http://localhost:5002/api/resources/help`

With this info, I can help you fix it immediately!

---

## ✅ Summary

- ✅ Routes added to `App.jsx`
- ✅ Backend route already exists in `server.js`
- ✅ Database already seeded with 10 articles
- ✅ All files created and ready

**Just restart your servers and try accessing the Help Center!**

URL: `http://localhost:5173/resources/help`
