# Favorites/Bookmarks System - Implementation Guide

## Overview
Implemented a comprehensive favorites/bookmarks system allowing users to save trusted food sources and locations. Perfect for families with routines who frequently visit the same donors or distribution centers.

## Features Implemented

### 1. Database Model (`FavoriteLocation`)
- Save any location (donor, distribution center, or general spot)
- Track visit history and frequency
- Personal notes and custom tags
- Notification preferences for new listings
- Soft deletes for data retention

### 2. API Endpoints
- **GET /api/favorites** - List all favorites
- **POST /api/favorites** - Add new favorite
- **PUT /api/favorites/{id}** - Update favorite details
- **POST /api/favorites/{id}/visit** - Record a visit
- **DELETE /api/favorites/{id}** - Remove favorite

### 3. User Interface
- **Favorites Panel**: Full-screen management interface
  - Search and filter capabilities
  - Location cards with visit stats
  - Edit modal for notes/tags/notifications
  - Get directions button (Google Maps)
  
- **Listing Cards**: Star button to quick-save donors
- **Profile Menu**: "⭐ My Favorites" access point

### 4. Smart Features
- **Visit Tracking**: Count visits and track last visit date
- **Duplicate Prevention**: Won't save same location twice
- **Smart Sorting**: Most-visited locations appear first
- **Personalization**: Custom names, notes, and tags
- **Notifications** (Ready): Enable alerts for new listings

## How to Use

### For Users

#### Saving a Favorite Location:
1. Click the ⭐ star icon on any listing card
2. Location is automatically saved with donor info
3. Access all favorites from profile menu → "⭐ My Favorites"

#### Managing Favorites:
1. Open profile menu (click your name)
2. Select "⭐ My Favorites"
3. Search, filter, or browse saved locations
4. **Mark Visit**: Track when you visit
5. **Edit**: Add notes, tags, or enable notifications
6. **Get Directions**: Navigate to location
7. **Remove**: Delete from favorites

#### Track Your Routine:
- Visit counter shows frequency
- Last visit date helps plan next trip
- Most-visited locations automatically sort to top
- Add personal notes like "Best on Fridays 2-4pm"

### For Administrators

#### Migration:
```bash
cd backend/scripts
python migrate_favorites.py
```

This creates the `favorite_locations` table in your database.

#### Restart Server:
```bash
sudo systemctl restart foodmaps
```

## Technical Details

### Database Schema
```sql
favorite_locations:
- id, user_id, name, address, coords_lat, coords_lng
- location_type: 'donor'|'distribution_center'|'general'
- donor_id, center_id (optional foreign keys)
- notes (TEXT), tags (JSON array)
- visit_count, last_visited
- notify_new_listings, notification_radius_km
- created_at, updated_at, is_active
```

### Files Modified
- `backend/models.py` - Added FavoriteLocation model
- `backend/app.py` - Added 5 favorites endpoints
- `components/FavoritesPanel.js` - Full UI replacement
- `components/ListingCard.js` - Updated star button
- `utils/favoritesAPI.js` - Client API helper
- `index.html` - Added script import
- `backend/scripts/migrate_favorites.py` - Database migration

## Use Cases

### Family Routines
"We visit the community center every Tuesday. I saved it with a note about pickup times so we never miss it."

### Trusted Sources
"I favorited three food banks that consistently have what we need. Tagged them 'family-friendly' and 'fresh-produce'."

### Repeat Donors
"As a donor, I favorite reliable recipients who always show up. Easy to notify them first about new donations."

## Future Enhancements
- Map view of all favorites
- Share favorites with family members
- Weekly routine analysis
- "Favorite donor posted" notifications
- Import from Google Maps

---
**Status**: ✅ Complete  
**Date**: January 2026
