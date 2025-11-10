from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.core.database import get_db
from app.api.routes.auth import get_current_user
from app.models.user import User
from app.models.expense import Expense, TransactionType
from pydantic import BaseModel
from datetime import datetime, date
from typing import List, Optional

router = APIRouter()

class ExpenseCreate(BaseModel):
    details: str
    amount: float
    transaction_type: TransactionType
    transaction_date: datetime

class ExpenseResponse(BaseModel):
    id: int
    details: str
    amount: float
    transaction_type: TransactionType
    transaction_date: datetime
    created_at: datetime

class MonthlyStats(BaseModel):
    total_credit: float
    total_debit: float
    net_amount: float

@router.post("/", response_model=ExpenseResponse)
async def create_expense(
    expense: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_expense = Expense(
        user_id=current_user.id,
        details=expense.details,
        amount=expense.amount,
        transaction_type=expense.transaction_type.value.lower(),
        transaction_date=expense.transaction_date
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

@router.get("/", response_model=List[ExpenseResponse])
async def get_expenses(
    year: int = Query(...),
    month: int = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expenses = db.query(Expense).filter(
        Expense.user_id == current_user.id,
        extract('year', Expense.transaction_date) == year,
        extract('month', Expense.transaction_date) == month
    ).order_by(Expense.transaction_date.desc()).order_by(Expense.created_at.desc()).all()
    
    return expenses

@router.get("/monthly-stats", response_model=MonthlyStats)
async def get_monthly_stats(
    year: int = Query(...),
    month: int = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    credit_sum = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == current_user.id,
        extract('year', Expense.transaction_date) == year,
        extract('month', Expense.transaction_date) == month,
        Expense.transaction_type == TransactionType.CREDIT
    ).scalar() or 0
    
    debit_sum = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == current_user.id,
        extract('year', Expense.transaction_date) == year,
        extract('month', Expense.transaction_date) == month,
        Expense.transaction_type == TransactionType.DEBIT
    ).scalar() or 0
    
    return MonthlyStats(
        total_credit=credit_sum,
        total_debit=debit_sum,
        net_amount=credit_sum - debit_sum
    )

@router.get("/dashboard-stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get last 4 months data in ascending order
    current_date = datetime.now()
    months_data = []
    
    for i in range(3, -1, -1):  # 3, 2, 1, 0 for ascending order
        if current_date.month > i:
            month_date = datetime(current_date.year, current_date.month - i, 1)
        else:
            month_date = datetime(current_date.year - 1, 12 - (i - current_date.month), 1)
        
        credit_sum = db.query(func.sum(Expense.amount)).filter(
            Expense.user_id == current_user.id,
            extract('year', Expense.transaction_date) == month_date.year,
            extract('month', Expense.transaction_date) == month_date.month,
            Expense.transaction_type == TransactionType.CREDIT
        ).scalar() or 0
        
        debit_sum = db.query(func.sum(Expense.amount)).filter(
            Expense.user_id == current_user.id,
            extract('year', Expense.transaction_date) == month_date.year,
            extract('month', Expense.transaction_date) == month_date.month,
            Expense.transaction_type == TransactionType.DEBIT
        ).scalar() or 0
        
        months_data.append({
            "month": month_date.strftime("%B"),
            "year": month_date.year,
            "credit": float(credit_sum),
            "debit": float(debit_sum),
            "net": float(credit_sum - debit_sum)
        })
    
    return {"months": months_data}