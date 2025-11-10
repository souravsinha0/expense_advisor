from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from app.services.notification_service import (
    send_monthly_report, 
    send_daily_reminder,
    get_users_for_monthly_report,
    get_users_for_daily_reminder
)
from app.services.cleanup_service import cleanup_old_files
import logging

logger = logging.getLogger(__name__)
scheduler = BackgroundScheduler()

def send_monthly_reports():
    """Send monthly reports to all eligible users"""
    try:
        user_ids = get_users_for_monthly_report()
        for user_id in user_ids:
            send_monthly_report(user_id)
        logger.info(f"Monthly reports sent to {len(user_ids)} users")
    except Exception as e:
        logger.error(f"Error sending monthly reports: {str(e)}")

def send_daily_reminders():
    """Send daily reminders to all eligible users"""
    try:
        user_ids = get_users_for_daily_reminder()
        for user_id in user_ids:
            send_daily_reminder(user_id)
        logger.info(f"Daily reminders sent to {len(user_ids)} users")
    except Exception as e:
        logger.error(f"Error sending daily reminders: {str(e)}")

def start_scheduler():
    """Start the background scheduler"""
    # Check for monthly reports daily at 9 AM
    scheduler.add_job(
        send_monthly_reports,
        CronTrigger(hour=9, minute=0),
        id='monthly_reports',
        replace_existing=True
    )
    
    # Check for daily reminders every hour
    scheduler.add_job(
        send_daily_reminders,
        CronTrigger(minute=0),
        id='daily_reminders',
        replace_existing=True
    )
    
    # Clean up old files daily at 2 AM
    scheduler.add_job(
        cleanup_old_files,
        CronTrigger(hour=2, minute=0),
        id='file_cleanup',
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("Scheduler started successfully")

def stop_scheduler():
    """Stop the background scheduler"""
    scheduler.shutdown()
    logger.info("Scheduler stopped")