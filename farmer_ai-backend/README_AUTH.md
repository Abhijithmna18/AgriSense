# AgriSense Backend - Authentication System

Production-ready authentication system with local auth, Google Sign-In, email OTP verification, and JWT sessions.

## Features

✅ **Local Authentication**
- User registration with email/password
- Email OTP verification (HMAC-SHA256)
- Secure password hashing (bcrypt)
- JWT token-based sessions

✅ **Security**
- Rate limiting on auth endpoints
- Input validation (express-validator)
- CORS protection
- Helmet.js security headers
- OTP expiry (10 minutes)
- OTP max tries (3 attempts)
- Phone number validation (E.164 format)

✅ **Email System**
- Nodemailer SMTP integration
- Branded HTML email templates
- OTP verification emails
- Password reset emails

⚠️ **Google Sign-In** (Requires Firebase Admin SDK setup)

---

## Quick Start

### 1. Install Dependencies

```bash
cd farmer_ai-backend
npm install
```

**Required packages:**
```bash
npm install express mongoose bcryptjs jsonwebtoken nodemailer express-validator express-rate-limit dotenv cors helmet morgan
```

### 2. Configure Environment Variables

Create `.env` file in backend root:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/agrisense_auth

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d

# OTP
OTP_SECRET=your_otp_hmac_secret_key
OTP_EXPIRY_MINUTES=10
OTP_MAX_TRIES=3
OTP_RESEND_LIMIT_PER_HOUR=3

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM="AgriSense" <noreply@agrisense.com>

# Frontend
FRONTEND_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000
```

### 3. Set Up Gmail SMTP (for OTP emails)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the generated password in `SMTP_PASS`

### 4. Start MongoDB

```bash
# Windows
mongod

# Mac/Linux
sudo systemctl start mongod
```

### 5. Run Server

```bash
npm start
# or
node server.js
```

Server will run on `http://localhost:5000`

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/google-login` - Google Sign-In (requires Firebase)
- `POST /api/auth/logout` - Logout

### Protected Routes
- `GET /api/user/me` - Get current user
- `GET /api/dashboard` - Dashboard access

See [API_DOCUMENTATION.md](../API_DOCUMENTATION.md) for complete details.

---

## Project Structure

```
farmer_ai-backend/
├── src/
│   ├── models/
│   │   └── User.js              # User model with OTP methods
│   ├── controllers/
│   │   └── authController.js    # Auth logic
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   └── userRoutes.js        # User endpoints
│   ├── middleware/
│   │   └── auth.js              # JWT verification
│   ├── services/
│   │   └── mailer.js            # Email service
│   ├── utils/
│   │   └── jwt.js               # JWT utilities
│   └── config/
│       └── db.js                # MongoDB connection
├── server.js                     # Express app
├── .env                          # Environment variables
└── package.json
```

---

## Testing

### Manual Testing with curl

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "password": "SecurePass123!"
  }'

# 2. Check email for OTP, then verify
curl -X POST http://localhost:5000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'

# 3. Save token from response, then access protected route
curl -X GET http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Security Notes

✅ **Implemented:**
- Passwords hashed with bcrypt (10 rounds)
- OTP hashed with HMAC-SHA256
- OTP expiry + max tries
- Rate limiting
- Input validation
- JWT with secure secret

⚠️ **Production Recommendations:**
1. Use HTTPS only
2. Store JWT in httpOnly secure cookies
3. Implement refresh tokens
4. Add CSRF protection
5. Use environment-specific secrets
6. Enable MongoDB authentication
7. Set up logging (Winston)
8. Implement monitoring
9. Add automated tests

---

## Troubleshooting

**MongoDB Connection Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
→ Start MongoDB: `mongod` or `sudo systemctl start mongod`

**Email Not Sending:**
→ Check SMTP credentials and Gmail App Password

**JWT Token Invalid:**
→ Verify JWT_SECRET matches between requests

**Rate Limit Exceeded:**
→ Wait 15 minutes or restart server (dev only)

---

## Dependencies

```json
{
  "express": "^4.18.0",
  "mongoose": "^7.0.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.0",
  "nodemailer": "^6.9.0",
  "express-validator": "^7.0.0",
  "express-rate-limit": "^6.7.0",
  "dotenv": "^16.0.0",
  "cors": "^2.8.5",
  "helmet": "^7.0.0",
  "morgan": "^1.10.0"
}
```

---

## License

MIT

---

**For complete API documentation, see:** [API_DOCUMENTATION.md](../API_DOCUMENTATION.md)
