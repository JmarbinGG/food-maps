#!/usr/bin/env python3
"""
Script to seed sample distribution centers with inventory
"""
import sys
import os

# Add parent directories to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Import models with full path
from models import Base, User, DistributionCenter, CenterInventory, UserRole, FoodCategory, PerishabilityLevel

load_dotenv(os.path.join(os.path.dirname(__file__), '../..', '.env'))
DATABASE_URL = os.getenv("DATABASE_URL")

print(f"Using database: {DATABASE_URL[:30]}...")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def seed_distribution_centers():
    db = SessionLocal()
    
    try:
        # Get a donor user (create one if doesn't exist)
        donor = db.query(User).filter(User.role == UserRole.DONOR).first()
        
        if not donor:
            print("No donor users found in database. Please create a donor user first.")
            return
        
        # Sample distribution centers
        centers_data = [
            {
                "name": "Downtown Food Hub",
                "description": "Central distribution center serving the downtown area",
                "address": "123 Market St, San Francisco, CA 94103",
                "coords_lat": 37.7749,
                "coords_lng": -122.4194,
                "phone": "(415) 555-0101",
                "hours": "Mon-Fri: 9AM-6PM, Sat: 10AM-4PM",
                "inventory": [
                    {"name": "Fresh Apples", "category": FoodCategory.FRUIT, "quantity": 50, "unit": "lbs", "perishability": PerishabilityLevel.MEDIUM},
                    {"name": "Canned Beans", "category": FoodCategory.PACKAGED, "quantity": 100, "unit": "cans", "perishability": PerishabilityLevel.LOW},
                    {"name": "Fresh Bread", "category": FoodCategory.BAKERY, "quantity": 30, "unit": "loaves", "perishability": PerishabilityLevel.HIGH},
                    {"name": "Bottled Water", "category": FoodCategory.WATER, "quantity": 200, "unit": "bottles", "perishability": PerishabilityLevel.LOW},
                ]
            },
            {
                "name": "Mission District Food Bank",
                "description": "Community food bank serving Mission District families",
                "address": "456 Valencia St, San Francisco, CA 94110",
                "coords_lat": 37.7599,
                "coords_lng": -122.4214,
                "phone": "(415) 555-0102",
                "hours": "Mon-Sat: 8AM-5PM",
                "inventory": [
                    {"name": "Fresh Vegetables Mix", "category": FoodCategory.PRODUCE, "quantity": 75, "unit": "lbs", "perishability": PerishabilityLevel.HIGH},
                    {"name": "Rice Bags", "category": FoodCategory.PACKAGED, "quantity": 40, "unit": "bags", "perishability": PerishabilityLevel.LOW},
                    {"name": "Prepared Meals", "category": FoodCategory.PREPARED, "quantity": 60, "unit": "servings", "perishability": PerishabilityLevel.HIGH},
                ]
            },
            {
                "name": "Sunset Community Pantry",
                "description": "Serving the Sunset and Richmond neighborhoods",
                "address": "789 Judah St, San Francisco, CA 94122",
                "coords_lat": 37.7625,
                "coords_lng": -122.4644,
                "phone": "(415) 555-0103",
                "hours": "Tue-Fri: 10AM-6PM, Sat: 9AM-3PM",
                "inventory": [
                    {"name": "Fresh Oranges", "category": FoodCategory.FRUIT, "quantity": 40, "unit": "lbs", "perishability": PerishabilityLevel.MEDIUM},
                    {"name": "Pasta Boxes", "category": FoodCategory.PACKAGED, "quantity": 80, "unit": "boxes", "perishability": PerishabilityLevel.LOW},
                    {"name": "Fresh Salad", "category": FoodCategory.PRODUCE, "quantity": 25, "unit": "bags", "perishability": PerishabilityLevel.HIGH},
                ]
            },
            {
                "name": "Dogood's Grocery & Market",
                "description": "Local grocery store and community market serving fresh food to the neighborhood",
                "address": "550 Irving St, San Francisco, CA 94122",
                "coords_lat": 37.7634,
                "coords_lng": -122.4642,
                "phone": "(415) 555-0104",
                "hours": "Mon-Sun: 7AM-10PM",
                "inventory": [
                    {"name": "Fresh Chicken", "category": FoodCategory.PREPARED, "quantity": 30, "unit": "lbs", "perishability": PerishabilityLevel.HIGH},
                    {"name": "Milk & Dairy", "category": FoodCategory.PACKAGED, "quantity": 50, "unit": "items", "perishability": PerishabilityLevel.HIGH},
                    {"name": "Fresh Vegetables", "category": FoodCategory.PRODUCE, "quantity": 60, "unit": "lbs", "perishability": PerishabilityLevel.MEDIUM},
                    {"name": "Fresh Eggs", "category": FoodCategory.PACKAGED, "quantity": 100, "unit": "dozen", "perishability": PerishabilityLevel.MEDIUM},
                ]
            }
        ]
        
        for center_data in centers_data:
            # Check if center already exists
            existing = db.query(DistributionCenter).filter(
                DistributionCenter.name == center_data["name"]
            ).first()
            
            if existing:
                print(f"Center '{center_data['name']}' already exists, skipping...")
                continue
            
            # Create center
            inventory_items = center_data.pop("inventory", [])
            center = DistributionCenter(
                owner_id=donor.id,
                **center_data
            )
            
            db.add(center)
            db.flush()  # Get the center ID
            
            # Add inventory items
            for item_data in inventory_items:
                expiration_date = None
                if item_data.get('perishability') == PerishabilityLevel.HIGH:
                    expiration_date = datetime.utcnow() + timedelta(days=3)
                elif item_data.get('perishability') == PerishabilityLevel.MEDIUM:
                    expiration_date = datetime.utcnow() + timedelta(days=14)
                
                inventory_item = CenterInventory(
                    center_id=center.id,
                    name=item_data['name'],
                    category=item_data['category'],
                    quantity=item_data['quantity'],
                    unit=item_data['unit'],
                    perishability=item_data.get('perishability'),
                    expiration_date=expiration_date,
                    is_available=True
                )
                db.add(inventory_item)
            
            print(f"✓ Created center: {center_data['name']} with {len(inventory_items)} items")
        
        db.commit()
        print("\n✅ Successfully seeded distribution centers!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding data: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_distribution_centers()
