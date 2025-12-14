#!/usr/bin/env python3
"""
Database initialization script for Expense Advisor
Supports both PostgreSQL and SQLite
"""

from app.core.database import engine, Base
from app.models.user import User
from app.models.expense import Expense
from app.core.config import settings

def init_database():
    """Initialize database tables"""
    print(f"Initializing database with {settings.DB_TYPE}...")
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        
        if settings.DB_TYPE == "sqlite":
            print("📁 SQLite database file: expense_advisor.db")
        else:
            print(f"🐘 PostgreSQL database: {settings.POSTGRES_DB}")
            
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    init_database()