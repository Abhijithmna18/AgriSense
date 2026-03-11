# Quick Fix - Feature Flags "Failed to create flag"

## The Problem
You're seeing "Failed to create flag" error when trying to create a feature flag.

## Possible Causes

1. **Backend not restarted** - New routes not loaded
2. **MongoDB connection issue** - Database not accessible
3. **Validation error** - Duplicate key or invalid data
4. **Authentication issue** - Not logged in as admin

## Quick Fix (3 Steps)

### Step 1: Seed Default Flags

Instead of creating manually, run the seed script:

```bash
cd farmer_ai-backend
node src/scripts/seedFeatureFlags.js
```

Or use the batch file:
```bash
./SETUP_FEATURE_FLAGS.bat
```

This will create 12 default feature flags automatically.

### Step 2: Restart Backend

```bash
cd farmer_ai-backend
# Stop current server (Ctrl+C)
npm start
```

### Step 3: Verify in Admin Panel

1. Login as admin
2. Go to Feature Flags page
3. You should see 12 flags
4. Try toggling them ON/OFF

## If Still Not Working

### Check 1: Verify Backend Routes

Open browser DevTools (F12) and check the Network tab when creating a flag.

**Expected:**
- Request to: `POST /api/admin/feature-flags`
- Status: 201 Created

**If you see 404:**
- Backend routes not loaded
- Restart backend server

**If you see 500:**
- Check backend console for error
- Check MongoDB connection

### Check 2: Test API Directly

Open a new terminal and test:

```bash
# Windows PowerShell
$token = "YOUR_AUTH_TOKEN"
$body = @{
    name = "Test Flag"
    key = "test_flag"
    description = "Test description"
    isEnabled = $true
    environment = "production"
    rolloutPercentage = 100
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5002/api/admin/feature-flags" `
    -Method POST `
    -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
    -Body $body
```

### Check 3: Verify MongoDB Connection

Check if MongoDB is running and accessible:

```bash
# In farmer_ai-backend/.env
MONGO_URI=mongodb://localhost:27017/your_database
# or
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

### Check 4: Check Backend Logs

Look at the terminal where backend is running for error messages:

```
Error: Cannot find module '../controllers/featureFlagController'
Error: FeatureFlag validation failed
Error: E11000 duplicate key error
```

### Check 5: Verify Admin Access

Make sure you're logged in as admin:

1. Open DevTools (F12)
2. Go to Application > Local Storage
3. Find your auth token
4. Decode at jwt.io
5. Verify `activeRole: "admin"`

## Manual Database Check

If seed script fails, check MongoDB directly:

```javascript
// In MongoDB shell or Compass
use your_database_name

// Check if FeatureFlag collection exists
db.getCollectionNames()

// Try creating a flag manually
db.featureflags.insertOne({
    name: "Test Flag",
    key: "test_flag",
    description: "Test",
    isEnabled: true,
    environment: "production",
    rolloutPercentage: 100,
    targetRoles: [],
    targetUsers: [],
    createdAt: new Date(),
    lastUpdated: new Date()
})
```

## Common Errors & Solutions

### Error: "Duplicate key error"
**Solution:** Key already exists. Use a different key or delete the existing flag.

### Error: "Validation failed"
**Solution:** Check all required fields are filled:
- name (required)
- key (required, unique)
- description (required)
- environment (must be: production, staging, development, or all)

### Error: "Cannot find module"
**Solution:** 
```bash
cd farmer_ai-backend
npm install
```

### Error: "401 Unauthorized"
**Solution:** Log out and log back in as admin.

### Error: "500 Internal Server Error"
**Solution:** Check backend console for specific error message.

## Verification Checklist

After fixing, verify these work:

- [ ] Backend starts without errors
- [ ] Can access Feature Flags page
- [ ] Can see seeded flags (12 flags)
- [ ] Can toggle flags ON/OFF
- [ ] Can edit existing flags
- [ ] Can delete flags
- [ ] Can create new flags manually

## Alternative: Use Seeded Flags

If manual creation keeps failing, just use the seeded flags:

1. Run: `./SETUP_FEATURE_FLAGS.bat`
2. 12 flags are created automatically
3. Edit them as needed
4. Toggle them ON/OFF
5. No need to create manually!

## Success Indicators

You'll know it's working when:
- ✅ Seed script completes successfully
- ✅ 12 flags appear in admin panel
- ✅ Can toggle flags ON/OFF
- ✅ Toggle shows success notification
- ✅ Can edit flag details
- ✅ Can delete flags
- ✅ Can create new flags

## Still Having Issues?

1. **Check Backend Console** - Look for specific error messages
2. **Check Browser Console** - Look for API errors
3. **Check MongoDB** - Ensure it's running and accessible
4. **Check .env File** - Verify MONGO_URI is correct
5. **Restart Everything** - Stop backend, frontend, restart both

## Quick Reset

If all else fails:

```bash
# 1. Stop all servers

# 2. Clear feature flags collection
# In MongoDB:
db.featureflags.deleteMany({})

# 3. Re-seed
cd farmer_ai-backend
node src/scripts/seedFeatureFlags.js

# 4. Restart backend
npm start

# 5. Restart frontend
cd ../farmer_ai-frontend
npm run dev

# 6. Clear browser cache and reload
```

## Summary

The easiest solution is to use the seed script instead of manual creation:

```bash
./SETUP_FEATURE_FLAGS.bat
```

This creates 12 working feature flags that you can immediately use, toggle, and edit!
