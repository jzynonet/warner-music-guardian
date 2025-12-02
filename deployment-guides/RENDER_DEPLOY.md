# Render Backend Deployment - Complete Guide

## Why Render?
- ✅ Already configured (render.yaml exists)
- ✅ 750 free hours/month
- ✅ Super simple deployment (5 minutes)
- ✅ No credit card required
- ✅ Great documentation
- ⚠️ Cold starts after 15 min inactivity (free tier)
- ⚠️ No persistent disk on free tier

---

## Important: Free Tier Limitations

### What You Get Free
- ✅ 750 hours/month compute
- ✅ HTTPS automatically
- ✅ Auto-deploy from GitHub
- ✅ 100 GB bandwidth/month

### What You DON'T Get Free
- ❌ **Persistent disk** - Database resets on every deploy
- ❌ No cold starts - Spins down after 15 min inactivity
- ❌ Background workers

### Solutions
1. **For Testing**: Accept database resets (data lost on deploy)
2. **For Production**: Upgrade to $7/month plan (gets persistent disk)
3. **Alternative**: Use external database (PostgreSQL from Render or Neon)

---

## Option 1: Free Tier (Testing Only)

### ⚠️ Warning
- Database will **reset every time you deploy**
- App will **sleep after 15 minutes** of no traffic
- First request after sleep takes **30-60 seconds**

### Good For
- Quick testing
- Demos
- Learning
- Non-critical data

### Not Good For
- Production
- Data you want to keep
- Real-time applications

---

## Option 2: Paid Tier ($7/month) - Recommended for Production

### What You Get
- ✅ Persistent disk (database stays)
- ✅ Faster cold starts
- ✅ More compute resources
- ✅ Better support

### Cost
- $7/month for Starter plan
- First month often free with trial

---

## Prerequisites

Before starting:
- [ ] GitHub account
- [ ] Code pushed to GitHub
- [ ] YouTube API Key
- [ ] Chosen admin password
- [ ] 10 minutes

---

## Step 1: Push to GitHub (If Not Done)

```bash
cd C:\Users\hifor\Documents\ucg

git init
git add .
git commit -m "Ready for Render deployment"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## Step 2: Create Render Account (1 minute)

1. **Go to Render**
   - Visit: [render.com](https://render.com)
   - Click **"Get Started"** or **"Sign Up"**

2. **Sign Up with GitHub**
   - Click **"Sign in with GitHub"**
   - Authorize Render to access GitHub
   - No credit card needed for free tier!

3. **Verify Email**
   - Check email for verification link
   - Click to verify

✅ **You're in Render Dashboard!**

---

## Step 3: Deploy Using Blueprint (2 minutes)

Your `render.yaml` is already configured, so deployment is automatic!

### 3.1 Create New Blueprint

1. In Render dashboard, click **"New +"** (top right)

2. Select **"Blueprint"**

3. **Connect GitHub**
   - If first time: Click "Connect GitHub"
   - Grant Render access to your repositories

4. **Select Repository**
   - Find your "warner-music-guardian" repo
   - Click **"Connect"**

5. **Render Detects Configuration**
   - Render will find `render.yaml` automatically
   - Shows: "1 service will be created"
   - Service type: Web Service
   - Environment: Python

6. **Review Settings**
   - Should show:
     - Name: `ugc-monitor-backend`
     - Environment: `python`
     - Build Command: `cd backend && pip install -r requirements.txt`
     - Start Command: `cd backend && python app.py`

7. **Click "Apply"**

✅ **Deployment started!**

---

## Step 4: Configure Environment Variables (2 minutes)

### 4.1 Navigate to Environment

1. Wait for initial deploy (2-3 minutes)
2. Click on your service: **"ugc-monitor-backend"**
3. Go to **"Environment"** tab (left sidebar)

### 4.2 Add Variables

Click **"Add Environment Variable"** and add each:

```bash
YOUTUBE_API_KEY=your_actual_youtube_api_key
ADMIN_PASSWORD=ChooseSecurePassword123!
FLASK_SECRET_KEY=random_long_string_12345678
PORT=5000
```

**How to get these:**

**YOUTUBE_API_KEY:**
- Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- Enable "YouTube Data API v3"
- Create API Key
- Copy here

**ADMIN_PASSWORD:**
- Your login password
- Make it secure!
- Example: `MusicGuardian2024!`

**FLASK_SECRET_KEY:**
- Random string
- Generate: `python -c "import secrets; print(secrets.token_hex(32))"`
- Or just: `mysupersecretkey123456789`

**PORT:**
- Always: `5000`

### 4.3 Optional Variables

If using Spotify or email:

```bash
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=your_email@gmail.com
```

### 4.4 Save and Redeploy

1. Click **"Save Changes"**
2. Render will **auto-redeploy** with new variables
3. Wait 2-3 minutes

✅ **Environment configured!**

---

## Step 5: Get Your URL (1 minute)

### 5.1 Find Your Service URL

1. In your service dashboard, look for **URL** at the top
2. It will be something like:
   ```
   https://ugc-monitor-backend.onrender.com
   ```
   or
   ```
   https://warner-music-guardian.onrender.com
   ```

3. **Copy this URL** - you need it for Vercel!

### 5.2 Test Your Backend

1. Open browser and visit:
   ```
   https://your-app.onrender.com/api/health
   ```

2. Should see:
   ```json
   {
     "status": "ok",
     "api_configured": true
   }
   ```

3. If you see this, backend is working! ✅

⚠️ **First load may take 30-60 seconds if service was sleeping**

---

## Step 6: Understand Free Tier Behavior

### Cold Starts (Free Tier)

**What happens:**
1. After 15 minutes of no requests, service "spins down"
2. Next request "wakes it up" (takes 30-60 seconds)
3. Subsequent requests are fast

**How to handle:**
- Warn users first load is slow
- Keep a browser tab open during testing
- Or upgrade to paid ($7/month, no spin down)

### Database Resets (Free Tier)

**What happens:**
1. Every time you deploy new code, database resets
2. All videos, artists, settings are lost
3. Starts fresh each deploy

**How to handle:**
- **Testing**: Accept data loss, re-add test data
- **Production**: Upgrade to $7/month for persistent disk
- **Alternative**: Use external PostgreSQL database

---

## Step 7: Verify Deployment (2 minutes)

### 7.1 Check Logs

1. Go to your service → **"Logs"** tab
2. Should see:
   ```
   * Running on all addresses (0.0.0.0)
   * Running on http://0.0.0.0:5000
   ```

3. No errors should appear

### 7.2 Test Endpoints

**Health Check:**
```
https://your-app.onrender.com/api/health
```

**Stats:**
```
https://your-app.onrender.com/api/stats
```
Should return: `{"total_videos": 0, "pending": 0, ...}`

**Login Test (optional):**
```bash
# Using curl or Postman
POST https://your-app.onrender.com/api/auth/login
Body: {"password": "your_admin_password"}
```

✅ **All working!**

---

## 🎉 Step 8: You're Live!

### Your Render URLs

**Base URL:**
```
https://your-app.onrender.com
```

**API Endpoints:**
```
Health:    /api/health
Login:     /api/auth/login
Stats:     /api/stats
Videos:    /api/videos
Artists:   /api/artists
```

### Next Steps

1. ✅ Copy your Render URL
2. ✅ Deploy frontend to Vercel
3. ✅ Use Render URL as `VITE_API_URL` in Vercel
4. ✅ Test complete app

---

## 💰 Upgrading to Paid (Recommended)

### Why Upgrade?

**Problems with Free Tier:**
- Database resets on every deploy
- Service sleeps (slow first load)
- Not suitable for production

**Benefits of $7/month:**
- ✅ Persistent disk (25GB)
- ✅ Database stays between deploys
- ✅ Faster cold starts
- ✅ More reliable

### How to Upgrade

1. **Go to Your Service**
   - Dashboard → Your service

2. **Click Settings**
   - Scroll to "Instance Type"

3. **Select Plan**
   - Free → **Starter ($7/month)**
   - Or: **Standard ($25/month)** for more power

4. **Add Payment Method**
   - Add credit card
   - First charge may be prorated

5. **Add Persistent Disk**
   - Settings → Disks
   - Click "Add Disk"
   - Name: `database`
   - Mount Path: `/opt/render/project/src`
   - Size: 1 GB (or more)
   - Click "Save"

6. **Redeploy**
   - Service will redeploy with persistent disk
   - Database now persists!

✅ **Now production-ready!**

---

## 🔧 Troubleshooting

### ❌ Build Failed

**Error: "Could not find requirements.txt"**

**Solution:**
```yaml
# Check render.yaml has correct path
buildCommand: "cd backend && pip install -r requirements.txt"
```

**Error: "Python version not found"**

**Solution:**
```bash
# Add runtime.txt in backend folder
echo "python-3.11.0" > backend/runtime.txt
git add backend/runtime.txt
git commit -m "Add Python version"
git push
```

---

### ❌ Service Not Starting

**Check Logs:**
1. Service → Logs
2. Look for Python errors

**Common Issues:**

**Missing Environment Variables:**
```bash
# Make sure all are set:
YOUTUBE_API_KEY
ADMIN_PASSWORD
FLASK_SECRET_KEY
PORT=5000
```

**Wrong Start Command:**
```yaml
# In render.yaml, should be:
startCommand: "cd backend && python app.py"
```

**Port Issues:**
```python
# In app.py, make sure:
port = int(os.getenv('PORT', 5000))
app.run(host='0.0.0.0', port=port)
```

---

### ❌ "Application Failed to Respond"

**Cause:** Service sleeping (free tier) or crashed

**Solution:**
1. Check if service is running (Dashboard)
2. Look at logs for errors
3. Wait 30-60 seconds for wake-up (free tier)
4. If crashed, check logs and redeploy

---

### ❌ Database Resets

**Cause:** Free tier has no persistent disk

**Solutions:**

**Option 1: Upgrade ($7/month)**
- Add persistent disk
- Database persists

**Option 2: External Database**
- Use Render PostgreSQL (free 90 days)
- Or Neon.tech (free 0.5GB)
- Or Supabase (free 500MB)

**Option 3: Accept It (Testing Only)**
- Re-add test data after each deploy

---

### ❌ Slow First Load (30-60 seconds)

**Cause:** Free tier spins down after 15 min inactivity

**Solutions:**

**Option 1: Keep Awake Service**
```bash
# Use a service like:
# - UptimeRobot (free)
# - Pingdom (free tier)
# Ping your URL every 10 minutes
```

**Option 2: Upgrade to Paid**
- $7/month plan has faster spin-up
- Or stays always-on

**Option 3: Accept It**
- First load slow, rest is fast
- Good enough for testing

---

### ❌ CORS Errors

**Cause:** Backend not allowing frontend domain

**Solution:**
```python
# Check app.py has:
from flask_cors import CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Or specific domain:
CORS(app, resources={r"/api/*": {"origins": ["https://your-app.vercel.app"]}})
```

Redeploy after fixing.

---

## 🔄 Updating Your Backend

### Auto-Deploy from GitHub

```bash
# Make changes locally
# Test: python backend/app.py

# Commit and push
git add .
git commit -m "Update backend"
git push

# Render auto-deploys!
# Takes 2-3 minutes
```

### Manual Redeploy

1. Service → "Manual Deploy"
2. Select branch: `main`
3. Click "Deploy"

### Rollback to Previous Deploy

1. Service → "Events" tab
2. Find successful deployment
3. Click "Rollback to this deploy"

---

## 📊 Monitoring & Logs

### View Logs

1. **Live Logs:**
   - Service → Logs tab
   - See real-time logs

2. **Filter Logs:**
   - Click "Filter"
   - Search for errors
   - Download logs

### Usage Dashboard

1. **Dashboard → Usage**
2. See:
   - Hours used (750/month free)
   - Bandwidth used
   - Build minutes

### Set Up Notifications

1. **Service → Settings**
2. **Notifications**
3. Add email or Slack
4. Get alerts for:
   - Deploy failures
   - Service crashes
   - Usage limits

---

## 💡 Pro Tips

### Keep Service Awake (Free Tier)

Use **UptimeRobot** (free):
1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Add monitor for your Render URL
3. Check every 5-10 minutes
4. Service stays awake!

### Faster Deployments

```yaml
# In render.yaml, cache dependencies:
buildCommand: |
  cd backend
  pip install --upgrade pip
  pip install -r requirements.txt --cache-dir=/opt/render/.pip-cache
```

### Environment-Specific Variables

```bash
# Render supports:
# - Production (main branch)
# - Preview (PR branches)

# Set different variables for each
```

### Database Backups (Paid Plan)

```bash
# Add backup endpoint in app.py
@app.route('/api/backup-db')
def backup_db():
    # Return database file
    return send_file('videos.db')

# Download periodically
# Or use Render's disk snapshots
```

---

## 🆚 Render vs Railway Comparison

| Feature | Render Free | Railway Free | Winner |
|---------|-------------|--------------|--------|
| Compute | 750 hrs/mo | $5 credit (~500hrs) | Render |
| Cold Starts | Yes (15min) | No | Railway |
| Persistent Disk | No | Yes | Railway |
| Setup Time | 5 min | 5 min | Tie |
| Paid Upgrade | $7/mo | $5/mo | Railway |
| Best For | Testing w/ data loss | Testing w/ data | Railway |

**Recommendation:**
- **For Testing**: Railway (persistent database)
- **For Paid Production**: Either works great!

---

## 📚 Success Checklist

Your Render deployment is successful when:

- [ ] Build completed without errors
- [ ] Service shows "Live" status
- [ ] `/api/health` returns `{"status": "ok"}`
- [ ] All environment variables set
- [ ] Service URL works in browser
- [ ] Can access API endpoints
- [ ] Auto-deploy works (git push → deploy)

**If on Paid Plan:**
- [ ] Persistent disk attached
- [ ] Database survives redeployment
- [ ] Service doesn't sleep

---

## 🎓 Render CLI (Optional)

```bash
# Install Render CLI
npm install -g render-cli

# Or use npx
npx render-cli

# Login
render login

# List services
render services

# View logs
render logs <service-name>

# Manual deploy
render deploy <service-name>
```

---

## 📞 Additional Resources

**Render Documentation:**
- Main Docs: https://render.com/docs
- Python Guide: https://render.com/docs/deploy-flask
- Persistent Disks: https://render.com/docs/disks

**Community:**
- Render Community: https://community.render.com
- Status Page: https://status.render.com

**Your Docs:**
- Vercel Frontend: `VERCEL_DEPLOY.md`
- Railway Alternative: `RAILWAY_DEPLOY.md`
- Backend Options: `BACKEND_OPTIONS.md`

---

## 🚀 You're Live on Render!

Your backend is deployed with:
- ✅ 750 free hours/month
- ✅ Auto-deploy from GitHub
- ✅ HTTPS automatically
- ⚠️ Database resets (upgrade for persistence)
- ⚠️ Cold starts (upgrade to reduce)

**Your Render URL:**
```
https://your-app.onrender.com
```

**Next Steps:**
1. ✅ Copy your Render URL
2. ✅ Deploy frontend to Vercel (`VERCEL_QUICKSTART.md`)
3. ✅ Use Render URL as `VITE_API_URL`
4. ✅ Test complete application
5. 💰 Consider upgrading to $7/month for production

**Save your URL - you need it for Vercel!** 📝

---

## 💬 Quick Decision: Render or Railway?

### Choose Render If:
- ✅ You're okay with cold starts
- ✅ You'll upgrade to $7/month for persistence
- ✅ You want 750 hours (more than Railway)
- ✅ Your data can reset during testing

### Choose Railway If:
- ✅ You need persistent database for free
- ✅ You want no cold starts
- ✅ You prefer simpler setup
- ✅ $5 credit is enough for testing

**Both are great! Pick what works for your needs.** 🎉
