"""Redis pub/sub listener that forwards events to WebSocket clients."""
from __future__ import annotations

import asyncio
import contextlib
import json
import logging
from typing import Optional

from redis.asyncio import Redis
from redis.asyncio.client import PubSub

from .config import settings
from .connection_manager import ConnectionManager

logger = logging.getLogger(__name__)


class RedisSubscriber:
    """Subscribes to Redis channels and rebroadcasts payloads to WS clients."""

    def __init__(self, manager: ConnectionManager) -> None:
        self._manager = manager
        self._redis: Optional[Redis] = None
        self._pubsub: Optional[PubSub] = None
        self._listen_task: Optional[asyncio.Task] = None
        self._running = False

    async def start(self) -> None:
        if self._running:
            return

        logger.info("🔗 Connecting to Redis at %s", settings.redis_url)
        self._redis = Redis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True,
        )
        self._pubsub = self._redis.pubsub()
        await self._pubsub.subscribe(*settings.redis_channel_list)
        self._running = True
        self._listen_task = asyncio.create_task(self._listen_loop())
        logger.info(
            "📡 Subscribed to Redis channels: %s",
            ", ".join(settings.redis_channel_list),
        )

    async def stop(self) -> None:
        self._running = False

        if self._listen_task:
            self._listen_task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await self._listen_task
            self._listen_task = None

        if self._pubsub:
            await self._pubsub.close()
            self._pubsub = None

        if self._redis:
            await self._redis.close()
            self._redis = None

    async def _listen_loop(self) -> None:
        assert self._pubsub is not None

        try:
            async for message in self._pubsub.listen():
                if not self._running:
                    break

                if message.get("type") != "message":
                    continue

                channel = message.get("channel")
                data = message.get("data")
                if channel is None or data is None:
                    continue

                try:
                    payload = json.loads(data)
                    logger.debug("📥 Redis message on %s: %s", channel, payload)
                except json.JSONDecodeError:
                    logger.warning(
                        "⚠️ Ignoring non-JSON payload from Redis channel %s: %s", channel, data
                    )
                    continue

                try:
                    await self._manager.broadcast(channel, payload)
                except Exception as exc:  # noqa: BLE001
                    logger.error("❌ Failed to broadcast %s event: %s", channel, exc)
        except asyncio.CancelledError:
            logger.info("Redis listener cancelled")
            raise
        except Exception as exc:  # noqa: BLE001
            logger.error("❌ Redis listener crashed: %s", exc)
        finally:
            logger.info("Redis listener stopped")
