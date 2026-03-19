#!/usr/bin/env python3
"""Generate referral codes for all existing users who don't have one"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import random
import string
from dotenv import load_dotenv

# Load environment
load_dotenv('../.env')
DATABASE_URL = os.getenv('DATABASE_URL', 'mysql+pymysql://root:password@localhost/foodmaps')

# Create database connection
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
db = Session()

def generate_referral_code():
    """Generate a unique 8-character referral code"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

# Import models
from models import User

# Get all users without referral codes
users_without_codes = db.query(User).filter(User.referral_code == None).all()

print(f"Found {len(users_without_codes)} users without referral codes")

updated_count = 0
for user in users_without_codes:
    # Generate unique code
    new_code = generate_referral_code()
    while db.query(User).filter(User.referral_code == new_code).first():
        new_code = generate_referral_code()
    
    # Update user
    user.referral_code = new_code
    db.add(user)
    updated_count += 1
    print(f"  User {user.id} ({user.email}): {new_code}")

# Commit all changes
db.commit()
print(f"\n✅ Generated referral codes for {updated_count} users")

# Verify
all_users = db.query(User).all()
with_codes = sum(1 for u in all_users if u.referral_code)
print(f"📊 Total users: {len(all_users)}, with codes: {with_codes}")

db.close()
