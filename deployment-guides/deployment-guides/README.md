# Deployment Guides

All documentation for deploying Warner Music Guardian to production.

---

## 🚀 Quick Start (Recommended)

### Railway + Vercel Deployment (15 minutes total)

**Backend (Railway):**
1. Follow **`RAILWAY_QUICKSTART.md`** (10 minutes)
2. Get your Railway URL

**Frontend (Vercel):**
1. Follow **`VERCEL_QUICKSTART.md`** (3 minutes)
2. Use Railway URL as `VITE_API_URL`

**Done!** ✅

---

## 📚 Available Guides

### Start Here
- **`START_HERE.md`** - Read this first! Quick overview and navigation

### Quick Start Guides (⚡ Fastest)
- **`RAILWAY_QUICKSTART.md`** - Railway backend in 10 minutes ⭐
- **`VERCEL_QUICKSTART.md`** - Vercel frontend in 3 minutes ⭐
- **`QUICK_DEPLOY.md`** - Complete deployment in 15 minutes

### Complete Guides (📖 Detailed)
- **`RAILWAY_DEPLOY.md`** - Full Railway deployment guide ⭐
- **`RENDER_DEPLOY.md`** - Full Render deployment guide
- **`VERCEL_DEPLOY.md`** - Full Vercel deployment guide

### Comparison & Options
- **`RAILWAY_VS_RENDER.md`** - Compare backend options
- **`BACKEND_OPTIONS.md`** - All 11+ backend alternatives
- **`DEPLOYMENT_SUMMARY.md`** - High-level overview

### Checklists
- **`DEPLOYMENT_CHECKLIST.md`** - Step-by-step checklist with troubleshooting
- **`DEPLOYMENT_GUIDE.md`** - Original comprehensive guide

---

## 🎯 Which Guide Should I Use?

### I want the fastest deployment
→ **`RAILWAY_QUICKSTART.md`** + **`VERCEL_QUICKSTART.md`**

### I want detailed instructions
→ **`RAILWAY_DEPLOY.md`** + **`VERCEL_DEPLOY.md`**

### I'm not sure which backend to use
→ **`RAILWAY_VS_RENDER.md`** or **`BACKEND_OPTIONS.md`**

### I want a step-by-step checklist
→ **`DEPLOYMENT_CHECKLIST.md`**

### I want to understand all options
→ **`DEPLOYMENT_SUMMARY.md`**

---

## 🏗️ Project Structure

```
ucg/
├── deployment-guides/          ← You are here
│   ├── README.md              ← This file
│   ├── START_HERE.md          ← Quick navigation
│   ├── RAILWAY_QUICKSTART.md  ⭐ Start here for Railway
│   ├── RAILWAY_DEPLOY.md      📖 Full Railway guide
│   ├── VERCEL_QUICKSTART.md   ⚡ Frontend quick start
│   ├── VERCEL_DEPLOY.md       📖 Full Vercel guide
│   └── ... (other guides)
│
├── railway.json               ← Railway config (ready)
├── nixpacks.toml             ← Railway build config
├── render.yaml               ← Render config (ready)
├── vercel.json               ← Vercel config (ready)
├── .vercelignore             ← Vercel ignore rules
│
├── backend/                   ← Python Flask API
├── frontend/                  ← React + Vite app
└── README.md                  ← Main project readme

```

---

## ⚙️ Configuration Files (In Root)

These files are already configured and ready to use:

**Backend Deployment:**
- `railway.json` - Railway deployment config
- `nixpacks.toml` - Railway build config
- `render.yaml` - Render deployment config

**Frontend Deployment:**
- `vercel.json` - Vercel deployment config
- `.vercelignore` - Files Vercel should ignore

**Environment Variables:**
- `frontend/.env.production` - Template for production
- `frontend/.env.example` - Example environment variables
- `backend/.env.example` - Backend environment template

---

## 🎯 Recommended Path

### For Production Deployment:

```
1. Read START_HERE.md (2 min)
   ↓
2. Deploy Backend to Railway (10 min)
   → Follow RAILWAY_QUICKSTART.md
   → Get Railway URL
   ↓
3. Deploy Frontend to Vercel (3 min)
   → Follow VERCEL_QUICKSTART.md
   → Use Railway URL as VITE_API_URL
   ↓
4. Test Your App (2 min)
   → Login at your Vercel URL
   → Add artist, search videos
   ↓
5. Done! 🎉
```

**Total Time: ~15 minutes**

---

## 🆘 Getting Help

**If something doesn't work:**

1. Check the **Troubleshooting** section in the relevant guide
2. Review **`DEPLOYMENT_CHECKLIST.md`** for common issues
3. Check platform-specific docs:
   - Railway: https://docs.railway.app
   - Vercel: https://vercel.com/docs
   - Render: https://render.com/docs

**Most common issues:**
- Missing environment variables
- Wrong VITE_API_URL format
- Database not persisting (Render free tier)
- Cold starts (Render free tier)
- CORS errors (check backend CORS config)

---

## 💰 Cost Summary

**Recommended Setup (Railway + Vercel):**
- Backend: Railway $0/month (free $5 credit)
- Frontend: Vercel $0/month (free forever)
- **Total: $0/month for testing**

**If Scaling:**
- Railway: ~$5-10/month (small production)
- Vercel: Free (or $20/month for teams)
- **Total: ~$5-10/month**

---

## 🔥 Quick Links

**Platform Logins:**
- Railway: https://railway.app
- Vercel: https://vercel.com
- Render: https://render.com

**Get API Keys:**
- YouTube API: https://console.cloud.google.com/apis/credentials
- Spotify API: https://developer.spotify.com/dashboard

**Documentation:**
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- This Project: `../README.md`

---

## ✅ Success Criteria

Your deployment is successful when:

**Backend (Railway):**
- [ ] Service is live
- [ ] `/api/health` returns `{"status": "ok"}`
- [ ] Environment variables are set
- [ ] Persistent volume is mounted
- [ ] URL is accessible

**Frontend (Vercel):**
- [ ] Site loads without errors
- [ ] Can login with password
- [ ] Can add artists and search videos
- [ ] Data persists after refresh
- [ ] No console errors

**Integration:**
- [ ] Frontend connects to backend
- [ ] All features work
- [ ] Auto-deploy works (git push)

---

## 🚀 Ready to Deploy?

**Start here:**
→ Open **`START_HERE.md`** for quick navigation
→ Or jump to **`RAILWAY_QUICKSTART.md`** to begin!

**Good luck with your deployment!** 🎉
