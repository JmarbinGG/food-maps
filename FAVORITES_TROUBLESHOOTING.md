# 🔍 Favorites Feature Troubleshooting Guide

## ✅ Backend Status: WORKING

**Diagnostic Results:**
- ✅ Server running
- ✅ Database table `favorite_locations` exists (confirmed)
- ✅ API endpoint `/api/favorites` registered
- ✅ JavaScript files served correctly
  - `favoritesAPI.js` (4.6KB)
  - `FavoritesPanel.js` (32KB)
- ✅ Header component has "⭐ My Favorites" button

## 🎯 How to Access the Feature

### Step 1: Make Sure You're Logged In
The favorites feature **requires authentication**. You must be logged in to see it.

1. Open your browser
2. Go to your website
3. Click **"Login"** in the top-right
4. Enter your credentials

### Step 2: Clear Browser Cache (IMPORTANT!)
Since files were just updated, you need to force-refresh:

**Chrome/Edge:**
- Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Firefox:**
- Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Safari:**
- Mac: `Cmd + Option + R`

**Alternative:** Open in **Incognito/Private Mode** to bypass cache entirely

### Step 3: Access Your Favorites
1. After logging in and hard-refreshing, look at the **top-right corner**
2. Click your **username/profile**
3. You should see a dropdown menu
4. Look for **"⭐ My Favorites"** with a yellow background
5. Click it!

## 🌟 How to Use Favorites

### Adding Favorites:
- Click the **star (⭐) button** on any food listing card
- When starred, it turns yellow/gold
- You'll see a success message: "⭐ Added to favorites!"

### Viewing Favorites:
- Click your name → "⭐ My Favorites"
- See all your saved locations
- Search and filter by type (donors, distribution centers, etc.)

### Managing Favorites:
- **Edit**: Add notes and tags to each favorite
- **Mark Visit**: Track when you visited
- **Get Directions**: Open in maps
- **Notifications**: Enable alerts for new listings nearby
- **Remove**: Delete favorites you no longer need

## 🧪 Test Page

If you still can't see it, use the diagnostic page:

```
http://your-domain/test_favorites.html
```

This will:
- Check if all files load
- Test the API endpoint
- Show your login status
- Let you manually test the feature

## 🐛 Still Not Working?

### Check Browser Console:
1. Press `F12` to open Developer Tools
2. Click "Console" tab
3. Look for any red errors
4. Common issues:
   - "401 Unauthorized" = You're not logged in
   - "Failed to fetch" = Server connection issue
   - "FavoritesPanel is not defined" = Script loading issue

### Check If You're Really Logged In:
1. Press `F12` → Console tab
2. Type: `localStorage.getItem('auth_token')`
3. Press Enter
4. Should show a long token string
5. If it shows `null`, you're not logged in

### Force Script Reload:
1. Open Developer Tools (F12)
2. Go to "Network" tab
3. Check "Disable cache" checkbox
4. Reload page with `Ctrl+Shift+R`
5. Watch for `favoritesAPI.js` and `FavoritesPanel.js` to load

## 📊 Diagnostic Commands (For Developers)

Run this on the server to check everything:
```bash
/tmp/check_favorites.sh
```

Or check manually:
```bash
# Check server
systemctl status foodmaps

# Check table
python3 << 'EOF'
from dotenv import load_dotenv
import pymysql, os
load_dotenv('/home/ec2-user/project/.env')
# (connection code to verify table exists)
EOF

# Check API
curl -I http://localhost:8000/api/favorites
# Should return 401 or 403 (not 404!)
```

## 💡 Common Solutions

| Problem | Solution |
|---------|----------|
| "Feature not visible" | Hard refresh (Ctrl+Shift+R) or use Incognito |
| "401 Unauthorized" | Log in first |
| "Star doesn't work" | Make sure you're logged in |
| "Dropdown doesn't show option" | Clear cache and reload |
| "JavaScript error" | Check browser console (F12) |

## ✨ Feature is Working If:

- ✅ You see "⭐ My Favorites" in profile dropdown (yellow background)
- ✅ Star buttons appear on listing cards
- ✅ Clicking star shows success message
- ✅ Opening favorites panel shows your saved locations
- ✅ You can add notes, track visits, and get directions

---

**Last Updated:** January 21, 2026  
**Status:** Fully Implemented & Deployed
