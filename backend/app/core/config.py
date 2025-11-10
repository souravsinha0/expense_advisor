from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "Expense Advisor"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # Email
    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_USER: str
    SMTP_PASSWORD: str
    
    # Ollama
    OLLAMA_BASE_URL: str
    
    # File Retention
    FILE_RETENTION_DAYS: int = 7

    SERVER_BASE_URL: str = "http://localhost:8000"
    
    class Config:
        env_file = ".env"

settings = Settings()