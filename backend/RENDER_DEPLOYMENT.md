# Render.com Deployment Guide for Sakura Backend

## 🚀 Deployment Configuration

### Build Command
```bash
pip install -r requirements.txt
```

### Start Command (Render.com Production)
```bash
python main.py
```

**Alternative Production Start Commands:**
- Using Gunicorn (recommended for production): `gunicorn main:app --bind 0.0.0.0:$PORT --workers 4 --worker-class uvicorn.workers.UvicornWorker --timeout 120 --keep-alive 2 --max-requests 1000 --max-requests-jitter 100 --preload`
- Using the startup script: `chmod +x start.sh && ./start.sh`

### Local Development Commands
```bash
# For local development (with hot reload)
uvicorn main:app --reload

# Or using the main.py directly
python main.py
```

### Environment Variables Required

Set these in your Render.com dashboard:

1. **MONGO_URI** - Your MongoDB Atlas connection string
2. **OPENAI_API_KEY** - Your OpenAI API key
3. **LANGCHAIN_API_KEY** - Your LangChain API key (optional)
4. **LANGCHAIN_TRACING_V2** - Set to "true" for tracing (optional)
5. **LANGCHAIN_PROJECT** - Your LangChain project name (optional)

### Python Version
- **Python 3.11.7** (specified in runtime.txt)

### Instance Configuration
- **Instance Type**: Starter (free tier) or higher
- **Auto-Deploy**: Enable for automatic deployments from main branch

## 📁 File Structure
```
backend/
├── main.py                 # Main FastAPI application
├── requirements.txt        # Python dependencies
├── runtime.txt            # Python version specification
├── start.sh              # Production startup script
├── Procfile              # Alternative startup configuration
├── storage.py            # Database operations
├── actions.py            # LangGraph actions
├── aops.json            # AOPs configuration
└── faiss_index/         # Vector store files
```

## 🔧 Production Optimizations

1. **Gunicorn Configuration**: Optimized for production with multiple workers
2. **Environment Detection**: Automatically detects Render.com environment
3. **Port Configuration**: Uses Render.com's PORT environment variable
4. **Error Handling**: Comprehensive error handling and logging
5. **Health Checks**: Built-in health endpoint at `/health`

## 🚨 Important Notes

1. **MongoDB Atlas**: Ensure your MongoDB Atlas cluster allows connections from Render.com IPs
2. **File Storage**: Vector store files (faiss_index/) need to be included in deployment
3. **Environment Variables**: All required environment variables must be set in Render.com dashboard
4. **Memory Usage**: The application uses sentence-transformers which can be memory-intensive

## 🔍 Troubleshooting

### Common Issues:
1. **Build Failures**: Check Python version compatibility
2. **Memory Issues**: Consider upgrading to a higher instance type
3. **Database Connection**: Verify MongoDB Atlas whitelist settings
4. **Import Errors**: Ensure all dependencies are in requirements.txt

### Health Check:
Visit `https://your-app-name.onrender.com/health` to verify deployment

## 📊 Monitoring

The application includes:
- Health check endpoint
- Comprehensive logging
- Error tracking
- Performance monitoring through LangSmith (if configured)
