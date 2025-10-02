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
from .models import Base, FoodResource, User, UserRole


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


@app.get("/api/listings", response_model=List[FoodResourceResponse])
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