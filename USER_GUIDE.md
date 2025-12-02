# Warner Music Guardian - User Guide
## Complete Platform Usage Instructions

---

## 📖 Table of Contents
1. [Getting Started](#getting-started)
2. [Admin Login](#admin-login)
3. [Managing Artists](#managing-artists)
4. [Managing Videos](#managing-videos)
5. [YouTube Channel Monitoring](#youtube-channel-monitoring)
6. [Search & Filter](#search--filter)
7. [Bulk Operations](#bulk-operations)
8. [Settings & Configuration](#settings--configuration)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

### Accessing the Platform
1. Open your web browser
2. Go to your Vercel frontend URL: `https://your-app.vercel.app`
3. You'll see the login screen

### System Requirements
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)
- **Internet**: Stable connection required
- **Screen**: Works on desktop, tablet, and mobile

---

## 🔐 Admin Login

### First Time Login
1. Navigate to the platform URL
2. You'll see the login screen with a password field
3. Enter your admin password (set in Railway environment variables)
4. Click "Login" or press Enter

### Default Password
- If admin didn't set a custom password, the default is: `admin123`
- **⚠️ Change this immediately for security!**

### Forgot Password?
If you forgot your admin password:
1. Contact your system administrator
2. Or access Railway dashboard → Backend service → Variables
3. Check or reset the `ADMIN_PASSWORD` environment variable

### Login Issues?
- **Error: "Invalid password"**: Check you're using the correct password
- **Error: "Cannot connect"**: Backend might be down, check Railway
- **CORS Error**: Check browser console, contact admin
- **Page won't load**: Check your internet connection

---

## 🎤 Managing Artists

### Adding a New Artist

#### Method 1: Manual Entry
1. Click **"Artists"** in the navigation menu
2. Click **"+ Add Artist"** button
3. Fill in the form:
   - **Artist Name** (required): Full name of the artist
   - **YouTube Channel ID** (optional): For monitoring their channel
   - **Spotify ID** (optional): For fetching their songs
4. Click **"Save"** or **"Add Artist"**

#### Method 2: Quick Add from Videos Page
1. Go to **"Videos"** page
2. When adding a video, you can create a new artist on-the-fly
3. Type the artist name and select "Create new artist"

### Viewing Artists
1. Click **"Artists"** in navigation
2. You'll see a list/grid of all artists:
   - Artist name
   - Number of tracked videos
   - YouTube channel status
   - Last updated date

### Editing an Artist
1. Go to **"Artists"** page
2. Find the artist you want to edit
3. Click the **Edit** (✏️) icon or artist card
4. Update the information
5. Click **"Save Changes"**

### Deleting an Artist
1. Go to **"Artists"** page
2. Find the artist you want to delete
3. Click the **Delete** (🗑️) icon
4. **Confirm deletion** in the popup
5. **⚠️ Warning**: This will also delete all associated videos!

### Fetching Songs from Spotify
If you have Spotify API configured:
1. Edit the artist
2. Make sure **Spotify ID** is filled
3. Click **"Fetch Songs from Spotify"**
4. System will automatically import their songs
5. New videos will be created for each song

---

## 🎥 Managing Videos

### Adding a New Video

#### Method 1: Manual Entry
1. Click **"Videos"** in navigation
2. Click **"+ Add Video"** button
3. Fill in the video details:
   - **Artist**: Select from dropdown or create new
   - **Song Title** (required): Name of the song
   - **YouTube URL** (optional): Link to official video
   - **Duration**: Song length (auto-fetched if URL provided)
   - **Notes**: Any additional information
4. Click **"Save"** or **"Add Video"**

#### Method 2: Import from YouTube
1. Go to **"Videos"** page
2. Click **"Import from YouTube"**
3. Paste YouTube video URL or video ID
4. System auto-fetches:
   - Video title
   - Duration
   - Thumbnail
   - Channel info
5. Select the artist from dropdown
6. Click **"Import"**

#### Method 3: Bulk Import
See [Bulk Operations](#bulk-operations) section below

### Viewing Videos

#### List View
- Click **"Videos"** in navigation
- See all videos in a sortable table:
  - Thumbnail
  - Song title
  - Artist name
  - Duration
  - Status
  - Last checked date
  - Actions

#### Grid View
- Click the **Grid** icon (if available)
- See videos as cards with thumbnails
- Better for visual browsing

### Filtering Videos
Located at the top of the Videos page:

**By Artist**:
1. Click "Filter by Artist" dropdown
2. Select an artist
3. Only their videos will show

**By Status**:
- **All**: Show all videos
- **Active**: Videos currently being monitored
- **Inactive**: Videos paused from monitoring
- **Error**: Videos with issues

**By Duration**:
- Use slider to filter by video length
- Example: Only show videos 3-5 minutes long

**Search**:
- Type in the search box
- Searches: song title, artist name, notes

### Editing a Video
1. Find the video in the list
2. Click **Edit** (✏️) icon
3. Update any fields
4. Click **"Save Changes"**

### Deleting a Video
1. Find the video in the list
2. Click **Delete** (🗑️) icon
3. **Confirm deletion** in popup
4. **Note**: This only removes from your tracking, doesn't delete from YouTube

### Marking False Positives
When system detects a video that shouldn't be flagged:
1. Find the video
2. Click **"Mark as False Positive"** button
3. System learns and won't flag similar videos again
4. This improves detection accuracy over time

---

## 📡 YouTube Channel Monitoring

### How It Works
The system automatically:
1. Checks monitored channels every few hours
2. Looks for new video uploads
3. Detects if videos contain your tracked songs
4. Flags unauthorized uses
5. Adds them to your dashboard

### Setting Up Channel Monitoring

#### For an Artist's Official Channel:
1. Go to **"Artists"** page
2. Edit the artist
3. Add their **YouTube Channel ID**
   - Get it from their YouTube channel URL
   - Example: `youtube.com/channel/UCxxxxxxxxxxxxxx`
   - Or use: `youtube.com/@channelname` (system converts it)
4. Save

#### For Monitoring Third-Party Channels:
1. Go to **"Monitoring"** or **"Channels"** section
2. Click **"+ Add Channel"**
3. Paste the channel URL or ID
4. Select which artists to monitor for
5. Click **"Start Monitoring"**

### Checking Monitoring Status
1. Go to **"Dashboard"** or **"Monitoring"**
2. See:
   - Active monitors
   - Last check time
   - New detections
   - Error logs

### Manual Channel Scan
If you want to scan immediately:
1. Go to **"Monitoring"**
2. Find the channel
3. Click **"Scan Now"** button
4. Wait for results (may take 1-2 minutes)

### Viewing Detections
1. Go to **"Detections"** or **"Alerts"**
2. See list of potential matches:
   - Video thumbnail & title
   - Channel name
   - Confidence score
   - Timestamp when detected
3. Review and take action

---

## 🔍 Search & Filter

### Global Search
Located in the top navigation:
1. Click the search icon or box
2. Type your query
3. Searches across:
   - Artist names
   - Song titles
   - Channel names
   - Video descriptions

### Advanced Filters

#### By Date Range:
1. Click **"Date Filter"**
2. Select start date
3. Select end date
4. Click **"Apply"**

#### By Multiple Criteria:
1. Click **"Advanced Filters"**
2. Combine multiple filters:
   - Artist + Status + Duration
   - Date range + Channel + Keywords
3. Click **"Apply Filters"**

#### Saving Filter Presets:
1. Set up your desired filters
2. Click **"Save Filter"**
3. Name your preset (e.g., "Active Artist A videos")
4. Access later from **"Saved Filters"** dropdown

---

## 📦 Bulk Operations

### Bulk Import Videos

#### From Excel/CSV:
1. Go to **"Videos"** page
2. Click **"Bulk Import"**
3. Download the template file
4. Fill in the template:
   - Column A: Artist Name
   - Column B: Song Title
   - Column C: YouTube URL (optional)
   - Column D: Duration (optional)
   - Column E: Notes (optional)
5. Upload the filled template
6. Review the preview
7. Click **"Import All"**

#### From YouTube Playlist:
1. Go to **"Videos"** page
2. Click **"Import from Playlist"**
3. Paste the YouTube playlist URL
4. Select the artist these songs belong to
5. Click **"Import"**
6. System fetches all videos from playlist
7. Review and confirm

### Bulk Edit
1. Select multiple videos (checkboxes)
2. Click **"Bulk Actions"** dropdown
3. Choose action:
   - Change status (Active/Inactive)
   - Assign to different artist
   - Add tags
   - Update notes
4. Apply changes

### Bulk Delete
1. Select multiple videos (checkboxes)
2. Click **"Bulk Actions"** → **"Delete Selected"**
3. **⚠️ Confirm** you want to delete all selected
4. Cannot be undone!

### Bulk Export
Export your data:
1. Select videos to export (or "Select All")
2. Click **"Export"** button
3. Choose format:
   - CSV (for Excel)
   - JSON (for developers)
   - PDF (for reports)
4. Download file

---

## ⚙️ Settings & Configuration

### Accessing Settings
1. Click your profile icon or **"Settings"** in navigation
2. Or click the gear icon (⚙️)

### General Settings

#### Change Admin Password:
1. Go to **Settings** → **Security**
2. Click **"Change Password"**
3. Enter current password
4. Enter new password (twice)
5. Click **"Update"**

#### Notification Preferences:
1. Go to **Settings** → **Notifications**
2. Toggle on/off:
   - Email alerts for new detections
   - Daily summary reports
   - System status updates
3. Enter email address if not set
4. Click **"Save"**

#### Monitoring Frequency:
1. Go to **Settings** → **Monitoring**
2. Adjust scan frequency:
   - Every hour
   - Every 3 hours (recommended)
   - Every 6 hours
   - Every 12 hours
   - Daily
3. **Note**: More frequent = higher API usage

### API Configuration

#### YouTube API Key:
1. Go to **Settings** → **API Keys**
2. Click **"YouTube API"**
3. Paste your YouTube Data API v3 key
4. Click **"Validate"** to test
5. Click **"Save"**

**Where to get YouTube API key:**
- Go to: https://console.cloud.google.com
- Create a project
- Enable YouTube Data API v3
- Create credentials → API key

#### Spotify API (Optional):
1. Go to **Settings** → **API Keys**
2. Click **"Spotify API"**
3. Enter:
   - Client ID
   - Client Secret
4. Click **"Validate"**
5. Click **"Save"**

**Where to get Spotify credentials:**
- Go to: https://developer.spotify.com/dashboard
- Create an app
- Get Client ID & Secret

### Display Preferences

#### Theme:
- **Light Mode**: Default bright theme
- **Dark Mode**: Easy on the eyes
- **Auto**: Matches your system preference

#### Language:
- Currently: English only
- More languages coming soon

#### Table Density:
- **Compact**: More rows visible
- **Normal**: Balanced (default)
- **Comfortable**: Spacious layout

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### "Cannot connect to server"
**Cause**: Backend is down or unreachable
**Fix**:
1. Check your internet connection
2. Try refreshing the page (F5)
3. Check if Railway backend is running
4. Contact administrator

#### "API Key Invalid"
**Cause**: YouTube API key expired or wrong
**Fix**:
1. Go to Settings → API Keys
2. Verify YouTube API key is correct
3. Check quota in Google Cloud Console
4. Generate new key if needed

#### "Failed to fetch videos"
**Cause**: API quota exceeded or network error
**Fix**:
1. Check YouTube API quota usage
2. Wait for quota to reset (daily at midnight PT)
3. Consider upgrading Google Cloud quota
4. Reduce monitoring frequency

#### Videos not showing thumbnails
**Cause**: CORS or network issues
**Fix**:
1. Refresh the page
2. Check browser console for errors (F12)
3. Try different browser
4. Contact administrator

#### "CORS Error" in console
**Cause**: Backend not allowing frontend requests
**Fix**:
1. Check `FRONTEND_URL` is set correctly in Railway
2. Verify `VITE_API_URL` is correct in Vercel
3. Contact administrator for backend update

#### Search not working
**Cause**: Database sync issue
**Fix**:
1. Wait a few seconds and try again
2. Refresh the page
3. Try with different search terms
4. Contact administrator if persists

#### Bulk import fails
**Cause**: File format issue or large file
**Fix**:
1. Use the provided template
2. Check file is .xlsx or .csv format
3. Reduce number of rows (under 500)
4. Check for special characters in data
5. Try smaller batches

#### Detection confidence too low/high
**Cause**: ML model needs tuning
**Fix**:
1. Mark false positives correctly
2. System learns over time
3. Contact administrator to adjust thresholds

---

## 📊 Understanding the Dashboard

### Main Dashboard Widgets

#### Statistics Overview:
- **Total Artists**: Number of artists being tracked
- **Total Videos**: Number of songs in database
- **Active Monitors**: Channels being monitored
- **New Detections**: Unreviewed matches this week

#### Recent Activity:
- Latest video additions
- Recent detections
- System status updates
- API usage stats

#### Quick Actions:
- Add new artist
- Add new video
- Run manual scan
- View all detections

#### Charts & Analytics:
- Detections over time (line chart)
- Videos per artist (bar chart)
- Status breakdown (pie chart)
- API usage (gauge)

---

## 🎯 Best Practices

### For Accurate Monitoring:
1. ✅ Keep artist information up-to-date
2. ✅ Add official YouTube URLs when available
3. ✅ Mark false positives promptly
4. ✅ Review detections weekly
5. ✅ Use descriptive notes for videos

### For Performance:
1. ⚡ Don't monitor too many channels (under 100)
2. ⚡ Use 3-hour scan frequency (balance)
3. ⚡ Archive old/inactive videos
4. ⚡ Export data periodically for backups
5. ⚡ Monitor API quota usage

### For Security:
1. 🔒 Use strong admin password
2. 🔒 Change password regularly
3. 🔒 Don't share login credentials
4. 🔒 Log out when done
5. 🔒 Keep API keys private

---

## 💡 Tips & Tricks

### Keyboard Shortcuts:
- `Ctrl/Cmd + K`: Quick search
- `Ctrl/Cmd + N`: Add new video (on videos page)
- `Ctrl/Cmd + F`: Find in page
- `Esc`: Close modals/popups
- `Enter`: Submit forms

### Power User Features:
1. **Use tags**: Tag videos by category (e.g., "single", "album", "remix")
2. **Create playlists**: Group videos for different purposes
3. **Set priorities**: Mark important artists/videos
4. **Export reports**: Generate weekly detection reports
5. **Schedule scans**: Set specific times for monitoring

### Mobile Usage:
- Fully responsive design
- Swipe to delete on mobile
- Pull to refresh lists
- Tap and hold for quick actions
- Hamburger menu for navigation

---

## 📞 Getting Help

### Need Support?
1. Check this guide first
2. Look in the **Troubleshooting** section above
3. Check system status page (if available)
4. Contact your system administrator

### Reporting Bugs:
When reporting issues, include:
- What you were trying to do
- What went wrong
- Browser and OS version
- Screenshots if possible
- Any error messages

### Feature Requests:
Have an idea for improvement?
- Document your suggestion
- Explain the use case
- Share with the development team

---

## 📚 Additional Resources

### Documentation:
- Technical Documentation: See `SESSION_NOTES.md`
- Deployment Guide: See `DEPLOYMENT_README.md`
- API Documentation: (if available)

### External Links:
- YouTube Data API: https://developers.google.com/youtube/v3
- Spotify API: https://developer.spotify.com/documentation/web-api
- Flask Documentation: https://flask.palletsprojects.com

---

## ✨ Quick Reference Card

### Most Common Tasks:

| Task | Steps |
|------|-------|
| **Add Artist** | Artists → + Add Artist → Fill form → Save |
| **Add Video** | Videos → + Add Video → Fill form → Save |
| **Search** | Type in search box at top |
| **Filter by Artist** | Videos → Filter dropdown → Select artist |
| **Manual Scan** | Monitoring → Select channel → Scan Now |
| **Mark False Positive** | Find video → Mark as False Positive button |
| **Export Data** | Select videos → Export → Choose format |
| **Change Password** | Settings → Security → Change Password |
| **Check API Quota** | Settings → API Keys → View Usage |
| **Bulk Import** | Videos → Bulk Import → Upload file |

---

**Last Updated**: December 2, 2025  
**Version**: 1.0  
**For questions or support**: Contact your system administrator

**Happy Monitoring! 🎵🛡️**
