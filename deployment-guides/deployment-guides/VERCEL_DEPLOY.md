# Vercel Frontend Deployment Guide

## Overview
Your frontend is ready to deploy to Vercel. It will auto-detect Vite and build everything correctly.

---

## Prerequisites

1. ✅ GitHub account
2. ✅ Code pushed to GitHub
3. ✅ Backend deployed and URL ready (Railway/Render)
4. ✅ Vercel account (free)

---

## Step 1: Prepare Environment Variable (1 minute)

You need your backend URL. This should be:
- **Railway**: `https://your-app-production.up.railway.app`
- **Render**: `https://your-app.onrender.com`
- **Local Testing**: `http://localhost:5000`

Write it down - you'll need it in Step 3.

---

## Step 2: Deploy to Vercel (2 minutes)

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "Sign Up" or "Login"
   - Choose "Continue with GitHub"

2. **Import Your Repository**
   - Click "Add New..." → "Project"
   - You'll see your GitHub repositories
   - Find and select your repository
   - Click "Import"

3. **Configure Build Settings**
   Vercel should auto-detect everything, but verify:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

   If not auto-filled, Vercel will use the `vercel.json` config (already set up).

4. **Add Environment Variable**
   - Scroll to "Environment Variables"
   - Click "Add"
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-url-here.up.railway.app` (your actual backend URL)
   - **Environments**: Production, Preview, Development (select all)
   - Click "Add"

5. **Deploy**
   - Click "Deploy"
   - Wait ~2 minutes for build
   - You'll see "🎉 Congratulations!" when done

6. **Get Your URL**
   - Vercel assigns URL like: `https://your-repo-name.vercel.app`
   - Or: `https://your-repo-name-username.vercel.app`
   - Click "Visit" to test

---

### Option B: Deploy via Vercel CLI (Alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to project root
cd C:\Users\hifor\Documents\ucg

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? warner-music-guardian
# - In which directory is your code? ./frontend
# - Override settings? No

# Deploy to production
vercel --prod
```

---

## Step 3: Verify Deployment (1 minute)

1. **Visit Your URL**
   - Open `https://your-app.vercel.app`
   - Should see the login page

2. **Test Backend Connection**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Login with your password
   - Should see no errors
   - If errors say "Cannot connect to backend", check Step 4

3. **Test Features**
   - Add an artist
   - Search for videos
   - Open video details modal
   - Check if data persists after refresh

---

## Step 4: Troubleshooting

### ❌ "Cannot connect to backend" or CORS errors

**Solution 1: Check Environment Variable**
```
1. Go to Vercel dashboard
2. Your project → Settings → Environment Variables
3. Verify VITE_API_URL is correct
4. Make sure it includes https://
5. Make sure no trailing slash
6. Click "Redeploy" from Deployments tab
```

**Solution 2: Check Backend CORS**
```
1. Visit: https://your-backend-url.up.railway.app/api/health
2. Should see: {"status": "ok", "api_configured": true}
3. If you get 404, backend isn't running
4. Check Railway/Render logs
```

**Solution 3: Hard Refresh**
```
- Ctrl + Shift + R (Windows)
- Cmd + Shift + R (Mac)
- Or clear browser cache
```

---

### ❌ Build fails with "command not found"

**Solution:**
```
1. Vercel dashboard → Project Settings → General
2. Verify:
   - Root Directory: frontend
   - Framework: Vite
   - Build Command: npm run build
   - Output Directory: dist
3. Redeploy
```

---

### ❌ Page shows blank screen

**Solution:**
```
1. Open DevTools (F12) → Console
2. Look for errors
3. Common issue: Wrong VITE_API_URL
4. Fix in Vercel environment variables
5. Redeploy
```

---

### ❌ "404 Not Found" on refresh

**Already Fixed** - `vercel.json` has rewrites configured. If still happening:
```
1. Check vercel.json is committed to git
2. Redeploy from Vercel dashboard
```

---

### ❌ Environment variable not updating

**Solution:**
```
1. Change the variable in Vercel settings
2. Go to Deployments tab
3. Find latest deployment
4. Click "..." → "Redeploy"
5. Wait for new build
```

---

## Step 5: Custom Domain (Optional)

### Add Your Own Domain

1. **In Vercel Dashboard**
   - Go to your project
   - Settings → Domains
   - Click "Add"
   - Enter your domain: `app.yourdomain.com`

2. **In Your DNS Provider**
   - Add CNAME record:
     - Name: `app` (or `www` or `@`)
     - Value: `cname.vercel-dns.com`
   - Save

3. **Wait for DNS**
   - Can take 5 minutes to 48 hours
   - Vercel shows green checkmark when ready

4. **Update Backend CORS** (if needed)
   - Some backends check origin domain
   - May need to allow your custom domain

---

## Step 6: Auto-Deploy on Push (Already Configured)

Every time you push to GitHub:
- Vercel auto-builds and deploys
- You get a preview URL for each PR
- Production deploys on main branch

To disable:
- Settings → Git → Disable auto-deployments

---

## Updating Your App

### Update Frontend Code
```bash
# Make changes locally
# Test locally: npm run dev

# Commit and push
git add .
git commit -m "Update frontend"
git push

# Vercel auto-deploys in ~2 minutes
```

### Update Environment Variables
```
1. Vercel dashboard → Settings → Environment Variables
2. Edit VITE_API_URL
3. Click "Save"
4. Go to Deployments → Latest → Redeploy
```

### Update Backend URL
```
1. Deploy new backend
2. Get new URL
3. Update VITE_API_URL in Vercel
4. Redeploy
```

---

## Monitoring & Analytics

### View Logs
```
1. Vercel dashboard → Your project
2. Deployments → Click deployment
3. View build logs and runtime logs
```

### Check Usage
```
1. Vercel dashboard → Usage
2. See bandwidth, builds, serverless functions
3. Free tier: 100GB bandwidth/month
```

### Performance
```
1. Each deployment shows Web Vitals
2. Click deployment → Analytics tab
3. See load times, FCP, LCP metrics
```

---

## Vercel Free Tier Limits

✅ **Included Forever Free:**
- 100GB bandwidth per month
- Unlimited websites
- Unlimited deployments
- SSL certificates (auto)
- CDN (150+ locations worldwide)
- Preview deployments (for PRs)
- Web analytics

⚠️ **Limits:**
- 100GB bandwidth/month (then throttled)
- 100 builds/day
- 6,000 build minutes/month
- 100GB build output cache

**For This App:**
- Your app is ~5MB built
- Easily handles 10,000+ visits/month
- Well within free tier

---

## Pro Tips

### Environment Variable Management
```bash
# Create .env.local for local testing
VITE_API_URL=http://localhost:5000

# Vercel uses .env.production values automatically
# Never commit .env files with secrets!
```

### Multiple Environments
```
- main branch → Production (your-app.vercel.app)
- dev branch → Preview (your-app-git-dev.vercel.app)
- feature branches → Auto preview URLs
```

### Speed Up Builds
```
1. Vercel caches node_modules
2. Average build time: ~2 minutes
3. Can't make much faster on free tier
```

---

## Success Checklist ✅

Your Vercel deployment is successful when:

- [ ] Frontend loads at your Vercel URL
- [ ] Login works with your password
- [ ] Can add artists and search videos
- [ ] No console errors (F12 → Console)
- [ ] Data persists after refresh
- [ ] Stats cards filter videos correctly
- [ ] Video modal opens and works
- [ ] Auto-deploy works (push to git → auto-updates)

---

## Get Help

**Vercel Documentation:**
- Main Docs: https://vercel.com/docs
- Vite Guide: https://vercel.com/docs/frameworks/vite
- Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables

**Support:**
- Vercel Discord: https://vercel.com/discord
- GitHub Issues: Your repo issues
- Vercel Support: support@vercel.com (Pro plans)

---

## Quick Reference

### Your URLs
- **Production**: `https://your-app.vercel.app`
- **Git Branch Previews**: `https://your-app-git-branch.vercel.app`
- **Backend**: `https://your-backend.up.railway.app`

### Important Settings
- **Root Directory**: `frontend`
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variable**: `VITE_API_URL`

### Common Commands
```bash
# Local development
cd frontend
npm run dev

# Build locally
npm run build

# Preview build
npm run preview

# Deploy with CLI
vercel --prod
```

---

## Next Steps After Deployment

1. ✅ Share Vercel URL with team
2. ✅ Test all features thoroughly
3. ✅ Monitor first day of usage
4. ✅ Add custom domain (optional)
5. ✅ Set up staging environment (optional)
6. ✅ Configure preview deployments for PRs

---

## You're Live! 🎉

Your Warner Music Guardian frontend is now deployed on Vercel with:
- ✅ Auto-deploy from GitHub
- ✅ Global CDN
- ✅ SSL certificate
- ✅ Preview deployments
- ✅ Analytics

**Your app is ready for the world!** 🌍
