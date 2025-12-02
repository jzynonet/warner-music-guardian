# Deployment Guide - Warner Music Guardian

## Overview
- **Frontend**: Vercel (Free)
- **Backend**: Railway (Free $5/month credit) **RECOMMENDED** 
- **Database**: SQLite (on Railway persistent volume)

Alternative: Render.com (already configured, but limited free tier)

---

## Option 1: Railway (RECOMMENDED - Better Free Tier)

### Why Railway?
- ✅ $5 free credit per month (enough for small projects)
- ✅ Persistent volumes (SQLite data persists)
- ✅ No spin down / cold starts
- ✅ Simple deployment from GitHub
- ✅ Built-in PostgreSQL if you want to upgrade later

### Backend Deployment on Railway

1. **Push code to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy to Railway**:
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect Python and deploy

3. **Configure Environment Variables**:
   In Railway dashboard, go to your service → Variables → Add:
   ```
   YOUTUBE_API_KEY=your_youtube_api_key_here
   ADMIN_PASSWORD=your_secure_password
   FLASK_SECRET_KEY=random_long_string_here
   PORT=5000
   ```

4. **Add Persistent Volume** (for SQLite database):
   - In Railway dashboard → your service → Settings
   - Scroll to "Volumes" → "New Volume"
   - Mount Path: `/app/backend`
   - This keeps your database across deploys

5. **Get Backend URL**:
   - In Railway dashboard → Settings → Domains
   - Click "Generate Domain"
   - Copy URL (e.g., `https://your-app.up.railway.app`)

---

## Option 2: Render.com (Alternative - Already Configured)

### Why Render?
- ✅ Free 750 hours/month
- ❌ Spins down after 15 min inactivity (slow cold starts)
- ❌ No persistent disk on free tier (data lost on redeploy)
- ❌ Better for static/stateless apps

### Backend Deployment on Render

1. **Push code to GitHub** (same as above)

2. **Deploy to Render**:
   - Go to [render.com](https://render.com)
   - Sign up with GitHub
   - Click "New" → "Blueprint"
   - Connect your GitHub repo
   - Render will detect `render.yaml` and auto-configure

3. **Configure Environment Variables**:
   In Render dashboard → your service → Environment:
   ```
   YOUTUBE_API_KEY=your_youtube_api_key_here
   ADMIN_PASSWORD=your_secure_password
   FLASK_SECRET_KEY=random_long_string_here
   ```

4. **⚠️ Important**: Free tier has no persistent disk
   - Database resets on every deploy
   - Upgrade to paid ($7/month) for persistent disk
   - OR use external database (see PostgreSQL option below)

---

## Frontend Deployment on Vercel

1. **Update API URL in frontend**:
   Create `.env.production` in `frontend/` folder:
   ```
   VITE_API_URL=https://your-backend-url-here.up.railway.app
   ```

2. **Push to GitHub** (if not already done)

3. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure:
     - **Root Directory**: `frontend`
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Add Environment Variable:
     ```
     VITE_API_URL=https://your-backend-url-here.up.railway.app
     ```
   - Click "Deploy"

4. **Get Frontend URL**:
   - Vercel will provide URL like `https://your-app.vercel.app`

---

## Upgrade to PostgreSQL (Optional - For Production)

If you want better database for production:

### Option A: Railway PostgreSQL (Free with $5 credit)
1. In Railway dashboard → "New" → "Database" → "PostgreSQL"
2. Railway auto-provisions database
3. Update backend code to use PostgreSQL instead of SQLite
4. Install `psycopg2-binary` in requirements.txt

### Option B: Neon.tech (Free 0.5GB PostgreSQL)
1. Go to [neon.tech](https://neon.tech)
2. Create free account → New Project
3. Copy connection string
4. Add to Railway environment variables:
   ```
   DATABASE_URL=postgresql://user:pass@host/db
   ```

---

## Testing the Deployment

1. Visit your Vercel frontend URL
2. Login with ADMIN_PASSWORD you set
3. Try adding an artist and searching videos
4. Check Railway logs if any errors occur

---

## Cost Summary

### Free Tier (Testing):
- **Vercel**: Free forever (100GB bandwidth)
- **Railway**: $5 free credit/month (~500 hours runtime)
- **Total**: $0/month (within free limits)

### Paid Tier (Production):
- **Vercel**: Free (or $20/month Pro for team features)
- **Railway**: ~$5-10/month (depends on usage)
- **Total**: ~$5-10/month

---

## Troubleshooting

### "Cannot connect to backend"
- Check VITE_API_URL in Vercel environment variables
- Verify backend is running in Railway dashboard
- Check Railway logs for errors

### "Database locked" errors
- Common with SQLite on free hosting
- Solution: Upgrade to PostgreSQL (see above)

### "API Key Invalid"
- Check YOUTUBE_API_KEY in Railway environment variables
- Verify API key is enabled for YouTube Data API v3

### Railway "Out of Credit"
- Free $5 credit renews monthly
- Upgrade to paid plan ($5/month minimum)

---

## Next Steps

1. Follow Railway backend deployment
2. Deploy frontend to Vercel
3. Test the live app
4. Monitor Railway usage dashboard
5. Consider PostgreSQL for production

Need help? Check Railway docs: https://docs.railway.app
