# Hosting AgriSense on Vercel - Complete Guide

This guide covers hosting both the frontend (React/Vite) and backend (Node.js) on Vercel.

## Project Overview

- **Frontend**: React + Vite (farmer_ai-frontend)
- **Backend**: Node.js + Express (farmer_ai-backend)
- **Database**: MongoDB
- **Services**: Firebase, Socket.io, Razorpay integration

---

## Option 1: Frontend Only on Vercel (Recommended for Quick Start)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy Frontend

```bash
cd farmer_ai-frontend
vercel
```

Follow the prompts:
- **Project name**: agrisense-frontend
- **Framework**: Vite
- **Root directory**: ./
- **Build command**: npm run build
- **Output directory**: dist

**Done!** Frontend is live at: `https://agrisense-frontend.vercel.app`

---

## Option 2: Full Stack on Vercel (Recommended)

### Architecture

```
┌─────────────────────────────────────────┐
│         Vercel Hosting                  │
│    (Frontend - React/Vite)              │
│    agrisense.vercel.app                 │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│      Vercel Serverless Functions        │
│    (Backend API - Node.js)              │
│    /api/* routes                        │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│    External Services                    │
│  - MongoDB Atlas                        │
│  - Firebase                             │
│  - Razorpay                             │
└─────────────────────────────────────────┘
```

### Step 1: Create vercel.json

Create `vercel.json` in project root:

```json
{
  "version": 2,
  "buildCommand": "cd farmer_ai-frontend && npm run build",
  "outputDirectory": "farmer_ai-frontend/dist",
  "public": false,
  "env": {
    "MONGODB_URI": "@mongodb_uri",
    "JWT_SECRET": "@jwt_secret",
    "FIREBASE_API_KEY": "@firebase_api_key",
    "RAZORPAY_KEY_ID": "@razorpay_key_id",
    "RAZORPAY_KEY_SECRET": "@razorpay_key_secret",
    "OPENAI_API_KEY": "@openai_api_key",
    "GOOGLE_AI_API_KEY": "@google_ai_api_key"
  },
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 60
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

### Step 2: Create API Routes

Create `api/` directory in project root:

```
api/
├── auth/
│   ├── login.js
│   ├── register.js
│   └── logout.js
├── dashboard/
│   └── stats.js
├── market/
│   └── analytics.js
└── health.js
```

#### Example: `api/health.js`

```javascript
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
}
```

#### Example: `api/auth/login.js`

```javascript
import mongoose from 'mongoose';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to MongoDB
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const { email, password } = req.body;

    // Your login logic here
    // Example:
    // const user = await User.findOne({ email });
    // if (!user || !user.comparePassword(password)) {
    //   return res.status(401).json({ error: 'Invalid credentials' });
    // }

    const token = 'your-jwt-token';

    res.status(200).json({
      success: true,
      token,
      user: { email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
}
```

#### Example: `api/dashboard/stats.js`

```javascript
import mongoose from 'mongoose';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Your dashboard stats logic
    const stats = {
      totalUsers: 1250,
      activeLoans: 45,
      totalTransactions: 3200,
      avgLoanAmount: 50000
    };

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### Step 3: Update Frontend API URL

Update `farmer_ai-frontend/.env`:

```
VITE_API_URL=https://agrisense.vercel.app/api
```

Or for custom domain:

```
VITE_API_URL=https://yourdomain.com/api
```

### Step 4: Update Frontend API Calls

In your React components, use the API:

```javascript
// Before
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

// After
const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
  method: 'POST',
  body: JSON.stringify({ email, password })
});
```

### Step 5: Deploy to Vercel

```bash
vercel
```

Follow prompts:
- **Project name**: agrisense
- **Framework**: Vite
- **Root directory**: ./
- **Build command**: cd farmer_ai-frontend && npm run build
- **Output directory**: farmer_ai-frontend/dist

---

## Step 3: Add Environment Variables

### Via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all variables:

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your-secret-key
FIREBASE_API_KEY=xxx
FIREBASE_AUTH_DOMAIN=xxx
FIREBASE_PROJECT_ID=xxx
FIREBASE_STORAGE_BUCKET=xxx
FIREBASE_MESSAGING_SENDER_ID=xxx
FIREBASE_APP_ID=xxx
RAZORPAY_KEY_ID=xxx
RAZORPAY_KEY_SECRET=xxx
OPENAI_API_KEY=xxx
GOOGLE_AI_API_KEY=xxx
```

### Via CLI

```bash
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add FIREBASE_API_KEY
# ... add all other variables
```

---

## Step 4: Connect Git Repository

### Automatic Deployments

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub/GitLab/Bitbucket repo
4. Configure:
   - **Framework**: Vite
   - **Root Directory**: ./
   - **Build Command**: `cd farmer_ai-frontend && npm run build`
   - **Output Directory**: `farmer_ai-frontend/dist`
5. Click "Deploy"

Now every git push auto-deploys! 🚀

---

## Step 5: Configure Custom Domain

### Add Domain

1. Dashboard → Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., agrisense.com)
4. Choose DNS provider:
   - **Vercel Nameservers** (recommended)
   - **CNAME** (if using external DNS)

### Update Nameservers

If using Vercel nameservers:
1. Copy nameservers from Vercel
2. Update at your domain registrar
3. Wait 24-48 hours for propagation

If using CNAME:
1. Add CNAME record: `agrisense.com CNAME cname.vercel.com`
2. Verify in Vercel dashboard

---

## Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Cluster

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Get connection string

### Step 2: Add to Vercel

```bash
vercel env add MONGODB_URI
# Paste: mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

### Step 3: Test Connection

Create `api/test-db.js`:

```javascript
import mongoose from 'mongoose';

export default async function handler(req, res) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    res.status(200).json({ message: 'Connected to MongoDB' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

Test: `curl https://yourdomain.com/api/test-db`

---

## Middleware & CORS Setup

Create `api/middleware/cors.js`:

```javascript
export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Your handler logic
}
```

Use in all API routes:

```javascript
import { setCorsHeaders } from './middleware/cors';

export default function handler(req, res) {
  setCorsHeaders(res);
  // ... rest of handler
}
```

---

## WebSocket Support (Socket.io)

Vercel doesn't support WebSockets in serverless functions. Options:

### Option 1: Use External Service
- **Firebase Realtime Database**
- **Pusher**
- **Socket.io Cloud**

### Option 2: Use Vercel Edge Functions (Limited)

```javascript
// api/socket.js
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Limited WebSocket support
  return new Response('WebSocket not supported');
}
```

### Option 3: Separate Socket.io Server

Deploy Socket.io on:
- **Railway.app**
- **Render.com**
- **Heroku**

---

## Performance Optimization

### Enable Caching

```javascript
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).json({ data: 'cached' });
}
```

### Use Edge Functions for Speed

```javascript
// api/fast-endpoint.js
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  return new Response(JSON.stringify({ fast: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### Image Optimization

Vercel automatically optimizes images. Use:

```jsx
import Image from 'next/image';

// Or for Vite, use Vercel's image optimization:
<img src="/api/image?url=..." alt="..." />
```

---

## Monitoring & Logging

### View Logs

```bash
vercel logs
```

### Real-time Logs

```bash
vercel logs --follow
```

### Analytics

1. Dashboard → Analytics
2. View:
   - Requests
   - Response times
   - Error rates
   - Bandwidth

---

## Deployment Checklist

- [ ] Frontend built and tested locally
- [ ] Backend API tested locally
- [ ] MongoDB Atlas cluster created
- [ ] Vercel account created
- [ ] Git repository connected
- [ ] Environment variables configured
- [ ] Custom domain added
- [ ] SSL/TLS enabled (automatic)
- [ ] CORS configured
- [ ] API endpoints tested
- [ ] Database connection verified
- [ ] Monitoring enabled

---

## Troubleshooting

### Build Fails

```bash
# Check build logs
vercel logs --follow

# Test build locally
npm run build

# Check for missing dependencies
npm install
```

### API Returns 404

```bash
# Verify file structure
ls -la api/

# Check vercel.json
cat vercel.json

# Test endpoint
curl https://yourdomain.com/api/health
```

### Environment Variables Not Loading

```bash
# List variables
vercel env list

# Re-add variable
vercel env add VARIABLE_NAME

# Redeploy
vercel --prod
```

### Database Connection Fails

```bash
# Test connection string
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/dbname"

# Check firewall rules in MongoDB Atlas
# Add Vercel IP: 0.0.0.0/0 (or specific IPs)
```

### CORS Errors

```javascript
// Add to all API routes
res.setHeader('Access-Control-Allow-Origin', 'https://yourdomain.com');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```

---

## Cost Estimation

| Service | Free Tier | Paid |
|---------|-----------|------|
| Vercel Hosting | Unlimited | $20/month |
| Serverless Functions | 100GB/month | $0.50/GB |
| Edge Functions | 100k/month | $0.15/million |
| MongoDB Atlas | 512MB | $57/month |
| **Total** | **Free** | **~$80/month** |

---

## Comparison: Vercel vs Cloudflare

| Feature | Vercel | Cloudflare |
|---------|--------|-----------|
| Frontend Hosting | ✅ Excellent | ✅ Good |
| Serverless Functions | ✅ Full Node.js | ⚠️ Limited |
| WebSocket Support | ❌ No | ⚠️ Limited |
| Database Integration | ✅ Easy | ✅ Easy |
| Custom Domain | ✅ Free | ✅ Free |
| Auto-scaling | ✅ Yes | ✅ Yes |
| Learning Curve | ⭐⭐ Easy | ⭐⭐⭐ Medium |
| **Best For** | **Full Stack** | **Static + API** |

---

## Next Steps

1. Deploy frontend to Vercel
2. Create API routes
3. Connect MongoDB
4. Configure environment variables
5. Add custom domain
6. Test all endpoints
7. Enable monitoring

---

## Useful Commands

```bash
# Deploy
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List environments
vercel env list

# Add environment variable
vercel env add VARIABLE_NAME

# Remove environment variable
vercel env rm VARIABLE_NAME

# Rollback deployment
vercel rollback

# List deployments
vercel list

# Inspect deployment
vercel inspect <deployment-url>
```

---

## Resources

- **Docs**: https://vercel.com/docs
- **API Reference**: https://vercel.com/docs/api
- **Community**: https://github.com/vercel/vercel/discussions
- **Status**: https://www.vercelstatus.com/

---

## Support

- Email: support@vercel.com
- Chat: https://vercel.com/support
- Community: https://github.com/vercel/next.js/discussions

**You're ready to deploy! 🚀**
