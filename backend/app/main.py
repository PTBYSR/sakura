"""
Sakura Backend - Main FastAPI application entry point.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.settings import get_settings, Settings
from app.core.database import init_database, get_db_manager
from app.services.embeddings_service import init_embeddings_service
from app.services.vector_store_service import init_vector_store_service
from app.services.langgraph_service import init_langgraph_service
from app.routes import ai, users


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events."""
    settings = get_settings()
    
    # Startup
    print("🚀 Starting up Sakura Backend...")
    
    try:
        # Initialize database
        print("🔗 Initializing database...")
        await init_database(settings)
        
        # Initialize embeddings service
        print("🤖 Initializing embeddings service...")
        embeddings_service = init_embeddings_service(settings)
        
        # Initialize vector store service
        print("📚 Initializing vector store service...")
        vector_store_service = init_vector_store_service(settings, embeddings_service)
        
        # Initialize LangGraph service
        print("🧠 Initializing LangGraph service...")
        init_langgraph_service(settings, vector_store_service)
        
        print("✅ Startup complete - API ready to serve requests!")
        
    except Exception as e:
        print(f"❌ Startup failed: {e}")
        raise
    
    yield
    
    # Shutdown
    print("🛑 Shutting down Sakura Backend...")
    try:
        db_manager = get_db_manager()
        await db_manager.disconnect()
        print("✅ Shutdown complete")
    except Exception as e:
        print(f"❌ Shutdown error: {e}")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()
    
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        debug=settings.debug,
        lifespan=lifespan
    )
    
    # CORS configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.frontend_urls,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routers
    app.include_router(ai.router)
    app.include_router(users.router)
    
    # Root endpoint
    @app.get("/")
    async def root():
        return {
            "message": "Welcome to Sakura Backend API",
            "version": settings.app_version,
            "status": "running"
        }
    
    return app


# Create the application instance
app = create_app()


if __name__ == "__main__":
    import uvicorn
    settings = get_settings()
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )

