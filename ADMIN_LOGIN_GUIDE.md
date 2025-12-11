# Admin Dashboard Access Guide

## 🔐 How to Login to Admin Dashboard

### Option 1: Create Admin User via Seed Script (Recommended)

1. **Stop the backend server** (Ctrl+C in the terminal running `node server.js`)

2. **Run the seed script:**
   ```bash
   cd farmer_ai-backend
   node scripts/seedAdmin.js
   ```

3. **Restart the backend server:**
   ```bash
   node server.js
   ```

4. **Login credentials:**
   - Email: `admin@agrisense.com`
   - Password: `Admin@123`

5. **Access the dashboard:**
   - Go to: http://localhost:5173/login
   - Login with the credentials above
   - Navigate to: http://localhost:5173/admin

---

### Option 2: Manually Update Existing User

If you already have a user account, you can manually promote it to admin:

1. **Connect to MongoDB** (using MongoDB Compass, mongosh, or any MongoDB client)

2. **Find your user:**
   ```javascript
   db.users.findOne({ email: "your-email@example.com" })
   ```

3. **Update the role to admin:**
   ```javascript
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin", isActive: true } }
   )
   ```

4. **Login and access:**
   - Go to: http://localhost:5173/login
   - Login with your credentials
   - Navigate to: http://localhost:5173/admin

---

### Option 3: Register New User & Manually Promote

1. **Register a new user** at http://localhost:5173/register
2. **Verify email** (if email verification is enabled)
3. **Update role in database** using Option 2 steps above
4. **Login and access admin dashboard**

---

## 🎯 Admin Dashboard Features

Once logged in as admin, you'll have access to:

- **Dashboard**: System metrics and quick actions
- **Users**: Manage users, suspend/activate accounts
- **Feature Flags**: Toggle features on/off dynamically
- **Audit Logs**: View all admin actions
- **Farms**: Manage farm listings
- **Settings**: System configuration

---

## ⚠️ Important Notes

1. **Backend Port**: The backend runs on port **5002** (not 5000)
2. **Authentication**: You must be logged in with `role: 'admin'` to access `/admin` routes
3. **Environment Badge**: Check the ENV badge in the admin sidebar to confirm you're in the correct environment (DEV/PROD)

---

## 🐛 Troubleshooting

### "401 Unauthorized" Error
- Make sure you're logged in
- Check that your user has `role: 'admin'` in the database
- Clear browser cache and localStorage, then login again

### "404 Not Found" for API calls
- Verify backend is running on port 5002
- Check that `adminRoutes.js` is properly mounted in `server.js`

### Can't see admin menu after login
- Verify your user's role is set to `'admin'` in MongoDB
- Check browser console for errors
- Try logging out and logging back in
