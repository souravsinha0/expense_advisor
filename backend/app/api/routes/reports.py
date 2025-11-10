from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import extract, and_
from app.core.database import get_db
from app.api.routes.auth import get_current_user
from app.models.user import User
from app.models.expense import Expense, TransactionType
from app.services.report_service import generate_pdf_report, generate_excel_report
from datetime import datetime
from typing import Optional
import os

router = APIRouter()



@router.get("/pdf")
async def generate_pdf(
    from_year: int = Query(..., ge=2000, le=2100),
    from_month: int = Query(..., ge=1, le=12),
    to_year: int = Query(..., ge=2000, le=2100),
    to_month: int = Query(..., ge=1, le=12),
    transaction_type: Optional[TransactionType] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Build date range
        start_date = datetime(from_year, from_month, 1)
        if to_month == 12:
            end_date = datetime(to_year + 1, 1, 1)
        else:
            end_date = datetime(to_year, to_month + 1, 1)

        print(f"Date range: {start_date} to {end_date}")

        query = db.query(Expense).filter(
            Expense.user_id == current_user.id,
            Expense.transaction_date >= start_date,
            Expense.transaction_date < end_date
        )

        if transaction_type:
            query = query.filter(Expense.transaction_type == transaction_type)

        expenses = query.order_by(Expense.transaction_date.desc()).order_by(Expense.created_at.desc()).all()
        print(f"Found {len(expenses)} expenses")

        file_path = generate_pdf_report(expenses, current_user)

        if not os.path.exists(file_path):
            raise HTTPException(status_code=500, detail="PDF file was not created")

        fileName = f"report_{current_user.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        return FileResponse(
            path=file_path,
            media_type='application/pdf',
            filename=fileName,
            headers={"Content-Disposition": f'attachment; filename="{fileName}"'}
        )

    except Exception as e:
        print(f"PDF API error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/excel")
async def generate_excel(
    from_year: int = Query(...),
    from_month: int = Query(...),
    to_year: int = Query(...),
    to_month: int = Query(...),
    transaction_type: Optional[TransactionType] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Expense).filter(Expense.user_id == current_user.id)
    
    # Date range filter
    from_date = datetime(from_year, from_month, 1)
    if to_month == 12:
        to_date = datetime(to_year + 1, 1, 1)
    else:
        to_date = datetime(to_year, to_month + 1, 1)
    
    query = query.filter(
        Expense.transaction_date >= from_date,
        Expense.transaction_date < to_date
    )
    
    if transaction_type:
        query = query.filter(Expense.transaction_type == transaction_type)
    
    expenses = query.order_by(Expense.transaction_date.desc()).all()
    
    file_path = generate_excel_report(expenses, current_user)
    fileName = f"report_{current_user.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    return FileResponse(
        file_path,
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename=fileName
    )