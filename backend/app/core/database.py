from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import os

# Database URL configuration based on DB_TYPE
if settings.DB_TYPE == "sqlite":
    # SQLite for lightweight deployment
    DATABASE_URL = "sqlite:///./expense_advisor.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # PostgreSQL for production
    DATABASE_URL = settings.DATABASE_URL
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()