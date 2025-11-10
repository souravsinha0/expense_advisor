from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.routes.auth import get_current_user
from app.models.user import User
from app.models.expense import Expense, TransactionType
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class ExpenseUpdate(BaseModel):
    details: str
    amount: float
    transaction_type: TransactionType
    transaction_date: datetime

@router.put("/{expense_id}")
async def update_expense(
    expense_id: int,
    expense_update: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()
    
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    expense.details = expense_update.details
    expense.amount = expense_update.amount
    expense.transaction_type = expense_update.transaction_type
    expense.transaction_date = expense_update.transaction_date
    
    db.commit()
    db.refresh(expense)
    
    return {"message": "Expense updated successfully", "expense": expense}

@router.delete("/{expense_id}")
async def delete_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()
    
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    db.delete(expense)
    db.commit()
    
    return {"message": "Expense deleted successfully"}