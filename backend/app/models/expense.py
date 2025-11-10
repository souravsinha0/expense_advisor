from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base

class TransactionType(str, enum.Enum):
    CREDIT = "credit"
    DEBIT = "debit"

class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    details = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    transaction_type = Column(
        Enum(TransactionType, values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
    )
    transaction_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", back_populates="expenses")

# Add relationship to User model
from app.models.user import User
User.expenses = relationship("Expense", back_populates="user")