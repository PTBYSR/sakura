"""
Database connection and initialization.
"""
import certifi
from pymongo import MongoClient
from typing import Optional
from app.core.settings import Settings


class DatabaseManager:
    """Manages database connections and operations."""
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self.client: Optional[MongoClient] = None
        self.db = None
        
    async def connect(self) -> None:
        """Establish database connection with retry logic."""
        max_retries = 3
        retry_delay = 5  # seconds
        
        for attempt in range(max_retries):
            try:
                print(f"🔄 Database connection attempt {attempt + 1}/{max_retries}")
                self.client = MongoClient(
                    self.settings.mongodb_uri,
                    tlsCAFile=certifi.where(),
                    serverSelectionTimeoutMS=30000,
                    connectTimeoutMS=30000,
                    socketTimeoutMS=30000,
                    maxPoolSize=10,
                    retryWrites=True
                )
                # Test connection
                self.client.admin.command('ping')
                self.db = self.client[self.settings.mongodb_db_name]
                print("✅ SUCCESS! MongoDB connected")
                return
                
            except Exception as e:
                print(f"❌ Connection attempt {attempt + 1} failed: {e}")
                if attempt < max_retries - 1:
                    print(f"⏳ Waiting {retry_delay} seconds before retry...")
                    import asyncio
                    await asyncio.sleep(retry_delay)
                else:
                    raise Exception(f"Failed to connect to MongoDB after {max_retries} attempts: {e}")
    
    async def disconnect(self) -> None:
        """Close database connection."""
        if self.client:
            self.client.close()
            print("🔌 MongoDB connection closed")
    
    def get_database(self):
        """Get the database instance."""
        if not self.db:
            raise Exception("Database not connected. Call connect() first.")
        return self.db


# Global database manager instance
db_manager: Optional[DatabaseManager] = None


async def init_database(settings: Settings) -> DatabaseManager:
    """Initialize database connection."""
    global db_manager
    db_manager = DatabaseManager(settings)
    await db_manager.connect()
    return db_manager


def get_database():
    """Get database instance for dependency injection."""
    if not db_manager or not db_manager.db:
        raise Exception("Database not initialized. Call init_database() first.")
    return db_manager.db


def get_db_manager() -> DatabaseManager:
    """Get database manager instance."""
    if not db_manager:
        raise Exception("Database manager not initialized. Call init_database() first.")
    return db_manager

