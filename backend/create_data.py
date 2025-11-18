from sqlalchemy.orm import Session
from backend.models import Base, User, FoodResource, UserRole, FoodCategory, PerishabilityLevel
from sqlalchemy import create_engine
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
Base.metadata.create_all(bind=engine)  # ensure tables exist

def insert_test_data():
    session = Session(bind=engine)

    # Create a donor user
    donor = User(
        name="Test Donor",
        email="donor@example.com",
        password_hash="fakehash",
        role=UserRole.DONOR,
        phone="123-456-7890",
        address="123 Main St",
        coords_lat=37.7749,
        coords_lng=-122.4194
    )
    session.add(donor)
    session.commit()

    # Create a test food resource
    food = FoodResource(
        donor_id=donor.id,
        title="Apples",
        description="Fresh red apples",
        category=FoodCategory.PRODUCE,
        qty=10,
        unit="kg",
        perishability=PerishabilityLevel.MEDIUM,
        expiration_date=datetime.utcnow() + timedelta(days=7),
        pickup_window_start=datetime.utcnow(),
        pickup_window_end=datetime.utcnow() + timedelta(hours=2),
        address="123 Main St",
        status="available"
    )
    session.add(food)
    session.commit()
    session.close()
    print("Inserted test data!")

if __name__ == "__main__":
    insert_test_data()

