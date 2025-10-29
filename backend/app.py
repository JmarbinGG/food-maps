from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, Enum
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
# Optional bearer for endpoints where auth is not required but can tailor results
optional_security = HTTPBearer(auto_error=False)

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
# NOTE: Use Base imported from models; do not re-declare another Base here
# JWT settings
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
JWT_ALGORITHM = "HS256"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -----------------------------
# Serialization helpers
# -----------------------------

def serialize_user(user: Optional[User]) -> Optional[dict]:
    """Return a safe, minimal representation of a User for client responses."""
    if not user:
        return None
    try:
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role.value if getattr(user, "role", None) else None,
            "phone": getattr(user, "phone", None),
            "address": getattr(user, "address", None),
            "coords_lat": getattr(user, "coords_lat", None),
            "coords_lng": getattr(user, "coords_lng", None),
            "created_at": user.created_at.isoformat() if getattr(user, "created_at", None) else None,
        }
    except Exception:
        # Best-effort fallback to avoid breaking responses
        return {"id": getattr(user, "id", None), "name": getattr(user, "name", None)}


def serialize_listing(item: FoodResource, include_donor: bool = True) -> dict:
    """Return a safe, client-friendly listing dict. Converts enums/datetimes and includes donor if available."""
    donor_payload = serialize_user(item.donor) if (include_donor and getattr(item, "donor", None)) else None
    # Enum helpers
    def ev(v):
        try:
            return v.value if v is not None else None
        except Exception:
            # Already a string or unexpected type
            return v

    return {
        "id": item.id,
        "donor_id": getattr(item, "donor_id", None),
        "recipient_id": getattr(item, "recipient_id", None),
        "title": getattr(item, "title", None),
        "description": getattr(item, "description", None),
        "category": ev(getattr(item, "category", None)),
        "qty": getattr(item, "qty", None),
        "unit": getattr(item, "unit", None),
        "perishability": ev(getattr(item, "perishability", None)),
        "address": getattr(item, "address", None),
        "coords_lat": getattr(item, "coords_lat", None),
        "coords_lng": getattr(item, "coords_lng", None),
        "pickup_window_start": item.pickup_window_start.isoformat() if getattr(item, "pickup_window_start", None) else None,
        "pickup_window_end": item.pickup_window_end.isoformat() if getattr(item, "pickup_window_end", None) else None,
        "status": getattr(item, "status", None),
        "claimed_at": item.claimed_at.isoformat() if getattr(item, "claimed_at", None) else None,
        "urgency_score": getattr(item, "urgency_score", 0) or 0,
        "created_at": item.created_at.isoformat() if getattr(item, "created_at", None) else None,
        "updated_at": item.updated_at.isoformat() if getattr(item, "updated_at", None) else None,
        "donor": donor_payload,
    }

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

# -----------------------------
# User profile helper endpoints
# -----------------------------

@app.get("/api/user/me")
async def get_me(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = int(payload.get("sub")) if payload and payload.get("sub") is not None else None
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role.value if user.role else None,
            "phone": user.phone,
            "address": user.address,
            "coords_lat": user.coords_lat,
            "coords_lng": user.coords_lng,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/user/phone")
async def update_phone(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = int(payload.get("sub")) if payload and payload.get("sub") is not None else None
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        body = await request.json()
        phone = (body or {}).get("phone") if isinstance(body, dict) else None
        if not phone or not isinstance(phone, str) or len(phone.strip()) < 7:
            raise HTTPException(status_code=422, detail="Please provide a valid phone number")
        phone = phone.strip()
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.phone = phone
        db.add(user)
        db.commit()
        return {"success": True, "phone": phone}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Create tables
@app.on_event("startup")
async def startup_event():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    # Lightweight, best-effort migration: add missing columns used by new features
    # This primarily targets SQLite; no-op on other engines if the statements fail
    try:
        with engine.connect() as conn:
            dialect_name = conn.engine.dialect.name
            if dialect_name == "sqlite":
                # Inspect existing columns
                res = conn.execute(text("PRAGMA table_info(food_resources)"))
                cols = {row[1] for row in res.fetchall()}
                if "recipient_id" not in cols:
                    conn.execute(text("ALTER TABLE food_resources ADD COLUMN recipient_id INTEGER"))
                if "claimed_at" not in cols:
                    conn.execute(text("ALTER TABLE food_resources ADD COLUMN claimed_at DATETIME"))
            elif dialect_name in ("mysql", "mariadb"):
                # MySQL/MariaDB conditional adds
                conn.execute(text(
                    """
                    ALTER TABLE food_resources
                    ADD COLUMN IF NOT EXISTS recipient_id INT NULL,
                    ADD COLUMN IF NOT EXISTS claimed_at DATETIME NULL
                    """
                ))
            elif dialect_name == "postgresql":
                conn.execute(text(
                    """
                    DO $$ BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name='food_resources' AND column_name='recipient_id'
                    ) THEN
                        ALTER TABLE food_resources ADD COLUMN recipient_id INTEGER NULL;
                    END IF;
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name='food_resources' AND column_name='claimed_at'
                    ) THEN
                        ALTER TABLE food_resources ADD COLUMN claimed_at TIMESTAMP NULL;
                    END IF;
                    END $$;
                    """
                ))
    except Exception as e:
        try:
            print(f"Startup migration warning: {e}")
        except Exception:
            pass

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
def get_listings(
    limit: int = 100,
    include_claimed_for_me: bool = False,
    db: Session = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security)
):
    """
    Returns up to `limit` food resources.
    By default returns only available listings.
    When `include_claimed_for_me=true` and a valid JWT is provided:
      - If user is a donor: also include listings with status=='claimed' owned by this donor
      - If user is a recipient: also include listings with status=='claimed' claimed by this recipient
    """
    try:
        # Base: available items
        # Base: only available items for general audience
        available_q = (
            db.query(FoodResource)
            .filter(FoodResource.status == "available")
            .order_by(FoodResource.created_at.desc())
            .limit(limit)
        )
        available_list = available_q.all()

        # Optionally include claimed-for-me items
        claimed_list = []
        user_id = None
        user_role = None
        if include_claimed_for_me and credentials is not None:
            try:
                payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
                user_id = str(payload.get("sub")) if payload else None
                user_role = str(payload.get("role") or "").lower() if payload else None
                print("Decoded JWT payload:", payload)
            except Exception as e:
                print(f"JWT decode error: {e}")
                # Invalid token - ignore claimed inclusion
                user_id = None
                user_role = None

        print("user_id:", user_id, " user_role:", user_role)
        if include_claimed_for_me and user_id:
            if user_role == "donor":
                claimed_q = (
                    db.query(FoodResource)
                    .filter(FoodResource.status == "claimed", FoodResource.donor_id == int(user_id))
                    .order_by(FoodResource.status, FoodResource.created_at.desc())
                    .limit(limit)
                )
                claimed_list = claimed_q.all()
            elif user_role == "recipient":
                # If recipient_id column exists, include claimed-by-me items
                # Guard against older databases without the column
                try:
                    claimed_q = (
                        db.query(FoodResource)
                        .filter(FoodResource.status == "claimed", FoodResource.recipient_id == int(user_id))
                        .order_by(FoodResource.created_at.desc())
                        .limit(limit)
                    )
                    claimed_list = claimed_q.all()
                except Exception:
                    claimed_list = []

        # Merge (avoid duplicates by id)
        by_id = {}
        for item in available_list:
            by_id[item.id] = item
        for item in claimed_list:
            by_id[item.id] = item

        listings = list(by_id.values())

        # Ensure donor relationship is loaded to satisfy response_model
        for listing in listings:
            _ = listing.donor

        return listings
    except Exception as e:
        # Inline logging for easier diagnostics in environments without log collection
        try:
            print(f"/api/listings/get error: {e}")
        except Exception:
            pass
        raise HTTPException(status_code=500, detail="Failed to fetch listings")

@app.delete("/api/listings/get/{listing_id}")
async def delete_listing(listing_id: int, db: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Delete a listing. Only the donor who created the listing can delete it."""
    try:
        item = db.query(FoodResource).filter(FoodResource.id == listing_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Listing not found")

        # Authorization: only the donor who created the listing can delete
        try:
            payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = str(payload.get("sub")) if payload else None
            if not user_id or str(item.donor_id) != user_id:
                raise HTTPException(status_code=403, detail="Not authorized to delete this listing")
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid or missing token")

        db.delete(item)
        db.commit()

        return {"success": True, "message": "Listing deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
                    params = {"access_token": MAPBOX_TOKEN, "limit": 1, "type": "address"}
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

        return {"success": True, "listing": serialize_listing(item)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/user/create")
async def create_user(name: str, email: str, password: str, role: UserRole, db: Session = Depends(get_db)):
    print("login attempt: email:", email, " pw:", password, " len:", len(password.encode('utf-8')), "repr", repr(password))
    try:    
        if role == "volunteer" or role == "admin":
            raise HTTPException(status_code=400, detail="Invalid role")
        
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


@app.patch("/api/listings/get/{listing_id}")
async def claim_listing(listing_id: int, recipient_id: int, db: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Claim a listing by setting its recipient_id and updating status to 'claimed'."""
    try:
        item = db.query(FoodResource).filter(FoodResource.id == listing_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Listing not found")

        # Authorization: any authenticated user can claim
        try:
            payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = str(payload.get("sub")) if payload else None
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid or missing token")
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid or missing token")

        # Enforce phone presence for claimant
        claimant = db.query(User).filter(User.id == int(user_id)).first()
        if not claimant or not claimant.phone or len(str(claimant.phone).strip()) < 7:
            raise HTTPException(status_code=400, detail="A valid phone number is required to claim food")

        # Use token subject as recipient to prevent spoofing
        item.recipient_id = int(user_id)
        item.status = "claimed"
        item.claimed_at = datetime.utcnow()
        db.add(item)
        db.commit()
        db.refresh(item)

        return {"success": True, "message": "Listing claimed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/listings/create")
async def create_listing(donor_id: int, title: str, desc: str, category: FoodCategory, qty: int, unit: str, perishability: PerishabilityLevel, address: str,  pickup_start: str, pickup_end: str, est_w: int = 0, db: Session = Depends(get_db)):
    """
    Create a FoodResource and attempt server-side geocoding using Mapbox when an address is provided
    and coords are not supplied. Returns the created listing as JSON.
    """
    try:
        # Enforce that donor has a phone number on file
        donor = db.query(User).filter(User.id == int(donor_id)).first()
        if not donor:
            raise HTTPException(status_code=404, detail="Donor not found")
        if not donor.phone or len(str(donor.phone).strip()) < 7:
            raise HTTPException(status_code=400, detail="A valid phone number is required to create a listing")

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
        # Return the created item
        return {"success": True, "listing": serialize_listing(item)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/listings/user-details/{listing_id}")
async def get_user_details(
    listing_id: int,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Return the counterparty contact info for a claimed listing:
    - If requester is the recipient who claimed the listing, return the donor's name/phone.
    - If requester is the donor who created the listing, return the recipient's name/phone.
    """
    try:
        try:
            payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_role = str(payload.get("role") or "").lower() if payload else None
            user_id = int(payload.get("sub")) if payload and payload.get("sub") is not None else None
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid or missing token")

        if user_role not in ("donor", "recipient"):
            raise HTTPException(status_code=403, detail="Not authorized")

        listing = db.query(FoodResource).filter(FoodResource.id == listing_id).first()
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")

        # Recipient can only see donor for listings they claimed
        if user_role == "recipient":
            if listing.recipient_id is None or listing.recipient_id != user_id:
                raise HTTPException(status_code=403, detail="Not authorized for this listing")
            donor = db.query(User).filter(User.id == listing.donor_id).first()
            if not donor:
                # Return empty contact gracefully if donor record is missing
                return {"name": "", "phone": ""}
            return {"name": donor.name or "", "phone": donor.phone or ""}

        # Donor can only see recipient for their own listing
        if listing.donor_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized for this listing")
        # If not yet claimed or recipient missing, return empty contact gracefully
        if listing.recipient_id is None:
            return {"name": "", "phone": ""}
        recipient = db.query(User).filter(User.id == listing.recipient_id).first()
        if not recipient:
            return {"name": "", "phone": ""}
        return {"name": recipient.name or "", "phone": recipient.phone or ""}

    except HTTPException:
        raise
    except Exception as e:
        try:
            print(f"/api/listings/user-details error: {e}")
        except Exception:
            pass
        raise HTTPException(status_code=500, detail="Failed to fetch user details")