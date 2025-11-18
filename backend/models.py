from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class UserRole(enum.Enum):
    DONOR = "donor"
    RECIPIENT = "recipient" 
    VOLUNTEER = "volunteer"
    DISPATCHER = "dispatcher"
    ADMIN = "admin"

class FoodCategory(enum.Enum):
    PRODUCE = "produce"
    PREPARED = "prepared"
    PACKAGED = "packaged"
    BAKERY = "bakery"
    WATER = "water"
    FRUIT = "fruit"
    LEFTOVERS = "leftovers"

class PerishabilityLevel(enum.Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True)
    name = Column(String(255))
    password_hash = Column(String(255))
    role = Column(SQLEnum(UserRole))
    phone = Column(String(255), nullable=True)
    address = Column(String(255), nullable=True)
    coords_lat = Column(Float, nullable=True)
    coords_lng = Column(Float, nullable=True)
    vehicle_capacity_kg = Column(Float, nullable=True)
    has_refrigeration = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    # reset_token = Column(String(10), nullable=True)  # Commented out - not in MySQL DB
    # reset_token_expiry = Column(DateTime, nullable=True)  # Commented out - not in MySQL DB
    
    # Relationships
    donations = relationship("FoodResource", foreign_keys="FoodResource.donor_id", back_populates="donor")
    requests = relationship("FoodRequest", back_populates="recipient")
    consumption_logs = relationship("ConsumptionLog", back_populates="user")

class FoodResource(Base):
    __tablename__ = "food_resources"
    
    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("users.id"))
    # Who claimed the listing (nullable for available/unclaimed)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(255))
    description = Column(Text, nullable=True)
    category = Column(SQLEnum(FoodCategory))
    qty = Column(Float)
    unit = Column(String(255))
    est_weight_kg = Column(Float, nullable=True)
    perishability = Column(SQLEnum(PerishabilityLevel))
    expiration_date = Column(DateTime, nullable=True)
    pickup_window_start = Column(DateTime, nullable=True)
    pickup_window_end = Column(DateTime, nullable=True)
    address = Column(String(255))
    coords_lat = Column(Float, nullable=True)
    coords_lng = Column(Float, nullable=True)
    status = Column(String(255), default="available")
    claimed_at = Column(DateTime, nullable=True)
    images = Column(Text, nullable=True)  # JSON array of image URLs
    urgency_score = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    donor = relationship("User", foreign_keys=[donor_id], back_populates="donations")
    consumption_logs = relationship("ConsumptionLog", back_populates="food_resource")

class FoodRequest(Base):
    __tablename__ = "food_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id"))
    category = Column(SQLEnum(FoodCategory), nullable=True)  # 'any' for flexible requests
    household_size = Column(Integer, default=1)
    special_needs = Column(Text, nullable=True)  # JSON array
    dietary_restrictions = Column(Text, nullable=True)
    latest_by = Column(DateTime, nullable=True)
    address = Column(String(255))
    coords_lat = Column(Float, nullable=True)
    coords_lng = Column(Float, nullable=True)
    status = Column(String(255), default="open")
    notes = Column(Text, nullable=True)
    urgency_score = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    recipient = relationship("User", back_populates="requests")

class ConsumptionLog(Base):
    __tablename__ = "consumption_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    food_resource_id = Column(Integer, ForeignKey("food_resources.id"), nullable=True)
    food_name = Column(String(255))
    category = Column(SQLEnum(FoodCategory))
    qty_consumed = Column(Float)
    unit = Column(String(255))
    consumption_date = Column(DateTime, default=datetime.utcnow)
    source_type = Column(String(255))  # 'donation', 'own_harvest', 'purchased', 'leftover'
    nutritional_value = Column(Text, nullable=True)  # JSON object
    waste_amount = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="consumption_logs")
    food_resource = relationship("FoodResource", back_populates="consumption_logs")

class DistributionCenter(Base):
    __tablename__ = "distribution_centers"
    
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(255))
    description = Column(Text, nullable=True)
    address = Column(String(255))
    coords_lat = Column(Float)
    coords_lng = Column(Float)
    phone = Column(String(255), nullable=True)
    hours = Column(Text, nullable=True)  # JSON object with operating hours
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", foreign_keys=[owner_id])
    inventory = relationship("CenterInventory", back_populates="center")

class CenterInventory(Base):
    __tablename__ = "center_inventory"
    
    id = Column(Integer, primary_key=True, index=True)
    center_id = Column(Integer, ForeignKey("distribution_centers.id"))
    name = Column(String(255))
    description = Column(Text, nullable=True)
    category = Column(SQLEnum(FoodCategory))
    quantity = Column(Float)
    unit = Column(String(255))
    perishability = Column(SQLEnum(PerishabilityLevel), nullable=True)
    expiration_date = Column(DateTime, nullable=True)
    images = Column(Text, nullable=True)  # JSON array
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    center = relationship("DistributionCenter", back_populates="inventory")
