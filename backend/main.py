from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.auth import router as auth_router
from backend.food_api import router as food_router
from backend.models import Base
from backend.app import engine

# Create FastAPI app
app = FastAPI(title="Food Maps Agentic API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(food_router)

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

# Create tables on startup
@app.on_event("startup")
async def startup_event():
    Base.metadata.create_all(bind=engine)

## The root route now serves landing.html

@app.get("/health")
async def health_check():
    return {"status": "healthy"}