# Favorites Feature Guide

## Overview
Users can now bookmark trusted food donors and distribution centers for quick access.

## How to Add Favorites

### From Map Markers
1. Click on any food listing (🍎) or distribution center (🏪) marker on the map
2. In the popup, click the **⭐ Save** button
3. The location is added to your favorites

### From Listing Details
1. Click on a food listing to view details
2. Click the **⭐** star button in the top-right corner of the modal
3. The star will fill (⭐) to indicate it's favorited

### From Distribution Center Modal
1. Click on a distribution center marker
2. Click "View Inventory" to open the modal
3. Click the **⭐** button next to the center name
4. The location is added to your favorites

## How to View Favorites

1. Click on your profile menu (top right)
2. Select **"My Favorites"**
3. View all your saved locations with:
   - Location type (Distribution Center or Food Donor)
   - Name and address
   - Date added
   - Any notes you've added

## How to Remove Favorites

### From Favorites Panel
1. Open "My Favorites" from your profile menu
2. Click the **🗑️** trash icon next to any location
3. The location is removed from your favorites

### From Listing Details
1. Open a favorited listing
2. Click the filled star (⭐) to unfavorite
3. The star will become empty (☆)

## Benefits

- **Quick Access**: Easily find trusted donors and centers you've used before
- **Build Trust**: Save locations with good track records
- **Save Time**: No need to search for the same locations repeatedly
- **Personal Notes**: Add notes to remember why you favorited a location

## Technical Details

### API Endpoints
- `GET /api/favorites` - Retrieve user's favorites
- `POST /api/favorites` - Add a favorite (requires: location_type, location_id, optional notes)
- `DELETE /api/favorites/{id}` - Remove a favorite

### Database
- Favorites are stored in the `FavoriteLocation` table
- Each favorite links to either a listing (donor) or distribution center
- Supports optional notes field for user annotations
