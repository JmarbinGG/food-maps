# Food Maps - AI-Powered Food Distribution System

A comprehensive food distribution platform with AI-driven optimization, route planning, and consumption tracking.

## Features

- **AI-Powered Matching**: Intelligent food donation-recipient matching
- **Route Optimization**: Automated delivery route planning for volunteers  
- **Consumption Tracking**: Personal food consumption logging and analytics
- **Map Integration**: Interactive Mapbox-powered food discovery
- **Multi-Role Support**: Donors, recipients, volunteers, dispatchers

## Quick Start

### Frontend (Web App)
1. Open `index.html` in a web browser
2. Configure Mapbox token in `utils/mapbox.js`
3. Start exploring food listings and tracking consumption

### Backend (API Server)
1. Install dependencies: `cd backend && pip install -r requirements.txt`
2. (Optional) Start a DB. By default we use a local SQLite file at `project/food_maps.db`. To use Postgres/MySQL, set `DATABASE_URL`.
3. Run the API server from the `backend` folder: `uvicorn app:app --reload`
4. API available at `http://localhost:8000`

### Full Docker Setup
```bash
docker-compose up
```

## Environment Variables

```env
# Mapbox (optional, enables server-side geocoding on create/update)
MAPBOX_ACCESS_TOKEN=your_mapbox_token

# Database. Defaults to SQLite at project/food_maps.db if not set.
DATABASE_URL=sqlite:///../food_maps.db

# JWT secret for auth tokens
JWT_SECRET=your_secret_key
```

## API additions (Claiming, Contacts, Phone)

- Listings
	- GET `/api/listings/get?include_claimed_for_me=true` — returns available listings; when authenticated, optionally includes claimed listings relevant to the current user (donor or recipient).
	- PATCH `/api/listings/get/{id}` — claim a listing (requires recipient auth and a saved phone number).
	- GET `/api/listings/user-details/{id}` — for a claimed listing, returns counterparty name/phone (recipient sees donor; donor sees recipient). Unclaimed or missing users return empty contact.

- User
	- GET `/api/user/me` — returns the authenticated user profile.
	- PUT `/api/user/phone` — saves/updates the authenticated user's phone.

Notes
- Creating or claiming a listing requires the user to have a valid phone number on file.
- A lightweight startup migration adds `recipient_id` and `claimed_at` columns to `food_resources` when missing (SQLite/Postgres/MySQL best-effort).

## Tech Stack

- **Frontend**: React, TailwindCSS, Mapbox GL JS
- **Backend**: FastAPI, PostgreSQL, SQLAlchemy
- **AI**: Multi-agent optimization system
- **Maps**: Mapbox APIs (Geocoding, Routing, Optimization)

## Usage

1. **Donors**: Quick 60-second food sharing
2. **Recipients**: Request help with automatic matching
3. **Volunteers**: Optimized delivery routes
4. **Everyone**: Track food consumption and waste

Last updated: October 2025