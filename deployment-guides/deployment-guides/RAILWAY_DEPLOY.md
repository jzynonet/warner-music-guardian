# Railway Backend Deployment - Complete Guide

## Why Railway?
- ✅ $5 free credit/month (~500 hours)
- ✅ No cold starts (instant response)
- ✅ Persistent storage for SQLite
- ✅ Auto-deploy from GitHub
- ✅ No credit card required for free tier
- ✅ Perfect for your Warner Music Guardian app

---

## Prerequisites Checklist

Before starting, make sure you have:
- [ ] GitHub account
- [ ] Your code pushed to GitHub repository
- [ ] YouTube API Key ([Get here](https://console.cloud.google.com/apis/credentials))
- [ ] Chosen a secure admin password
- [ ] 10 minutes of time

---

## Step 1: Push Code to GitHub (If Not Done)

```bash
# Navigate to your project
cd C:\Users\hifor\Documents\ucg

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Railway deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

✅ **Verify:** Visit your GitHub repo and confirm all files are there.

---

## Step 2: Create Railway Account (1 minute)

1. **Go to Railway**
   - Visit: [railway.app](https://railway.app)
   - Click **"Start a New Project"** or **"Login"**

2. **Sign Up with GitHub**
   - Click **"Login with GitHub"**
   - Authorize Railway to access your GitHub
   - No credit card needed!

3. **Confirm Account**
   - Check your email for verification
   - Click the verification link

✅ **You're now in Railway Dashboard!**

---

## Step 3: Deploy Backend (2 minutes)

### 3.1 Create New Project

1. In Railway dashboard, click **"New Project"**

2. Select **"Deploy from GitHub repo"**

3. **Authorize Railway** (if first time)
   - Railway needs permission to read your repos
   - Click "Configure GitHub App"
   - Select your repository or grant access to all repos

4. **Select Your Repository**
   - Find "warner-music-guardian" (or your repo name)
   - Click on it

5. **Railway Auto-Detects Python**
   - Railway will detect it's a Python app
   - It will automatically use the `railway.json` and `nixpacks.toml` configs
   - Click **"Deploy Now"** or just wait (auto-starts)

6. **Watch the Build**
   - You'll see build logs in real-time
   - Takes about 2-3 minutes first time
   - Look for: "Build successful" and "Deployment successful"

✅ **Your backend is deploying!**

---

## Step 4: Configure Environment Variables (2 minutes)

Your backend needs API keys and secrets to work.

### 4.1 Navigate to Variables

1. In Railway dashboard, click on your **service** (the Python app)
2. Click **"Variables"** tab
3. Click **"+ New Variable"** or "Raw Editor"

### 4.2 Add Required Variables

Add these one by one (or use Raw Editor to paste all):

```bash
YOUTUBE_API_KEY=your_actual_youtube_api_key_here
ADMIN_PASSWORD=ChooseASecurePassword123!
FLASK_SECRET_KEY=random_long_string_here_12345678
PORT=5000
```

**How to fill these:**

1. **YOUTUBE_API_KEY**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create/select project
   - Enable "YouTube Data API v3"
   - Create API Key
   - Copy and paste here

2. **ADMIN_PASSWORD**
   - Choose a secure password
   - This is what you'll use to login to the app
   - Example: `MusicGuardian2024!`

3. **FLASK_SECRET_KEY**
   - Generate random string: `python -c "import secrets; print(secrets.token_hex(32))"`
   - Or just type: `supersecretrandomstring123456789`

4. **PORT**
   - Always: `5000`

### 4.3 Optional Variables (Add if using features)

```bash
# For Spotify Artist Import
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# For Email Notifications
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=your_email@gmail.com
```

### 4.4 Save Variables

- Click **"Add"** or **"Save"**
- Railway will **automatically redeploy** with new variables
- Wait 1-2 minutes for redeploy to complete

✅ **Environment variables configured!**

---

## Step 5: Setup Persistent Storage (3 minutes)

This is **critical** - it keeps your SQLite database between deployments.

### 5.1 Add a Volume

1. In your service, click **"Settings"** (or "Configure")

2. Scroll down to **"Volumes"** section

3. Click **"+ New Volume"**

4. Configure:
   - **Mount Path**: `/app/backend`
   - **Size**: 1 GB (plenty for SQLite)
   
5. Click **"Add"**

6. Railway will redeploy automatically

### 5.2 Verify Volume

- Check that volume shows "Mounted" status
- Should see: `/app/backend → 1 GB`

✅ **Database will now persist across deploys!**

---

## Step 6: Generate Public URL (1 minute)

Your backend needs a URL so the frontend can connect.

### 6.1 Generate Domain

1. In your service, click **"Settings"**

2. Scroll to **"Networking"** or **"Domains"**

3. Click **"Generate Domain"**

4. Railway creates URL like:
   - `https://your-app-production.up.railway.app`
   - Or: `https://warner-music-guardian-production-xxxx.up.railway.app`

5. **Copy this URL** - you'll need it for Vercel!

### 6.2 Test the URL

1. Click on the generated domain or visit it in browser

2. Add `/api/health` to the end:
   ```
   https://your-app-production.up.railway.app/api/health
   ```

3. You should see:
   ```json
   {
     "status": "ok",
     "api_configured": true,
     "database": "connected"
   }
   ```

✅ **Backend is live and healthy!**

---

## Step 7: Verify Deployment (2 minutes)

### 7.1 Check Build Logs

1. Go to your service → **"Deployments"** tab
2. Click latest deployment
3. View logs - should see:
   ```
   * Running on all addresses (0.0.0.0)
   * Running on http://127.0.0.1:5000
   * Running on http://[::]:5000
   ```

### 7.2 Test API Endpoints

Open these URLs in browser (replace with your domain):

**Health Check:**
```
https://your-app.up.railway.app/api/health
```
Should return: `{"status": "ok"}`

**Stats Endpoint:**
```
https://your-app.up.railway.app/api/stats
```
Should return: `{"total_videos": 0, "pending": 0, ...}`

✅ **All endpoints working!**

---

## Step 8: Monitor Usage (Important!)

### 8.1 Check Your Credit

1. Click your **profile icon** (top right)
2. Go to **"Usage"** or **"Billing"**
3. See your $5 credit balance
4. See estimated usage per day

### 8.2 Usage Estimates

Your app (assuming low-medium traffic):
- **Compute**: ~$0.20/day = $6/month (over free tier)
- **Network**: ~$0.01/day (well within free)
- **Total**: Expect to use ~$6-7/month if running 24/7

**To stay within free tier:**
- Monitor daily usage
- Consider pausing when not testing
- Or upgrade to paid ($5/month minimum)

### 8.3 Set Up Alerts

1. In Railway dashboard → **"Settings"**
2. Enable **"Usage Alerts"**
3. Get notified when approaching limit

✅ **Monitoring setup complete!**

---

## 🎉 Step 9: You're Live!

### Your Backend URLs

**Base URL:**
```
https://your-app-production.up.railway.app
```

**Important Endpoints:**
```
Health:    /api/health
Login:     /api/auth/login
Stats:     /api/stats
Videos:    /api/videos
Artists:   /api/artists
```

### Next Steps

1. ✅ **Copy your Railway URL**
   - You'll need this for Vercel frontend deployment
   
2. ✅ **Test with Postman/Insomnia** (optional)
   - Test POST to `/api/auth/login` with your password
   
3. ✅ **Deploy Frontend to Vercel**
   - Use `VERCEL_QUICKSTART.md`
   - Add your Railway URL as `VITE_API_URL`

---

## 🔧 Troubleshooting

### ❌ Build Failed

**Error: "Module not found"**
```bash
# Solution: Check requirements.txt
# Make sure it's in backend/ folder
# Common fix: Add missing package
```

**Error: "Python version"**
```bash
# Solution: Check runtime.txt in backend/
# Should say: python-3.11.0 or similar
```

### ❌ App Crashes on Start

**Check Logs:**
1. Service → Deployments → Latest
2. Look for error messages
3. Common issues:
   - Missing environment variables
   - Wrong PORT (should be 5000)
   - Database connection error

**Fix:**
```bash
# Verify all environment variables are set
# Check PORT=5000
# Redeploy: Settings → Redeploy
```

### ❌ "Application Error" When Visiting URL

**Cause:** App not starting properly

**Solution:**
1. Check deployment logs for errors
2. Verify environment variables
3. Check that `app.run(host='0.0.0.0', port=port)` in app.py
4. Redeploy

### ❌ Database Resets After Deploy

**Cause:** Volume not mounted correctly

**Solution:**
1. Go to Settings → Volumes
2. Verify mount path is `/app/backend`
3. Volume should show as "Mounted"
4. If not, delete and recreate volume
5. Redeploy

### ❌ 404 on All Routes

**Cause:** Wrong base path

**Solution:**
1. Make sure you're including `/api/` in URLs
2. Check that app.py has routes defined
3. Example: `https://your-app.up.railway.app/api/health`

### ❌ CORS Errors from Frontend

**Cause:** Backend not allowing frontend origin

**Solution:**
1. Check app.py has CORS enabled:
   ```python
   from flask_cors import CORS
   CORS(app, resources={r"/api/*": {"origins": "*"}})
   ```
2. Redeploy
3. Or add specific Vercel domain to origins

### ❌ YouTube API Not Working

**Verify:**
1. YOUTUBE_API_KEY is set in Railway variables
2. API key is valid (test in Google Console)
3. YouTube Data API v3 is enabled
4. No usage limits reached

**Test:**
```bash
# Visit: https://your-app.up.railway.app/api/health
# Check: "api_configured": true
```

---

## 🔄 Updating Your Backend

### Method 1: Git Push (Recommended)

```bash
# Make changes locally
# Test locally: python backend/app.py

# Commit and push
git add .
git commit -m "Update backend"
git push

# Railway auto-deploys in 2-3 minutes!
```

### Method 2: Manual Redeploy

1. Railway dashboard → Your service
2. Settings → **"Redeploy"**
3. Confirm

### Method 3: Rollback

1. Deployments tab
2. Find previous successful deployment
3. Click "..." → **"Redeploy"**

---

## ⚙️ Advanced Configuration

### Custom Domain

1. **Buy domain** (Namecheap, Google Domains, etc.)

2. **In Railway:**
   - Settings → Domains
   - Click "Custom Domain"
   - Enter: `api.yourdomain.com`

3. **In DNS Provider:**
   - Add CNAME record:
     - Name: `api`
     - Value: (provided by Railway)
   - Save

4. **Wait for DNS** (5 min - 48 hours)

### Environment-Based Variables

```bash
# Railway supports multiple environments
# Create: Development, Staging, Production

# Each can have different variables
# Deploy different branches to each
```

### Database Backup

```bash
# Download database periodically

# Method 1: Railway CLI
railway run cat /app/backend/videos.db > backup.db

# Method 2: Add backup endpoint in app.py
# Then download via browser
```

### Monitoring & Logs

```bash
# View live logs
railway logs

# Or in dashboard: Deployments → View Logs

# Set up log retention (paid feature)
```

---

## 💰 Cost Management

### Staying Within Free Tier

**Your app usage:**
- Small SQLite database: < 1 GB
- Low-medium traffic: < 1000 requests/day
- Always-on: ~$6/month (slightly over free)

**Options:**
1. **Monitor closely** - pause when not using
2. **Upgrade to paid** - $5/month minimum (worth it!)
3. **Optimize** - reduce compute if possible

### When to Upgrade

✅ **Upgrade ($5/month) if:**
- You use it daily for work
- Need guaranteed uptime
- Want better support
- Free credit runs out mid-month

### Upgrade Process

1. Settings → Billing
2. Add payment method
3. Choose plan (pay-as-you-go)
4. Minimum $5/month for your usage

---

## 📊 Success Checklist

Your Railway deployment is successful when:

- [ ] Build completes without errors
- [ ] Deployment shows "Active" status
- [ ] `/api/health` returns `{"status": "ok"}`
- [ ] Environment variables are all set
- [ ] Volume is mounted at `/app/backend`
- [ ] Generated domain works
- [ ] Can access from browser
- [ ] Database persists after redeploy
- [ ] Auto-deploy works (git push → deploy)

---

## 🎓 Railway CLI (Optional)

Install Railway CLI for advanced features:

```bash
# Install
npm i -g @railway/cli

# Or on Windows:
# Download from: https://docs.railway.app/develop/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs

# Run commands on Railway
railway run python manage.py migrate

# Open in browser
railway open
```

---

## 📚 Additional Resources

**Railway Documentation:**
- Main Docs: https://docs.railway.app
- Python Guide: https://docs.railway.app/guides/python
- Volumes: https://docs.railway.app/reference/volumes

**Community:**
- Railway Discord: https://discord.gg/railway
- GitHub Issues: https://github.com/railwayapp/railway

**Your Docs:**
- Vercel Frontend: `VERCEL_DEPLOY.md`
- Quick Deploy: `QUICK_DEPLOY.md`
- Backend Options: `BACKEND_OPTIONS.md`

---

## 🚀 You're All Set!

Your backend is now live on Railway with:
- ✅ Auto-deploy from GitHub
- ✅ Persistent database storage
- ✅ Public HTTPS URL
- ✅ Environment variables configured
- ✅ $5 free credit/month

**Your Railway URL:**
```
https://your-app-production.up.railway.app
```

**Next:** Deploy frontend to Vercel using `VERCEL_QUICKSTART.md`

**Save this URL - you'll need it for frontend deployment!** 📝

---

## 💬 Need Help?

**If stuck:**
1. Check Railway logs (most issues show there)
2. Review this guide's troubleshooting section
3. Check Railway Discord community
4. Verify all environment variables

**Common issues are usually:**
- Missing environment variable
- Wrong volume mount path
- Database file permissions
- CORS configuration

**You got this! 🎉**
