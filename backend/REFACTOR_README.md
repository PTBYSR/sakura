# Sakura Backend - Modular FastAPI Structure

This is the refactored Sakura Backend with a clean, modular architecture ready for production.

## Project Structure

```
/app
  main.py                    # FastAPI application entry point
  /core
    __init__.py
    config.py                # Configuration and constants
    database.py              # Database connection and management
    settings.py              # Pydantic BaseSettings for environment variables
  /models
    __init__.py
    user_model.py            # User-related data models
    chat_model.py            # Chat and AI-related data models
  /routes
    __init__.py
    users.py                 # User management endpoints
    ai.py                    # AI/chat endpoints
  /services
    __init__.py
    langgraph_service.py     # LangGraph workflows and AI agent logic
    embeddings_service.py    # Text embeddings and model loading
    vector_store_service.py  # FAISS vector store operations
```

## Key Features

### 🏗️ **Modular Architecture**
- **Separation of Concerns**: Each module has a single responsibility
- **Dependency Injection**: Services are injected via FastAPI's dependency system
- **Clean Imports**: Absolute imports throughout the codebase

### ⚙️ **Configuration Management**
- **Pydantic BaseSettings**: Type-safe environment variable loading
- **Environment-specific configs**: Easy switching between dev/staging/production
- **Centralized settings**: All configuration in one place

### 🗄️ **Database Layer**
- **Async MongoDB**: Non-blocking database operations
- **Connection pooling**: Optimized for production workloads
- **Retry logic**: Robust connection handling

### 🤖 **AI Services**
- **LangGraph Integration**: Advanced AI agent workflows
- **Vector Search**: FAISS-based similarity search
- **Embeddings**: HuggingFace model support (local + API)

### 🛣️ **API Routes**
- **RESTful Design**: Clean, predictable endpoints
- **Request/Response Models**: Pydantic validation
- **Error Handling**: Comprehensive error responses

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements_new.txt
```

### 2. Environment Setup
Create a `.env` file:
```bash
# Database
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=sakura

# AI Configuration
OPENAI_API_KEY=your_openai_api_key
HUGGINGFACE_API_TOKEN=your_huggingface_token

# Application
DEBUG=true
PORT=8000
```

### 3. Run the Application
```bash
# Development
python main_new.py

# Production
gunicorn main_new:app --bind 0.0.0.0:8000 --workers 4
```

## API Endpoints

### Chat & AI
- `POST /api/chat` - Process chat messages
- `POST /api/aop` - Run Agent Operating Procedures
- `GET /api/health` - Health check

### Users
- `POST /api/users/data` - Store user data
- `GET /api/users/data/{user_id}` - Retrieve user data

## Migration from Old Structure

The old `main.py` has been refactored into:

1. **Configuration** → `app/core/settings.py`
2. **Database** → `app/core/database.py`
3. **LangGraph** → `app/services/langgraph_service.py`
4. **Embeddings** → `app/services/embeddings_service.py`
5. **Vector Store** → `app/services/vector_store_service.py`
6. **Routes** → `app/routes/ai.py` & `app/routes/users.py`
7. **Models** → `app/models/chat_model.py`

## Benefits

✅ **Testable**: Each service can be unit tested independently  
✅ **Scalable**: Easy to add new features and services  
✅ **Maintainable**: Clear separation of concerns  
✅ **Production-Ready**: Proper error handling and logging  
✅ **Type-Safe**: Full Pydantic validation throughout  

## Next Steps

1. **Testing**: Add unit tests for each service
2. **Documentation**: Generate API docs with FastAPI
3. **Monitoring**: Add logging and metrics
4. **Deployment**: Configure for your deployment platform

