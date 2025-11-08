"""MongoDB connection management for the WebSocket microservice."""
from __future__ import annotations

import logging
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from .config import settings

logger = logging.getLogger(__name__)

_client: Optional[AsyncIOMotorClient] = None
_database: Optional[AsyncIOMotorDatabase] = None


def connect_to_mongo() -> AsyncIOMotorDatabase:
    """Initialise the Mongo client and return the database handle."""
    global _client, _database

    if _client is None:
        logger.info("🔗 Connecting to MongoDB at %s", settings.mongo_uri)
        _client = AsyncIOMotorClient(settings.mongo_uri)
        _database = _client[settings.mongo_db]
    return _database  # type: ignore[return-value]


def get_database() -> AsyncIOMotorDatabase:
    if _database is None:
        raise RuntimeError("MongoDB not initialised. Call connect_to_mongo() first.")
    return _database


def close_mongo() -> None:
    global _client, _database

    if _client is not None:
        logger.info("🔌 Closing MongoDB connection")
        _client.close()

    _client = None
    _database = None
