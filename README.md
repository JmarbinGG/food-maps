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
2. Start database: `docker-compose up postgres`
3. Run API server: `uvicorn main:app --reload`
4. API available at `http://localhost:8000`

### Full Docker Setup
```bash
docker-compose up
```

## Environment Variables

```env
MAPBOX_ACCESS_TOKEN=your_mapbox_token
DATABASE_URL=postgresql://user:pass@localhost/food_maps
JWT_SECRET=your_secret_key
```

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

Last updated: January 2025