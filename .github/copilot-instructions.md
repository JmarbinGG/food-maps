# Food Maps - AI Coding Agent Instructions

## Project Overview
Food Maps is a food distribution platform connecting donors, recipients, volunteers, and dispatchers to reduce food waste. It's a **monolithic web app** with a FastAPI backend serving both API endpoints and static HTML files, and a React-based frontend using Babel for in-browser JSX transformation (no build step).

**Core Mission**: 60-second food sharing with safety features, dietary matching, scheduled donations, and trust scoring.

## Architecture & File Structure

### Frontend: Multi-App HTML Pages (No Build Step)
- **Three independent React applications**:
  - `landing.html` → `landing-app.js` (public marketing page)
  - `index.html` → `app.js` (main authenticated app: map, listings, profiles, claims)
  - `dispatch.html` → `dispatch-app.js` (logistics/driver coordination)
  
- **React via Babel Standalone**: Uses `<script src="babel.min.js">` + `<script type="text/babel">` tags - no webpack/vite
- **Component loading order matters**: In HTML, load utilities (`utils/*.js`) FIRST, then components (`components/*.js`), then main app script last
  - Example from `index.html`: `utils/mapbox.js` → `components/Header.js` → `app.js`
- **Styling**: TailwindCSS via CDN (`<script src="https://cdn.tailwindcss.com">`) - no build step
- **Map integration**: Mapbox GL JS v2.15.0 via CDN, token set in `utils/mapbox.js` as `window.MAPBOX_ACCESS_TOKEN`

### Backend: FastAPI Monolith (`/backend/app.py`, 3565 lines)
- **Dual-purpose server**: Serves HTML files via `HTMLResponse` AND provides REST API
  - `@app.get("/")` reads `landing.html` from project root
  - `@app.get("/api/listings/get")` returns JSON listings
  
- **Database-first design**: SQLAlchemy models (`models.py`) define schema, Pydantic schemas (`schemas.py`) validate API requests
  - Models include: `User`, `FoodResource`, `DistributionCenter`, `Message`, `DonationSchedule`, `SafetyReport`, `Feedback`
  - Enums: `UserRole`, `FoodCategory`, `PerishabilityLevel`, `RecurrenceFrequency`, `VerificationStatus`

- **Authentication**: JWT tokens via `pyjwt`, issued in `POST /api/user/login`, validated via `verify_token()` dependency
  - Tokens expire in 24h, stored in `localStorage.getItem('auth_token')`
  - Two security patterns: `HTTPBearer` (required) vs `optional_security` (enhances results if present)

- **Startup migrations** (`@app.on_event("startup")`): Best-effort ALTER TABLE for missing columns (e.g., `recipient_id`, `claimed_at`)
  - Handles SQLite/Postgres/MySQL differences gracefully - errors are logged, not fatal

### Database Flexibility
- **Configurable SQL backend** via `DATABASE_URL`:
  - SQLite (default): `sqlite:///../food_maps.db` - single file, no server
  - PostgreSQL: `postgresql://user:pass@host/db` - recommended for production
  - MySQL: `mysql://user:pass@host/db` - current deployment uses MySQL
  
- **Key tables**:
  - `users`: Multi-role (donor/recipient/volunteer/dispatcher/admin), includes trust scoring, dietary preferences, verification status
  - `food_resources`: Listings with claiming workflow, photo verification, urgency scoring
  - `donation_schedules`: Recurring donations with frequencies (daily/weekly/monthly/custom)
  - `messages`: In-platform messaging between users
  - `safety_reports`: Community safety incident reporting

## Critical Developer Workflows

### Running the Application

**Development (local backend + served frontend)**:
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
# Opens API + serves HTML at http://localhost:8000
```

**Production (systemd service on Linux)**:
```bash
sudo systemctl start foodmaps    # Uses foodmaps.service + backend/start_server.sh
sudo systemctl status foodmaps   # Check health
sudo journalctl -u foodmaps -f   # View logs
# Auto-restarts on crash, starts on boot, runs 4 workers
```

**Docker (full stack)**:
```bash
docker-compose up  # PostgreSQL + Redis + API on port 8000
```

**Environment Variables** (`.env` in project root):
```env
DATABASE_URL=mysql://user:pass@host/food_maps  # or sqlite:// or postgresql://
JWT_SECRET=your-secret-key
MAPBOX_ACCESS_TOKEN=pk.xxx          # Server-side geocoding for listings
TWILIO_ACCOUNT_SID=ACxxx            # SMS for claim confirmations
TWILIO_AUTH_TOKEN=xxx               # (falls back to console logs if missing)
TWILIO_PHONE_NUMBER=+1234567890
EMAIL_PASSWORD=xxx                  # SMTP for password reset emails
```

### Key API Endpoints & Patterns

**Listings** (`/api/listings/get`):
- Returns ALL listings, frontend filters by role (no backend filtering by user type)
- Unauthenticated: only `status=available`
- Recipients: available + their claimed listings
- Donors: all their own listings (available/claimed/expired)
- Uses `serialize_listing()` helper that conditionally includes contact info

**Claiming Workflow** (`PATCH /api/listings/get/{id}`):
1. Requires recipient auth + phone on file (frontend prompts via `requestPhone()` modal if missing)
2. Sets `recipient_id`, `status='claimed'`, `claimed_at=now()`
3. Sends SMS confirmation via Twilio (or logs to console if credentials missing)
4. Returns updated listing with donor contact info now visible

**User Management**:
- `POST /api/user/create` - signup (returns JWT)
- `POST /api/user/login` - login (returns JWT + user object)
- `GET /api/user/me` - current user profile
- `PUT /api/user/phone` - save/update phone (required before claiming)
- `PUT /api/user/profile` - update dietary preferences, address, etc.

**Admin Endpoints** (require `verify_admin()` dependency):
- `POST /api/admin/make-admin` - promote user to admin role
- `GET /api/admin/messages` - view all platform messages
- Admin panel UI at `admin.html`

### Frontend State Management

**No framework state management**: All state lives in top-level `App()` component in `app.js`, passed to children via props
- Example: `user`, `listings`, `showAuthModal`, `currentView`, `filters`

**LocalStorage patterns**:
- `auth_token`: JWT for API requests (set on login, cleared on logout)
- `current_user`: JSON-serialized user object (hydrated on mount, updated on profile changes)
- `tutorial_completed`: Boolean flag to track first-time user onboarding

**Phone requirement pattern** (unique to this codebase):
```javascript
const requestPhone = React.useCallback(() => {
  return new Promise((resolve) => {
    phoneResolveRef.current = resolve;
    setPhoneModalOpen(true);  // Shows PhoneModal.js component
  });
}, []);

// Usage before claiming:
const needsPhone = !user.phone;
if (needsPhone) await requestPhone();
```

## Project-Specific Conventions

### Contact Privacy by Claim Status
**Critical pattern**: Donor/recipient contact info (phone, full address) ONLY exposed after claim.
```python
# In serialize_listing():
if include_donor_contact or item.status == 'claimed':
    donor_payload = serialize_user(item.donor)  # Full contact
else:
    donor_payload = {"id": item.donor.id}      # ID only
```
**Why**: Prevents spam/harassment, encourages use of in-platform messaging until committed.

### Error Handling Philosophy
- **Best-effort operations**: Startup migrations, geocoding, SMS all use try/except with `print()` logging
  - Example: Missing Twilio → logs "⚠️ Twilio not configured" instead of crashing
- **Graceful degradation**: Features like SMS confirmations fallback to console logs if credentials missing
- **No exceptions for HTTP responses**: Use `raise HTTPException(status_code=..., detail=...)` pattern

### Geocoding Strategy (avoid rate limits)
- **Frontend-first**: `CreateListing.js` uses Mapbox Autofill to capture coordinates before submission
- **Backend fallback**: If listing has no `coords_lat/lng`, `update_listing()` calls Mapbox Geocoding API
- **Rate limit awareness**: Server-side geocoding consumes API quota, prefer frontend capture

### Password Security
- **Current**: Passlib with argon2/bcrypt via `pwd_context.hash()` and `pwd_context.verify()`
- **Legacy**: Some old code may have SHA-256 hashing - migrate to passlib when found

### Enum Serialization Pattern
SQLAlchemy enums must use `.value` when converting to JSON:
```python
# CORRECT:
"category": item.category.value if item.category else None

# WRONG (returns enum object, not serializable):
"category": item.category
```

## Feature Highlights (Recent Implementations)

**Dietary Matching** (`DIETARY_NEEDS_IMPLEMENTATION.md`):
- User model has `dietary_restrictions`, `allergies`, `household_size`, `preferred_categories`
- `GET /api/listings/recommended` returns personalized matches (allergen filtering, distance, category)
- UI: `DietaryPreferences.js` component with multi-select buttons

**Urgency Countdown** (`URGENCY_COUNTDOWN_IMPLEMENTATION.md`):
- 4-tier urgency: 🚨 Critical (<2h), ⚠️ High (<6h), ⏰ Medium (<24h), ✓ Low (>24h)
- `ListingCard.js` shows countdown timers updated every 60s, pulsing animation for critical
- Listings auto-sorted by urgency on frontend

**Pickup Verification** (`PICKUP_VERIFICATION_IMPLEMENTATION.md`):
- Before/after photo workflow using HTML5 MediaDevices API (camera access)
- Status flow: available → claimed → before_verified → completed
- Photos stored in `FoodResource.before_photo_url` / `after_photo_url`

**Safety & Trust** (`SAFETY_TRUST_IMPLEMENTATION.md`):
- Trust score system (0-100): +10 complete profile, +5 photo verification, +3 positive feedback
- Email/phone verification via `GET /api/user/verify-email/{token}`, SMS codes
- Safety reporting: `POST /api/safety/report` for incidents

**Donation Scheduler** (`backend/models.py` - `DonationSchedule` model):
- Recurring donations: daily/weekly/biweekly/monthly/custom intervals
- `DonationReminder` model tracks upcoming notifications
- UI: `DonationScheduler.js` component

**Messaging System** (`MESSAGING_FEATURE.md`):
- In-platform messaging via `Message` model, avoids sharing personal contact info
- `POST /api/messages/send`, `GET /api/messages/conversation/{user1}/{user2}`
- UI: `MessageSupport.js` component

## Common Pitfalls & Solutions

1. **React component not rendering**:
   - **Cause**: `<script type="text/babel" src="...">` loading order in HTML
   - **Fix**: Load dependencies BEFORE components (e.g., `Header.js` needs `window.MAPBOX_ACCESS_TOKEN` from `utils/mapbox.js`)

2. **JWT 401 errors after 24h**:
   - **Cause**: Tokens expire, frontend doesn't refresh
   - **Fix**: Catch 401s, clear `localStorage.auth_token`, redirect to login

3. **Database "column not found" errors**:
   - **Cause**: Schema drift between `models.py` and actual DB
   - **Fix**: Add ALTER TABLE to `@app.on_event("startup")` with try/except

4. **CORS errors**:
   - **Fix**: Backend has `allow_origins=["*"]`, ensure client sends `Content-Type: application/json`

5. **Mapbox map not loading**:
   - **Check**: `window.MAPBOX_ACCESS_TOKEN` set in `utils/mapbox.js`, valid `pk.` or `sk.` token
   - **Check**: Mapbox GL JS loaded via CDN before components that use it

6. **SMS not sending**:
   - **Non-issue**: Falls back to console logs if `TWILIO_ACCOUNT_SID` missing (check server logs)

## Testing & Debugging

- **No automated tests**: Manual testing via browser, Postman, curl
- **Debug pages**: `test_profile.html`, `debug_profile.html`, `feedback_test.html` for isolated component testing
- **Health checks**:
  - `GET /api/health` → `{"status": "healthy"}`
  - `GET /api/dbtest` → Tests database connection
- **Error boundaries**: `ErrorBoundary` component in `app.js` catches React errors
- **Server logs**: `sudo journalctl -u foodmaps -f` (systemd) or check `backend/server.log`

## External Dependencies (All CDN-loaded)

- **Mapbox GL JS** v2.15.0: Map rendering, geocoding, directions
- **React** 18: UI framework (via `react.production.min.js`)
- **Babel Standalone** 7: In-browser JSX transformation
- **TailwindCSS** 3: Utility-first CSS (via CDN, no config file)
- **Twilio REST API**: SMS confirmations (Python SDK in backend)
- **SMTP** (Python `smtplib`): Password reset emails

## When Making Changes

**Adding API endpoints**:
1. Define Pydantic schema in `schemas.py` (request/response validation)
2. Add SQLAlchemy model to `models.py` if new table needed
3. Create endpoint in `app.py` using `@app.post/get/put/delete` decorators
4. Use `serialize_listing()` / `serialize_user()` helpers for responses
5. Add to API client in `utils/api.js` for frontend consumption

**New React components**:
1. Create file in `/components/ComponentName.js`
2. Add `<script type="text/babel" src="components/ComponentName.js">` to HTML BEFORE app script
3. Use component in parent via `<ComponentName prop={value} />`

**Database schema changes**:
1. Update `models.py` (add Column to existing model or new model)
2. Update matching Pydantic schema in `schemas.py`
3. Add migration to `startup_event()` in `app.py`:
   ```python
   try:
       conn.execute(text("ALTER TABLE table_name ADD COLUMN new_col TYPE"))
   except Exception:
       pass  # Already exists
   ```

**Authentication changes**:
- Modify JWT payload in `POST /api/user/login` endpoint
- Update `verify_token()` or `verify_admin()` dependency if new claims needed
- Frontend: Update `localStorage.current_user` hydration logic

## Production Deployment Notes

- **Server**: Runs via systemd service (`foodmaps.service`) with 4 Uvicorn workers
- **Auto-restart**: Service configured with `Restart=always`, `RestartSec=5s`
- **Database**: Currently MySQL in production (check `DATABASE_URL` env var)
- **Static assets**: Served directly by FastAPI (no nginx/CDN), includes HTML/JS/CSS/images
- **Logs**: `sudo journalctl -u foodmaps -f` for systemd, or `backend/server.log` for script-based runs
- **Monitoring**: Check `GET /api/health` endpoint for uptime checks
