# Local Development Setup Guide

## Quick Start (Recommended)

### Using Docker Compose
```bash
# 1. Clone the repository
git clone <your-repo-url>
cd expense_advisor

# 2. Copy environment file
cp backend/.env.example backend/.env

# 3. Start all services
docker-compose up -d

# 4. Initialize database
docker-compose exec backend alembic upgrade head

# 5. Setup Ollama model
docker-compose exec ollama ollama pull llama2

# 6. Access the application
# Web: http://localhost:3000
# API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## Manual Setup (Development)

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Edit the configs in .env file as well as alembic.ini file before running the migration:

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# For web development
npm run web
```

### Database Setup (PostgreSQL)
```bash
# Using Docker
docker run --name expense-postgres -e POSTGRES_PASSWORD=expense_pass -e POSTGRES_USER=expense_user -e POSTGRES_DB=expense_advisor -p 5432:5432 -d postgres:15

# Or install PostgreSQL locally and create database
createdb expense_advisor
```

### Email Configuration
```bash
# Configure SMTP settings in .env file
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Ollama Setup
```bash
# Install Ollama locally
curl -fsSL https://ollama.ai/install.sh | sh

# Pull model
ollama pull llama2

# Start Ollama server
ollama serve
```

## Development Tools

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### API Testing
```bash
# Access API documentation
http://localhost:8000/docs

# Test endpoints with curl
curl -X POST "http://localhost:8000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### Frontend Development
```bash
# Run on different platforms
npm run web      # Web browser
npm run android  # Android emulator
npm run ios      # iOS simulator
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Ensure database exists

2. **Ollama Not Responding**
   - Check if Ollama service is running
   - Verify OLLAMA_BASE_URL in .env
   - Pull the required model

3. **Frontend Build Issues**
   - Clear node_modules and reinstall
   - Check Node.js version (18+)
   - Verify API_URL configuration

4. **Email Notification Issues**
   - Check SMTP configuration in .env
   - Verify email credentials
   - Test with notification endpoints

### Logs and Debugging
```bash
# Backend logs
docker-compose logs backend

# Database logs
docker-compose logs postgres

# All services logs
docker-compose logs -f
```