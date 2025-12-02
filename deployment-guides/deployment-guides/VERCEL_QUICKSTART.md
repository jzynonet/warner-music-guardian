# Vercel Deployment - 3 Minute Guide

## What You Need
1. ✅ GitHub account with your code pushed
2. ✅ Backend URL (Railway/Render)
3. ✅ 3 minutes

---

## Deploy Now

### 1. Go to Vercel (30 seconds)
→ Visit [vercel.com](https://vercel.com)
→ Click "Sign Up" or "Login"
→ Choose "Continue with GitHub"

### 2. Import Project (30 seconds)
→ Click "Add New..." → "Project"
→ Select your repository
→ Click "Import"

### 3. Configure (1 minute)
Vercel auto-detects settings, just add:

**Environment Variable:**
- Name: `VITE_API_URL`
- Value: `https://your-backend-url.up.railway.app`
- Select all environments

### 4. Deploy (1 minute)
→ Click "Deploy"
→ Wait ~2 minutes
→ Click "Visit" when done

---

## Test It

1. Visit your Vercel URL
2. Login with your password
3. Add an artist
4. Search videos
5. ✅ Done!

---

## If Something's Wrong

**Can't connect to backend?**
→ Check VITE_API_URL has correct backend URL
→ Must include `https://`
→ No trailing slash
→ Redeploy from Vercel dashboard

**Build failed?**
→ Check Root Directory is `frontend`
→ Redeploy

---

## Your URLs

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.up.railway.app`
- **Health Check**: `https://your-backend.up.railway.app/api/health`

---

## Next Steps

- Share URL with team
- Add custom domain (optional)
- Test all features
- See `VERCEL_DEPLOY.md` for detailed guide

🎉 **You're live on Vercel!**
