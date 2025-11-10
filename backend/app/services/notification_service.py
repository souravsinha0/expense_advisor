import smtplib
import pandas as pd
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.user import User
from app.models.expense import Expense, TransactionType
from app.core.database import SessionLocal
import io
import logging

logger = logging.getLogger(__name__)

def send_email(to_email: str, subject: str, body: str, attachment_data=None, attachment_name=None):
    """Send email with optional attachment"""
    try:
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'plain'))
        
        if attachment_data and attachment_name:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(attachment_data)
            encoders.encode_base64(part)
            part.add_header(
                'Content-Disposition',
                f'attachment; filename= {attachment_name}'
            )
            msg.attach(part)
        
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(settings.SMTP_USER, to_email, text)
        server.quit()
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

def generate_monthly_report_csv(user_id: int, db: Session) -> bytes:
    """Generate CSV report for monthly expenses"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    # Get current month expenses
    current_date = datetime.now()
    expenses = db.query(Expense).filter(
        Expense.user_id == user_id,
        Expense.transaction_date >= datetime(current_date.year, current_date.month, 1),
        Expense.transaction_date < datetime(current_date.year, current_date.month + 1, 1) if current_date.month < 12 else datetime(current_date.year + 1, 1, 1)
    ).all()
    
    # Create DataFrame
    data = []
    for expense in expenses:
        data.append({
            'Date': expense.transaction_date.strftime('%Y-%m-%d'),
            'Details': expense.details,
            'Type': expense.transaction_type.value.title(),
            'Amount': expense.amount,
            'Currency': user.currency
        })
    
    df = pd.DataFrame(data)
    
    # Convert to CSV bytes
    csv_buffer = io.StringIO()
    df.to_csv(csv_buffer, index=False)
    return csv_buffer.getvalue().encode('utf-8')

def send_monthly_report(user_id: int):
    """Send monthly report to user"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.monthly_report_enabled:
            return
        
        csv_data = generate_monthly_report_csv(user_id, db)
        if not csv_data:
            return
        
        current_month = datetime.now().strftime('%B %Y')
        subject = f"Monthly Expense Report - {current_month}"
        body = f"""
Dear {user.full_name or 'User'},

Please find attached your monthly expense report for {current_month}.

Best regards,
Expense Advisor Team
        """
        
        send_email(
            user.email,
            subject,
            body,
            csv_data,
            f"expense_report_{datetime.now().strftime('%Y_%m')}.csv"
        )
    finally:
        db.close()

def send_daily_reminder(user_id: int):
    """Send daily reminder to user"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.daily_reminder_time:
            return
        
        subject = "Daily Expense Reminder"
        body = f"""
Dear {user.full_name or 'User'},

Don't forget to log your expenses for today!

Track your spending to maintain better financial health.

Best regards,
Expense Advisor Team
        """
        
        send_email(user.email, subject, body)
    finally:
        db.close()

def get_users_for_monthly_report() -> list:
    """Get users who should receive monthly reports"""
    db = SessionLocal()
    try:
        current_day = datetime.now().day
        users = db.query(User).filter(
            User.monthly_report_enabled == True,
            User.monthly_cycle_start == current_day
        ).all()
        return [user.id for user in users]
    finally:
        db.close()

def get_users_for_daily_reminder() -> list:
    """Get users who should receive daily reminders"""
    db = SessionLocal()
    try:
        current_time = datetime.now().strftime('%H:%M')
        users = db.query(User).filter(
            User.daily_reminder_time == current_time
        ).all()
        return [user.id for user in users]
    finally:
        db.close()