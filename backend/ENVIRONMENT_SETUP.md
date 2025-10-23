# Environment Configuration for Sakura Backend

## 🔧 Environment Variables

The backend now uses environment variables instead of hardcoded URLs. Create a `.env` file in the backend directory with the following variables:

### Required Environment Variables

```bash
# Backend Configuration
BACKEND_BASE_URL=http://localhost:8000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
```

### Optional Environment Variables

```bash
# LangChain Configuration (optional)
LANGCHAIN_API_KEY=your_langchain_api_key_here
LANGCHAIN_TRACING_V2=false
LANGCHAIN_PROJECT=sakura-backend

# Frontend URLs for CORS (comma-separated)
FRONTEND_URLS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001
```

## 🚀 Setup Instructions

### 1. Create Environment File
```bash
# Copy the example file
cp backend/env.example backend/.env

# Edit the .env file with your actual values
nano backend/.env
```

### 2. Configure for Different Environments

#### Local Development
```bash
BACKEND_BASE_URL=http://localhost:8000
FRONTEND_URLS=http://localhost:3000,http://127.0.0.1:3000
```

#### Production (Render.com)
```bash
BACKEND_BASE_URL=https://your-app-name.onrender.com
FRONTEND_URLS=https://your-frontend-domain.com
```

#### Staging
```bash
BACKEND_BASE_URL=https://your-staging-app.onrender.com
FRONTEND_URLS=https://your-staging-frontend.com
```

## 🔍 Changes Made

### 1. CORS Configuration
- **Before**: Hardcoded frontend URLs in `main.py`
- **After**: Dynamic URLs from `FRONTEND_URLS` environment variable

### 2. Port Configuration
- **Already using**: `os.environ.get("PORT", 8000)` for Render.com compatibility

### 3. Database Configuration
- **Already using**: `os.getenv("MONGODB_URI", "mongodb://localhost:27017")` in `monog_test.py`

## 🛠️ Benefits

1. **Flexibility**: Easy to switch between development, staging, and production
2. **Security**: No hardcoded URLs in source code
3. **Deployment**: Works seamlessly with Render.com and other cloud platforms
4. **Team Development**: Each developer can have their own configuration

## 📝 Notes

- All hardcoded `localhost:8000` and `localhost:3000` references have been removed
- Default fallbacks are provided for local development
- The backend will work out-of-the-box for local development
- Production deployments should set appropriate environment variables
