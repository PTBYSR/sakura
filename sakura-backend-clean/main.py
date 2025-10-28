"""
Sakura Backend - Main entry point.
This file imports the FastAPI app from the modular structure.
"""
from app.main import app

if __name__ == "__main__":
    import uvicorn
    from app.core.settings import get_settings
    
    settings = get_settings()
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )