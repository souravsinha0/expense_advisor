from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.routes import auth, users, expenses, reports, ai_chat, notifications, static_files, expense_crud
from app.services.scheduler_service import start_scheduler, stop_scheduler
from fastapi.staticfiles import StaticFiles
import os


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    start_scheduler()
    yield
    # Shutdown
    stop_scheduler()

app = FastAPI(title=settings.APP_NAME, version="1.0.0", lifespan=lifespan)

# Mount static files
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(STATIC_DIR, exist_ok=True)
# Mount reports
REPORT_DIR = os.path.join(os.path.dirname(__file__), "static", "reports")
os.makedirs(REPORT_DIR, exist_ok=True)

app.mount("/app/static", StaticFiles(directory=STATIC_DIR), name="static")
app.mount("/app/static/reports", StaticFiles(directory=REPORT_DIR), name="reports")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(expenses.router, prefix="/api/expenses", tags=["expenses"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(ai_chat.router, prefix="/api/ai", tags=["ai"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(static_files.router, tags=["static"])
app.include_router(expense_crud.router, prefix="/api/expenses", tags=["expense-crud"])

@app.get("/")
async def root():
    return {"message": "Expense Advisor API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}