"""Entry point for the WebSocket microservice."""
from __future__ import annotations

import asyncio
import logging
import uuid
from contextlib import asynccontextmanager, suppress
from datetime import datetime

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .connection_manager import ConnectionManager
from .database import close_mongo, connect_to_mongo, get_database
from .redis_subscriber import RedisSubscriber
from .snapshots import chat_snapshot_loop, unread_snapshot_loop

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

manager = ConnectionManager()
redis_subscriber = RedisSubscriber(manager)


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Manage service startup and shutdown."""
    logger.info("🚀 Starting WebSocket microservice")

    chat_task: asyncio.Task | None = None
    unread_task: asyncio.Task | None = None

    # Initialise Mongo (for snapshot jobs)
    db = None
    try:
        db_candidate = connect_to_mongo()
        await db_candidate.command("ping")
    except Exception as exc:  # noqa: BLE001
        logger.warning("Mongo unavailable (%s). Snapshot jobs disabled.", exc)
        close_mongo()
    else:
        db = db_candidate

    # Start Redis listener
    await redis_subscriber.start()

    # Kick off background snapshot jobs when Mongo is available
    if db is not None:
        chat_task = asyncio.create_task(chat_snapshot_loop(db, manager))
        unread_task = asyncio.create_task(unread_snapshot_loop(db, manager))
    else:
        logger.info("Skipping snapshot jobs because MongoDB is not connected.")
    try:
        yield
    finally:
        logger.info("🛑 Shutting down WebSocket microservice")
        for task in (chat_task, unread_task):
            if task is None:
                continue
            task.cancel()
            with suppress(asyncio.CancelledError):
                await task

        await redis_subscriber.stop()
        close_mongo()


app = FastAPI(title="Sakura WebSocket Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.websocket("/ws/dashboard")
async def websocket_endpoint(websocket: WebSocket) -> None:
    connection_id = str(uuid.uuid4())
    await manager.connect(websocket, connection_id)

    try:
        await manager.send(
            connection_id,
            {
                "type": "connected",
                "connection_id": connection_id,
                "message": "WebSocket connection established",
            },
        )

        while True:
            message = await websocket.receive_json()
            action = message.get("action")
            subscription_type = message.get("subscription_type")

            if action == "subscribe" and subscription_type:
                manager.subscribe(connection_id, subscription_type)
                await manager.send(
                    connection_id,
                    {
                        "type": "subscribed",
                        "subscription_type": subscription_type,
                    },
                )
            elif action == "unsubscribe" and subscription_type:
                manager.unsubscribe(connection_id, subscription_type)
                await manager.send(
                    connection_id,
                    {
                        "type": "unsubscribed",
                        "subscription_type": subscription_type,
                    },
                )
            elif action == "ping":
                await manager.send(
                    connection_id,
                    {
                        "type": "pong",
                        "timestamp": datetime.utcnow().isoformat(),
                    },
                )
            else:
                await manager.send(
                    connection_id,
                    {
                        "type": "error",
                        "message": f"Unknown action: {action}",
                    },
                )
    except WebSocketDisconnect:
        pass
    except Exception as exc:  # noqa: BLE001
        logger.exception("WebSocket error for %s: %s", connection_id, exc)
    finally:
        manager.disconnect(connection_id)


@app.get("/health")
async def health() -> dict[str, str]:
    try:
        db = get_database()
        _ = await db.command("ping")
    except Exception as exc:  # noqa: BLE001
        logger.warning("Mongo health check failed: %s", exc)
        mongo_status = "unhealthy"
    else:
        mongo_status = "healthy"

    return {
        "status": "ok",
        "mongo": mongo_status,
        "redis": "connected" if redis_subscriber._running else "disconnected",
    }
