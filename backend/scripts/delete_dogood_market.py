#!/usr/bin/env python3
"""
Delete Dogood's Grocery & Market distribution center
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.engine import make_url
from dotenv import load_dotenv
from backend.models import DistributionCenter

# Use the same DATABASE_URL as app.py
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is required")

print(f"Using database: {make_url(DATABASE_URL).render_as_string(hide_password=True)}")
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

try:
    center = session.query(DistributionCenter).filter(
        DistributionCenter.name == "Dogood's Grocery & Market"
    ).first()
    
    if center:
        center_id = center.id
        session.delete(center)
        session.commit()
        print(f"✅ Successfully deleted Dogood's Grocery & Market (ID: {center_id})")
    else:
        print("❌ Dogood's Grocery & Market not found in database")
        
except Exception as e:
    session.rollback()
    print(f"❌ Error deleting center: {e}")
finally:
    session.close()
