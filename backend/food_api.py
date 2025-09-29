from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from .models import FoodResource, User, ConsumptionLog
from .schemas import FoodResourceCreate, FoodResourceResponse, ConsumptionLogCreate, ConsumptionLogResponse
from .app import get_db, verify_token

router = APIRouter(prefix="/food", tags=["food-management"])

@router.post("/resources", response_model=FoodResourceResponse)
async def create_food_resource(
    resource_data: FoodResourceCreate,
    token_data: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    user_id = int(token_data["sub"])
    
    db_resource = FoodResource(
        donor_id=user_id,
        title=resource_data.title,
        description=resource_data.description,
        category=resource_data.category,
        qty=resource_data.qty,
        unit=resource_data.unit,
        perishability=resource_data.perishability,
        expiration_date=resource_data.expiration_date,
        pickup_window_start=resource_data.pickup_window_start,
        pickup_window_end=resource_data.pickup_window_end,
        address=resource_data.address,
        coords_lat=resource_data.coords_lat,
        coords_lng=resource_data.coords_lng,
        images=str(resource_data.images) if resource_data.images else None
    )
    
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    
    return db_resource

@router.get("/resources", response_model=List[FoodResourceResponse])
async def get_food_resources(
    category: Optional[str] = None,
    status: str = "available",
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(FoodResource).filter(FoodResource.status == status)
    
    if category and category != "all":
        query = query.filter(FoodResource.category == category)
    
    resources = query.limit(limit).all()
    return resources

@router.get("/my-resources", response_model=List[FoodResourceResponse])
async def get_my_resources(
    token_data: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    user_id = int(token_data["sub"])
    resources = db.query(FoodResource).filter(FoodResource.donor_id == user_id).all()
    return resources

@router.post("/consumption", response_model=ConsumptionLogResponse)
async def log_consumption(
    consumption_data: ConsumptionLogCreate,
    token_data: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    user_id = int(token_data["sub"])
    
    db_log = ConsumptionLog(
        user_id=user_id,
        food_resource_id=consumption_data.food_resource_id,
        food_name=consumption_data.food_name,
        category=consumption_data.category,
        qty_consumed=consumption_data.qty_consumed,
        unit=consumption_data.unit,
        consumption_date=consumption_data.consumption_date or datetime.utcnow(),
        source_type=consumption_data.source_type,
        waste_amount=consumption_data.waste_amount,
        notes=consumption_data.notes
    )
    
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    
    return db_log

@router.get("/consumption", response_model=List[ConsumptionLogResponse])
async def get_consumption_history(
    days: int = Query(30, le=365),
    token_data: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    user_id = int(token_data["sub"])
    start_date = datetime.utcnow() - timedelta(days=days)
    
    logs = db.query(ConsumptionLog).filter(
        ConsumptionLog.user_id == user_id,
        ConsumptionLog.consumption_date >= start_date
    ).order_by(ConsumptionLog.consumption_date.desc()).all()
    
    return logs