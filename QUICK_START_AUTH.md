# Quick Start Guide - AgriSense Authentication

## ✅ Prerequisites Checklist

- [x] Node.js installed
- [x] MongoDB Atlas account (already configured)
- [x] Gmail SMTP credentials (already configured)
- [x] Backend dependencies installed
- [x] Environment variables configured

---

## 🚀 Start the System

### 1. Backend (Already Running)
Your backend is already running on port 5002!
```bash
# If you need to restart:
cd d:\New folder\intern\Agri\farmer_ai-backend
node server.js
```

### 2. Frontend (Already Running)
Your frontend is already running!
```bash
# If you need to restart:
cd d:\New folder\intern\Agri\farmer_ai-frontend
npm run dev
```

---

## 🧪 Test the Authentication System

### Option 1: Browser Testing (Recommended)

1. **Open Browser**: Navigate to `http://localhost:5173/register`

2. **Register a New User**:
   - First Name: `Test`
   - Last Name: `User`
   - Email: `your-email@gmail.com` (use your real email!)
   - Phone: `919876543210` (integers only, no spaces!)
   - Password: `TestPass123!`
   - Click "Create Account"

3. **Check Your Email**:
   - Look for email from AgriSense
   - Copy the 6-digit OTP code

4. **Verify Email**:
   - You'll be auto-redirected to `/verify`
   - Enter the OTP code
   - Click "Verify Email"

5. **Access Dashboard**:
   - Auto-redirected to `/dashboard`
   - See your user profile
   - Test logout button

6. **Login Again**:
   - Go to `/login`
   - Enter email + password
   - Access dashboard

### Option 2: curl Testing

```bash
# 1. Register
curl -X POST http://localhost:5002/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"firstName\":\"Test\",\"lastName\":\"User\",\"email\":\"your-email@gmail.com\",\"phone\":\"+919876543210\",\"password\":\"TestPass123!\"}"

# 2. Check email for OTP, then verify
curl -X POST http://localhost:5002/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"your-email@gmail.com\",\"otp\":\"123456\"}"

# 3. Copy token from response, then access dashboard
curl -X GET http://localhost:5002/api/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🎯 What to Test

### ✅ Happy Path
- [x] Register with valid data
- [x] Receive OTP email
- [x] Verify with correct OTP
- [x] Get redirected to dashboard
- [x] See user profile
- [x] Logout
- [x] Login again

### ⚠️ Error Cases
- [ ] Register with existing email
- [ ] Enter wrong OTP (3 times)
- [ ] Wait 10 minutes, try expired OTP
- [ ] Resend OTP multiple times (rate limit)
- [ ] Try to login before verifying
- [ ] Access `/dashboard` without token
- [ ] Phone input with letters/spaces

---

## 🔍 Troubleshooting

### Email Not Received?
1. Check spam folder
2. Verify SMTP credentials in `.env`
3. Check backend console for errors
4. Try resending OTP

### "Network Error" in Frontend?
1. Check backend is running on port 5002
2. Verify `REACT_APP_API_URL=http://localhost:5002` in frontend `.env`
3. Check browser console for CORS errors

### Token Not Working?
1. Check JWT_SECRET in backend `.env`
2. Verify token is saved in localStorage
3. Check Authorization header format: `Bearer <token>`

### Phone Validation Not Working?
1. Enter numbers only: `919876543210`
2. No spaces, no dashes, no parentheses
3. Backend will add `+` prefix automatically

---

## 📊 Expected Results

### Successful Registration
```json
{
  "success": true,
  "message": "Registration successful. OTP sent to your email."
}
```

### Successful Verification
```json
{
  "success": true,
  "message": "Email verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "...",
    "firstName": "Test",
    "lastName": "User",
    "email": "your-email@gmail.com",
    "isEmailVerified": true
  }
}
```

### Dashboard Access
```json
{
  "success": true,
  "message": "Access granted to dashboard",
  "userId": "...",
  "user": {
    "firstName": "Test",
    "lastName": "User",
    "email": "your-email@gmail.com",
    "role": "farmer"
  }
}
```

---

## 📝 Next Steps

1. **Test all flows** (register, verify, login, dashboard)
2. **Test error cases** (wrong OTP, rate limits, etc.)
3. **Review documentation**:
   - [API_DOCUMENTATION.md](file:///C:/Users/abhij/.gemini/antigravity/brain/4bf355e0-83bf-48bd-8409-c252cb3b37e6/API_DOCUMENTATION.md)
   - [walkthrough.md](file:///C:/Users/abhij/.gemini/antigravity/brain/4bf355e0-83bf-48bd-8409-c252cb3b37e6/walkthrough.md)
4. **Configure Firebase** (optional, for Google Sign-In)
5. **Deploy to production** (see walkthrough.md)

---

## 🎉 You're Ready!

Your authentication system is **fully configured and ready to test**!

**Quick Links:**
- Frontend: http://localhost:5173/register
- Backend API: http://localhost:5002/api
- Dashboard: http://localhost:5173/dashboard (requires login)

**Need Help?** Check the comprehensive documentation files listed above.
