from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.routes.auth import get_current_user
from app.models.user import User
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class UserProfile(BaseModel):
    full_name: str
    monthly_salary: float
    location: str
    mobile_number: str
    monthly_income: float
    currency: str = "USD"
    monthly_cycle_start: int = 1
    monthly_report_enabled: bool = True
    daily_reminder_time: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    monthly_salary: Optional[float]
    location: Optional[str]
    mobile_number: Optional[str]
    monthly_income: Optional[float]
    currency: str
    monthly_cycle_start: int
    monthly_report_enabled: bool
    daily_reminder_time: Optional[str]
    is_profile_complete: bool

@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile")
async def update_profile(
    profile: UserProfile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    for field, value in profile.dict().items():
        setattr(current_user, field, value)
    
    current_user.is_profile_complete = True
    db.commit()
    db.refresh(current_user)
    
    return {"message": "Profile updated successfully"}