# Railway Deployment - 10 Minute Quick Start

Deploy your backend to Railway in 10 minutes. No fluff, just steps.

---

## Before You Start

Make sure you have:
- ✅ GitHub account
- ✅ Code pushed to GitHub
- ✅ YouTube API Key ([Get here](https://console.cloud.google.com/apis/credentials))
- ✅ Admin password chosen

---

## Step 1: Create Railway Account (1 min)

1. Go to [railway.app](https://railway.app)
2. Click **"Login with GitHub"**
3. Authorize Railway
4. ✅ No credit card needed!

---

## Step 2: Deploy from GitHub (2 min)

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository
4. Railway auto-detects Python and starts deploying
5. Wait ~2 minutes for initial build

---

## Step 3: Add Environment Variables (2 min)

1. Click on your service
2. Go to **"Variables"** tab
3. Add these variables:

```bash
YOUTUBE_API_KEY=your_actual_youtube_api_key_here
ADMIN_PASSWORD=YourSecurePassword123!
FLASK_SECRET_KEY=random_long_string_here_12345678
PORT=5000
```

**Optional (for Spotify import):**
```bash
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

4. Click **"Save"**
5. Railway auto-redeploys (~2 min)

---

## Step 4: Add Persistent Storage (2 min)

**This is critical** - keeps your database between deploys!

1. In your service, go to **"Settings"**
2. Scroll to **"Volumes"**
3. Click **"+ New Volume"**
4. Configure:
   - **Mount Path**: `/app/backend`
   - **Size**: 1 GB
5. Click **"Add"**
6. Railway redeploys automatically

---

## Step 5: Get Your URL (1 min)

1. Go to **"Settings"**
2. Find **"Networking"** section
3. Click **"Generate Domain"**
4. Copy your URL:
   ```
   https://your-app-production.up.railway.app
   ```

---

## Step 6: Test It (1 min)

1. Open browser
2. Visit: `https://your-railway-url.up.railway.app/api/health`
3. Should see:
   ```json
   {
     "status": "ok",
     "api_configured": true
   }
   ```

✅ **Backend is live!**

---

## Step 7: Save Your URL (1 min)

**IMPORTANT:** Copy your Railway URL now!

You'll need it for frontend deployment:
```
https://your-app-production.up.railway.app
```

---

## ✅ Success Checklist

Your Railway backend is ready when:
- [ ] Build completed successfully
- [ ] Service shows "Active" status
- [ ] Environment variables are all set
- [ ] Volume is mounted at `/app/backend`
- [ ] Generated domain works
- [ ] `/api/health` returns OK

---

## 🚨 Quick Troubleshooting

### Build Failed?
- Check logs in Railway dashboard
- Verify `backend/requirements.txt` exists
- Redeploy: Settings → "Redeploy"

### Can't Access URL?
- Wait 2-3 minutes for deployment
- Check service is "Active" (not deploying)
- Try `/api/health` endpoint

### Variables Not Working?
- Make sure you saved them
- Check for typos
- Redeploy after adding variables

---

## 💰 Free Tier Info

**What you get:**
- $5 credit per month
- ~500 hours runtime (plenty!)
- Persistent storage
- No cold starts

**Monitor usage:**
- Profile → "Usage" dashboard
- Check daily to stay within limit

---

## 🎉 You're Done!

Your backend is live at:
```
https://your-railway-url.up.railway.app
```

**Next Step:**
→ Deploy frontend to Vercel
→ Open **`VERCEL_QUICKSTART.md`**

**Need detailed help?**
→ See **`RAILWAY_DEPLOY.md`** for full guide

---

## 📝 Save This Info

Write down or save:
```
Railway URL: https://your-app-production.up.railway.app
Admin Password: [your password]
YouTube API Key: [saved in Railway]
```

You'll need the Railway URL for Vercel deployment!

---

**Next:** Open **`VERCEL_QUICKSTART.md`** to deploy frontend! 🚀
