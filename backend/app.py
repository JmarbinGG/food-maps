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
import random
import string
from passlib.context import CryptContext
from backend.schemas import (
    FoodResourceResponse,
    DistributionCenterCreate,
    DistributionCenterResponse,
    DistributionCenterWithInventory,
    CenterInventoryResponse
)
from backend.models import (
    Base, FoodResource, User, UserRole, FoodCategory, PerishabilityLevel,
    DistributionCenter, CenterInventory
)
from threading import Timer
import smtplib
from email.mime.text import MIMEText
from twilio.rest import Client


pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")

# Helper function to generate unique referral codes
def generate_referral_code():
    """Generate a unique 8-character referral code"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

app = FastAPI(title="Food Maps Agentic API", version="1.0.0")
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Serve static files at root paths for legacy HTML compatibility
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
#app.mount("/", StaticFiles(directory=PROJECT_ROOT), name="root")
security = HTTPBearer()
# Optional bearer for endpoints where auth is not required but can tailor results
optional_security = HTTPBearer(auto_error=False)

#email
sender = "noreply.foodmaps@gmail.com"
password = os.getenv("EMAIL_PASSWORD")

# Twilio SMS configuration
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_KEY")  # Using TWILIO_KEY from .env
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER", "+18449464421")  # Default Twilio number




# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup - MySQL only
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is required")
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


def serialize_listing(item: FoodResource, include_donor: bool = True, include_donor_contact: bool = False) -> dict:
    """Return a safe, client-friendly listing dict. Converts enums/datetimes and includes donor if available."""
    # Only include full donor details if listing is claimed, otherwise just include basic info
    donor_payload = None
    if include_donor and getattr(item, "donor", None):
        if include_donor_contact or item.status == 'claimed':
            donor_payload = serialize_user(item.donor)
        else:
            # For non-claimed listings, only include donor ID, not contact info
            donor_payload = {"id": item.donor.id} if item.donor else None
    
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

def verify_admin(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """Verify user is authenticated and has admin role"""
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = int(payload.get("sub")) if payload and payload.get("sub") is not None else None
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user or user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Authorization error")


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

@app.get("/admin-referrals.html", response_class=HTMLResponse)
async def serve_admin_referrals():
    return get_html_content("admin-referrals.html")

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

@app.put("/api/user/profile")
async def update_profile(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = int(payload.get("sub")) if payload and payload.get("sub") is not None else None
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        body = await request.json()
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if 'name' in body:
            user.name = body['name']
        if 'email' in body:
            user.email = body['email']
        if 'phone' in body:
            user.phone = body['phone']
        if 'address' in body:
            user.address = body['address']
        
        db.commit()
        db.refresh(user)
        
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "address": user.address,
            "role": user.role.value if user.role else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/user/change-password")
async def change_password(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = int(payload.get("sub")) if payload and payload.get("sub") is not None else None
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        body = await request.json()
        current_password = body.get('current_password')
        new_password = body.get('new_password')
        
        if not current_password or not new_password:
            raise HTTPException(status_code=400, detail="Current and new passwords required")
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Verify current password
        if not pwd_context.verify(current_password, user.password_hash):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        
        # Update password
        user.password_hash = pwd_context.hash(new_password)
        db.commit()
        
        return {"success": True, "message": "Password changed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/make-admin")
async def make_user_admin(request: Request, db: Session = Depends(get_db)):
    """Make a user an admin by email - temporary endpoint for setup"""
    try:
        body = await request.json()
        email = body.get('email')
        secret = body.get('secret')
        
        # Simple secret check - in production use proper admin authentication
        if secret != os.getenv('ADMIN_SECRET', 'change-me-in-production'):
            raise HTTPException(status_code=403, detail="Invalid secret")
        
        if not email:
            raise HTTPException(status_code=400, detail="Email required")
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user.role = UserRole.ADMIN
        db.commit()
        
        return {
            "success": True,
            "message": f"User {user.name} ({user.email}) is now an admin"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Create tables
@app.on_event("startup")
async def startup_event():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    # MySQL column additions (best-effort, ignore if already exists)
    try:
        with engine.connect() as conn:
            # Add missing columns if they don't exist
            try:
                conn.execute(text("ALTER TABLE food_resources ADD COLUMN recipient_id INT NULL"))
            except Exception:
                pass  # Column already exists
            try:
                conn.execute(text("ALTER TABLE food_resources ADD COLUMN claimed_at DATETIME NULL"))
            except Exception:
                pass  # Column already exists
            conn.commit()
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
    db: Session = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security)
):
    """
    Returns ALL food resources for authenticated users to filter on frontend.
    - Recipients see: all available + their claimed listings
    - Donors see: all their listings (available, claimed, expired)
    - Unauthenticated: only available listings
    """
    if credentials is not None:
            try:
                payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            except jwt.ExpiredSignatureError:
                print("JWT token expired")
                raise HTTPException(status_code=401, detail="Invalid token")
            except jwt.InvalidTokenError as e:
                print(f"JWT token invalid: {e}")
                raise HTTPException(status_code=401, detail="Invalid token")
            except Exception as e:
                print(f"JWT decode error: {e}")
                raise HTTPException(status_code=401, detail="Invalid token")
    try:
        user_id = None
        user_role = None
        
        # Decode JWT if provided
        if credentials is not None:
            try:
                payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
                user_id = str(payload.get("sub")) if payload else None
                user_role = str(payload.get("role") or "").lower() if payload else None
            except Exception as e:
                print(f"JWT decode error: {e}")
                user_id = None
                user_role = None

        # Return ALL listings - let frontend filter
        # This allows proper filtering for donors to see expired/claimed items
        listings = (
            db.query(FoodResource)
            .order_by(FoodResource.created_at.desc())
            .limit(limit)
        ).all()

        # Ensure donor relationship is loaded
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
    """Delete a listing. Donor who created it or admin can delete."""
    try:
        item = db.query(FoodResource).filter(FoodResource.id == listing_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Listing not found")

        # Authorization: donor who created it or admin can delete
        try:
            payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = str(payload.get("sub")) if payload else None
            if not user_id:
                raise HTTPException(status_code=401, detail="Your session is missing or expired. Please sign in to continue.")
            
            # Check if user is the owner or an admin
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise HTTPException(status_code=401, detail="User not found")
            
            is_owner = str(item.donor_id) == user_id
            is_admin = user.role and user.role.upper() == 'ADMIN'
            
            if not (is_owner or is_admin):
                raise HTTPException(status_code=403, detail="Not authorized to delete this listing")
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=401, detail="Your session is missing or expired. Please sign in to continue.")

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
            raise HTTPException(status_code=401, detail="Your session is missing or expired. Please sign in to continue.")

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
async def create_user(name: str, email: str, password: str, role: UserRole, referral_code: str = None, db: Session = Depends(get_db)):
    try:    
        # Check for existing user
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Validate referral code if provided
        referrer_id = None
        if referral_code:
            referrer = db.query(User).filter(User.referral_code == referral_code).first()
            if not referrer:
                raise HTTPException(status_code=400, detail="Invalid referral code")
            referrer_id = referrer.id
        
        # Generate unique referral code for new user
        new_referral_code = generate_referral_code()
        while db.query(User).filter(User.referral_code == new_referral_code).first():
            new_referral_code = generate_referral_code()
        
        # Create new user
        user = User(
            email=email, 
            name=name, 
            password_hash=pwd_context.hash(password), 
            role=role,
            referral_code=new_referral_code,
            referred_by_code=referral_code if referrer_id else None,
            created_at=datetime.utcnow()
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return {"success": True, "message": "Account created successfully", "referral_code": new_referral_code}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/user/login")
async def login_user(email: str = None, password: str = None, db: Session = Depends(get_db)):
    try:
        print(f"Login attempt for email: {email}")
        
        if not email or not password:
            print("Missing email or password")
            raise HTTPException(status_code=400, detail="Email and password are required")
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"User not found: {email}")
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        print(f"User found: {user.id}, verifying password...")
        if not pwd_context.verify(password, user.password_hash):
            print("Password verification failed")
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        print("Password verified successfully")
        # Create token with 24 hour expiration
        now = datetime.utcnow()
        payload = {
            "sub": str(user.id),
            "name": user.name,
            "role": user.role.value,
            "iat": now,
            "exp": now + timedelta(hours=24)
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        print(f"✅ Generated token for user {user.id} ({user.email}), expires in 24 hours")
        return {"success": True, "token": token}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

# Store for password reset codes
password_reset_codes = {}

@app.post("/api/user/forgot-password")
async def forgot_password(request: Request, db: Session = Depends(get_db)):
    """Send password reset code to user's email"""
    try:
        form = await request.form()
        email = form.get('email')
        
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            # Don't reveal if email exists
            return {"success": True, "message": "If the email exists, a reset code has been sent"}
        
        # Generate 6-digit code
        reset_code = generate_reset_code(6)
        
        # Store code with expiration
        password_reset_codes[email] = {
            'code': reset_code,
            'expires_at': datetime.utcnow() + timedelta(minutes=15)
        }
        
        # In production, send email here
        sendEmail(email, reset_code)
        
        return {"success": True, "message": "Reset code sent"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Forgot password error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/user/reset-password")
async def reset_password(request: Request, db: Session = Depends(get_db)):
    """Reset user password with verification code"""
    try:
        form = await request.form()
        email = form.get('email')
        code = form.get('code')
        new_password = form.get('new_password')
        
        if not email or not code or not new_password:
            raise HTTPException(status_code=400, detail="Missing required fields")
        
        # Check if code exists
        if email not in password_reset_codes:
            raise HTTPException(status_code=400, detail="Invalid or expired reset code")
        
        stored = password_reset_codes[email]
        
        # Verify code
        if stored['code'] != code:
            raise HTTPException(status_code=400, detail="Invalid reset code")
        
        # Check expiration
        if datetime.utcnow() > stored['expires_at']:
            del password_reset_codes[email]
            raise HTTPException(status_code=400, detail="Reset code expired")
        
        # Update password
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user.password_hash = pwd_context.hash(new_password)
        db.commit()
        
        # Clean up code
        del password_reset_codes[email]
        
        return {"success": True, "message": "Password reset successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Reset password error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user/referrals")
async def get_user_referrals(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """Get user's referral stats"""
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = int(payload.get("sub")) if payload and payload.get("sub") is not None else None
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Count referrals
        referral_count = db.query(User).filter(User.referred_by == user_id).count()
        
        return {
            "referral_code": user.referral_code,
            "referral_count": referral_count
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/referral/validate")
async def validate_referral_code(request: Request, db: Session = Depends(get_db)):
    """Validate a referral code"""
    try:
        body = await request.json()
        code = body.get('code')
        
        if not code:
            raise HTTPException(status_code=400, detail="Referral code required")
        
        user = db.query(User).filter(User.referral_code == code).first()
        if not user:
            return {"valid": False}
        
        return {"valid": True, "referrer_name": user.name}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/referrals")
async def get_referral_analytics(admin_user: User = Depends(verify_admin), db: Session = Depends(get_db)):
    """Get referral analytics for admin (Admin only)"""
    try:
        # Get all users with their referral data
        users = db.query(User).all()
        
        referral_stats = []
        for user in users:
            # Count how many people this user referred
            referral_count = db.query(User).filter(User.referred_by == user.id).count()
            
            # Get the actual referred users for recent referrals display
            referred_users = db.query(User).filter(User.referred_by == user.id).all()
            
            referral_stats.append({
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "referral_code": user.referral_code,
                "referral_count": referral_count,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "referred_users": [{
                    "id": ru.id,
                    "name": ru.name,
                    "email": ru.email,
                    "created_at": ru.created_at.isoformat() if ru.created_at else None
                } for ru in referred_users]
            })
        
        return referral_stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Store for pending confirmations
pending_confirmations = {}

def generate_reset_code(length: int = 6) -> str:
    """Generate a random numeric code for SMS confirmation"""
    return ''.join(random.choices(string.digits, k=length))

def generate_referral_code() -> str:
    """Generate a unique referral code"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

def send_sms(phone: str, message: str) -> bool:
    """Send SMS using Twilio API with fallback to console logging"""
    try:
        # Check if Twilio credentials are configured
        if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
            print(f"⚠️  Twilio not configured. SMS to {phone}: {message}")
            return False
        
        # Initialize Twilio client
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        
        # Format phone number (ensure it starts with +)
        formatted_phone = phone.strip()
        if not formatted_phone.startswith('+'):
            # Assume US number if no country code
            formatted_phone = '+1' + formatted_phone.replace('-', '').replace('(', '').replace(')', '').replace(' ', '').replace('.', '')
        
        # Send SMS
        message_obj = client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to=formatted_phone
        )
        
        print(f"✅ SMS sent successfully to {formatted_phone} (SID: {message_obj.sid})")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send SMS to {phone}: {str(e)}")
        # Log to console as fallback
        print(f"📱 SMS to {phone}: {message}")
        return False

def auto_release_claim(listing_id: int):
    """Auto-release a claim if not confirmed within time limit"""
    try:
        db = SessionLocal()
        if listing_id in pending_confirmations:
            item = db.query(FoodResource).filter(FoodResource.id == listing_id).first()
            if item and item.status == "pending_confirmation":
                item.status = "available"
                item.recipient_id = None
                item.claimed_at = None
                db.commit()
                print(f"⏰ Auto-released listing {listing_id} due to timeout")
            del pending_confirmations[listing_id]
        db.close()
    except Exception as e:
        print(f"Error in auto_release_claim: {e}")

# ============================================
# DISTRIBUTION CENTER ENDPOINTS
# ============================================

@app.get("/api/centers", response_model=List[DistributionCenterResponse])
async def get_distribution_centers(db: Session = Depends(get_db)):
    """Get all distribution centers"""
    try:
        centers = db.query(DistributionCenter).all()
        return centers
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/centers")
async def create_distribution_center(request: Request, admin_user: User = Depends(verify_admin), db: Session = Depends(get_db)):
    """Create a new distribution center (Admin only)"""
    try:
        body = await request.json()
        center = DistributionCenter(
            owner_id=admin_user.id,
            name=body.get('name'),
            description=body.get('description'),
            address=body.get('address'),
            coords_lat=body.get('coords_lat'),
            coords_lng=body.get('coords_lng'),
            phone=body.get('phone'),
            hours=body.get('hours'),
            created_at=datetime.utcnow()
        )
        db.add(center)
        db.commit()
        db.refresh(center)
        return {"success": True, "center": center}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/centers/{center_id}")
async def update_distribution_center(center_id: int, request: Request, admin_user: User = Depends(verify_admin), db: Session = Depends(get_db)):
    """Update a distribution center (Admin only)"""
    try:
        center = db.query(DistributionCenter).filter(DistributionCenter.id == center_id).first()
        if not center:
            raise HTTPException(status_code=404, detail="Center not found")
        
        body = await request.json()
        
        # Update fields if provided
        if 'name' in body:
            center.name = body['name']
        if 'description' in body:
            center.description = body['description']
        if 'address' in body:
            center.address = body['address']
        if 'coords_lat' in body:
            center.coords_lat = body['coords_lat']
        if 'coords_lng' in body:
            center.coords_lng = body['coords_lng']
        if 'phone' in body:
            center.phone = body['phone']
        if 'hours' in body:
            center.hours = body['hours']
        if 'is_active' in body:
            center.is_active = body['is_active']
        
        db.commit()
        db.refresh(center)
        return {"success": True, "center": center}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Update center error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/centers/{center_id}")
async def delete_distribution_center(center_id: int, admin_user: User = Depends(verify_admin), db: Session = Depends(get_db)):
    """Delete a distribution center and its inventory (Admin only)"""
    try:
        center = db.query(DistributionCenter).filter(DistributionCenter.id == center_id).first()
        if not center:
            raise HTTPException(status_code=404, detail="Center not found")
        
        # Delete associated inventory first
        db.query(CenterInventory).filter(CenterInventory.center_id == center_id).delete()
        
        # Delete the center
        db.delete(center)
        db.commit()
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Delete center error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/centers/{center_id}", response_model=DistributionCenterWithInventory)
async def get_distribution_center(center_id: int, db: Session = Depends(get_db)):
    """Get a specific distribution center with inventory"""
    try:
        center = db.query(DistributionCenter).filter(
            DistributionCenter.id == center_id
        ).first()
        
        if not center:
            raise HTTPException(status_code=404, detail="Distribution center not found")
        
        return center
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/centers/{center_id}/inventory", response_model=List[CenterInventoryResponse])
async def get_center_inventory(center_id: int, db: Session = Depends(get_db)):
    """Get inventory for a specific distribution center"""
    try:
        center = db.query(DistributionCenter).filter(
            DistributionCenter.id == center_id
        ).first()
        
        if not center:
            raise HTTPException(status_code=404, detail="Distribution center not found")
        
        inventory = db.query(CenterInventory).filter(
            CenterInventory.center_id == center_id
        ).all()
        
        return inventory
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/api/listings/get/{listing_id}")
async def claim_listing(listing_id: int, db: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Claim a listing with SMS confirmation requirement."""
    try:
        item = db.query(FoodResource).filter(FoodResource.id == listing_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Listing not found")
        if item.status != 'available':
            raise HTTPException(status_code=400, detail="Listing is not available")

        # Authorization
        try:
            payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = str(payload.get("sub")) if payload else None
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid token")
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid token")

        # Get user details
        claimant = db.query(User).filter(User.id == int(user_id)).first()
        if not claimant or not claimant.phone:
            raise HTTPException(status_code=400, detail="Phone number required")

        donor = db.query(User).filter(User.id == item.donor_id).first()
        
        # Generate confirmation code
        confirmation_code = generate_reset_code(4)
        
        # Set status to pending confirmation
        item.recipient_id = int(user_id)
        item.status = "pending_confirmation"
        item.claimed_at = datetime.utcnow()
        db.commit()
        
        # Store confirmation code
        pending_confirmations[listing_id] = {
            'code': confirmation_code,
            'recipient_id': int(user_id),
            'expires_at': datetime.utcnow() + timedelta(minutes=5)
        }
        
        # Send SMS to recipient
        recipient_msg = f"You claimed '{item.title}'. Reply with code {confirmation_code} within 5 minutes to confirm. Address: {item.address}"
        send_sms(claimant.phone, recipient_msg)
        
        # Send SMS to donor if they have a phone
        if donor and donor.phone:
            donor_msg = f"Your listing '{item.title}' was claimed by {claimant.name}. Waiting for confirmation."
            send_sms(donor.phone, donor_msg)
        
        # Set auto-release timer
        timer = Timer(300.0, auto_release_claim, args=[listing_id])  # 5 minutes
        timer.start()
        
        return {
            "success": True, 
            "message": "Claim initiated. Check your phone for confirmation code.",
            "listing": serialize_listing(item)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/listings/confirm/{listing_id}")
async def confirm_claim(listing_id: int, request: Request, db: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Confirm a claim with SMS code."""
    try:
        body = await request.json()
        code = body.get('code', '').strip()
        
        if not code:
            raise HTTPException(status_code=400, detail="Confirmation code required")
        
        # Check if confirmation is pending
        if listing_id not in pending_confirmations:
            raise HTTPException(status_code=400, detail="No pending confirmation for this listing")
        
        confirmation = pending_confirmations[listing_id]
        
        # Check if code matches
        if confirmation['code'] != code:
            raise HTTPException(status_code=400, detail="Invalid confirmation code")
        
        # Check if expired
        if datetime.utcnow() > confirmation['expires_at']:
            del pending_confirmations[listing_id]
            raise HTTPException(status_code=400, detail="Confirmation code expired")
        
        # Verify user authorization
        try:
            payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = int(payload.get("sub")) if payload and payload.get("sub") is not None else None
            if user_id != confirmation['recipient_id']:
                raise HTTPException(status_code=403, detail="Not authorized")
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Update listing status to claimed
        item = db.query(FoodResource).filter(FoodResource.id == listing_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Listing not found")
        
        item.status = "claimed"
        db.commit()
        
        # Clean up confirmation
        del pending_confirmations[listing_id]
        
        # Get user details for notification
        claimant = db.query(User).filter(User.id == user_id).first()
        donor = db.query(User).filter(User.id == item.donor_id).first()
        
        # Send confirmation SMS to both parties
        if claimant and claimant.phone:
            msg = f"Claim confirmed! You can now pick up '{item.title}' at {item.address}. Contact donor: {donor.phone if donor and donor.phone else 'N/A'}"
            send_sms(claimant.phone, msg)
        
        if donor and donor.phone:
            msg = f"Claim confirmed! {claimant.name if claimant else 'Recipient'} will pick up '{item.title}'. Contact: {claimant.phone if claimant and claimant.phone else 'N/A'}"
            send_sms(donor.phone, msg)
        
        return {
            "success": True,
            "message": "Claim confirmed successfully",
            "listing": serialize_listing(item)
        }
        
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
            raise HTTPException(status_code=401, detail="Your session is missing or expired. Please sign in to continue.")

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



def sendEmail(address, code):
        msg = MIMEText('''
Hello,\n
You're receiving this email because you requested to reset your password for your Food Maps account.\n


To reset your password, enter the code below:\n

{code}
For your security, this code will expire in 15 minutes. If you did not request this reset, please ignore this email.\n

Please do not reply to this email.\n
Best regards,\n
The Food Maps Team'''.format(code=code))
        msg['Subject'] = "Food Maps Password Reset"
        msg['From'] = sender
        msg['To'] = address
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp_server:
          smtp_server.login(sender, password)
          smtp_server.sendmail(sender, address, msg.as_string())
        print(f"📧 Password reset code for {address}: {code}")


# Referral System Endpoints
@app.get("/api/referrals/stats")
async def get_referral_stats(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get referral statistics for admin"""
    try:
        user = verify_token(credentials.credentials, db)
        
        # Check if user is admin
        if user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Get all users with referral codes
        users_with_referrals = db.query(User).filter(User.referred_by_code.isnot(None)).all()
        
        # Build referral tree
        referral_data = []
        for user_item in users_with_referrals:
            referrer = db.query(User).filter(User.referral_code == user_item.referred_by_code).first()
            referral_data.append({
                "id": user_item.id,
                "name": user_item.name,
                "email": user_item.email,
                "role": user_item.role.value,
                "referral_code": user_item.referral_code,
                "referred_by_code": user_item.referred_by_code,
                "referrer_name": referrer.name if referrer else "Unknown",
                "referrer_email": referrer.email if referrer else "Unknown",
                "created_at": user_item.created_at.isoformat() if user_item.created_at else None
            })
        
        # Count total referrals per user
        referral_counts = {}
        all_users = db.query(User).filter(User.referral_code.isnot(None)).all()
        for user_item in all_users:
            count = db.query(User).filter(User.referred_by_code == user_item.referral_code).count()
            if count > 0:
                referral_counts[user_item.referral_code] = {
                    "referrer_id": user_item.id,
                    "referrer_name": user_item.name,
                    "referrer_email": user_item.email,
                    "referrer_role": user_item.role.value,
                    "total_referrals": count
                }
        
        return {
            "success": True,
            "total_referred_users": len(referral_data),
            "referral_details": referral_data,
            "top_referrers": dict(sorted(referral_counts.items(), key=lambda x: x[1]['total_referrals'], reverse=True))
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/referrals/user/{user_id}")
async def get_user_referrals(
    user_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get all users referred by a specific user"""
    try:
        user = verify_token(credentials.credentials, db)
        
        # Check if user is admin or the user themselves
        if user.role != UserRole.ADMIN and user.id != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Get the user's referral code
        target_user = db.query(User).filter(User.id == user_id).first()
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if not target_user.referral_code:
            # Generate one if missing
            new_code = generate_referral_code()
            while db.query(User).filter(User.referral_code == new_code).first():
                new_code = generate_referral_code()
            target_user.referral_code = new_code
            db.add(target_user)
            db.commit()
        
        # Get all users referred by this code
        referred_users = db.query(User).filter(User.referred_by_code == target_user.referral_code).all()
        
        return {
            "success": True,
            "referral_code": target_user.referral_code,
            "referred_users": [
                {
                    "id": u.id,
                    "name": u.name,
                    "email": u.email,
                    "role": u.role.value,
                    "created_at": u.created_at.isoformat() if u.created_at else None
                }
                for u in referred_users
            ],
            "total_referrals": len(referred_users)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/user/referral-code")
async def get_my_referral_code(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current user's referral code"""
    try:
        user = verify_token(credentials.credentials, db)
        
        # Generate referral code if user doesn't have one
        if not user.referral_code:
            new_code = generate_referral_code()
            while db.query(User).filter(User.referral_code == new_code).first():
                new_code = generate_referral_code()
            
            user.referral_code = new_code
            db.add(user)
            db.commit()
            db.refresh(user)
        
        return {
            "success": True,
            "referral_code": user.referral_code,
            "referral_link": f"https://foodmaps.com/register?ref={user.referral_code}"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



