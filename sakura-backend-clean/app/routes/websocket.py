"""
WebSocket routes for real-time dashboard updates.
"""
import json
import asyncio
import logging
from typing import Dict, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from pymongo.database import Database
from app.core.database import get_database
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws", tags=["WebSocket"])


class ConnectionManager:
    """Manages WebSocket connections and broadcasts messages to connected clients."""
    
    def __init__(self):
        # Map of connection_id -> WebSocket
        self.active_connections: Dict[str, WebSocket] = {}
        # Map of subscription -> Set of connection_ids
        self.subscriptions: Dict[str, Set[str]] = {
            "chat_updates": set(),
            "unread_counts": set(),
            "website_status": set(),
        }
    
    async def connect(self, websocket: WebSocket, connection_id: str):
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        self.active_connections[connection_id] = websocket
        logger.info(f"WebSocket connected: {connection_id}")
    
    def disconnect(self, connection_id: str):
        """Remove a WebSocket connection and clean up subscriptions."""
        if connection_id in self.active_connections:
            del self.active_connections[connection_id]
            # Remove from all subscriptions
            for subscriptions_set in self.subscriptions.values():
                subscriptions_set.discard(connection_id)
            logger.info(f"WebSocket disconnected: {connection_id}")
    
    async def send_personal_message(self, message: dict, connection_id: str):
        """Send a message to a specific connection."""
        if connection_id in self.active_connections:
            try:
                websocket = self.active_connections[connection_id]
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to {connection_id}: {e}")
                self.disconnect(connection_id)
    
    async def broadcast(self, message: dict, subscription_type: str):
        """Broadcast a message to all connections subscribed to a specific type."""
        if subscription_type not in self.subscriptions:
            logger.warning(f"Unknown subscription type: {subscription_type}")
            return
        
        disconnected = []
        for connection_id in self.subscriptions[subscription_type]:
            if connection_id in self.active_connections:
                try:
                    websocket = self.active_connections[connection_id]
                    await websocket.send_json(message)
                except Exception as e:
                    logger.error(f"Error broadcasting to {connection_id}: {e}")
                    disconnected.append(connection_id)
        
        # Clean up disconnected connections
        for conn_id in disconnected:
            self.disconnect(conn_id)
    
    def subscribe(self, connection_id: str, subscription_type: str):
        """Subscribe a connection to a specific update type."""
        if subscription_type in self.subscriptions:
            self.subscriptions[subscription_type].add(connection_id)
            logger.info(f"Connection {connection_id} subscribed to {subscription_type}")
    
    def unsubscribe(self, connection_id: str, subscription_type: str):
        """Unsubscribe a connection from a specific update type."""
        if subscription_type in self.subscriptions:
            self.subscriptions[subscription_type].discard(connection_id)
            logger.info(f"Connection {connection_id} unsubscribed from {subscription_type}")


# Global connection manager instance
manager = ConnectionManager()


def get_chat_count_for_section(section: str, db: Database) -> int:
    """Calculate chat count for a specific section."""
    try:
        # Map section to categorization criteria
        CHAT_CATEGORIZATION = {
            "unified-inbox": {},
            "agent-inbox-active": {"category": "agent-inbox", "status": "active"},
            "agent-inbox-resolved": {"category": "agent-inbox", "status": "resolved"},
            "my-inbox-chats": {"category": "human-chats", "status": "active"},
            "my-inbox-escalated": {"category": "human-chats", "status": "escalated"},
            "my-inbox-resolved": {"category": "human-chats", "status": "resolved"},
        }
        
        categorization = CHAT_CATEGORIZATION.get(section, {})
        
        collection = db.customers
        users = list(collection.find({}))
        
        count = 0
        for user in users:
            if not user.get("chats"):
                continue
            
            user_category = user.get("category", "")
            user_status = user.get("status", "").lower()
            
            category_match = not categorization.get("category") or user_category == categorization.get("category")
            status_match = True
            if categorization.get("status"):
                status_match = user_status == categorization.get("status", "").lower()
            
            if category_match and status_match:
                # Count chats for this user
                chats_collection = db["customer-chats"]
                user_chats = list(chats_collection.find({"user_id": user.get("_id")}))
                count += len(user_chats)
        
        return count
    except Exception as e:
        logger.error(f"Error calculating chat count for section {section}: {e}")
        return 0


async def broadcast_chat_updates(db: Database):
    """Periodically broadcast chat updates to subscribed clients."""
    while True:
        try:
            await asyncio.sleep(2)  # Check every 2 seconds
            
            if "chat_updates" in manager.subscriptions and manager.subscriptions["chat_updates"]:
                # Fetch latest chat data
                collection = db.customers
                users = list(collection.find({}).limit(100))
                
                # Format chat data similar to /api/debug/users-chats
                formatted_users = []
                for user in users:
                    chats_collection = db["customer-chats"]
                    user_chats = list(chats_collection.find({"user_id": user.get("_id")}))
                    
                    chats = []
                    for chat_doc in user_chats:
                        chat = {
                            "chat_id": chat_doc.get("chat_id", "unknown"),
                            "status": chat_doc.get("status", "active"),
                            "created_at": chat_doc.get("created_at", datetime.now()).isoformat() if isinstance(chat_doc.get("created_at"), datetime) else str(chat_doc.get("created_at", "")),
                            "last_activity": chat_doc.get("last_activity", datetime.now()).isoformat() if isinstance(chat_doc.get("last_activity"), datetime) else str(chat_doc.get("last_activity", "")),
                            "messages": chat_doc.get("messages", [])
                        }
                        chats.append(chat)
                    
                    formatted_users.append({
                        "_id": str(user.get("_id", "")),
                        "name": user.get("name", "Unknown"),
                        "email": user.get("email", ""),
                        "category": user.get("category", "human-chats"),
                        "status": user.get("status", "active"),
                        "chats": chats
                    })
                
                message = {
                    "type": "chat_updates",
                    "data": {
                        "users": formatted_users,
                        "timestamp": datetime.now().isoformat()
                    }
                }
                await manager.broadcast(message, "chat_updates")
        except Exception as e:
            logger.error(f"Error in broadcast_chat_updates: {e}")


async def broadcast_unread_counts(db: Database):
    """Periodically broadcast unread counts to subscribed clients."""
    while True:
        try:
            await asyncio.sleep(5)  # Update every 5 seconds
            
            if "unread_counts" in manager.subscriptions and manager.subscriptions["unread_counts"]:
                sections = [
                    "my-inbox-chats",
                    "my-inbox-escalated",
                    "my-inbox-resolved",
                    "agent-inbox-active",
                    "agent-inbox-resolved",
                ]
                
                counts = {}
                for section in sections:
                    counts[section] = get_chat_count_for_section(section, db)
                
                message = {
                    "type": "unread_counts",
                    "data": {
                        "counts": counts,
                        "timestamp": datetime.now().isoformat()
                    }
                }
                await manager.broadcast(message, "unread_counts")
        except Exception as e:
            logger.error(f"Error in broadcast_unread_counts: {e}")


@router.websocket("/dashboard")
async def websocket_endpoint(websocket: WebSocket):
    """
    Main WebSocket endpoint for dashboard real-time updates.
    
    Clients can subscribe to:
    - chat_updates: Real-time chat data updates
    - unread_counts: Unread count updates for inbox sections
    - website_status: Knowledge base website crawling status
    """
    import uuid
    connection_id = str(uuid.uuid4())
    
    try:
        await manager.connect(websocket, connection_id)
        
        # Get database connection
        from app.core.database import get_db_manager
        db_manager = get_db_manager()
        db = db_manager.db if db_manager else None
        
        # Start background tasks if not already running
        if not hasattr(manager, "_background_tasks_started"):
            if db is not None:
                asyncio.create_task(broadcast_chat_updates(db))
                asyncio.create_task(broadcast_unread_counts(db))
            manager._background_tasks_started = True
        
        # Send initial connection confirmation
        await websocket.send_json({
            "type": "connected",
            "connection_id": connection_id,
            "message": "WebSocket connection established"
        })
        
        # Handle incoming messages
        while True:
            data = await websocket.receive_json()
            
            # Handle subscription requests
            if data.get("action") == "subscribe":
                subscription_type = data.get("subscription_type")
                if subscription_type:
                    manager.subscribe(connection_id, subscription_type)
                    await websocket.send_json({
                        "type": "subscribed",
                        "subscription_type": subscription_type
                    })
            
            # Handle unsubscription requests
            elif data.get("action") == "unsubscribe":
                subscription_type = data.get("subscription_type")
                if subscription_type:
                    manager.unsubscribe(connection_id, subscription_type)
                    await websocket.send_json({
                        "type": "unsubscribed",
                        "subscription_type": subscription_type
                    })
            
            # Handle ping (keepalive)
            elif data.get("action") == "ping":
                await websocket.send_json({
                    "type": "pong",
                    "timestamp": datetime.now().isoformat()
                })
            
            else:
                await websocket.send_json({
                    "type": "error",
                    "message": f"Unknown action: {data.get('action')}"
                })
    
    except WebSocketDisconnect:
        manager.disconnect(connection_id)
    except Exception as e:
        logger.error(f"WebSocket error for {connection_id}: {e}")
        manager.disconnect(connection_id)

