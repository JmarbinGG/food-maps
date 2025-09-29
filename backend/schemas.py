from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from enum import Enum

class UserRole(str, Enum):
    DONOR = "donor"
    RECIPIENT = "recipient"
    VOLUNTEER = "volunteer"
    DISPATCHER = "dispatcher"
    ADMIN = "admin"

class FoodCategory(str, Enum):
    PRODUCE = "produce"
    PREPARED = "prepared"
    PACKAGED = "packaged"
    BAKERY = "bakery"
    WATER = "water"
    FRUIT = "fruit"
    LEFTOVERS = "leftovers"

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole
    phone: Optional[str] = None
    address: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    phone: Optional[str] = None
    address: Optional[str] = None
    coords_lat: Optional[float] = None
    coords_lng: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True

class FoodResourceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: FoodCategory
    qty: float
    unit: str
    perishability: str
    expiration_date: Optional[datetime] = None
    pickup_window_start: Optional[datetime] = None
    pickup_window_end: Optional[datetime] = None
    address: str
    coords_lat: Optional[float] = None
    coords_lng: Optional[float] = None
    images: Optional[List[str]] = None

class FoodResourceResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: FoodCategory
    qty: float
    unit: str
    perishability: str
    status: str
    address: str
    coords_lat: Optional[float] = None
    coords_lng: Optional[float] = None
    urgency_score: int
    created_at: datetime
    donor: UserResponse

    class Config:
        from_attributes = True

class ConsumptionLogCreate(BaseModel):
    food_resource_id: Optional[int] = None
    food_name: str
    category: FoodCategory
    qty_consumed: float
    unit: str
    consumption_date: Optional[datetime] = None
    source_type: str
    waste_amount: Optional[float] = 0.0
    notes: Optional[str] = None

class ConsumptionLogResponse(BaseModel):
    id: int
    food_name: str
    category: FoodCategory
    qty_consumed: float
    unit: str
    consumption_date: datetime
    source_type: str
    waste_amount: float
    notes: Optional[str] = None

    class Config:
        from_attributes = True