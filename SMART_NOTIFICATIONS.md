# Smart Notifications Implementation

## Overview
AI-powered notification system that learns user preferences to deliver relevant, non-spammy notifications about food listings.

## Features

### ✅ Implemented

#### Frontend (components/SmartNotifications.js)
- **Full notification management UI** with preferences panel
- **AI learning algorithm** with relevance scoring (0-100+ points)
- **User preference controls**:
  - Max distance filter (0.5-10 miles)
  - Daily notification limit (1-10)
  - Quiet hours (default 22:00-08:00)
  - Urgency-only mode
  - Category selection
  - Dietary tag filters
  - Favorite locations
- **Behavior tracking system**:
  - Clicked categories vs ignored
  - Click times for pattern analysis
  - Response rate monitoring
  - Preferred distance learning
- **Learning insights dashboard** showing AI patterns
- **Test notification** feature
- **NotificationToggle** compact component for header/floating button

#### Backend (backend/app.py)
- **GET/PUT /api/notification-preferences** - Load/save user settings
- **GET /api/notification-behavior** - Load learned behavior data
- **POST /api/notification-sent** - Track notification delivery
- **POST /api/notification-clicked** - Track user engagement for AI learning
- **GET /api/listings/recent?minutes=X** - Fetch new listings for notification checks

#### Database (backend/models.py)
- **notification_preferences** TEXT column on users table (JSON)
- **notification_behavior** TEXT column on users table (JSON)
- Migration script: `backend/scripts/migrate_notifications.py`

#### Integration
- Added to Header.js dropdown menu
- Mounted in app.js with state management
- Script tag in index.html
- Floating notification toggle on all pages
- Test page: test_notifications.html

## AI Relevance Scoring Algorithm

### How It Works
Each potential notification is scored 0-100+ points based on multiple factors:

```javascript
score = 0

// Category preference (learned from user behavior)
if (user clicked this category before) score += 30
if (user ignored this category before) score -= 20

// Dietary matching
for each matching dietary tag: score += 15

// Favorite location bonus
if (listing from favorite location) score += 40

// Distance preference
if (within preferred distance) score += 20

// Urgency
if (expiring in <6 hours) score += 25

// Freshness
if (posted <30 minutes ago) score += 15

// High value
if (servings >4) score += 10

// Only notify if score >= threshold
threshold = 40-60 (adapts based on response rate)
```

### Anti-Spam Measures
1. **Daily Limits** - Max 1-10 notifications per day (user configurable)
2. **Quiet Hours** - No notifications during quiet hours (default 22:00-08:00)
3. **Relevance Threshold** - Only high-scoring notifications are sent
4. **Response Rate Tracking** - Raises threshold if user ignores notifications
5. **Urgency-Only Mode** - Option to only receive urgent notifications

### Learning System
The AI learns from user behavior:
- **Clicks** → Increase preference for that category/distance
- **Ignores** → Decrease preference
- **Response Rate** → Adjusts notification threshold
- **Time Patterns** → Learns when user is most responsive

## Data Structures

### Notification Preferences (notification_preferences column)
```json
{
  "enabled": true,
  "maxDistance": 2,
  "categories": ["produce", "prepared", "bakery"],
  "dietaryTags": ["vegetarian", "gluten-free"],
  "favoriteLocations": [123, 456],
  "quietHours": {
    "start": "22:00",
    "end": "08:00"
  },
  "maxPerDay": 3,
  "urgencyOnly": false
}
```

### Notification Behavior (notification_behavior column)
```json
{
  "clickedCategories": {
    "produce": 15,
    "prepared": 8,
    "bakery": 3
  },
  "ignoredCategories": {
    "water": 5,
    "packaged": 2
  },
  "clickedTimes": ["2025-01-22T14:30:00Z", "2025-01-22T18:45:00Z"],
  "preferredDistance": 1.5,
  "responseRate": 0.76
}
```

## Notification Types

### 1. Fresh Arrivals
- **Trigger**: New listing posted <30 minutes ago
- **Title**: "✨ Fresh {category} just arrived {distance}mi away"
- **Bonus**: +15 points for freshness

### 2. Saved Location Restocks
- **Trigger**: New listing from favorite location
- **Title**: "🌟 Your saved location restocked!"
- **Bonus**: +40 points for favorite location

### 3. Urgent Items
- **Trigger**: Listing expiring in <6 hours
- **Title**: "⚡ Urgent: {category} expiring soon"
- **Bonus**: +25 points for urgency

### 4. General Availability
- **Trigger**: New listing matching preferences
- **Title**: "🍽️ {category} available {distance}mi away"
- **Default notification type**

## User Interface

### Main Panel
- **Enable/Disable Toggle** with permission request
- **Preferences Section**:
  - Distance slider (0.5-10 miles)
  - Daily limit slider (1-10)
  - Quiet hours time pickers
  - Urgency-only checkbox
- **Category Selection** with checkboxes
- **Dietary Tags** with checkboxes
- **Test Notification** button

### Learning Insights Section
- Most clicked categories (bar chart visualization)
- Response rate percentage
- Preferred distance
- Recent click times
- Clear insights button (resets learning)

### Compact Toggle (NotificationToggle)
- Small floating button showing notification count
- Bell icon with permission status indicator
- Click to open full preferences panel

## Browser Permission Flow

1. **Default State**: Permission not requested
   - Show "Enable Notifications" button
   - Explain what notifications will show

2. **Permission Requested**: 
   - Browser shows native permission dialog
   - User grants or denies

3. **Granted**: 
   - Notifications enabled
   - Start background polling (every 5 minutes)
   - Check new listings and send relevant ones

4. **Denied**:
   - Show instructions to enable in browser settings
   - Disable notification features

## Background Polling

When enabled, the system:
1. Checks for new listings every 5 minutes
2. Fetches `/api/listings/recent?minutes=5`
3. Loads user preferences and behavior data
4. Scores each listing using AI algorithm
5. Sends browser notification if score >= threshold
6. Tracks sent notifications for learning

## Testing

### Test Page
Visit `/test_notifications.html` for:
- Feature overview
- AI algorithm explanation
- Interactive testing
- Permission request flow

### Manual Testing Checklist
- [ ] Enable notifications (grant permission)
- [ ] Set preferences (distance, categories, dietary tags)
- [ ] Send test notification
- [ ] Verify notification appears
- [ ] Click notification → tracks as "clicked"
- [ ] Ignore notification → tracks as "ignored"
- [ ] Check learning insights update
- [ ] Verify quiet hours prevent notifications
- [ ] Verify daily limit stops notifications
- [ ] Test urgency-only mode

## API Endpoints

### GET /api/notification-preferences
**Auth**: Required (JWT)
**Returns**: User's notification preferences or defaults

### PUT /api/notification-preferences
**Auth**: Required (JWT)
**Body**: Preferences object
**Returns**: Success message and saved preferences

### GET /api/notification-behavior
**Auth**: Required (JWT)
**Returns**: Learned behavior data or defaults

### POST /api/notification-clicked
**Auth**: Required (JWT)
**Body**: `{ category, clicked_at, listing_id }`
**Effect**: Increments clicked category count, updates response rate
**Returns**: Updated behavior data

### GET /api/listings/recent
**Auth**: Required (JWT)
**Query**: `minutes` (default: 30)
**Returns**: Array of listings created in last N minutes with distance/expiry data

## Future Enhancements

### Potential Improvements
1. **Geofencing** - Automatic notifications when entering area with food
2. **Time-Based Learning** - Learn best times to notify each user
3. **Predictive Notifications** - AI predicts when user will need food
4. **Notification History** - View all past notifications
5. **Weekly Digest** - Summary of missed opportunities
6. **Social Proof** - "10 people claimed from this location this week"
7. **Streak Tracking** - Gamify consistent usage
8. **Smart Grouping** - Bundle related notifications to reduce spam
9. **Web Push API** - Cross-device notifications
10. **SMS Fallback** - Critical notifications via SMS if browser unavailable

### Advanced AI Features
1. **Household Pattern Learning** - Predict family size needs
2. **Seasonal Preferences** - Learn seasonal food preferences
3. **Transportation Mode** - Adjust distance based on car/bike/walk
4. **Schedule Integration** - Avoid notifications during work hours
5. **Weather Awareness** - Factor in weather for pickup feasibility

## Privacy & Data

### What We Store
- Notification preferences (user-configurable)
- Click/ignore statistics per category
- Click timestamps for pattern analysis
- Response rate percentage
- Preferred distance estimate

### What We DON'T Store
- Notification content after delivery
- Exact location data (only distance preferences)
- Personal information in notifications
- Third-party tracking data

### User Control
- Users can disable at any time
- Clear learning data with one click
- Export preferences (TODO)
- Delete all notification data on account deletion (TODO)

## Accessibility

### Features
- High contrast notification badges
- Screen reader compatible
- Keyboard navigation support
- Clear visual indicators for permission states
- Descriptive labels for all controls

## Performance

### Optimization
- Background polling only when notifications enabled
- 5-minute interval to balance freshness vs battery
- Local caching of preferences
- Efficient scoring algorithm (O(n) for n listings)
- Minimal data transfer (<5KB per poll)

### Battery Impact
- Low: Polls every 5 minutes (12 requests/hour)
- Service worker could reduce this further (TODO)
- Notifications stop during quiet hours
- Automatic disable on low battery (browser handles)

## Browser Compatibility

### Supported Browsers
- ✅ Chrome/Edge 50+ (full support)
- ✅ Firefox 44+ (full support)
- ✅ Safari 16+ (full support with iOS 16.4+)
- ⚠️ Safari <16 (notification API limited on iOS)
- ❌ IE (not supported)

### Feature Detection
Component checks for:
- `'Notification' in window`
- `Notification.permission`
- Falls back gracefully if unavailable

## Deployment Checklist

### Backend
- [x] Database migration run
- [x] API endpoints deployed
- [x] JSON serialization added
- [x] Error handling in place
- [x] Server restarted

### Frontend
- [x] Component loaded in index.html
- [x] Header integration
- [x] App.js state management
- [x] Floating toggle added
- [x] Test page created

### Testing
- [ ] Test with real user account
- [ ] Verify permission flow
- [ ] Confirm notifications appear
- [ ] Check AI learning updates
- [ ] Test all preference controls
- [ ] Verify quiet hours work
- [ ] Test daily limit enforcement

### Documentation
- [x] This implementation guide
- [ ] User guide in USER_GUIDE.md
- [ ] Add to COMPLETE_FEATURES_SUMMARY.md
- [ ] Update README.md

## Troubleshooting

### Notifications Not Appearing
1. Check browser permission (must be "granted")
2. Verify notifications enabled in preferences
3. Check quiet hours not active
4. Verify daily limit not reached
5. Check browser notification settings (OS level)

### AI Not Learning
1. Verify backend endpoints responding
2. Check localStorage for behavior data
3. Confirm clicks being tracked (network tab)
4. Check database notification_behavior column

### Permission Denied
1. User must re-enable in browser settings
2. Chrome: Settings → Privacy → Site Settings → Notifications
3. Firefox: Settings → Privacy → Permissions → Notifications
4. Safari: Settings → Websites → Notifications

### No Recent Listings
1. Check `/api/listings/recent` endpoint
2. Verify listings exist in last 5 minutes
3. Check database created_at timestamps
4. Confirm listings match user preferences

## Code Locations

- **Frontend Component**: `/home/ec2-user/project/components/SmartNotifications.js`
- **Backend Endpoints**: `/home/ec2-user/project/backend/app.py` (lines 4043-4276)
- **Database Model**: `/home/ec2-user/project/backend/models.py` (User table)
- **Migration Script**: `/home/ec2-user/project/backend/scripts/migrate_notifications.py`
- **Header Integration**: `/home/ec2-user/project/components/Header.js`
- **App Integration**: `/home/ec2-user/project/app.js`
- **Test Page**: `/home/ec2-user/project/test_notifications.html`
- **Documentation**: This file

## Support

For issues or questions:
1. Check this documentation first
2. Review test page at `/test_notifications.html`
3. Check browser console for errors
4. Verify backend logs: `sudo journalctl -u foodmaps -f`
5. Report via feedback modal in app
