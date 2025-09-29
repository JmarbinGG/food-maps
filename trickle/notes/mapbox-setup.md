# Mapbox Setup Instructions

## Current Status
✅ **Configured**: Mapbox public access token is now properly configured and the map features should work correctly.

## Getting a Mapbox Access Token

1. Visit [mapbox.com](https://www.mapbox.com/) and create a **free account**
2. Go to your Account page and navigate to "Access tokens"
3. Copy your **Default public token** (starts with `pk.`) or use your secret token (starts with `sk.`)
4. For production, create a new token with these scopes:
   - `styles:read`
   - `fonts:read` 
   - `datasets:read`
   - `vision:read`

## Configuration Steps

1. Open `utils/mapbox.js` in your code editor
2. Find this line:
   ```javascript
   window.MAPBOX_ACCESS_TOKEN = 'YOUR_MAPBOX_TOKEN_HERE';
   ```
3. Replace `YOUR_MAPBOX_TOKEN_HERE` with your actual Mapbox token:
   ```javascript
   window.MAPBOX_ACCESS_TOKEN = 'pk.your_actual_token_here';
   ```
4. Save the file and refresh the page

## Features Enabled

With a valid token, the following features will work:

- Interactive map with street/satellite view
- Real-time clustering of food listings with status colors
- Interactive popups showing food details
- User location services and geolocation
- Auto-fit map to show all available food
- Turn-by-turn directions (future feature)

## Troubleshooting

**Map not loading?**
- Check browser console for errors
- Verify token starts with `pk.` (public) or `sk.` (secret) and is valid
- Ensure you have internet connection
- Try refreshing the page
- Make sure the token is not expired or restricted

**Rate Limits**
- Mapbox free tier: 50,000 map loads/month
- Monitor usage in your Mapbox dashboard
- Upgrade if needed for production use

## Fallback Behavior

Without a valid token, the app will:
- Show setup instructions instead of the map
- Still display all food listings in the sidebar
- Allow filtering and claiming food
- Provide clear configuration guidance

Last updated: January 2025
