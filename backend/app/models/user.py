from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float
from sqlalchemy.sql import func
from app.core.database import Base, SessionLocal

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    monthly_salary = Column(Float)
    location = Column(String)
    mobile_number = Column(String)
    monthly_income = Column(Float)
    currency = Column(String, default="INR")
    monthly_cycle_start = Column(Integer, default=1)  # Day of month
    monthly_report_enabled = Column(Boolean, default=True)
    daily_reminder_time = Column(String)  # Format: "HH:MM"
    is_active = Column(Boolean, default=True)
    is_profile_complete = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

def get_user_details(user_id: int):
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    return user