# Environment Configuration for Sakura Backend

## 🔧 Environment Variables

Create a `.env` file in the project root with the following variables:

### Required Environment Variables

```bash
# Backend Configuration
BACKEND_BASE_URL=http://localhost:8000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=sakura

# AI Configuration (Optional for testing)
OPENAI_API_KEY=your_openai_api_key_here
HUGGINGFACE_API_TOKEN=your_huggingface_api_token_here
```

### Optional Environment Variables

```bash
# LangChain Configuration (optional)
LANGCHAIN_API_KEY=your_langchain_api_key_here
LANGCHAIN_TRACING_V2=false
LANGCHAIN_PROJECT=sakura-backend

# Frontend URLs for CORS (comma-separated)
FRONTEND_URLS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001

# File Paths
AOPS_FILE_PATH=aops.json
FAISS_INDEX_PATH=faiss_index
JSONL_DATA_PATH=jsonl_data
REGIRL_CHUNK_PATH=regirl_chunk

# Embeddings Configuration
EMBEDDINGS_MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
EMBEDDINGS_MODEL_NAME_API=sentence-transformers/all-mpnet-base-v2

# Deployment
RENDER=false
DEBUG=true
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
uv sync
```

### 2. Run the Application
```bash
# Development with auto-reload
uv run uvicorn main:app --reload

# Production
uv run uvicorn main:app --host 0.0.0.0 --port 8000
```

### 3. Test the API
```bash
# Health check
curl http://localhost:8000/api/health

# Root endpoint
curl http://localhost:8000/

# Chat endpoint
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!", "session_id": "test123"}'
```

## 📁 Project Structure

```
/app
  main.py                    # FastAPI application entry point
  /core
    settings.py              # Configuration with Pydantic BaseSettings
    database.py              # MongoDB connection management
  /models
    chat_model.py            # Pydantic models for API requests/responses
  /routes
    ai.py                    # AI/chat endpoints (/api/chat, /api/aop, /api/health)
    users.py                 # User management endpoints (/api/users/*)
  /services
    embeddings_service.py    # Text embeddings (simplified for testing)
    vector_store_service.py  # Vector store operations (simplified for testing)
    langgraph_service.py     # AI workflows (simplified for testing)
```

## 🔄 Migration from Original Project

The original monolithic `main.py` (1208 lines) has been refactored into:

1. **Configuration** → `app/core/settings.py`
2. **Database** → `app/core/database.py`
3. **AI Services** → `app/services/*.py`
4. **API Routes** → `app/routes/*.py`
5. **Data Models** → `app/models/*.py`

## 🎯 Next Steps for Production

1. **Add Real AI Dependencies**:
   ```bash
   uv add langchain langgraph langchain-huggingface faiss-cpu sentence-transformers
   ```

2. **Set up MongoDB** (or use MongoDB Atlas)

3. **Configure Environment Variables** for your deployment platform

4. **Add Authentication** and security middleware

5. **Set up Monitoring** and logging

## ✅ Benefits Achieved

- **Modular Architecture**: Clean separation of concerns
- **Type Safety**: Full Pydantic validation
- **Dependency Injection**: Services injected via FastAPI
- **Testable**: Each service can be unit tested
- **Production Ready**: Proper error handling and logging
- **Scalable**: Easy to add new features and services

