# Quick Deploy Guide - 5 Minutes

## Prerequisites
- GitHub account
- Railway account (sign up at [railway.app](https://railway.app))
- Vercel account (sign up at [vercel.com](https://vercel.com))
- YouTube API Key ([Get it here](https://console.cloud.google.com/apis/credentials))

---

## Step 1: Push to GitHub (2 minutes)

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Ready for deployment"

# Create new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend to Railway (2 minutes)

1. Go to [railway.app](https://railway.app) → Login with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway auto-detects and deploys
5. Click on your service → **"Variables"** → Add these:
   ```
   YOUTUBE_API_KEY=YOUR_YOUTUBE_API_KEY
   ADMIN_PASSWORD=ChooseSecurePassword123
   FLASK_SECRET_KEY=RandomString123456789
   ```
6. Click **"Settings"** → **"Networking"** → **"Generate Domain"**
7. **Copy the domain URL** (e.g., `https://xxx.up.railway.app`)

---

## Step 3: Deploy Frontend to Vercel (1 minute)

1. Go to [vercel.com](https://vercel.com) → Login with GitHub
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add **Environment Variable**:
   ```
   VITE_API_URL=https://YOUR_RAILWAY_URL_HERE.up.railway.app
   ```
   (Use the Railway URL from Step 2)
6. Click **"Deploy"**
7. Wait ~2 minutes for build to complete

---

## Step 4: Test Your App

1. Open your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Login with the `ADMIN_PASSWORD` you set
3. Add an artist
4. Search for videos
5. Done! 🎉

---

## Troubleshooting

### "Cannot connect to backend"
→ Check `VITE_API_URL` in Vercel environment variables matches Railway URL

### "Invalid API key"
→ Check `YOUTUBE_API_KEY` in Railway environment variables

### Frontend not updating after changes
→ Push to GitHub, Vercel auto-redeploys

### Backend not updating after changes
→ Push to GitHub, Railway auto-redeploys

---

## What's Free?

- **Vercel**: 100GB bandwidth/month (plenty for testing)
- **Railway**: $5 free credit/month (~500 hours)
- **Total**: $0/month for testing

---

## Update Backend URL Later

If you need to change the backend URL:

1. Go to Vercel dashboard → Your project
2. Settings → Environment Variables
3. Edit `VITE_API_URL`
4. Redeploy from Deployments tab

---

## Next Steps

- Add Spotify API keys for artist import
- Enable auto-flagging rules
- Set up email notifications
- Monitor usage in Railway dashboard

Need detailed docs? See `DEPLOYMENT_GUIDE.md`
