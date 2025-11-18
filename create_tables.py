#!/usr/bin/env python3
import sys
import os
sys.path.append('/home/ec2-user/project/backend')

from sqlalchemy import create_engine
from models import Base

# Create database and tables
DATABASE_URL = "sqlite:///./food_maps.db"
engine = create_engine(DATABASE_URL)

# Create all tables
Base.metadata.create_all(bind=engine)
print("All tables created successfully!")