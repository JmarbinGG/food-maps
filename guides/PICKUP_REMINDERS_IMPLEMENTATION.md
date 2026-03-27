# Pickup Reminders Implementation

## Overview
The Pickup Reminders system automatically notifies recipients about their claimed food pickups, helping reduce no-shows and food waste. It features customizable scheduling, snooze functionality, SMS/email notifications, and intelligent urgency indicators.

## Features

### 1. **Automatic Reminder Scheduling**
- Auto-schedule reminders when recipients claim food
- Customizable advance notice (default: 2 hours before pickup)
- Configurable per-user preferences
- Batch reminder detection for items without reminders

### 2. **Multi-Channel Notifications**
- **SMS Reminders**: Text message notifications via Twilio
- **Email Reminders**: Email notifications (optional)
- Channel preferences per user
- Delivery confirmation tracking

### 3. **Intelligent Urgency System**
5-tier urgency classification:
- 🚨 **Overdue**: Pickup time has passed
- ⚠️ **Critical**: Less than 1 hour remaining
- ⏰ **High**: 1-4 hours remaining
- 🔔 **Medium**: 4-24 hours remaining
- 📅 **Low**: More than 24 hours remaining

### 4. **Snooze Functionality**
- Quick snooze options: 30 minutes, 1 hour
- Track snooze count for analytics
- Update reminder time dynamically
- Automatic status management

### 5. **Reminder Management**
- View upcoming, sent, and completed reminders
- Cancel individual reminders
- Real-time countdown to pickup
- Listing details integration

### 6. **User Preferences**
- Enable/disable reminders globally
- Set advance notice hours (0.5-72 hours)
- Toggle SMS/email channels
- Auto-reminder on claim setting

## Database Schema

### `pickup_reminders` Table

```sql
CREATE TABLE pickup_reminders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  listing_id INT NOT NULL,
  
  -- Timing
  scheduled_time DATETIME NOT NULL,       -- When to send reminder
  reminder_sent_at DATETIME NULL,         -- When actually sent
  
  -- Status
  status ENUM(
    'scheduled',    -- Queued for sending
    'sent',         -- Successfully delivered
    'snoozed',      -- User requested delay
    'completed',    -- Pickup completed
    'cancelled'     -- User cancelled reminder
  ) DEFAULT 'scheduled',
  
  -- Delivery tracking
  sms_sent BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,
  
  -- Snooze management
  snooze_count INT DEFAULT 0,
  snoozed_until DATETIME NULL,
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES food_resources(id) ON DELETE CASCADE,
  
  INDEX idx_user (user_id),
  INDEX idx_listing (listing_id),
  INDEX idx_scheduled_time (scheduled_time),
  INDEX idx_status (status)
);
```

### `reminder_settings` Table

```sql
CREATE TABLE reminder_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  
  -- Preferences
  enabled BOOLEAN DEFAULT TRUE,
  advance_notice_hours FLOAT DEFAULT 2.0,
  sms_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT FALSE,
  auto_reminder BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
);
```

## API Endpoints

### GET /api/pickup-reminders/list
Get all reminders for the authenticated user.

**Authentication**: Required (Bearer token)

**Response**:
```javascript
{
  success: true,
  reminders: [
    {
      id: 1,
      listing_id: 42,
      listing_title: "Fresh vegetables",
      location: "123 Main St, Oakland, CA",
      scheduled_time: "2025-12-28T14:00:00",
      reminder_sent_at: null,
      status: "scheduled",
      sms_sent: false,
      email_sent: false,
      snooze_count: 0,
      snoozed_until: null
    }
  ]
}
```

### GET /api/pickup-reminders/settings
Get reminder settings for the authenticated user.

**Authentication**: Required (Bearer token)

**Response**:
```javascript
{
  success: true,
  settings: {
    enabled: true,
    advance_notice_hours: 2.0,
    sms_enabled: true,
    email_enabled: false,
    auto_reminder: true
  }
}
```

**Auto-creates default settings** if user has none.

### POST /api/pickup-reminders/settings
Update reminder settings.

**Authentication**: Required (Bearer token)

**Request Parameters**:
```javascript
{
  enabled: bool,
  advance_notice_hours: float,
  sms_enabled: bool,
  email_enabled: bool,
  auto_reminder: bool
}
```

**Response**:
```javascript
{
  success: true,
  message: "Settings updated successfully"
}
```

### POST /api/pickup-reminders/schedule
Schedule a reminder for a claimed listing.

**Authentication**: Required (Bearer token)

**Request Parameters**:
```javascript
{
  listing_id: int
}
```

**Validation**:
- ✅ User must have claimed the listing
- ✅ No existing active reminder for same listing
- ✅ Pickup time must be in the future

**Response**:
```javascript
{
  success: true,
  message: "Reminder scheduled successfully",
  reminder_id: 1,
  scheduled_time: "2025-12-28T14:00:00"
}
```

**Calculation**: `reminder_time = pickup_time - advance_notice_hours`

### POST /api/pickup-reminders/{reminder_id}/cancel
Cancel a scheduled reminder.

**Authentication**: Required (Bearer token)

**Response**:
```javascript
{
  success: true,
  message: "Reminder cancelled"
}
```

### POST /api/pickup-reminders/{reminder_id}/snooze
Snooze a reminder for a specified duration.

**Authentication**: Required (Bearer token)

**Request Parameters**:
```javascript
{
  minutes: int  // Default: 30
}
```

**Response**:
```javascript
{
  success: true,
  message: "Reminder snoozed for 30 minutes",
  snoozed_until: "2025-12-28T14:30:00"
}
```

**Side Effects**:
- Status changes to `snoozed`
- `snoozed_until` timestamp set
- `snooze_count` incremented

## Frontend Components

### PickupReminders Component
**Location**: `components/PickupReminders.js`

**Props**:
- `user` - Current user object
- `listings` - Array of food listings
- `onClose` - Callback to close modal

**Features**:
- **3 Tabs**: Upcoming, Sent, History
- **Settings Panel**: Collapsible configuration
- **Smart Listing Detection**: Shows claimed items without reminders
- **Real-time Countdown**: Updates time until pickup
- **Color-coded Urgency**: Visual indicators by time remaining
- **Quick Actions**: Snooze 30m, Snooze 1h, Cancel

**State Management**:
```javascript
const [reminders, setReminders] = useState([]);
const [loading, setLoading] = useState(true);
const [activeTab, setActiveTab] = useState('upcoming');
const [settingsOpen, setSettingsOpen] = useState(false);
const [reminderSettings, setReminderSettings] = useState({...});
```

**Usage**:
```javascript
{showPickupReminders && user && (
  <PickupReminders
    user={user}
    listings={listings}
    onClose={() => setShowPickupReminders(false)}
  />
)}
```

### Header Integration
Added menu option for recipients:
```javascript
{user.role === 'recipient' && (
  <button onClick={() => window.openPickupReminders?.()}>
    🔔 Pickup Reminders
  </button>
)}
```

## User Workflows

### Recipient Claims Food and Gets Reminder

1. Recipient claims available food listing
2. If `auto_reminder` enabled:
   - System automatically schedules reminder
   - Reminder time = pickup_time - advance_notice_hours
3. Recipient sees notification:
   - "Claimed Items Without Reminders" section
   - Option to manually schedule if auto disabled

### Recipient Views Reminders

1. Click "🔔 Pickup Reminders" in user menu
2. **Upcoming Tab**:
   - See all scheduled and snoozed reminders
   - Urgency indicators show time criticality
   - Quick actions: Snooze or Cancel
3. **Sent Tab**:
   - View reminders that were delivered
   - See SMS/email delivery status
4. **History Tab**:
   - Completed and cancelled reminders
   - Historical tracking

### Recipient Snoozes Reminder

1. Click "😴 30m" or "😴 1h" button
2. Reminder status → `snoozed`
3. New snooze time calculated
4. Snooze counter incremented
5. Will re-alert after snooze period

### Recipient Cancels Reminder

1. Click "❌" cancel button
2. Confirmation prompt (optional)
3. Reminder status → `cancelled`
4. No longer appears in upcoming

### Recipient Updates Preferences

1. Open Pickup Reminders modal
2. Click "⚙️ Settings" button
3. Settings panel expands
4. Modify preferences:
   - Enable/disable reminders
   - Adjust advance notice hours
   - Toggle SMS/email channels
   - Set auto-reminder behavior
5. Changes save immediately

## Reminder Sending Logic (Backend)

### Background Job (Not Yet Implemented)
**Recommended**: Cron job or background worker

```python
# Pseudo-code for reminder sender
def send_due_reminders():
    now = datetime.utcnow()
    
    # Find reminders due to be sent
    due_reminders = db.query(PickupReminder).filter(
        PickupReminder.status == ReminderStatus.SCHEDULED,
        PickupReminder.scheduled_time <= now
    ).all()
    
    for reminder in due_reminders:
        user = reminder.user
        listing = reminder.listing
        settings = get_user_settings(user.id)
        
        # Send SMS if enabled
        if settings.sms_enabled and user.phone:
            send_sms(
                to=user.phone,
                message=f"Reminder: Pick up '{listing.title}' at {listing.address} "
                       f"by {listing.pickup_window_end.strftime('%I:%M %p')}"
            )
            reminder.sms_sent = True
        
        # Send Email if enabled
        if settings.email_enabled and user.email:
            send_email(
                to=user.email,
                subject=f"Pickup Reminder: {listing.title}",
                body=generate_reminder_email(listing)
            )
            reminder.email_sent = True
        
        # Update reminder status
        reminder.status = ReminderStatus.SENT
        reminder.reminder_sent_at = now
        db.commit()
```

**Cron Schedule**: Every 5-15 minutes

## Notification Templates

### SMS Template
```
🔔 Food Pickup Reminder

{listing_title}
📍 {address}
⏰ Pickup by: {pickup_end_time}

View details: {app_url}/listing/{listing_id}
```

### Email Template
```html
Subject: Pickup Reminder: {listing_title}

Hi {recipient_name},

This is a reminder to pick up your claimed food:

Item: {listing_title}
Location: {address}
Pickup Window: {pickup_start} - {pickup_end}
Quantity: {qty} {unit}

Don't forget to bring bags/containers!

[View Details Button]

Questions? Contact the donor: {donor_phone}
```

## Testing Checklist

### Functional Testing
- [ ] Schedule reminder for claimed listing
- [ ] Auto-schedule when claiming (if enabled)
- [ ] View reminders in all three tabs
- [ ] Snooze reminder (30min, 1hour)
- [ ] Cancel reminder
- [ ] Update user settings
- [ ] Disable reminders globally

### Integration Testing
- [ ] Reminder scheduling API
- [ ] Settings CRUD operations
- [ ] Snooze functionality
- [ ] Cancel functionality
- [ ] Listing deletion cascades to reminders
- [ ] User deletion cascades to reminders

### UI/UX Testing
- [ ] Urgency colors display correctly
- [ ] Countdown timer updates
- [ ] Settings panel opens/closes
- [ ] Tabs switch properly
- [ ] Modal responsive on mobile
- [ ] Empty states show correctly

### Edge Cases
- [ ] Schedule reminder for past listing (should fail)
- [ ] Duplicate reminder prevention
- [ ] Snooze after pickup time passed
- [ ] Settings for user with no listings
- [ ] Concurrent snooze requests
- [ ] Extremely long advance notice (72h)

## Security Considerations

### Authorization
- ✅ Users can only view their own reminders
- ✅ Only listing claimant can schedule reminder
- ✅ JWT authentication required for all endpoints
- ✅ Foreign key constraints prevent orphaned data

### Data Privacy
- ✅ Reminders cascade delete with users
- ✅ Settings isolated per user
- ✅ No cross-user reminder visibility
- ✅ Phone numbers only shared with claimant

### Rate Limiting (Recommended)
```python
@app.post("/api/pickup-reminders/schedule")
@rate_limit(max_calls=10, period=3600)  # 10 per hour
async def schedule_pickup_reminder(...):
    ...
```

## Performance Optimizations

### Database Indexes
- ✅ `idx_user (user_id)` - Fast user reminder lookup
- ✅ `idx_listing (listing_id)` - Fast listing reminder lookup
- ✅ `idx_scheduled_time` - Efficient due reminder queries
- ✅ `idx_status` - Filter by status

### Query Optimization
```python
# Eager load related data
reminders = db.query(PickupReminder)\
    .options(joinedload(PickupReminder.listing))\
    .filter(PickupReminder.user_id == user_id)\
    .all()
```

### Caching (Future)
- Cache user settings (low update frequency)
- Cache listing details for active reminders
- Redis for real-time countdown calculations

## Analytics & Metrics

### Key Metrics to Track
1. **Reminder Effectiveness**
   - % of reminded pickups completed
   - Average snooze count per reminder
   - Cancellation rate

2. **User Engagement**
   - % of users with reminders enabled
   - Most common advance notice time
   - SMS vs Email preference ratio

3. **Operational Metrics**
   - Reminders sent per day
   - Average time between schedule and send
   - Failed delivery rate

### Monitoring Queries
```sql
-- Reminder completion rate
SELECT 
    COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*) as completion_rate
FROM pickup_reminders;

-- Average advance notice
SELECT AVG(advance_notice_hours) as avg_advance_notice
FROM reminder_settings
WHERE enabled = TRUE;

-- Snooze statistics
SELECT 
    AVG(snooze_count) as avg_snoozes,
    MAX(snooze_count) as max_snoozes
FROM pickup_reminders
WHERE snooze_count > 0;
```

## Future Enhancements

### Phase 2 (Recommended)
1. **Push Notifications**: Browser/mobile push notifications
2. **Smart Scheduling**: ML-based optimal reminder timing
3. **Weather Integration**: Notify if bad weather affects pickup
4. **Route Planning**: Include directions to pickup location
5. **Batch Reminders**: Group multiple pickups in one notification

### Phase 3 (Advanced)
1. **Voice Calls**: Automated phone call reminders
2. **Calendar Integration**: Add to Google Calendar/Apple Calendar
3. **Traffic Alerts**: Adjust reminder time based on traffic
4. **Recurring Pickups**: Templates for regular schedules
5. **Reminder Chains**: Multiple reminders at different intervals

## Troubleshooting

### Common Issues

**Issue**: Reminders not appearing in modal
- **Solution**: Check user has claimed listings
- **Verify**: `listing.recipient_id === user.id`
- **Check**: Reminders fetched from API successfully

**Issue**: Cannot schedule reminder
- **Solution**: Verify listing is claimed by current user
- **Check**: No existing active reminder for listing
- **Verify**: Pickup time is in future

**Issue**: Snooze not working
- **Solution**: Check reminder belongs to current user
- **Verify**: Snooze time calculation correct
- **Check**: Status updates to 'snoozed'

**Issue**: Settings not saving
- **Solution**: Verify authentication token valid
- **Check**: Network request completes successfully
- **Verify**: Settings object structure matches API

### Debug Logging
Enable in PickupReminders component:
```javascript
console.log('Reminders:', reminders);
console.log('Settings:', reminderSettings);
console.log('Listings Needing Reminders:', listingsNeedingReminders);
```

## Migration History

### Migration 1: Initial Schema (2025-12-28)
**File**: `backend/scripts/migrate_pickup_reminders.py`

**Changes**:
- ✅ Created `pickup_reminders` table
- ✅ Created `reminder_settings` table
- ✅ Added indexes for performance
- ✅ Set up foreign key constraints

**Rollback** (if needed):
```sql
DROP TABLE IF EXISTS pickup_reminders;
DROP TABLE IF EXISTS reminder_settings;
```

## Dependencies

### Backend
- SQLAlchemy models: `PickupReminder`, `ReminderSettings`, `ReminderStatus`
- JWT authentication for all endpoints
- Twilio SDK for SMS (when implemented)
- Email service for email notifications (when implemented)

### Frontend
- React 18+ with hooks
- window.PickupReminders global component
- Tailwind CSS for styling
- Date/time formatting utilities

## Contributing

### Code Style
- Follow existing component patterns
- Use descriptive variable names
- Add comments for time calculations
- Test all reminder states

### Pull Request Checklist
- [ ] Database migration runs successfully
- [ ] All API endpoints tested
- [ ] UI displays correctly on mobile
- [ ] No console errors
- [ ] Documentation updated
- [ ] Edge cases handled

---

**Implementation Date**: December 28, 2025  
**Last Updated**: December 28, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready (SMS/Email sending requires implementation)
