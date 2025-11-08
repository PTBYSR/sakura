"""Async Redis publisher used to forward events to the WebSocket microservice."""
from __future__ import annotations

import json
import logging
from typing import Optional

from redis.asyncio import Redis

from app.core.settings import get_settings

logger = logging.getLogger(__name__)

_redis_client: Optional[Redis] = None


async def init_redis_publisher() -> None:
    """Initialise the Redis client for publishing events."""
    global _redis_client

    if _redis_client is not None:
        return

    settings = get_settings()
    logger.info("🔗 Connecting to Redis publisher at %s", settings.redis_url)
    _redis_client = Redis.from_url(
        settings.redis_url,
        encoding="utf-8",
        decode_responses=True,
    )


def get_redis_publisher() -> Redis:
    if _redis_client is None:
        raise RuntimeError("Redis publisher has not been initialised. Call init_redis_publisher().")
    return _redis_client


async def publish_event(channel: str, payload: dict) -> None:
    """Publish a JSON payload to the given channel."""
    if _redis_client is None:
        logger.warning("Redis publisher invoked before initialisation; skipping publish")
        return

    message = json.dumps(payload, default=str)
    await _redis_client.publish(channel, message)
    logger.debug("📤 Published message to %s", channel)


async def close_redis_publisher() -> None:
    global _redis_client

    if _redis_client is not None:
        await _redis_client.close()
        _redis_client = None
