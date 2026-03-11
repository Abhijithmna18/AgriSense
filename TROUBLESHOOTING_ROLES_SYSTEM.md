# Troubleshooting Guide - Roles & Permissions System

## Current Errors

### Error 1: 404 Not Found on `/api/admin/roles`
**Symptom:** Frontend shows "Failed to fetch roles" with 404 error

**Causes:**
1. Backend server not restarted after adding new routes
2. Routes not properly registered in server.js
3. roleController not found

**Solution:**
1. Stop the backend server (Ctrl+C in terminal)
2. Restart backend:
   ```bash
   cd farmer_ai-backend
   npm start
   ```
3. Verify routes are loaded by checking server logs for "Server running on port 5002"

### Error 2: 500 Internal Server Error
**Symptom:** Server responds but crashes when accessing routes

**Causes:**
1. Database models not found
2. Missing dependencies
3. Database not seeded with permissions

**Solution:**
1. Run the seed script first:
   ```bash
   cd farmer_ai-backend
   node src/scripts/seedPermissions.js
   ```
2. Check for MongoDB connection errors
3. Verify all models are properly exported

### Error 3: 401 Unauthorized
**Symptom:** "Failed to load resource: 401 Unauthorized"

**Causes:**
1. Not logged in as admin
2. Auth token expired
3. Admin middleware blocking request

**Solution:**
1. Log out and log back in
2. Ensure you're logged in with an admin account
3. Check browser localStorage for auth token
4. Verify user has `activeRole: 'admin'` in database

## Step-by-Step Fix

### Step 1: Verify Files Exist
Run this in PowerShell:
```powershell
Test-Path farmer_ai-backend/src/models/Role.js
Test-Path farmer_ai-backend/src/models/Permission.js
Test-Path farmer_ai-backend/src/controllers/roleController.js
```
All should return `True`

### Step 2: Check Syntax
```powershell
cd farmer_ai-backend
node -c src/models/Role.js
node -c src/models/Permission.js
node -c src/controllers/roleController.js
```
No output means syntax is valid

### Step 3: Seed Database
```bash
cd farmer_ai-backend
node src/scripts/seedPermissions.js
```

Expected output:
```
MongoDB connected...
Cleared existing permissions and roles
Created 30 permissions
Created 5 default roles
Seeding completed successfully!
```

### Step 4: Restart Backend
1. Stop current backend (Ctrl+C)
2. Start fresh:
   ```bash
   cd farmer_ai-backend
   npm start
   ```
3. Look for these lines in output:
   - "MongoDB Connected"
   - "Server running on port 5002"

### Step 5: Restart Frontend
1. Stop current frontend (Ctrl+C)
2. Start fresh:
   ```bash
   cd farmer_ai-frontend
   npm run dev
   ```

### Step 6: Clear Browser Cache
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
4. Or use Ctrl+Shift+Delete to clear cache

### Step 7: Test API Manually

Open a new terminal and test with curl:

```bash
# Get auth token first (replace with your admin credentials)
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"yourpassword"}'

# Copy the token from response, then test roles endpoint
curl http://localhost:5002/api/admin/roles \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

If this works, the backend is fine and the issue is in the frontend.

## Common Issues

### Issue: "Cannot find module '../controllers/roleController'"
**Fix:** Verify the file exists at exact path:
```
farmer_ai-backend/src/controllers/roleController.js
```

### Issue: "Role model not found"
**Fix:** Check if Role and Permission models are exported:
```javascript
// At end of Role.js and Permission.js
module.exports = mongoose.model('Role', RoleSchema);
module.exports = mongoose.model('Permission', PermissionSchema);
```

### Issue: Routes return empty array
**Fix:** Database not seeded. Run:
```bash
node src/scripts/seedPermissions.js
```

### Issue: Frontend shows blank page
**Fix:** Check browser console for errors. Common causes:
1. Import errors in RolesPermissionsAdmin.jsx
2. Missing dependencies
3. API endpoint mismatch

### Issue: "adminOnly is not a function"
**Fix:** Check middleware/auth.js exports both `protect` and `adminOnly`:
```javascript
module.exports = { protect, adminOnly, authorize };
```

## Verification Checklist

After fixing, verify these work:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:5173 (frontend)
- [ ] Can log in as admin
- [ ] Can navigate to Roles & Permissions page
- [ ] Roles table loads with 5 default roles
- [ ] Can click "Create Role" button
- [ ] Modal opens with permission checkboxes
- [ ] Can create a new role
- [ ] Can edit existing role
- [ ] Can view role permissions
- [ ] Can assign role to user from Users page

## Database Verification

Check MongoDB directly:

```javascript
// In MongoDB shell or Compass
use your_database_name

// Check permissions
db.permissions.count()  // Should be 30

// Check roles
db.roles.find().pretty()  // Should show 5 roles

// Check a specific role
db.roles.findOne({ name: "Admin" })
```

## Still Not Working?

1. **Check Backend Logs:**
   - Look at terminal where backend is running
   - Check `farmer_ai-backend/combined.log`
   - Check `farmer_ai-backend/error.log`

2. **Check Frontend Console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for red error messages
   - Check Network tab for failed requests

3. **Verify Environment Variables:**
   ```bash
   # In farmer_ai-backend/.env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. **Check MongoDB Connection:**
   - Ensure MongoDB is running
   - Test connection string
   - Check database name matches

5. **Reinstall Dependencies:**
   ```bash
   cd farmer_ai-backend
   rm -rf node_modules
   npm install
   
   cd ../farmer_ai-frontend
   rm -rf node_modules
   npm install
   ```

## Quick Reset

If all else fails, reset everything:

```bash
# 1. Stop all servers
# 2. Clear database collections
db.roles.deleteMany({})
db.permissions.deleteMany({})

# 3. Re-seed
cd farmer_ai-backend
node src/scripts/seedPermissions.js

# 4. Restart servers
npm start  # in farmer_ai-backend
npm run dev  # in farmer_ai-frontend

# 5. Clear browser cache and reload
```

## Contact Points

If issues persist:
1. Check server logs for specific error messages
2. Verify MongoDB connection
3. Ensure admin user exists in database
4. Test API endpoints with Postman/curl
5. Check browser network tab for request/response details
