# EvoMind Backend API

A Django REST Framework backend for the EvoMind emotional wellness companion application that helps users understand and navigate their emotional journey.

## 🛠️ Technical Stack

- **Framework**: Django 4.2.7 + Django REST Framework
- **Database**: PostgreSQL 
- **Caching**: Redis
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: 
  - Gemini AI
  - Custom ML models
- **API Documentation**: Swagger/OpenAPI

## 📋 Features

### Core Features
- User authentication and authorization
- Journaling system with emotional analysis
- AI-powered emotional pattern detection
- Self-care routines and exercises
- Dashboard with mood tracking and insights
- Real-time chat with AI companion
- Recommended support from professional based on self assesment

### Key Components
- **Journal Analysis**: Analyzes journal entries using AI to detect emotional patterns
- **Mood Tracking**: Daily mood logging and weekly trend analysis  
- **Analytics**: Provides insights on writing patterns and emotional trends with AI
- **Self-Care**: Customizable routines with various exercise categories
- **User Progress**: Tracks achievements and journaling streaks
- **Chat**: Async chat implementation with AI companion

## 🚀 Getting Started

### Prerequisites
```bash
- Python 3.12+
- PostgreSQL
- Redis
```

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
```

Required environment variables:
```
DJANGO_SECRET_KEY=your_secret_key
DATABASE_URL=postgres://user:password@localhost:5432/dbname
REDIS_URL=redis://localhost:6379/0
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

5. Run migrations:
```bash
python manage.py migrate
```

6. Start development server:
```bash
python manage.py runserver
```

## 📚 API Documentation

API documentation is available at:
- Swagger UI: `/swagger/`
- ReDoc: `/redoc/`

### Main Endpoints

#### Authentication
- POST `/api/v1/auth/login`
- POST `/api/v1/auth/register`
- POST `/api/v1/auth/logout`
- POST `/api/v1/auth/refresh-token`

#### Journal
- GET `/api/v1/journals`
- POST `/api/v1/journals`
- GET `/api/v1/journals/:id`
- PUT `/api/v1/journals/:id`
- GET `/api/v1/journals/history`

#### Analysis
- POST `/api/v1/analysis/journal`
- POST `/api/v1/analysis/trauma-pattern`
- GET `/api/v1/insights/patterns`
- GET `/api/v1/insights/recommendations`

#### User Management
- GET/PUT `/api/v1/users/profile`
- GET/PUT `/api/v1/users/settings`
- GET/POST `/api/v1/users/onboarding`
- GET `/api/v1/users/dashboard`
- GET `/api/v1/users/analytics`

## 🔒 Security Considerations

- JWT-based authentication
- Rate limiting on sensitive endpoints
- HTTPS required in production
- CSRF protection enabled
- Request validation
- Audit logging for sensitive operations

## 🧪 Testing

Run tests using:
```bash
python manage.py test
```

## 🚀 Deployment

1. Set `DEBUG=False` in production
2. Configure proper CORS settings
3. Enable HTTPS
4. Set up proper database configuration
5. Configure Redis for caching
6. Set up proper logging

## ⚡ Performance Optimizations

- Database query optimization with proper indexing
- Redis caching for frequently accessed data
- Pagination for list endpoints
- Async support for AI operations
- Request/response compression

## 👥 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request