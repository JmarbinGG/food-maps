# SMS Consent Manager - Twilio Compliance Implementation

## Overview
Twilio-compliant SMS opt-in system with explicit user consent and granular notification controls. Users must actively choose to receive text messages and can select exactly which types of notifications they want.

## Legal Compliance (Twilio Requirements)

### ✅ Checklist
- [x] **Explicit Opt-In**: Users must actively check boxes (no pre-checked defaults)
- [x] **Clear Disclosure**: Message frequency and rates disclosed
- [x] **STOP Command**: Users can reply STOP to opt out anytime
- [x] **HELP Command**: Users can reply HELP for assistance
- [x] **Consent Logging**: Date, IP address, and preferences recorded
- [x] **Easy Opt-Out**: Clear button in settings + STOP command
- [x] **Backend Verification**: Every SMS checked against consent before sending

## Database Schema

### New Fields in `users` Table
```sql
sms_consent_given BOOLEAN DEFAULT FALSE
sms_consent_date DATETIME NULL
sms_notification_types TEXT NULL  -- JSON array
sms_opt_out_date DATETIME NULL
sms_consent_ip VARCHAR(50) NULL
```

### Migration
Run: `python backend/migrate_sms_consent.py`

## 8 Notification Types

| ID | Title | Description | Example Message |
|----|-------|-------------|-----------------|
| `new_listings` | New Listings Nearby | Fresh food available nearby | "Fresh produce just arrived 0.4 miles away - 5 lbs available" |
| `claimed_ready` | Pickup Ready | Claimed food ready for pickup | "Your chicken & vegetables are ready at Main Street Market" |
| `expiring_soon` | Expiration Reminders | Items expiring soon | "Your milk expires in 2 hours - use it or freeze it now" |
| `spoilage_alerts` | Spoilage Warnings | Critical food safety alerts | "URGENT: Prepared food has been at room temp for 6 hours" |
| `pickup_reminders` | Pickup Time Reminders | 1hr and 15min before pickup | "Reminder: Pickup at Joe's Deli at 3:00 PM (15 minutes)" |
| `location_restocked` | Favorite Location Updates | Saved locations restocked | "Your saved location Community Pantry just restocked produce" |
| `meal_suggestions` | Meal Ideas | Quick recipes (max 1/day) | "You have chicken + greens expiring - here's a 15-min meal" |
| `urgent_only` | Urgent Alerts Only | Only critical safety + same-day pickups | Filters to only spoilage_alerts, pickup_reminders, claimed_ready |

## API Endpoints

### GET `/api/sms-consent`
Get user's current SMS consent status and preferences.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "consent_given": true,
  "consent_date": "2026-01-26T10:30:00Z",
  "notification_types": ["new_listings", "pickup_reminders", "spoilage_alerts"],
  "opt_out_date": null,
  "phone": "+1234567890",
  "phone_verified": true
}
```

### PUT `/api/sms-consent`
Update user's SMS consent and notification preferences.

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "consent_given": true,
  "notification_types": ["new_listings", "pickup_reminders"]
}
```

**Response:**
```json
{
  "success": true,
  "consent_given": true,
  "consent_date": "2026-01-26T10:30:00Z",
  "notification_types": ["new_listings", "pickup_reminders"],
  "message": "SMS preferences updated successfully"
}
```

## Backend Functions

### `check_sms_consent(db, user_id, notification_type)`
Verify user consent before sending SMS.

**Parameters:**
- `db`: Database session
- `user_id`: User ID to check
- `notification_type`: Type of notification (optional)

**Returns:** `True` if user consented and type enabled, `False` otherwise

**Checks:**
1. User exists
2. `sms_consent_given = True`
3. `sms_opt_out_date IS NULL`
4. Notification type in `sms_notification_types` array
5. Special handling for `urgent_only` mode

**Example:**
```python
from backend.sms_service import check_sms_consent

if check_sms_consent(db, user_id, 'new_listings'):
    send_sms_real(user.phone, "Fresh produce available!")
```

### `send_sms_with_consent(db, user_id, message, notification_type)`
Send SMS after checking consent (all-in-one function).

**Parameters:**
- `db`: Database session
- `user_id`: User ID
- `message`: SMS message text
- `notification_type`: Type of notification

**Returns:** `True` if sent successfully, `False` otherwise

**Example:**
```python
from backend.sms_service import send_sms_with_consent

send_sms_with_consent(
    db, 
    user_id=123, 
    message="Fresh produce just arrived nearby!", 
    notification_type='new_listings'
)
```

## UI Component

### SMSConsentManager
React component with full consent management UI.

**Props:**
```javascript
<SMSConsentManager
  user={user}              // User object with phone, phone_verified
  onClose={() => {}}       // Close modal callback
  onUpdate={() => {}}      // Called after preferences updated
/>
```

**Features:**
- Phone number validation
- 8 checkboxes for notification types
- Real-time consent status display
- Explicit opt-in confirmation dialog
- Easy opt-out button
- Legal compliance notices
- Example messages for each type
- Estimated message frequency

## User Flow

### First-Time Opt-In
1. User opens "📱 SMS Text Notifications" from header menu
2. Sees current status: "SMS Disabled"
3. Checks phone number on file (required)
4. Selects desired notification types (e.g., ✅ Pickup Ready, ✅ Spoilage Warnings)
5. Clicks "Enable 2 Notification(s)" button
6. **Confirmation dialog appears:**
   ```
   By clicking OK, you agree to receive text messages from Food Maps at +1234567890.
   
   Message frequency varies. Message and data rates may apply. 
   Reply STOP to opt out anytime.
   
   You've selected 2 notification type(s).
   ```
7. User clicks OK → Consent recorded with timestamp and IP
8. Success message: "You'll receive 2 type(s) of text notifications"

### Updating Preferences
1. User opens SMS settings
2. Sees current status: "SMS Enabled" with consent date
3. Toggles notification types on/off
4. Clicks "Enable 3 Notification(s)" to save
5. No confirmation needed (already consented)
6. Preferences updated immediately

### Opting Out
1. User opens SMS settings
2. Clicks red "Opt Out" button
3. **Confirmation dialog:**
   ```
   Are you sure you want to stop receiving ALL text messages?
   
   You can always opt back in later.
   ```
4. User confirms → All notifications disabled
5. `sms_opt_out_date` recorded
6. User can opt back in later (new consent date recorded)

## Integration Points

### Header Menu
```javascript
<button onClick={() => window.openSMSConsent?.()}>
  📱 SMS Text Notifications
</button>
```

### App.js State
```javascript
const [showSMSConsent, setShowSMSConsent] = React.useState(false);

window.openSMSConsent = () => {
  setShowSMSConsent(true);
};
```

### Render
```javascript
{showSMSConsent && user && window.SMSConsentManager && (
  <window.SMSConsentManager
    user={user}
    onClose={() => setShowSMSConsent(false)}
    onUpdate={handleUserUpdate}
  />
)}
```

## Special Cases

### Urgent-Only Mode
When user selects "🚨 Urgent Alerts Only":
- Only critical notifications allowed
- Filters to: `spoilage_alerts`, `pickup_reminders`, `claimed_ready`
- All other notification types blocked
- Estimated 1-5 messages/week

### No Phone Number
- UI shows warning: "Phone Number Required"
- All toggles disabled
- Save button disabled
- Links to profile to add phone

### Phone Not Verified
- Shows status: "Phone on file but not verified"
- Still allows SMS (Twilio will send)
- Suggests verifying for better deliverability

## Compliance Logging

### What's Recorded
```javascript
{
  sms_consent_given: true,
  sms_consent_date: "2026-01-26T10:30:00Z",
  sms_consent_ip: "192.168.1.100",
  sms_notification_types: ["new_listings", "pickup_reminders"],
  sms_opt_out_date: null
}
```

### Legal Protection
- Proves user explicitly consented
- Records exact time and IP address
- Shows which notifications user wanted
- Tracks opt-out requests
- Complies with TCPA and Twilio requirements

## Message Templates (Examples)

### New Listings
```
Fresh produce just arrived 0.4 miles away - 5 lbs available. 
View: foodmaps.com/listings/123

Reply STOP to opt out
```

### Pickup Ready
```
✅ Your claimed items are ready for pickup at Main Street Market.
Pickup window: 2:00 PM - 4:00 PM today

Reply STOP to opt out
```

### Expiration Reminder
```
⏰ Your milk expires in 2 hours - use it or freeze it now!
Other items expiring soon: Check app

Reply STOP to opt out
```

### Spoilage Alert (URGENT)
```
🚨 URGENT: Prepared food has been at room temperature for 6 hours. 
For safety, discard or use immediately.

Reply STOP to opt out
```

### Pickup Reminder
```
🔔 Reminder: Pickup at Joe's Deli at 3:00 PM (15 minutes)
Address: 123 Main St

Reply STOP to opt out
```

## Testing

### Test Page
Open: `test_sms_consent.html`

**Shows:**
- Full SMS consent UI
- All 8 notification types with examples
- Mock user with phone number
- Database schema documentation
- Twilio compliance checklist

### Manual Testing
1. **Without phone number:**
   - User should see warning
   - Toggles should be disabled
   - Cannot save preferences

2. **First-time opt-in:**
   - Select notification types
   - Click enable button
   - Should see confirmation dialog
   - After confirming, consent recorded

3. **Update preferences:**
   - Change selected types
   - Click save
   - No confirmation needed
   - Preferences update immediately

4. **Opt-out:**
   - Click red "Opt Out" button
   - Confirm in dialog
   - All SMS disabled
   - Can opt back in later

5. **Backend check:**
   ```python
   # Should return False (no consent)
   check_sms_consent(db, user_id, 'new_listings')
   
   # User opts in...
   
   # Should return True
   check_sms_consent(db, user_id, 'new_listings')
   
   # Should return False (type not enabled)
   check_sms_consent(db, user_id, 'meal_suggestions')
   ```

## Estimated Message Frequency

| Notification Type | Frequency |
|-------------------|-----------|
| New Listings | 5-20/week (depends on local activity) |
| Pickup Ready | 2-5/week (when user claims items) |
| Expiration Reminders | 1-3/week (based on claimed items) |
| Spoilage Alerts | 0-2/week (only critical safety issues) |
| Pickup Reminders | 2-5/week (1hr + 15min before pickup) |
| Location Restocked | 1-5/week (favorite locations only) |
| Meal Suggestions | 0-7/week (max 1/day, only with expiring items) |
| Urgent Only | 1-5/week (critical alerts only) |

## Error Handling

### Backend
- User not found → Return False
- No consent given → Return False, log warning
- Opted out → Return False, log warning
- Notification type disabled → Return False, log info
- Twilio error → Return False, log error

### Frontend
- API error → Show alert
- Save failure → Keep modal open
- No phone → Disable controls
- Network error → Retry option

## Future Enhancements

### Phase 2
- SMS verification code before enabling
- Two-way SMS (reply with commands)
- Smart frequency limits (max/day, max/week)
- Quiet hours per user timezone

### Phase 3
- A/B testing message templates
- Analytics dashboard (open rates, opt-out rates)
- Multi-language support
- Rich media MMS for meal photos

## Security & Privacy

- ✅ Consent required before any SMS
- ✅ IP address logged for legal protection
- ✅ User can opt out anytime
- ✅ Preferences encrypted in transit (HTTPS)
- ✅ Phone numbers not shared with third parties
- ✅ STOP command honored immediately
- ✅ Compliance with TCPA regulations

## Files Created

1. **Migration**: `backend/migrate_sms_consent.py`
2. **Models**: Updated `backend/models.py`
3. **API**: Updated `backend/app.py` (2 endpoints)
4. **Service**: Updated `backend/sms_service.py` (consent checking)
5. **Component**: `components/SMSConsentManager.js`
6. **Test Page**: `test_sms_consent.html`
7. **Integration**: `app.js`, `Header.js`, `index.html`
8. **Docs**: `SMS_CONSENT.md`

---

**Status**: ✅ Complete and Twilio-compliant  
**Last Updated**: January 26, 2026  
**Migration Required**: Yes - run `migrate_sms_consent.py`
