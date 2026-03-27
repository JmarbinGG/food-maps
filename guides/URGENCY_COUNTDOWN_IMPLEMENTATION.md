# Urgency Countdown & Expiration Tracking

## Overview
Implemented real-time countdown timers and urgency indicators for food listings to help recipients prioritize soon-expiring items and reduce food waste.

## Features Implemented

### 1. Real-Time Countdown Timers
**Components Updated:**
- `ListingCard.js` - Card view countdown
- `DetailedModal.js` - Detailed modal countdown

**Functionality:**
- ⏱️ **Live Countdown:** Updates every minute showing time remaining
- 📊 **Multiple Time Formats:**
  - Days + Hours (e.g., "2d 5h")
  - Hours + Minutes (e.g., "5h 30m")
  - Minutes only (e.g., "45m")
  - "EXPIRED" for past expiration

### 2. Urgency Level System

**4-Tier Urgency Classification:**

| Level | Conditions | Visual | Priority |
|-------|-----------|--------|----------|
| **Critical** 🚨 | High perishability + < 2 hours | Red, Pulsing | Immediate action |
| **High** ⚠️ | High perish. < 6h OR Medium < 6h | Orange | Act soon |
| **Medium** ⏰ | High perish. < 24h OR Medium < 24h OR Low < 24h | Yellow | Moderate |
| **Low** ✓ | > 24 hours remaining | Green | Good availability |

**Algorithm:**
```javascript
if (perishability === 'high') {
  if (hours < 2)  → CRITICAL
  if (hours < 6)  → HIGH
  if (hours < 24) → MEDIUM
  else            → LOW
} else if (perishability === 'medium') {
  if (hours < 6)  → HIGH
  if (hours < 24) → MEDIUM
  else            → LOW
} else {
  if (hours < 24) → MEDIUM
  else            → LOW
}
```

### 3. Visual Indicators

#### ListingCard Component
**Critical Urgency Banner:**
```
┌─────────────────────────────────────┐
│ 🚨 URGENT - Expires in 1h 30m!     │
│    Claim now before it expires      │
└─────────────────────────────────────┘
[Pulsing red gradient, impossible to miss]
```

**Urgency Badge:**
- Displayed next to status badge
- Color-coded by urgency level
- Shows countdown timer
- Animated pulse for critical items

#### DetailedModal Component
**Urgency Banner (top of modal):**
```
┌───────────────────────────────────────┐
│ 🚨 URGENT - Claim immediately!       │
│    Time remaining: 45m                │
└───────────────────────────────────────┘
```

**Colors:**
- Critical: Red gradient (bg-red-600 to bg-red-700)
- High: Orange gradient (bg-orange-500 to bg-orange-600)
- Medium: Yellow gradient (bg-yellow-500 to bg-yellow-600)
- Low: Green gradient (bg-green-500 to bg-green-600)
- Expired: Gray gradient (bg-gray-600 to bg-gray-700)

### 4. Intelligent Sorting

**Priority-Based Listing Order:**
Modified `app.js` filtering logic to sort listings by urgency:

1. **Critical items** (< 2 hours, high perishability) → First
2. **High urgency** (< 6 hours) → Second
3. **Medium urgency** (< 24 hours) → Third
4. **Low urgency** (> 24 hours) → Fourth
5. **Expired items** → Last

**Impact:**
- Recipients see most urgent food first
- Reduces scrolling to find time-sensitive items
- Maximizes chance of claiming before expiration
- Minimizes food waste

### 5. Auto-Update Mechanism

**Real-Time Updates:**
```javascript
React.useEffect(() => {
  calculateUrgency();
  const interval = setInterval(calculateUrgency, 60000); // Every 60 seconds
  return () => clearInterval(interval);
}, [listing.expiration_date, listing.pickup_window_end, listing.perishability]);
```

**Benefits:**
- No page refresh needed
- Always accurate countdown
- Urgency levels update automatically
- Smooth transitions between urgency states

## User Experience Enhancements

### For Recipients
✅ **Immediate Visual Priority:**
- Red pulsing banners catch attention
- No need to calculate urgency manually
- Clear action prompts ("Claim now!")

✅ **Better Decision Making:**
- See exact time remaining
- Understand perishability impact
- Prioritize claims effectively

✅ **Reduced Waste:**
- Urgent items get claimed faster
- Less food expires unclaimed
- Better resource utilization

### For Donors
✅ **Faster Claims:**
- Urgent items more visible
- Higher claim rates for perishables
- Better donor satisfaction

✅ **Transparency:**
- Recipients understand freshness
- Builds trust in the platform
- Encourages quality donations

## Technical Implementation

### State Management
```javascript
const [timeRemaining, setTimeRemaining] = React.useState(null);
const [urgencyLevel, setUrgencyLevel] = React.useState(null);
```

### Calculation Function
```javascript
const calculateUrgency = () => {
  const expirationDate = listing.expiration_date || listing.pickup_window_end;
  const now = new Date();
  const expiry = new Date(expirationDate);
  const diffMs = expiry - now;
  const diffHours = diffMs / (1000 * 60 * 60);
  
  // Calculate display format
  // Determine urgency level
  // Update state
};
```

### Visual Components
```javascript
const getUrgencyBadge = () => {
  const badgeStyles = {
    critical: 'bg-red-600 text-white animate-pulse',
    high: 'bg-orange-500 text-white',
    medium: 'bg-yellow-500 text-white',
    low: 'bg-green-500 text-white',
    expired: 'bg-gray-600 text-white'
  };
  // Return styled badge
};
```

## Performance Considerations

### Optimization Strategies
1. **Memoization:** Only recalculate when dependencies change
2. **Interval Management:** Clean up intervals on unmount
3. **Efficient Sorting:** Single-pass urgency calculation
4. **Conditional Rendering:** Only show urgency for available items

### Memory Usage
- Minimal overhead (2 state variables per listing)
- Intervals cleared properly (no memory leaks)
- Efficient re-renders (60-second intervals)

## Accessibility

### Screen Reader Support
- Urgency levels communicated via text
- Time remaining announced
- Clear action prompts

### Visual Accessibility
- High contrast colors
- Large, readable countdown text
- Icon + text combination
- Animation can be disabled (respects `prefers-reduced-motion`)

## Future Enhancements

### Potential Improvements
1. **Push Notifications:**
   - Alert when favorited item becomes critical
   - Remind users of claimed items nearing expiration

2. **Predictive Analytics:**
   - Machine learning for optimal claim times
   - Historical data on successful claims

3. **Custom Urgency Thresholds:**
   - User preferences for notification triggers
   - Different urgency levels for different users

4. **Integration with Calendar:**
   - Add pickup reminders to calendar
   - Sync with Google Calendar/Outlook

5. **Batch Claiming:**
   - Suggest multiple urgent items in same area
   - Optimize pickup routes

## Testing Recommendations

### Manual Testing Checklist
- [ ] Verify countdown updates every minute
- [ ] Test all urgency levels (critical, high, medium, low)
- [ ] Confirm expired items show "EXPIRED"
- [ ] Check animation on critical items
- [ ] Verify sorting places urgent items first
- [ ] Test with different perishability levels
- [ ] Confirm timers work in both card and modal views
- [ ] Check mobile responsiveness

### Edge Cases
- [ ] Items expiring in < 1 minute
- [ ] Items with no expiration date
- [ ] Items already expired
- [ ] Timezone handling
- [ ] Date parsing errors
- [ ] Very long time periods (> 1 year)

## Files Modified

### Updated Files
- `components/ListingCard.js` - Added countdown timer and urgency badge
- `components/DetailedModal.js` - Added urgency banner and countdown
- `app.js` - Added urgency-based sorting logic

### New Code Additions
- 2 new state variables per component
- Urgency calculation function (~60 lines)
- Visual display functions (~40 lines)
- Sorting algorithm (~40 lines)
- Total: ~140 lines of new code

## Impact Metrics

### Expected Improvements
- **Claim Rate for Perishables:** +30-50%
- **Food Waste Reduction:** 20-30%
- **User Engagement:** +15-25%
- **Time to Claim (urgent items):** -40%

### Success Indicators
- Decrease in expired unclaimed listings
- Increase in claims within first hour of posting
- Higher user satisfaction scores
- More frequent app usage

## Conclusion

The urgency countdown system transforms the user experience by providing clear, actionable information about food freshness and availability. By combining visual urgency indicators, real-time countdowns, and intelligent sorting, we've created a system that:

1. **Reduces waste** by prioritizing soon-expiring items
2. **Improves UX** with clear visual hierarchy
3. **Increases efficiency** through automated sorting
4. **Builds trust** with transparent freshness information

This feature is particularly impactful for high-perishability items like prepared meals, fresh produce, and dairy products, which represent a significant portion of food donations. The real-time nature ensures recipients always have the most current information to make quick, informed decisions.
