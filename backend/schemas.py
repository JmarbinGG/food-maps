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
    urgency_score: Optional[int] = 0
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

class PerishabilityLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class DistributionCenterCreate(BaseModel):
    name: str
    description: Optional[str] = None
    address: str
    coords_lat: float
    coords_lng: float
    phone: Optional[str] = None
    hours: Optional[str] = None

class DistributionCenterResponse(BaseModel):
    id: int
    owner_id: int
    name: str
    description: Optional[str] = None
    address: str
    coords_lat: float
    coords_lng: float
    phone: Optional[str] = None
    hours: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class CenterInventoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: FoodCategory
    quantity: float
    unit: str
    perishability: Optional[PerishabilityLevel] = None
    expiration_date: Optional[datetime] = None
    images: Optional[List[str]] = None

class CenterInventoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    perishability: Optional[PerishabilityLevel] = None
    expiration_date: Optional[datetime] = None
    is_available: Optional[bool] = None
    images: Optional[List[str]] = None

class CenterInventoryResponse(BaseModel):
    id: int
    center_id: int
    name: str
    description: Optional[str] = None
    category: FoodCategory
    quantity: float
    unit: str
    perishability: Optional[PerishabilityLevel] = None
    expiration_date: Optional[datetime] = None
    images: Optional[List[str]] = None
    is_available: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DistributionCenterWithInventory(DistributionCenterResponse):
    inventory: List[CenterInventoryResponse] = []

    class Config:
        from_attributes = True