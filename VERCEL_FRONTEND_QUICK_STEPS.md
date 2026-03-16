# Vercel Frontend Deployment - 5 Simple Steps

## Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

## Step 2: Login

```bash
vercel login
```

## Step 3: Deploy

```bash
cd farmer_ai-frontend
vercel
```

Answer the prompts:
- Project name: `agrisense-frontend`
- Framework: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

**Your frontend is now live!** 🎉

Example URL: `https://agrisense-frontend.vercel.app`

---

## Step 4: Add Environment Variables

### Via Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click **agrisense-frontend**
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
VITE_API_URL=https://your-backend-url.com
VITE_FIREBASE_API_KEY=your-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

5. Click **Save**
6. Redeploy: `vercel --prod`

### Via CLI

```bash
vercel env add VITE_API_URL
vercel env add VITE_FIREBASE_API_KEY
# ... add all other variables
```

---

## Step 5: Connect Git (Optional but Recommended)

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your repo
4. Set:
   - Root Directory: `farmer_ai-frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click **Deploy**

Now every git push auto-deploys! 🚀

---

## Verify It Works

```bash
# Test the deployment
curl https://agrisense-frontend.vercel.app

# View logs
vercel logs --follow
```

---

## Add Custom Domain (Optional)

1. Dashboard → **agrisense-frontend** → **Settings** → **Domains**
2. Add your domain
3. Update nameservers at your registrar
4. Wait 24-48 hours

---

## Common Commands

```bash
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

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Run `npm install` then `npm run build` locally |
| Env vars not loading | Re-add in dashboard, then redeploy |
| API calls fail | Check `VITE_API_URL` is correct |
| 404 on routes | Vercel handles SPA routing automatically |

---

## Done! 🎉

Your frontend is now hosted on Vercel!

- **URL**: https://agrisense-frontend.vercel.app
- **Dashboard**: https://vercel.com/dashboard
- **Docs**: https://vercel.com/docs
