"""
Simple test version of the refactored app without problematic dependencies.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    """Simple settings for testing."""
    app_name: str = "Sakura Backend"
    app_version: str = "1.0.0"
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000
    frontend_urls: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Create FastAPI app
app = FastAPI(
    title="Sakura Backend",
    version="1.0.0",
    debug=True
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "Welcome to Sakura Backend API",
        "version": "1.0.0",
        "status": "running",
        "note": "This is a simplified version for testing the modular structure"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "Simplified version running successfully"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
