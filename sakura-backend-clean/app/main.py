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
from app.services.faq_embedding_service import init_faq_embedding_service
from app.services.langgraph_service import init_langgraph_service
from app.routes import ai, users, dashboard, knowledge_base, websocket, ai_agent_kb
from app.services.website_crawler_service import init_website_crawler_service
from app.services.file_processing_service import init_file_processing_service


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
        # Initialize database (optional for testing)
        print("🔗 Initializing database...")
        try:
            await init_database(settings)
        except Exception as e:
            print(f"⚠️  Database connection failed (this is OK for testing): {e}")
        
        # Initialize embeddings service
        print("🤖 Initializing embeddings service...")
        embeddings_service = init_embeddings_service(settings)
        
        # Initialize vector store service
        print("📚 Initializing vector store service...")
        vector_store_service = init_vector_store_service(settings, embeddings_service)
        
        # Initialize FAQ embedding service
        print("💬 Initializing FAQ embedding service...")
        init_faq_embedding_service(vector_store_service, embeddings_service, settings)
        
        # Initialize LangGraph service
        print("🧠 Initializing LangGraph service...")
        init_langgraph_service(settings, vector_store_service)
        
        # Initialize website crawler service
        print("🕷️  Initializing website crawler service...")
        db_manager_instance = get_db_manager()
        db_instance = db_manager_instance.get_database() if db_manager_instance else None
        init_website_crawler_service(settings, db=db_instance)
        
        # Initialize file processing service
        print("📄 Initializing file processing service...")
        init_file_processing_service(settings, db=db_instance)
        
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
        allow_origins=settings.frontend_urls_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routers
    app.include_router(ai.router)
    app.include_router(users.router)
    app.include_router(dashboard.router)
    app.include_router(knowledge_base.router)
    app.include_router(websocket.router)
    app.include_router(ai_agent_kb.router)
    
    # Root endpoint
    @app.get("/")
    async def root():
        return {
            "message": "Welcome to Sakura Backend API",
            "version": settings.app_version,
            "status": "running",
            "note": "This is the modular version with simplified services for testing"
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
