#!/usr/bin/env python3
"""Make a user an admin by email"""

import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from backend.models import Base, User, UserRole
from sqlalchemy import create_engine
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("Error: DATABASE_URL not found in .env file")
    sys.exit(1)

engine = create_engine(DATABASE_URL)

def make_admin(email: str):
    """Make a user an admin by their email address"""
    session = Session(bind=engine)
    
    try:
        # Find user by email
        user = session.query(User).filter(User.email == email).first()
        
        if not user:
            print(f"❌ Error: User with email '{email}' not found")
            print("\nAvailable users:")
            users = session.query(User).all()
            for u in users:
                print(f"  - {u.email} ({u.name}) - Role: {u.role.value if u.role else 'None'}")
            session.close()
            return False
        
        # Check if already admin
        if user.role == UserRole.ADMIN:
            print(f"ℹ️  User {user.name} ({user.email}) is already an admin")
            session.close()
            return True
        
        # Make admin
        user.role = UserRole.ADMIN
        session.commit()
        
        print(f"✅ Success! User {user.name} ({user.email}) is now an admin")
        session.close()
        return True
        
    except Exception as e:
        session.rollback()
        print(f"❌ Error: {str(e)}")
        session.close()
        return False

if __name__ == "__main__":
    # Hard-coded email to make admin
    email = "kdreyfuss4@gmail.com"
    
    print(f"Making {email} an admin...")
    make_admin(email)
