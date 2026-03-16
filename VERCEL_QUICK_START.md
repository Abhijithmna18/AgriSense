# Vercel Deployment - Quick Start (5 Minutes)

## Fastest Way to Deploy

### Option A: Frontend Only (Easiest)

#### 1. Install Vercel CLI
```bash
npm install -g vercel
vercel login
```

#### 2. Deploy
```bash
cd farmer_ai-frontend
vercel
```

**Done!** Your frontend is live at: `https://agrisense-frontend.vercel.app`

---

### Option B: Full Stack (Frontend + Backend)

#### 1. Create vercel.json

In project root:

```json
{
  "version": 2,
  "buildCommand": "cd farmer_ai-frontend && npm run build",
  "outputDirectory": "farmer_ai-frontend/dist",
  "env": {
    "MONGODB_URI": "@mongodb_uri",
    "JWT_SECRET": "@jwt_secret"
  },
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 60
    }
  }
}
```

#### 2. Create API Directory

```bash
mkdir -p api/auth api/dashboard api/market
```

#### 3. Create API Routes

**api/health.js:**
```javascript
export default function handler(req, res) {
  res.status(200).json({ status: 'ok' });
}
```

**api/auth/login.js:**
```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    
    // Your login logic here
    const token = 'jwt-token';
    
    res.status(200).json({ success: true, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

#### 4. Update Frontend .env

```
VITE_API_URL=https://agrisense.vercel.app/api
```

#### 5. Deploy
```bash
vercel --prod
```

**Done!** Full stack is live! 🚀

---

## Add Environment Variables

### Via Dashboard

1. Go to https://vercel.com/dashboard
2. Select project → Settings → Environment Variables
3. Add:
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your-secret
   FIREBASE_API_KEY=xxx
   ```

### Via CLI

```bash
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add FIREBASE_API_KEY
```

---

## Connect Git for Auto-Deploy

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your repo
4. Configure:
   - Framework: Vite
   - Build: `cd farmer_ai-frontend && npm run build`
   - Output: `farmer_ai-frontend/dist`
5. Deploy!

Now every git push auto-deploys! 🎉

---

## Add Custom Domain

1. Dashboard → Project Settings → Domains
2. Add your domain
3. Update nameservers at registrar
4. Wait 24-48 hours

---

## Verify Deployment

```bash
# Test frontend
curl https://agrisense.vercel.app

# Test API
curl https://agrisense.vercel.app/api/health

# View logs
vercel logs
```

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Build fails | Run `npm install` first |
| API returns 404 | Check `api/` folder structure |
| Env vars not loading | Re-add in dashboard, then redeploy |
| Database connection fails | Check MongoDB firewall rules |
| CORS errors | Add CORS headers in API routes |

---

## Useful Commands

```bash
# Deploy
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs --follow

# List deployments
vercel list

# Rollback
vercel rollback

# Add env variable
vercel env add VARIABLE_NAME
```

---

## Project Structure

```
project-root/
├── farmer_ai-frontend/
│   ├── src/
│   ├── dist/
│   ├── package.json
│   └── vite.config.js
├── farmer_ai-backend/
│   ├── server.js
│   └── package.json
├── api/                    ← Vercel serverless functions
│   ├── health.js
│   ├── auth/
│   │   ├── login.js
│   │   └── register.js
│   ├── dashboard/
│   │   └── stats.js
│   └── market/
│       └── analytics.js
├── vercel.json            ← Vercel config
└── package.json
```

---

## Next Steps

1. ✅ Deploy frontend
2. ✅ Create API routes
3. ✅ Add environment variables
4. ✅ Connect MongoDB
5. ✅ Add custom domain
6. ✅ Test endpoints
7. ✅ Enable monitoring

---

## Monitoring

```bash
# Real-time logs
vercel logs --follow

# View analytics
# Dashboard → Analytics
```

---

## Cost

- **Free tier**: Unlimited deployments, 100GB/month functions
- **Paid**: $20/month for Pro features

---

## Support

- Docs: https://vercel.com/docs
- Status: https://www.vercelstatus.com/
- Community: https://github.com/vercel/vercel/discussions

**You're live! 🎉**
