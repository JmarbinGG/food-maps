from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy import text
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional, List
from dotenv import load_dotenv
import jwt
import os
from passlib.context import CryptContext
from .schemas import FoodResourceResponse
from .models import Base, FoodResource, User, UserRole, FoodCategory, PerishabilityLevel


pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

app = FastAPI(title="Food Maps Agentic API", version="1.0.0")
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Serve static files at root paths for legacy HTML compatibility
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
#app.mount("/", StaticFiles(directory=PROJECT_ROOT), name="root")
security = HTTPBearer()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./food_maps.db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
# JWT settings
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
JWT_ALGORITHM = "HS256"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


import os
HTML_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

def get_html_content(filename):
    filepath = os.path.join(HTML_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

@app.get("/", response_class=HTMLResponse)
async def serve_landing():
    return get_html_content("landing.html")

@app.get("/index.html", response_class=HTMLResponse)
async def serve_index():
    return get_html_content("index.html")

@app.get("/privacy.html", response_class=HTMLResponse)
async def serve_privacy():
    return get_html_content("privacy.html")

@app.get("/dispatch.html", response_class=HTMLResponse)
async def serve_dispatch():
    return get_html_content("dispatch.html")

@app.get("/cookies.html", response_class=HTMLResponse)
async def serve_cookies():
    return get_html_content("cookies.html")

@app.get("/terms.html", response_class=HTMLResponse)
async def serve_terms():
    return get_html_content("terms.html")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

# Create tables
@app.on_event("startup")
async def startup_event():
     Base.metadata.create_all(bind=engine)

@app.get("/api/dbtest")
async def db_test():
    try:
        db = SessionLocal()
        # Try a simple query (works for any SQLAlchemy model, e.g., User)
        db.execute(text("SELECT 1"))
        db.close()
        return {"success": True, "message": "Database connection successful"}
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.get("/api/listings/get", response_model=List[FoodResourceResponse])
def get_listings(limit: int = 100, db: Session = Depends(get_db)):
    """
    Returns up to `limit` food resources from the database,
    including donor information.
    """
    listings = (
        db.query(FoodResource)
        .filter(FoodResource.status == "available")
        .order_by(FoodResource.created_at.desc())
        .limit(limit)
        .all()
    )

    # Make sure dondor info is loaded for response
    for listing in listings:
        _ = listing.donor  # SQLAlchemy lazy loading

    return listings


@app.put("/api/listings/get/{listing_id}")
async def update_listing(listing_id: int, request: Request, db: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Update a listing's editable fields. Attempts server-side geocoding if address is provided and coords missing."""
    try:
        item = db.query(FoodResource).filter(FoodResource.id == listing_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Listing not found")

        # Authorization: only the donor who created the listing can edit
        try:
            payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = str(payload.get("sub")) if payload else None
            if not user_id or str(item.donor_id) != user_id:
                raise HTTPException(status_code=403, detail="Not authorized to edit this listing")
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid or missing token")

        body = {}
        try:
            body = await request.json()
        except Exception:
            body = {}

        # Track whether address changed
        address_changed = False
        title = body.get('title') if 'title' in body else None
        desc = body.get('desc') if 'desc' in body else None
        category_val = body.get('category') if 'category' in body else None
        qty = body.get('qty') if 'qty' in body else None
        unit = body.get('unit') if 'unit' in body else None
        perishability_val = body.get('perishability') if 'perishability' in body else None
        pickup_start = body.get('pickup_start') if 'pickup_start' in body else None
        pickup_end = body.get('pickup_end') if 'pickup_end' in body else None
        status = body.get('status') if 'status' in body else None
        recipient_id = body.get('recipient_id') if 'recipient_id' in body else None
        address = body.get('address') if 'address' in body else None

        if title is not None:
            item.title = title
        if desc is not None:
            item.description = desc
        if category_val is not None:
            try:
                item.category = category_val
            except Exception:
                pass
        if qty is not None:
            try:
                item.qty = float(qty)
            except Exception:
                pass
        if unit is not None:
            item.unit = unit
        if perishability_val is not None:
            try:
                item.perishability = perishability_val
            except Exception:
                pass
        if pickup_start is not None:
            item.pickup_window_start = pickup_start
        if pickup_end is not None:
            item.pickup_window_end = pickup_end
        if status is not None:
            item.status = status
        if recipient_id is not None:
            item.recipient_id = recipient_id
        if address is not None and address != item.address:
            item.address = address
            address_changed = True

        # If coords missing or address changed, attempt geocoding
        try:
            if (item.coords_lat is None or item.coords_lng is None or address_changed) and item.address:
                MAPBOX_TOKEN = os.getenv("MAPBOX_TOKEN")
                if MAPBOX_TOKEN:
                    from urllib.parse import quote as urlquote
                    import httpx
                    geocode_url = "https://api.mapbox.com/geocoding/v5/mapbox.places/{}.json".format(urlquote(item.address))
                    params = {"access_token": MAPBOX_TOKEN, "limit": 1}
                    with httpx.Client(timeout=10.0) as client:
                        resp = client.get(geocode_url, params=params)
                        if resp.status_code == 200:
                            data = resp.json()
                            features = data.get("features") or []
                            if len(features) > 0:
                                center = features[0].get("center")
                                if center and len(center) >= 2:
                                    item.coords_lng = float(center[0])
                                    item.coords_lat = float(center[1])
        except Exception as ge:
            try:
                print(f"Geocoding error for address {item.address}: {ge}")
            except Exception:
                pass

        item.updated_at = datetime.utcnow()
        db.add(item)
        db.commit()
        db.refresh(item)

        return {"success": True, "listing": {
            "id": item.id,
            "donor_id": item.donor_id,
            "title": item.title,
            "description": item.description,
            "category": item.category.name if item.category else None,
            "qty": item.qty,
            "unit": item.unit,
            "perishability": item.perishability.name if item.perishability else None,
            "address": item.address,
            "coords_lat": item.coords_lat,
            "coords_lng": item.coords_lng,
            "pickup_window_start": item.pickup_window_start.isoformat() if item.pickup_window_start else None,
            "pickup_window_end": item.pickup_window_end.isoformat() if item.pickup_window_end else None,
            "status": item.status,
            "created_at": item.created_at.isoformat() if item.created_at else None,
            "updated_at": item.updated_at.isoformat() if item.updated_at else None
        }}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/user/create")
async def create_user(name: str, email: str, password: str, role: UserRole, db: Session = Depends(get_db)):
    print("login attempt: email:", email, " pw:", password, " len:", len(password.encode('utf-8')), "repr", repr(password))
    try:    
        user = User(email = email, name = name, password_hash = password, role=role, created_at = datetime.utcnow())
        query = db.query(User).filter(User.email == email)
        existing_user = query.first()
        print("login attempt: email:", email, " pw:", password, " len:", len(password.encode('utf-8')), "repr", repr(password))
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        else:
            user.password_hash = pwd_context.hash(password)
        db.add(user)
        db.commit()
        db.close()
        return{"success": True, "message": "written successfully"}
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/user/login")
async def login_user(email: str, password: str, db: Session = Depends(get_db)):
    try:
        query = db.query(User).filter(User.email == email)
        user = query.first()
        if user and pwd_context.verify(password, user.password_hash):
            payload = {
                "sub": str(user.id),
                "name": user.name,
                "role": user.role.value,
                "exp": datetime.utcnow() + timedelta(hours=12)  # Token valid for 12 hours
            }
            token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
            return {"success": True, "token": token}
        else:
            raise HTTPException(status_code=401, detail="Invalid email or password")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Invalid Email or password")



@app.post("/api/listings/create")
async def create_listing(donor_id: int, title: str, desc: str, category: FoodCategory, qty: int, unit: str, perishability: PerishabilityLevel, address: str,  pickup_start: str, pickup_end: str, est_w: int = 0, db: Session = Depends(get_db)):
    """
    Create a FoodResource and attempt server-side geocoding using Mapbox when an address is provided
    and coords are not supplied. Returns the created listing as JSON.
    """
    try:
        item = FoodResource(
            donor_id=donor_id,
            title=title,
            description=desc,
            category=category,
            qty=qty,
            unit=unit,
            perishability=perishability,
            pickup_window_start=pickup_start,
            pickup_window_end=pickup_end,
            address=address,
            created_at=datetime.utcnow()
        )

        # If coords are missing and address provided, attempt Mapbox geocoding
        try:
            if (item.coords_lat is None or item.coords_lng is None) and item.address:
                MAPBOX_TOKEN = os.getenv('MAPBOX_TOKEN')
                if MAPBOX_TOKEN:
                    from urllib.parse import quote as urlquote
                    import httpx
                    geocode_url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{urlquote(item.address)}.json"
                    params = {"access_token": MAPBOX_TOKEN, "limit": 1}
                    with httpx.Client(timeout=10.0) as client:
                        resp = client.get(geocode_url, params=params)
                        if resp.status_code == 200:
                            data = resp.json()
                            features = data.get('features') or []
                            if len(features) > 0:
                                center = features[0].get('center')
                                if center and len(center) >= 2:
                                    # Mapbox returns [lng, lat]
                                    item.coords_lng = float(center[0])
                                    item.coords_lat = float(center[1])
                else:
                    # No MAPBOX token configured - skip geocoding
                    pass
        except Exception as ge:
            # Don't fail the request if geocoding fails; log and continue
            try:
                print(f"Geocoding error for address {item.address}: {ge}")
            except Exception:
                pass

        db.add(item)
        db.commit()
        db.refresh(item)
        # Return the created item as a simple dict
        return {
            "success": True,
            "listing": {
                "id": item.id,
                "donor_id": item.donor_id,
                "title": item.title,
                "description": item.description,
                "category": item.category.name if item.category else None,
                "qty": item.qty,
                "unit": item.unit,
                "perishability": item.perishability.name if item.perishability else None,
                "address": item.address,
                "coords_lat": item.coords_lat,
                "coords_lng": item.coords_lng,
                "pickup_window_start": item.pickup_window_start.isoformat() if item.pickup_window_start else None,
                "pickup_window_end": item.pickup_window_end.isoformat() if item.pickup_window_end else None,
                "status": item.status,
                "created_at": item.created_at.isoformat() if item.created_at else None
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

