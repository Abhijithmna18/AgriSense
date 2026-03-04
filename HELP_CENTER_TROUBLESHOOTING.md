# Help Center Troubleshooting Guide

## ✅ Routes Have Been Added!

I've just added the Help Center routes to your `App.jsx` file. The routes are now configured.

---

## 🔍 How to Debug "Not Working" Issue

### Step 1: Check Browser Console

1. Open your browser (Chrome/Firefox/Edge)
2. Press `F12` to open Developer Tools
3. Click on the "Console" tab
4. Look for any red error messages
5. Take a screenshot or copy the error message

**Common errors to look for:**
- `Cannot find module` - Missing import
- `undefined is not a function` - Missing export
- `404 Not Found` - API endpoint issue
- `Network Error` - Backend not running

---

### Step 2: Check Network Tab

1. In Developer Tools, click "Network" tab
2. Click on the Help Center link
3. Look for failed requests (red color)
4. Click on the failed request to see details

**What to check:**
- Is the request going to the right URL? (should be `http://localhost:5002/api/resources/help`)
- What's the status code? (404, 500, etc.)
- What's the error message in the response?

---

### Step 3: Verify Backend is Running

Open a terminal and check:

```bash
# Check if backend is running
curl http://localhost:5002/api/resources/help

# Or use PowerShell
Invoke-WebRequest -Uri http://localhost:5002/api/resources/help
```

**Expected response:**
```json
{
  "success": true,
  "count": 10,
  "total": 10,
  "data": [...]
}
```

**If you get an error:**
- Backend is not running → Start it: `cd farmer_ai-backend && npm start`
- Port is different → Check your `.env` file for `PORT` variable
- Route not found → Verify route is added in `server.js`

---

### Step 4: Check Frontend Server

Make sure your frontend is running:

```bash
cd farmer_ai-frontend
npm run dev
```

Should show:
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Blank Page / White Screen

**Symptoms:** Page loads but shows nothing

**Causes:**
- JavaScript error in component
- Missing import
- API call failing

**Solution:**
1. Check browser console for errors
2. Look for red error messages
3. Fix the import or API issue

---

### Issue 2: "Cannot GET /resources/help"

**Symptoms:** Shows this error message

**Causes:**
- Routes not added to React Router
- Frontend server not running
- Wrong URL

**Solution:**
1. Verify routes are in `App.jsx` (I just added them)
2. Restart frontend server: `npm run dev`
3. Clear browser cache: `Ctrl+Shift+Delete`

---

### Issue 3: API Returns 404

**Symptoms:** Network tab shows 404 error

**Causes:**
- Backend route not added
- Backend server not running
- Wrong API URL

**Solution:**
1. Check if route is in `server.js`:
   ```javascript
   app.use('/api/resources/help', require('./src/routes/helpCenterRoutes'));
   ```
2. Restart backend server
3. Test API directly: `curl http://localhost:5002/api/resources/help`

---

### Issue 4: CORS Error

**Symptoms:** Console shows CORS policy error

**Causes:**
- Frontend and backend on different ports
- CORS not configured

**Solution:**
1. Check `server.js` has CORS enabled
2. Verify frontend URL is in allowed origins
3. Restart backend server

---

### Issue 5: "useAuth is not defined"

**Symptoms:** Console error about useAuth

**Causes:**
- AuthContext not imported correctly
- useAuth hook not exported

**Solution:**
Already fixed! The import is correct in the files.

---

## 🧪 Quick Test Steps

### Test 1: Backend API

```bash
# Test if backend is responding
curl http://localhost:5002/api/resources/help

# Should return JSON with articles
```

### Test 2: Frontend Route

1. Visit: `http://localhost:5173/resources/help`
2. Should see Help Center page with articles
3. If blank, check console for errors

### Test 3: Click on Article

1. Click on any article card
2. Should navigate to detail page
3. Should show full article content

---

## 📋 Checklist

Run through this checklist:

- [ ] Backend server is running on port 5002
- [ ] Frontend server is running on port 5173
- [ ] Routes are added in `App.jsx` (✅ Done!)
- [ ] No errors in browser console
- [ ] API returns data when tested with curl
- [ ] Help Center link exists in navigation/footer
- [ ] Can access `/resources/help` URL
- [ ] Articles are displayed on the page
- [ ] Can click on an article and see details

---

## 🔧 Manual Verification

### Verify Routes in App.jsx

Open `farmer_ai-frontend/src/App.jsx` and search for:

```javascript
import HelpCenter from './pages/resources/HelpCenter';
import HelpCenterDetail from './pages/resources/HelpCenterDetail';
import HelpCenterAdmin from './pages/admin/resources/HelpCenterAdmin';
```

And:

```javascript
<Route path="/resources/help" element={<HelpCenter />} />
<Route path="/resources/help/:slug" element={<HelpCenterDetail />} />
```

**Status:** ✅ These have been added!

### Verify Backend Route in server.js

Open `farmer_ai-backend/server.js` and search for:

```javascript
app.use('/api/resources/help', require('./src/routes/helpCenterRoutes'));
```

**Status:** ✅ This has been added!

---

## 🚀 Next Steps

1. **Restart both servers** (if they're running):
   ```bash
   # Stop servers (Ctrl+C)
   # Start backend
   cd farmer_ai-backend
   npm start
   
   # Start frontend (new terminal)
   cd farmer_ai-frontend
   npm run dev
   ```

2. **Clear browser cache**:
   - Press `Ctrl+Shift+Delete`
   - Select "Cached images and files"
   - Click "Clear data"

3. **Try accessing Help Center**:
   - Visit: `http://localhost:5173/resources/help`
   - Check console for errors
   - Check network tab for failed requests

4. **Report specific error**:
   - If still not working, tell me:
     - What error message you see in console
     - What happens when you click Help Center
     - What you see in the network tab
     - Screenshot if possible

---

## 📞 What to Tell Me

If it's still not working, please provide:

1. **Error message from console** (exact text)
2. **What happens when you click Help Center** (blank page, error, nothing, etc.)
3. **Network tab status** (any red/failed requests?)
4. **Backend status** (is it running? any errors in terminal?)
5. **Frontend status** (is it running? any errors in terminal?)

With this information, I can help you fix the specific issue!

---

## ✅ What I've Done

1. ✅ Added Help Center imports to `App.jsx`
2. ✅ Added public routes for Help Center listing and detail pages
3. ✅ Added admin route for Help Center management
4. ✅ Verified all files exist and are correct

**The routes are now configured and should work!**

Try restarting your servers and accessing: `http://localhost:5173/resources/help`
