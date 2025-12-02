# Warner Music Guardian - Session Notes
## Date: December 2, 2025

---

## 🎉 Current Status: FULLY DEPLOYED & WORKING

### Deployment Architecture:
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: SQLite with persistent volume

---

## 🔧 Fixes Completed This Session

### 1. Fixed Docker Build Error (pip not found)
**Problem**: Railway build failed with "pip: command not found"

**Solution**: 
- Created custom `Dockerfile` using `python:3.10-slim` base image (has pip pre-installed)
- Changed Railway builder from NIXPACKS to DOCKERFILE

**Files Modified**:
- Created: `Dockerfile`
- Modified: `railway.json` - changed builder to "DOCKERFILE"

### 2. Fixed Container Runtime Error (cd command)
**Problem**: Container failed to start with "executable `cd` could not be found"

**Solution**:
- Removed `cd` commands from Dockerfile
- Used `WORKDIR` directive properly
- Used full paths for pip install

**Files Modified**:
- `Dockerfile` - removed `cd backend &&` commands
- `railway.json` - simplified startCommand to just `python app.py`

### 3. Added Persistent Database Volume
**Problem**: Database was resetting on every deployment

**Solution**:
- Added volume configuration to `railway.json`
- Volume mounted at `/app/backend` to persist SQLite database

**Files Modified**:
- `railway.json` - added volumes configuration

### 4. Fixed CORS for Vercel Frontend
**Problem**: Admin login not working - CORS blocking requests from Vercel

**Solution**:
- Updated backend CORS to dynamically allow frontend URL from environment variable
- Added `FRONTEND_URL` environment variable support

**Files Modified**:
- `backend/app.py` - dynamic CORS configuration

### 5. Fixed Admin Authentication
**Problem**: Admin password not working

**Solution**:
- Configured environment variables in Railway and Vercel

---

## 🔑 Environment Variables Configuration

### Railway Backend Environment Variables:
```
ADMIN_PASSWORD=YourSecurePassword123
FLASK_SECRET_KEY=your-random-secret-key
YOUTUBE_API_KEY=your_youtube_api_key
FRONTEND_URL=https://your-vercel-app.vercel.app
DATABASE_PATH=videos.db
```

### Vercel Frontend Environment Variables:
```
VITE_API_URL=https://your-railway-backend.up.railway.app
```

**Note**: Replace placeholders with your actual values!

---

## 📁 Key Files & Their Purpose

### Deployment Configuration:
- `Dockerfile` - Docker container configuration for Railway
- `railway.json` - Railway deployment settings (builder, volumes, start command)
- `nixpacks.toml` - Legacy config (not used anymore, kept for reference)
- `vercel.json` - Vercel deployment configuration for frontend

### Backend Files:
- `backend/app.py` - Main Flask application (currently used)
- `backend/requirements.txt` - Python dependencies
- `backend/.env.example` - Example environment variables

### Frontend Files:
- `frontend/src/App.jsx` - Main React app (uses VITE_API_URL)
- `frontend/.env.example` - Example environment variables

---

## 🚀 Deployment Process

### Backend (Railway):
1. Push code to GitHub
2. Railway auto-detects changes
3. Builds using `Dockerfile`
4. Starts with `python app.py` in `/app/backend`
5. Database persists in volume

### Frontend (Vercel):
1. Push code to GitHub
2. Vercel auto-builds
3. Uses `VITE_API_URL` to connect to Railway backend

---

## 🔄 How to Make Changes

### If you need to update backend code:
1. Modify files in `backend/` folder
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```
3. Railway auto-deploys (takes ~2-3 minutes)

### If you need to update frontend code:
1. Modify files in `frontend/src/` folder
2. Commit and push to GitHub
3. Vercel auto-deploys (takes ~1-2 minutes)

### If you need to change environment variables:
**Railway:**
- Go to Railway dashboard
- Select your backend service
- Click "Variables" tab
- Add/edit/delete variables
- Railway auto-redeploys

**Vercel:**
- Go to Vercel dashboard
- Select your project
- Settings → Environment Variables
- Add/edit/delete variables
- Manually redeploy from Deployments tab

---

## 📊 Database & Volume

### Current Setup:
- **Type**: SQLite
- **Location**: `/app/backend/videos.db` (inside container)
- **Persistence**: Railway Volume mounted at `/app/backend`
- **Size**: 1 GB (default)

### Important Notes:
- Volume requires Railway Hobby plan ($5/month minimum)
- Free plan does NOT support volumes (database resets on deploy)
- To check volume: Railway service → Settings → Volumes

### If Volume Not Working:
Consider migrating to PostgreSQL:
- Railway offers free PostgreSQL addon
- More reliable for production
- Survives deploys even on free plan

---

## 🐛 Troubleshooting

### Backend won't start:
1. Check Railway logs: Service → Deployments → View Logs
2. Verify environment variables are set
3. Check if `YOUTUBE_API_KEY` is valid

### Frontend can't connect to backend:
1. Check `VITE_API_URL` in Vercel environment variables
2. Verify Railway backend is running
3. Check CORS error in browser console
4. Verify `FRONTEND_URL` is set in Railway backend

### Admin login fails:
1. Check `ADMIN_PASSWORD` is set in Railway
2. Try default password: `admin123` (if not set)
3. Check browser console for errors
4. Verify CORS is working

### Database resets on deploy:
1. Check if Railway volume is configured (railway.json)
2. Verify you're on Hobby plan or higher
3. Check Railway service → Settings → Volumes
4. Consider migrating to PostgreSQL

---

## 📈 Next Steps / Future Improvements

### Recommended:
1. **Migrate to PostgreSQL** - More reliable than SQLite + volume
2. **Add automated backups** - Schedule database backups
3. **Set up monitoring** - Track uptime and errors
4. **Add rate limiting** - Prevent API abuse
5. **Enable HTTPS only** - Force secure connections
6. **Add logging service** - Better error tracking (Sentry, LogRocket)

### Optional Features:
1. Email notifications for new videos
2. Spotify API integration for artist tracking
3. Automated content monitoring
4. Multi-user support with roles
5. Analytics dashboard

---

## 🔗 Important URLs

### Dashboards:
- Railway: https://railway.app/dashboard
- Vercel: https://vercel.com/dashboard
- GitHub: https://github.com/yourusername/warner-music-guardian

### Documentation:
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Flask CORS: https://flask-cors.readthedocs.io

---

## 💡 Tips for Future Sessions

1. Always check environment variables first when something breaks
2. Railway logs are your friend - check them for errors
3. CORS errors show up in browser console (F12)
4. Test locally first before deploying to production
5. Keep this file updated with any new changes!

---

## 📝 Last Updated
**Date**: December 2, 2025  
**Status**: All systems operational ✅  
**Admin Login**: Working ✅  
**Database**: Persisting ✅  
**CORS**: Configured ✅
