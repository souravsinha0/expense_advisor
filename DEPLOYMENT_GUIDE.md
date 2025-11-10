# Expense Advisor - Deployment Guide

## Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

## Local Development Setup

### 1. Clone and Setup Environment
```bash
git clone <repository-url>
cd expense_advisor
cp backend/.env.example backend/.env
```

### 2. Update Environment Variables
Edit `backend/.env` with your actual values:
- Database credentials
- Email SMTP settings
- Secret keys

### 3. Start Services with Docker
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 4. Initialize Database
```bash
# Run migrations
docker-compose exec backend alembic upgrade head

# Create initial admin user (optional)
docker-compose exec backend python -c "
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash
db = SessionLocal()
user = User(email='admin@example.com', hashed_password=get_password_hash('admin123'))
db.add(user)
db.commit()
"
```

### 5. Setup Ollama Model
```bash
# Pull the model
docker-compose exec ollama ollama pull llama2
```

## Production Deployment

### 1. Environment Setup
- Use production database (managed PostgreSQL)
- Configure proper SMTP settings
- Set strong secret keys
- Enable SSL/TLS

### 2. Docker Compose for Production
```yaml
# Use production docker-compose.prod.yml
version: '3.8'
services:
  backend:
    build: ./backend
    environment:
      - DEBUG=False
      - DATABASE_URL=postgresql://user:pass@prod-db:5432/expense_advisor
    restart: unless-stopped
  
  frontend:
    build: ./frontend
    environment:
      - NODE_ENV=production
    restart: unless-stopped
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    restart: unless-stopped
```

### 3. Security Considerations
- Use HTTPS in production
- Configure firewall rules
- Regular security updates
- Backup database regularly
- Monitor application logs

## Mobile App Deployment

### Android
```bash
cd frontend
expo build:android
```

### iOS
```bash
cd frontend
expo build:ios
```

## Monitoring and Maintenance
- Set up log aggregation
- Configure health checks
- Monitor resource usage
- Regular database backups
- Update dependencies regularly