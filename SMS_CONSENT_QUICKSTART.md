# SMS Consent - Quick Start Guide

## What It Does
Twilio-compliant SMS opt-in system where users explicitly agree to receive text messages. Users actively choose which notifications they want with granular toggles for 8 different types.

## Why This Matters
- ✅ **Legal Compliance**: Meets TCPA and Twilio requirements
- ✅ **User Control**: Users choose exactly what they want
- ✅ **No Spam**: Only sends to consented users
- ✅ **Audit Trail**: Records consent date, IP, and preferences

## Setup (Backend)

### 1. Run Database Migration
```bash
cd /home/ec2-user/project/backend
python migrate_sms_consent.py
```

### 2. Fields Added to `users` Table
- `sms_consent_given` - Boolean (default FALSE)
- `sms_consent_date` - Timestamp of consent
- `sms_notification_types` - JSON array of enabled types
- `sms_opt_out_date` - When user opted out (if ever)
- `sms_consent_ip` - IP address for compliance

### 3. API Endpoints Available
- `GET /api/sms-consent` - Get user's consent status
- `PUT /api/sms-consent` - Update consent and preferences

## How Users Opt In

### Step 1: Open Settings
Click profile icon → "📱 SMS Text Notifications"

### Step 2: Review Notification Types
8 types available:
1. 🆕 **New Listings Nearby** - Fresh food alerts
2. ✅ **Pickup Ready** - Claimed items ready
3. ⏰ **Expiration Reminders** - Use before spoiling
4. ⚠️ **Spoilage Warnings** - Critical safety alerts
5. 🔔 **Pickup Time Reminders** - 1hr and 15min before
6. ⭐ **Favorite Locations** - Saved places restocked
7. 👨‍🍳 **Meal Ideas** - Quick recipes (max 1/day)
8. 🚨 **Urgent Only** - Critical alerts only

### Step 3: Select Desired Types
Check boxes for notifications you want to receive.

### Step 4: Confirm Consent
Click "Enable X Notification(s)" → Confirmation dialog:

```
By clicking OK, you agree to receive text messages 
from Food Maps at +1234567890.

Message frequency varies. Message and data rates may apply. 
Reply STOP to opt out anytime.

You've selected 3 notification type(s).
```

### Step 5: Done!
Consent recorded with timestamp and IP address.

## Sending SMS (Backend)

### ✅ Correct Way (With Consent Check)
```python
from backend.sms_service import send_sms_with_consent

# Automatically checks consent before sending
send_sms_with_consent(
    db=db,
    user_id=user.id,
    message="Fresh produce available nearby!",
    notification_type='new_listings'
)
```

### ❌ Wrong Way (No Consent Check)
```python
from backend.sms_service import send_sms_real

# DON'T DO THIS - bypasses consent check!
send_sms_real(user.phone, "Message")
```

### Manual Consent Check
```python
from backend.sms_service import check_sms_consent

if check_sms_consent(db, user.id, 'spoilage_alerts'):
    # User has consented to spoilage alerts
    send_sms_real(user.phone, "URGENT: Food safety alert")
else:
    # User hasn't consented or disabled this type
    print("User not consented for spoilage alerts")
```

## Urgent-Only Mode

When user selects "🚨 Urgent Alerts Only":
- **Blocks**: new_listings, location_restocked, meal_suggestions
- **Allows**: spoilage_alerts, pickup_reminders, claimed_ready, expiring_soon
- **Result**: 1-5 messages/week instead of 10-30/week

## Legal Compliance Features

### What's Required by Law
1. ✅ Explicit opt-in (no pre-checked boxes)
2. ✅ Clear message frequency disclosure
3. ✅ "Message and data rates may apply" notice
4. ✅ STOP command to opt out
5. ✅ HELP command for assistance
6. ✅ Consent audit trail

### What We Record
```json
{
  "sms_consent_given": true,
  "sms_consent_date": "2026-01-26T10:30:00Z",
  "sms_consent_ip": "192.168.1.100",
  "sms_notification_types": ["new_listings", "pickup_reminders"],
  "sms_opt_out_date": null
}
```

### Every SMS Must Include
```
Reply STOP to opt out
```

## User Access

### From Header Menu
All logged-in users see: **"📱 SMS Text Notifications"**

### Direct Function
```javascript
window.openSMSConsent()
```

## Testing

### Test Page
Open: `test_sms_consent.html`

### Test Scenarios

**1. User without phone:**
```
Expected: Warning shown, toggles disabled
```

**2. First-time opt-in:**
```
Expected: Confirmation dialog, consent recorded
```

**3. Update preferences:**
```
Expected: No confirmation, immediate update
```

**4. Opt-out:**
```
Expected: Confirmation dialog, all SMS disabled
```

**5. Backend check:**
```python
# User without consent
assert check_sms_consent(db, user_id, 'new_listings') == False

# User with consent for specific type
assert check_sms_consent(db, user_id, 'new_listings') == True

# User with consent but type disabled
assert check_sms_consent(db, user_id, 'meal_suggestions') == False
```

## Message Examples

### New Listing
```
Fresh produce just arrived 0.4 miles away - 5 lbs available. 
View: foodmaps.com/listings/123

Reply STOP to opt out
```

### Spoilage Alert
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

## Frequency Estimates

| Selection | Messages/Week |
|-----------|---------------|
| All 7 types | 15-40/week |
| New listings + Pickup | 7-25/week |
| Urgent only | 1-5/week |
| Single type | 1-7/week |

## Opt-Out Process

### User-Initiated (App)
1. Open SMS settings
2. Click "Opt Out" button
3. Confirm dialog
4. `sms_opt_out_date` recorded
5. All SMS stop immediately

### SMS Reply (STOP Command)
1. User texts "STOP" to any message
2. Twilio auto-replies: "You have been unsubscribed"
3. Manually update database: `sms_consent_given = FALSE`
4. Record `sms_opt_out_date`

### Re-Opt-In
Users can opt back in anytime:
- Opens SMS settings
- Selects notification types
- New consent date recorded
- `sms_opt_out_date` cleared

## Integration Summary

### Files Modified
1. `backend/models.py` - Added 5 SMS consent fields
2. `backend/app.py` - Added 2 API endpoints
3. `backend/sms_service.py` - Added consent checking
4. `components/SMSConsentManager.js` - UI component
5. `app.js` - State and global function
6. `components/Header.js` - Menu item
7. `index.html` - Component import

### Files Created
1. `backend/migrate_sms_consent.py` - Database migration
2. `test_sms_consent.html` - Test page
3. `SMS_CONSENT.md` - Full documentation
4. `SMS_CONSENT_QUICKSTART.md` - This guide

## Common Issues

### "Phone Number Required"
**Problem:** User hasn't added phone to profile  
**Solution:** Add phone in profile settings first

### Consent check returns False
**Problem:** User hasn't opted in or disabled that type  
**Solution:** Check `sms_consent_given` and `sms_notification_types`

### SMS not sending
**Problem:** Missing Twilio credentials or consent  
**Solution:** Verify `.env` has Twilio keys and user consented

### User can't find settings
**Problem:** Header menu item not visible  
**Solution:** Menu item shows for all logged-in users

## Best Practices

### ✅ DO
- Always use `send_sms_with_consent()` or `check_sms_consent()`
- Include "Reply STOP" in every message
- Log when consent given/revoked
- Provide clear examples of message types
- Keep messages under 160 characters when possible

### ❌ DON'T
- Send SMS without consent check
- Pre-check notification type boxes
- Send more than 1 meal suggestion per day
- Ignore opt-out requests
- Share phone numbers with third parties

## Quick Reference

### Enable SMS (Backend)
```python
from backend.sms_service import send_sms_with_consent

send_sms_with_consent(
    db, user_id, message, notification_type
)
```

### Check Consent (Backend)
```python
from backend.sms_service import check_sms_consent

if check_sms_consent(db, user_id, 'new_listings'):
    # Send SMS
```

### Open UI (Frontend)
```javascript
window.openSMSConsent()
```

---

**Status**: ✅ Ready to use  
**Migration**: Required (run `migrate_sms_consent.py`)  
**Compliance**: Twilio TCPA compliant  
**Test**: `test_sms_consent.html`
