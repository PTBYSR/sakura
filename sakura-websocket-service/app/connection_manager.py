"""Connection management for the WebSocket microservice."""
from __future__ import annotations

import json
import logging
from typing import Dict, Set, Callable, Awaitable, Optional

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Tracks active WebSocket connections and their subscriptions."""

    def __init__(self) -> None:
        self._connections: Dict[str, WebSocket] = {}
        self._subscriptions: Dict[str, Set[str]] = {}

    async def connect(self, websocket: WebSocket, connection_id: str) -> None:
        await websocket.accept()
        self._connections[connection_id] = websocket
        logger.info("WebSocket connected: %s", connection_id)

    def disconnect(self, connection_id: str) -> None:
        if connection_id not in self._connections:
            return

        del self._connections[connection_id]

        for subscribers in self._subscriptions.values():
            subscribers.discard(connection_id)

        logger.info("WebSocket disconnected: %s", connection_id)

    def subscribe(self, connection_id: str, subscription: str) -> None:
        if subscription not in self._subscriptions:
            self._subscriptions[subscription] = set()
        self._subscriptions[subscription].add(connection_id)
        logger.info(
            "Connection %s subscribed to %s (count=%d)",
            connection_id,
            subscription,
            len(self._subscriptions[subscription]),
        )

    def unsubscribe(self, connection_id: str, subscription: str) -> None:
        if subscription not in self._subscriptions:
            return
        self._subscriptions[subscription].discard(connection_id)
        logger.info(
            "Connection %s unsubscribed from %s (remaining=%d)",
            connection_id,
            subscription,
            len(self._subscriptions[subscription]),
        )

    async def broadcast(self, subscription: str, payload: dict) -> None:
        if subscription not in self._subscriptions:
            logger.debug("No subscription bucket for %s", subscription)
            return

        subscribers = self._subscriptions[subscription]
        if not subscribers:
            logger.info("No subscribers for %s", subscription)
            return

        disconnects: Set[str] = set()

        for connection_id in subscribers:
            websocket = self._connections.get(connection_id)
            if not websocket:
                disconnects.add(connection_id)
                continue

            try:
                await websocket.send_json(payload)
                logger.debug("Sent %s to %s", subscription, connection_id)
            except Exception as exc:  # noqa: BLE001
                logger.warning("Broadcast failed for %s: %s", connection_id, exc)
                disconnects.add(connection_id)

        for connection_id in disconnects:
            self.disconnect(connection_id)

    async def send(self, connection_id: str, payload: dict) -> None:
        websocket = self._connections.get(connection_id)
        if not websocket:
            return
        await websocket.send_json(payload)

    def active_connection_ids(self) -> Set[str]:
        return set(self._connections.keys())

    def subscriptions_snapshot(self) -> Dict[str, Set[str]]:
        return {name: set(ids) for name, ids in self._subscriptions.items()}
