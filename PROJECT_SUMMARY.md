# Expense Advisor - Project Summary

## Overview
AI-powered personal expense tracking application with web and mobile support.

## Tech Stack
- **Backend**: Python, FastAPI, PostgreSQL
- **Frontend**: React Native (Web & Mobile)
- **AI**: Ollama (Local LLM)
- **Scheduler**: APScheduler (Background Tasks)
- **Email**: SMTP (Notifications)
- **DevOps**: Docker, Docker Compose
- **Database**: PostgreSQL

## Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │     FastAPI     │    │   PostgreSQL    │
│   (Web/Mobile)  │◄──►│    Backend      │◄──►│    Database     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  APScheduler    │
                       │ (Email/Alerts)  │
                       └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │     Ollama      │
                       │   (AI Agent)    │
                       └─────────────────┘
```

## Key Features
1. User Authentication & Profile Management
2. Expense/Income Tracking with Calendar View
3. AI-powered Financial Insights
4. Automated Monthly Reports
5. Daily Reminders
6. Export to PDF/Excel
7. Interactive Charts & Analytics

## Project Structure
```
expense_advisor/
├── backend/                 # FastAPI backend
├── frontend/               # React Native app
├── docker/                 # Docker configurations
├── docs/                   # Documentation
└── scripts/               # Deployment scripts
```