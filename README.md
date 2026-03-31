# Food Maps

![Food Maps Social Banner](https://socialify.git.ci/JmarbinGG/food-maps/image?font=Inter&logo=https%3A%2F%2Fapp.trickle.so%2Fstorage%2Fpublic%2Fimages%2Fusr_0b8d952560000001%2F6d7a1e40-1a21-418a-9d29-070bb27350cf.png&name=1&pattern=Transparent&stargazers=1&theme=Dark)
![Status](https://img.shields.io/badge/status-pre--launch-orange)
![Development](https://img.shields.io/badge/development-active-blue)

Professional food recovery and distribution platform that connects donors, recipients, and volunteers through an interactive map, role-based workflows, and automation-friendly APIs.

## Screenshot


![Food Maps Screenshot](https://i.imgur.com/UqcIR6e.jpeg)


## Table of Contents

- Overview
- Key Capabilities
- Architecture
- Tech Stack
- Project Structure
- Getting Started
- Environment Variables
- API Highlights
- Development Notes
- Troubleshooting
- Roadmap

## Overview

Food Maps helps communities reduce food waste by making food donation discovery and pickup coordination simple. The platform supports multiple user roles and includes map-based discovery, listing workflows, claim flows, and operational features for partner organizations.

## Key Capabilities

- Interactive map-based food listing discovery
- Role-aware experiences for donors, recipients, volunteers, and admins
- Listing lifecycle support (available, claimed, pending confirmation, completed, expired)
- Contact exchange for eligible claimed listings
- Favorite locations and listing workflows
- Distribution center and inventory views
- Voice Search experience (In Progress)
- AI-powered assistant and optimization modules (In Progress)

## Architecture

Food Maps is split into two main layers:

- Frontend: Static HTML + React components loaded in-browser
- Backend: FastAPI service with SQLAlchemy models and JWT-based auth

High-level flow:

1. User opens the web app.
2. Frontend requests listings and related data from API endpoints.
3. Backend reads/writes listing, claim, and user state in the database.
4. Map and detail views render dynamically from API responses.

## Tech Stack

Frontend

- React 18 (UMD + Babel setup)
- Tailwind CSS
- Mapbox GL JS

Backend

- FastAPI
- Uvicorn
- SQLAlchemy
- Pydantic
- JWT / python-jose

Data and Services

- SQLite (default local dev path) or Postgres/MySQL via DATABASE_URL
- Optional Twilio integration for SMS features

## Project Structure

```text
food-maps/
  index.html                # Main web app shell
  app.js                    # Frontend app composition and view state
  components/               # React components (map, listings, modals, etc.)
  utils/                    # Frontend utilities and API helpers
  backend/
    app.py                  # FastAPI entry module
    models.py               # SQLAlchemy models
    schemas.py              # Pydantic schemas
    auth.py                 # Auth and JWT helpers
    requirements.txt        # Backend dependencies
```

## Getting Started

### Prerequisites

- Python 3.10+
- pip
- Modern browser (Chrome, Edge, Firefox, Safari)

### 1) Install backend dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2) Configure environment

Create a .env file in backend/ or export env vars in your shell.

Minimum recommended for local development:

```env
JWT_SECRET=change-me
DATABASE_URL=sqlite:///../food_maps.db
MAPBOX_ACCESS_TOKEN=your_mapbox_public_token
```

### 3) Run the API

From repository root:

```bash
python -m uvicorn backend.app:app --host 0.0.0.0 --port 8000 --reload
```

Or from backend/:

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### 4) Open the frontend

Open index.html in your browser.

If needed, serve static files with any local static server instead of opening directly.

## Environment Variables

Core

- JWT_SECRET: JWT signing secret (required)
- DATABASE_URL: DB connection string (optional; defaults to SQLite path)
- MAPBOX_ACCESS_TOKEN: enables map/geocoding behaviors

Optional / feature-specific

- Twilio-related variables for SMS features (if enabled)

## API Highlights

Authentication and user

- GET /api/user/me
- PUT /api/user/phone

Listings and claim flow

- GET /api/listings/get
- PATCH /api/listings/get/{id}   (claim path)
- GET /api/listings/user-details/{id}

Centers

- GET /api/centers
- GET /api/centers/{id}/inventory

## Development Notes

- Frontend currently uses script-based React component loading.
- Map rendering depends on Mapbox JS and token availability.
- App behavior is role-sensitive; test with multiple user roles.
- Keep user-facing status transitions consistent between backend and UI labels.

## Troubleshooting

Map not loading

- Verify MAPBOX_ACCESS_TOKEN is set and valid.
- Confirm Mapbox script and CSS load in the browser.
- Check browser devtools for network/CORS/script errors.

Backend import errors

- Ensure dependencies are installed from backend/requirements.txt.
- Confirm you run uvicorn from the expected working directory.

Database issues

- Validate DATABASE_URL format.
- If using SQLite, confirm write permissions for the project directory.

## Roadmap

- Complete Voice Search feature rollout (In Progress)
- Complete AI assistant and optimization enhancements (In Progress)
- Improve typed frontend build pipeline
- Expand observability and health dashboards
- Harden role-based e2e test coverage
- Improve deployment automation and secret management
