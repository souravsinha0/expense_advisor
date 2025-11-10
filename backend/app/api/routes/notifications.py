from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.routes.auth import get_current_user
from app.models.user import User
from app.services.notification_service import send_monthly_report, send_daily_reminder
from pydantic import BaseModel

router = APIRouter()

class NotificationResponse(BaseModel):
    message: str

@router.post("/test-monthly-report", response_model=NotificationResponse)
async def test_monthly_report(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    background_tasks.add_task(send_monthly_report, current_user.id)
    return NotificationResponse(message="Monthly report will be sent shortly")

@router.post("/test-daily-reminder", response_model=NotificationResponse)
async def test_daily_reminder(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    background_tasks.add_task(send_daily_reminder, current_user.id)
    return NotificationResponse(message="Daily reminder will be sent shortly")