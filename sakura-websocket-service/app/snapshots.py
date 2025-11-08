"""Periodic snapshot broadcasters for chat and unread counts."""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime
from typing import Dict, List

from motor.motor_asyncio import AsyncIOMotorDatabase

from .config import settings
from .connection_manager import ConnectionManager

logger = logging.getLogger(__name__)


CHAT_CATEGORIZATION: Dict[str, Dict[str, str]] = {
    "unified-inbox": {},
    "agent-inbox-active": {"category": "agent-inbox", "status": "active"},
    "agent-inbox-resolved": {"category": "agent-inbox", "status": "resolved"},
    "my-inbox-chats": {"category": "human-chats", "status": "active"},
    "my-inbox-escalated": {"category": "human-chats", "status": "escalated"},
    "my-inbox-resolved": {"category": "human-chats", "status": "resolved"},
}


async def _fetch_users_with_chats(db: AsyncIOMotorDatabase) -> List[dict]:
    customers_collection = db.customers
    chats_collection = db["customer-chats"]

    users = await customers_collection.find({}).limit(100).to_list(length=100)
    formatted_users: List[dict] = []

    for user in users:
        user_id = user.get("_id")
        user_chats = await chats_collection.find({"user_id": user_id}).to_list(length=200)

        chats = []
        for chat_doc in user_chats:
            chat = {
                "chat_id": chat_doc.get("chat_id", "unknown"),
                "status": chat_doc.get("status", "active"),
                "created_at": _to_iso(chat_doc.get("created_at")),
                "last_activity": _to_iso(chat_doc.get("last_activity")),
                "messages": chat_doc.get("messages", []),
            }
            chats.append(chat)

        formatted_users.append(
            {
                "_id": str(user_id),
                "name": user.get("name", "Unknown"),
                "email": user.get("email", ""),
                "category": user.get("category", "human-chats"),
                "status": user.get("status", "active"),
                "dashboard_user_id": user.get("dashboard_user_id"),
                "chats": chats,
            }
        )

    return formatted_users


async def _get_chat_count_for_section(section: str, db: AsyncIOMotorDatabase) -> int:
    categorization = CHAT_CATEGORIZATION.get(section, {})

    customers_collection = db.customers
    chats_collection = db["customer-chats"]

    users = await customers_collection.find({}).to_list(length=200)
    count = 0

    for user in users:
        if not user.get("chats"):
            continue

        user_category = user.get("category", "")
        user_status = str(user.get("status", "")).lower()

        category_match = not categorization.get("category") or user_category == categorization.get("category")
        status_match = True
        if categorization.get("status"):
            status_match = user_status == categorization["status"].lower()

        if category_match and status_match:
            user_id = user.get("_id")
            user_chats = await chats_collection.find({"user_id": user_id}).to_list(length=200)
            count += len(user_chats)

    return count


def _to_iso(value) -> str:
    if value is None:
        return datetime.now().isoformat()
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value)


async def chat_snapshot_loop(db: AsyncIOMotorDatabase, manager: ConnectionManager) -> None:
    while True:
        try:
            users = await _fetch_users_with_chats(db)
            payload = {
                "type": "chat_updates",
                "data": {
                    "users": users,
                    "timestamp": datetime.now().isoformat(),
                },
            }
            await manager.broadcast("chat_updates", payload)
        except Exception as exc:  # noqa: BLE001
            logger.exception("Error broadcasting chat snapshot: %s", exc)
        await asyncio.sleep(settings.chat_snapshot_interval_seconds)


async def unread_snapshot_loop(db: AsyncIOMotorDatabase, manager: ConnectionManager) -> None:
    sections = list(CHAT_CATEGORIZATION.keys())
    while True:
        try:
            counts = {}
            for section in sections:
                counts[section] = await _get_chat_count_for_section(section, db)

            payload = {
                "type": "unread_counts",
                "data": {
                    "counts": counts,
                    "timestamp": datetime.now().isoformat(),
                },
            }
            await manager.broadcast("unread_counts", payload)
        except Exception as exc:  # noqa: BLE001
            logger.exception("Error broadcasting unread counts: %s", exc)
        await asyncio.sleep(settings.unread_snapshot_interval_seconds)
