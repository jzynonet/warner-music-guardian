# Deployment Checklist ✅

## Before Deployment

### 1. Get Required API Keys
- [ ] YouTube API Key ([Get here](https://console.cloud.google.com/apis/credentials))
  - Enable "YouTube Data API v3"
  - Create API Key
  - Copy and save securely
- [ ] (Optional) Spotify API Keys ([Get here](https://developer.spotify.com/dashboard))
  - Create app in Spotify Dashboard
  - Copy Client ID and Client Secret

### 2. Choose Your Deployment Platform

**Recommended: Railway** ✅
- Persistent storage (SQLite works)
- No cold starts
- $5 free credit/month
- Easy setup

**Alternative: Render**
- 750 free hours/month
- Cold starts (15 min inactivity)
- No persistent disk on free tier
- Already configured

### 3. Prepare Repository
- [ ] Code is committed to git
- [ ] Push to GitHub
- [ ] All sensitive data removed from code
- [ ] .env files are in .gitignore

---

## Railway Deployment Steps

### Backend (5 minutes)

1. **Create Railway Account**
   - [ ] Go to [railway.app](https://railway.app)
   - [ ] Sign up with GitHub
   
2. **Deploy Backend**
   - [ ] Click "New Project"
   - [ ] Select "Deploy from GitHub repo"
   - [ ] Choose your repository
   - [ ] Wait for auto-detection and deploy
   
3. **Configure Environment Variables**
   - [ ] Click on service → "Variables"
   - [ ] Add all required variables:
     ```
     YOUTUBE_API_KEY=your_youtube_api_key
     ADMIN_PASSWORD=your_secure_password
     FLASK_SECRET_KEY=generate_random_string_here
     PORT=5000
     ```
   - [ ] (Optional) Add Spotify variables if using artist import
   
4. **Setup Persistent Storage**
   - [ ] Go to service → "Settings" → "Volumes"
   - [ ] Click "New Volume"
   - [ ] Mount path: `/app/backend`
   - [ ] This keeps your SQLite database across deploys
   
5. **Generate Domain**
   - [ ] Settings → "Networking" → "Generate Domain"
   - [ ] Copy the URL (save for frontend setup)
   - [ ] Example: `https://your-app-production.up.railway.app`
   
6. **Verify Backend is Running**
   - [ ] Visit: `https://your-railway-url.up.railway.app/api/health`
   - [ ] Should see: `{"status": "ok", "api_configured": true/false}`

---

### Frontend (5 minutes)

1. **Update Backend URL**
   - [ ] Open `frontend/.env.production`
   - [ ] Replace with your Railway URL:
     ```
     VITE_API_URL=https://your-actual-railway-url.up.railway.app
     ```
   - [ ] Commit and push to GitHub
   
2. **Create Vercel Account**
   - [ ] Go to [vercel.com](https://vercel.com)
   - [ ] Sign up with GitHub
   
3. **Deploy Frontend**
   - [ ] Click "Add New" → "Project"
   - [ ] Import your GitHub repository
   - [ ] Vercel auto-detects Vite configuration
   
4. **Configure Project Settings**
   - [ ] Root Directory: `frontend`
   - [ ] Framework Preset: Vite
   - [ ] Build Command: `npm run build`
   - [ ] Output Directory: `dist`
   
5. **Add Environment Variable**
   - [ ] In project settings → Environment Variables
   - [ ] Add:
     ```
     VITE_API_URL=https://your-railway-url.up.railway.app
     ```
   - [ ] Click "Add"
   
6. **Deploy**
   - [ ] Click "Deploy"
   - [ ] Wait ~2 minutes for build
   - [ ] Copy your Vercel URL
   
7. **Test the App**
   - [ ] Visit your Vercel URL
   - [ ] Login with ADMIN_PASSWORD
   - [ ] Try adding an artist
   - [ ] Try searching videos
   - [ ] Check if data persists after refresh

---

## Post-Deployment

### 1. Update CORS (if needed)
If you get CORS errors:
- [ ] Check Railway logs for errors
- [ ] Ensure backend CORS allows your Vercel domain

### 2. Test All Features
- [ ] Login works
- [ ] Add artist works
- [ ] Search videos works
- [ ] Video details modal works
- [ ] Status/priority updates work
- [ ] Stats cards filter videos
- [ ] Bulk import works (if using CSV)
- [ ] Spotify import works (if configured)

### 3. Monitor Usage
- [ ] Check Railway usage dashboard
- [ ] Monitor $5 credit consumption
- [ ] Set up billing alerts if needed

### 4. Optional: Custom Domain
**Vercel:**
- [ ] Go to project settings → Domains
- [ ] Add your custom domain
- [ ] Update DNS records

**Railway:**
- [ ] Go to service → Settings → Domains
- [ ] Add custom domain
- [ ] Update DNS records

---

## Troubleshooting

### Backend Issues

❌ **"Application failed to start"**
- Check Railway logs for errors
- Verify all environment variables are set
- Check Python version compatibility

❌ **"API Key Invalid"**
- Verify YOUTUBE_API_KEY is correct
- Check YouTube API is enabled in Google Cloud Console
- Verify API key has no restrictions blocking Railway IP

❌ **"Database locked"**
- Railway: Check volume is mounted correctly
- Render: Upgrade to paid plan for persistent disk

### Frontend Issues

❌ **"Cannot connect to backend"**
- Check VITE_API_URL matches Railway domain exactly
- Include `https://` in URL
- No trailing slash in URL
- Redeploy frontend after changing env vars

❌ **"CORS Error"**
- Check Railway backend logs
- Verify CORS is configured in Flask app
- Check if Vercel domain is allowed

❌ **"404 on refresh"**
- Already handled by vercel.json rewrites
- If still occurs, check vercel.json is committed

### Database Issues

❌ **"Data disappears after deploy"**
- Railway: Verify volume is properly mounted
- Render: Upgrade to paid tier for persistent disk
- Alternative: Switch to PostgreSQL

---

## Success Criteria ✅

Your deployment is successful when:
- [ ] Frontend loads without errors
- [ ] You can login with password
- [ ] Backend API responds at `/api/health`
- [ ] You can add and view artists
- [ ] You can search and see videos
- [ ] Data persists after browser refresh
- [ ] All stats cards work
- [ ] Video modal opens and closes
- [ ] No console errors

---

## Next Steps

After successful deployment:
1. Share the app URL with your team
2. Add Spotify keys for full functionality
3. Configure auto-flag rules
4. Set up email notifications (optional)
5. Monitor Railway usage to stay within free tier
6. Consider upgrading for production use

---

## Cost Tracking

### Free Tier Limits
- **Railway**: $5 credit/month = ~500 hours runtime
- **Vercel**: 100GB bandwidth/month, unlimited deployments
- **Expected cost for testing**: $0/month

### When to Upgrade
- Traffic exceeds Vercel 100GB/month
- Railway credit runs out (heavy usage)
- Need PostgreSQL instead of SQLite
- Need faster support

### Paid Plans
- **Railway**: $5/month minimum (pay-as-you-go)
- **Vercel**: Free for personal projects, $20/month for teams
- **Total estimated**: ~$5-10/month for production

---

## Support Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **YouTube API Docs**: https://developers.google.com/youtube/v3
- **Spotify API Docs**: https://developer.spotify.com/documentation/web-api

---

## Deployment Complete! 🎉

If all checkboxes are marked, your app is live and ready for testing!

Your URLs:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-app.up.railway.app
- **API Health**: https://your-app.up.railway.app/api/health
