# Quick Fix for 404 Errors - Roles & Permissions

## The Problem
You're seeing these errors:
- `404 Not Found` on `/api/admin/roles`
- `404 Not Found` on `/api/admin/roles/permissions/all`
- `500 Internal Server Error` on role creation

## Root Cause
The backend server was running BEFORE the new role routes were added. The server needs to be restarted to load the new routes.

## Quick Fix (5 Steps)

### Step 1: Seed the Database
Open a terminal and run:
```bash
cd farmer_ai-backend
node src/scripts/seedPermissions.js
```

You should see:
```
MongoDB connected...
Cleared existing permissions and roles
Created 30 permissions
Created 5 default roles
Seeding completed successfully!
```

### Step 2: Stop Backend Server
In the terminal where your backend is running:
- Press `Ctrl + C` to stop the server

### Step 3: Restart Backend Server
In the same terminal:
```bash
npm start
```

Wait for:
```
MongoDB Connected
Server running on port 5002
```

### Step 4: Clear Browser Cache
In your browser:
1. Press `F12` to open DevTools
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

OR

1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"

### Step 5: Reload the Page
1. Navigate to the Roles & Permissions page
2. You should now see the roles table with 5 default roles

## Verification

After the fix, you should see:

**In the Roles Table:**
- Admin (Full system access)
- Vendor (Vendor dashboard access)
- Farmer (Farmer platform access)
- Loan Officer (Loan management access)
- Manager (Reports and monitoring access)

**No Errors in Console:**
- No 404 errors
- No 500 errors
- Roles load successfully

## If Still Not Working

### Check 1: Verify Backend Routes
Open `farmer_ai-backend/src/routes/adminRoutes.js` and verify these lines exist at the end:

```javascript
// --- ROLES & PERMISSIONS ---
const roleController = require('../controllers/roleController');

// Role routes
router.get('/roles', roleController.getRoles);
router.post('/roles', roleController.createRole);
router.get('/roles/permissions/all', roleController.getPermissions);
router.get('/roles/:id', roleController.getRole);
router.put('/roles/:id', roleController.updateRole);
router.delete('/roles/:id', roleController.deleteRole);
router.get('/roles/:id/permissions', roleController.getRolePermissions);
router.put('/users/:userId/role', roleController.assignRoleToUser);

module.exports = router;
```

### Check 2: Verify Files Exist
Run in PowerShell:
```powershell
Test-Path farmer_ai-backend/src/models/Role.js
Test-Path farmer_ai-backend/src/models/Permission.js
Test-Path farmer_ai-backend/src/controllers/roleController.js
```

All should return `True`.

### Check 3: Check Backend Logs
Look at the terminal where backend is running. You should NOT see:
- "Cannot find module"
- "ReferenceError"
- "TypeError"

### Check 4: Test API Directly
Open a new terminal and test:

```bash
# Windows PowerShell
$token = "YOUR_AUTH_TOKEN_FROM_BROWSER"
Invoke-WebRequest -Uri "http://localhost:5002/api/admin/roles" -Headers @{"Authorization"="Bearer $token"}
```

If this returns data, the backend is working and the issue is in the frontend.

### Check 5: Verify Admin Access
Make sure you're logged in as an admin:
1. Open browser DevTools (F12)
2. Go to Application tab
3. Click on Local Storage
4. Find your auth token
5. Decode it at jwt.io
6. Verify `activeRole: "admin"` in the payload

## Alternative: Use Diagnostic Tool

Run the diagnostic batch file:
```bash
./DIAGNOSE_ISSUE.bat
```

This will check all components and tell you exactly what needs to be fixed.

## Still Having Issues?

1. **Check MongoDB Connection:**
   - Ensure MongoDB is running
   - Check `MONGO_URI` in `farmer_ai-backend/.env`

2. **Check Backend Logs:**
   - Look at `farmer_ai-backend/combined.log`
   - Look at `farmer_ai-backend/error.log`

3. **Reinstall Dependencies:**
   ```bash
   cd farmer_ai-backend
   rm -rf node_modules
   npm install
   ```

4. **Check Browser Console:**
   - Press F12
   - Go to Console tab
   - Look for specific error messages
   - Check Network tab for failed requests

## Success Indicators

You'll know it's working when:
- ✅ No 404 errors in browser console
- ✅ Roles table shows 5 default roles
- ✅ Can click "Create Role" button
- ✅ Modal opens with permission checkboxes
- ✅ Can create, edit, and delete roles
- ✅ Can assign roles to users

## Summary

The fix is simple:
1. Seed database
2. Restart backend
3. Clear browser cache
4. Reload page

The 404 errors happen because the server needs to be restarted to load the new routes that were just added.
