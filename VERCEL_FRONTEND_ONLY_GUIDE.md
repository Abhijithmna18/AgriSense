# Vercel Frontend-Only Deployment Guide

Deploy only the React/Vite frontend to Vercel in 5 minutes.

---

## Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

---

## Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate with your Vercel account.

---

## Step 3: Deploy Frontend

Navigate to the frontend directory and deploy:

```bash
cd farmer_ai-frontend
vercel
```

### Answer the prompts:

```
? Set up and deploy "farmer_ai-frontend"? [Y/n] → Y
? Which scope do you want to deploy to? → Your account
? Link to existing project? [y/N] → N
? What's your project's name? → agrisense-frontend
? In which directory is your code located? → ./
? Want to modify these settings? [y/N] → N
```

**Done!** Your frontend is live at: `https://agrisense-frontend.vercel.app`

---

## Step 4: Configure Environment Variables

### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select **agrisense-frontend** project
3. Go to **Settings** → **Environment Variables**
4. Add your variables:

```
VITE_API_URL=https://your-backend-url.com
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
```

5. Click "Save"
6. Redeploy: `vercel --prod`

### Option B: Via CLI

```bash
vercel env add VITE_API_URL
# Paste your backend URL

vercel env add VITE_FIREBASE_API_KEY
# Paste your Firebase API key

# Add all other VITE_* variables
```

---

## Step 5: Update Frontend .env File

Update `farmer_ai-frontend/.env`:

```
VITE_API_URL=https://your-backend-url.com
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
```

---

## Step 6: Connect Git for Auto-Deploy (Optional but Recommended)

### Setup Git Auto-Deploy

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your GitHub/GitLab/Bitbucket repo
4. Configure:
   - **Project name**: agrisense-frontend
   - **Framework**: Vite
   - **Root Directory**: farmer_ai-frontend
   - **Build Command**: npm run build
   - **Output Directory**: dist
5. Click **"Deploy"**

Now every git push to main branch auto-deploys! 🚀

---

## Step 7: Add Custom Domain (Optional)

### Add Your Domain

1. Dashboard → **agrisense-frontend** → **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., agrisense.com)
4. Choose DNS option:
   - **Vercel Nameservers** (easiest)
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

## Step 8: Verify Deployment

### Test Frontend

```bash
# Test the deployment
curl https://agrisense-frontend.vercel.app

# Or open in browser
https://agrisense-frontend.vercel.app
```

### Check Logs

```bash
# View deployment logs
vercel logs

# Follow logs in real-time
vercel logs --follow
```

---

## Project Structure

```
farmer_ai-frontend/
├── src/
│   ├── pages/
│   ├── components/
│   ├── App.jsx
│   └── main.jsx
├── public/
├── dist/                    ← Built files (auto-generated)
├── .env                     ← Environment variables
├── package.json
├── vite.config.js
└── index.html
```

---

## Environment Variables Reference

| Variable | Example | Required |
|----------|---------|----------|
| VITE_API_URL | https://api.example.com | ✅ Yes |
| VITE_FIREBASE_API_KEY | AIzaSy... | ✅ Yes |
| VITE_FIREBASE_AUTH_DOMAIN | project.firebaseapp.com | ✅ Yes |
| VITE_FIREBASE_PROJECT_ID | project-id | ✅ Yes |
| VITE_FIREBASE_STORAGE_BUCKET | project.appspot.com | ✅ Yes |
| VITE_FIREBASE_MESSAGING_SENDER_ID | 123456789 | ✅ Yes |
| VITE_FIREBASE_APP_ID | 1:123:web:abc | ✅ Yes |

---

## Useful Commands

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View logs
vercel logs

# Follow logs in real-time
vercel logs --follow

# List all deployments
vercel list

# Rollback to previous deployment
vercel rollback

# Add environment variable
vercel env add VARIABLE_NAME

# Remove environment variable
vercel env rm VARIABLE_NAME

# List environment variables
vercel env list

# Inspect a deployment
vercel inspect <deployment-url>
```

---

## Troubleshooting

### Build Fails

```bash
# Check build locally first
cd farmer_ai-frontend
npm install
npm run build

# If build succeeds locally but fails on Vercel:
# 1. Check Node version compatibility
# 2. Verify all dependencies are in package.json
# 3. Check for missing environment variables
```

### Environment Variables Not Loading

```bash
# Re-add variables
vercel env add VITE_API_URL

# Redeploy
vercel --prod

# Verify variables are set
vercel env list
```

### API Calls Failing

```bash
# Check VITE_API_URL is correct
# Make sure backend is running and accessible
# Check CORS headers on backend

# Test API endpoint
curl https://your-backend-url.com/api/health
```

### 404 on Routes

```bash
# Vercel automatically handles SPA routing
# No additional configuration needed for React Router
# If still having issues, add vercel.json:
```

Create `farmer_ai-frontend/vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Slow Performance

```bash
# Enable caching in vercel.json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## Performance Optimization

### 1. Enable Caching

Create `farmer_ai-frontend/vercel.json`:

```json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, must-revalidate"
        }
      ]
    }
  ]
}
```

### 2. Optimize Images

Use Vercel's Image Optimization:

```jsx
import Image from 'next/image';

// Or for Vite, use standard img tags
<img src="/image.jpg" alt="..." loading="lazy" />
```

### 3. Code Splitting

Vite automatically code-splits. No additional setup needed.

### 4. Monitor Performance

1. Dashboard → **Analytics**
2. View:
   - Response times
   - Bandwidth usage
   - Request count
   - Error rates

---

## Monitoring & Analytics

### View Analytics

1. Go to https://vercel.com/dashboard
2. Select **agrisense-frontend**
3. Click **Analytics**
4. View:
   - Requests
   - Response times
   - Bandwidth
   - Errors

### View Logs

```bash
vercel logs --follow
```

---

## Deployment Checklist

- [ ] Vercel CLI installed
- [ ] Logged in to Vercel
- [ ] Frontend deployed
- [ ] Environment variables added
- [ ] Git connected for auto-deploy
- [ ] Custom domain configured (optional)
- [ ] SSL/TLS enabled (automatic)
- [ ] Performance optimized
- [ ] Monitoring enabled
- [ ] Tested in production

---

## Cost

- **Free tier**: Unlimited deployments, 100GB/month bandwidth
- **Pro**: $20/month for advanced features
- **Enterprise**: Custom pricing

---

## Next Steps

1. ✅ Deploy frontend to Vercel
2. ✅ Add environment variables
3. ✅ Connect Git for auto-deploy
4. ✅ Add custom domain
5. ✅ Monitor performance
6. ✅ Keep backend running separately

---

## Useful Links

- **Dashboard**: https://vercel.com/dashboard
- **Documentation**: https://vercel.com/docs
- **Status**: https://www.vercelstatus.com/
- **Community**: https://github.com/vercel/vercel/discussions

---

## Support

- **Email**: support@vercel.com
- **Chat**: https://vercel.com/support
- **Community**: https://github.com/vercel/vercel/discussions

**Your frontend is live! 🎉**
