"""
Dashboard-specific API routes for user and chat management.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime
from typing import List, Optional, Union
from pymongo.database import Database
from bson import ObjectId
from app.core.database import get_database, get_db_manager
from app.models.chat_model import UserDataRequest, UserDataResponse

router = APIRouter(prefix="/api", tags=["Dashboard"])


def to_iso_string(value: Union[datetime, str, None], default: Optional[datetime] = None) -> str:
    """Safely convert a datetime value to ISO format string."""
    if value is None:
        if default is None:
            default = datetime.now()
        return default.isoformat()
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, str):
        # If it's already a string, try to parse and return ISO format
        try:
            # Try parsing common formats and returning ISO
            dt = datetime.fromisoformat(value.replace('Z', '+00:00'))
            return dt.isoformat()
        except:
            # If parsing fails, return as-is
            return value
    # Fallback: convert to string
    return str(value)


@router.get("/users")
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Database = Depends(get_database)
):
    """Get all users with pagination."""
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        collection = db.users
        
        # Get total count
        total = collection.count_documents({})
        
        # Get users with pagination
        cursor = collection.find({}).skip(skip).limit(limit)
        users = []
        
        for doc in cursor:
            # Get chats for this user
            chats_collection = db.chats
            user_chats = list(chats_collection.find({"user_id": doc.get("_id")}))
            
            # Convert chats to expected format
            chats = []
            for chat_doc in user_chats:
                chat = {
                    "chat_id": chat_doc.get("chat_id", "unknown"),
                    "status": chat_doc.get("status", "active"),
                    "created_at": to_iso_string(chat_doc.get("created_at")),
                    "last_activity": to_iso_string(chat_doc.get("last_activity")),
                    "total_messages": chat_doc.get("total_messages", len(chat_doc.get("messages", []))),
                    "messages": []
                }
                
                # Convert stored messages to expected format
                stored_messages = chat_doc.get("messages", [])
                for msg in stored_messages:
                    message = {
                        "role": msg.get("role", "user"),
                        "text": msg.get("content", msg.get("text", "")),
                        "timestamp": to_iso_string(msg.get("timestamp")),
                        "read": msg.get("read", True)
                    }
                    chat["messages"].append(message)
                
                chats.append(chat)
            
            user = {
                "_id": str(doc.get("_id", "unknown")),
                "name": doc.get("name", "Unknown User"),
                "email": doc.get("email", "unknown@example.com"),
                "ip": doc.get("ip"),
                "vibe": doc.get("vibe", "neutral"),
                "category": doc.get("category", "human-chats"),
                "status": doc.get("status", "active"),
                "location": doc.get("location", {}),
                "device": doc.get("device", {}),
                "last_seen": to_iso_string(doc.get("last_seen") or doc.get("created_at")),
                "chats": chats
            }
            users.append(user)
        
        return {
            "users": users,
            "total": total,
            "skip": skip,
            "limit": limit
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Error fetching users: {str(e)}\n{traceback.format_exc()}"
        print(f"❌ {error_detail}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users/{email}")
async def get_user_by_email(
    email: str,
    db: Database = Depends(get_database)
):
    """Get a specific user by email."""
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        collection = db.users
        
        # Find user by email in the data field
        doc = collection.find_one({"data.email": email})
        
        if not doc:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_data = doc.get("data", {})
        user = {
            "_id": doc.get("user_id", "unknown"),
            "name": user_data.get("name", "Unknown User"),
            "email": user_data.get("email", "unknown@example.com"),
            "ip": user_data.get("ip"),
            "vibe": user_data.get("vibe", "neutral"),
            "category": user_data.get("category", "human-chats"),
            "status": user_data.get("status", "active"),
            "location": user_data.get("location", {}),
            "device": user_data.get("device", {}),
            "chats": []  # Will be populated separately
        }
        
        return {"user": user}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users/{email}/stats")
async def get_user_stats(
    email: str,
    db: Database = Depends(get_database)
):
    """Get user statistics."""
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        collection = db.users
        
        # Find user by email
        doc = collection.find_one({"data.email": email})
        
        if not doc:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_data = doc.get("data", {})
        
        # Get chat statistics
        chats_collection = db.chat_states
        user_chats = list(chats_collection.find({"user_email": email}))
        
        total_chats = len(user_chats)
        open_chats = len([c for c in user_chats if c.get("status") != "closed"])
        closed_chats = total_chats - open_chats
        
        # Count total messages (simplified - would need proper message storage)
        total_messages = sum(len(c.get("messages", [])) for c in user_chats)
        
        stats = {
            "email": email,
            "name": user_data.get("name", "Unknown User"),
            "total_chats": total_chats,
            "open_chats": open_chats,
            "closed_chats": closed_chats,
            "total_messages": total_messages,
            "created_at": to_iso_string(doc.get("updated_at")),
            "last_seen": to_iso_string(user_data.get("lastSeen"))
        }
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chats")
async def get_chats(
    email: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Database = Depends(get_database)
):
    """Get chats, optionally filtered by user email."""
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        collection = db.chat_states
        
        # Build query
        query = {}
        if email:
            query["user_email"] = email
        
        # Get total count
        total = collection.count_documents(query)
        
        # Get chats with pagination
        cursor = collection.find(query).skip(skip).limit(limit)
        chats = []
        
        for doc in cursor:
            chat = {
                "chat_id": doc.get("chat_id", "unknown"),
                "user_id": doc.get("user_email", "unknown"),
                "status": doc.get("status", "active"),
                "created_at": to_iso_string(doc.get("created_at")),
                "updated_at": to_iso_string(doc.get("updated_at")),
                "messages": doc.get("messages", []),
                "state": doc.get("state", {})
            }
            chats.append(chat)
        
        return {"chats": chats, "total": total, "skip": skip, "limit": limit}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chats/{chat_id}")
async def get_chat_by_id(
    chat_id: str,
    db: Database = Depends(get_database)
):
    """Get a specific chat by ID."""
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        collection = db.chat_states
        
        doc = collection.find_one({"chat_id": chat_id})
        
        if not doc:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        chat = {
            "chat_id": doc.get("chat_id", "unknown"),
            "user_id": doc.get("user_email", "unknown"),
            "status": doc.get("status", "active"),
            "created_at": doc.get("created_at", datetime.now()).isoformat(),
            "updated_at": doc.get("updated_at", datetime.now()).isoformat(),
            "messages": doc.get("messages", []),
            "state": doc.get("state", {})
        }
        
        return {"chat": chat}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/debug/users-chats")
async def get_debug_users_chats(db: Database = Depends(get_database)):
    """Debug endpoint that returns users with their chats (for dashboard compatibility)."""
    try:
        if db is None:
            print("⚠️  Database not available, returning empty data")
            return {"users": []}
        
        users_collection = db.users
        chats_collection = db.chats
        
        # Get all users
        users_cursor = users_collection.find({})
        users = []
        
        for user_doc in users_cursor:
            user_email = user_doc.get("email", "unknown@example.com")
            
            # Get chats for this user (using user_id to match)
            user_chats_cursor = chats_collection.find({"user_id": user_doc.get("_id")})
            chats = []
            
            for chat_doc in user_chats_cursor:
                chat = {
                    "chat_id": chat_doc.get("chat_id", "unknown"),
                    "status": chat_doc.get("status", "active"),
                    "created_at": to_iso_string(chat_doc.get("created_at")),
                    "last_activity": to_iso_string(chat_doc.get("last_activity")),
                    "total_messages": chat_doc.get("total_messages", len(chat_doc.get("messages", []))),
                    "messages": []
                }
                
                # Convert stored messages to expected format
                stored_messages = chat_doc.get("messages", [])
                for msg in stored_messages:
                    message = {
                        "role": msg.get("role", "user"),
                        "text": msg.get("content", msg.get("text", "")),
                        "timestamp": to_iso_string(msg.get("timestamp")),
                        "read": msg.get("read", True)
                    }
                    chat["messages"].append(message)
                
                chats.append(chat)
            
            user = {
                "_id": str(user_doc.get("_id", "unknown")),
                "name": user_doc.get("name", "Unknown User"),
                "email": user_email,
                "ip": user_doc.get("ip"),
                "vibe": user_doc.get("vibe", "neutral"),
                "category": user_doc.get("category", "human-chats"),
                "status": user_doc.get("status", "active"),
                "location": user_doc.get("location", {}),
                "device": user_doc.get("device", {}),
                "chats": chats
            }
            users.append(user)
        
        return {"users": users}
        
    except Exception as e:
        print(f"❌ Error in debug endpoint: {e}")
        return {"users": []}


# Additional endpoints for ChatContext compatibility
@router.get("/users/{user_id}")
async def get_user_by_id(user_id: str, db: Database = Depends(get_database)):
    """Get a specific user by ID (for ChatContext)."""
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        users_collection = db.users
        chats_collection = db.chats
        
        # Find user by _id (handle ObjectId conversion)
        try:
            user_object_id = ObjectId(user_id)
            user_doc = users_collection.find_one({"_id": user_object_id})
        except:
            # If ObjectId conversion fails, try string comparison
            user_doc = users_collection.find_one({"_id": user_id})
        if not user_doc:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get chats for this user
        user_chats = list(chats_collection.find({"user_id": user_id}))
        
        # Convert chats to expected format
        chats = []
        for chat_doc in user_chats:
            chat = {
                "chat_id": chat_doc.get("chat_id", "unknown"),
                "status": chat_doc.get("status", "active"),
                "created_at": chat_doc.get("created_at", datetime.now()).isoformat(),
                "last_activity": chat_doc.get("last_activity", datetime.now()).isoformat(),
                "total_messages": chat_doc.get("total_messages", len(chat_doc.get("messages", []))),
                "messages": []
            }
            
            # Convert stored messages to expected format
            stored_messages = chat_doc.get("messages", [])
            for msg in stored_messages:
                message = {
                    "role": msg.get("role", "user"),
                    "text": msg.get("content", msg.get("text", "")),
                    "timestamp": msg.get("timestamp", datetime.now()).isoformat(),
                    "read": msg.get("read", True)
                }
                chat["messages"].append(message)
            
            chats.append(chat)
        
        user = {
            "_id": str(user_doc.get("_id", "unknown")),
            "name": user_doc.get("name", "Unknown User"),
            "email": user_doc.get("email", "unknown@example.com"),
            "ip": user_doc.get("ip"),
            "vibe": user_doc.get("vibe", "neutral"),
            "category": user_doc.get("category", "human-chats"),
            "status": user_doc.get("status", "active"),
            "location": user_doc.get("location", {}),
            "device": user_doc.get("device", {}),
            "last_seen": to_iso_string(user_doc.get("last_seen") or user_doc.get("created_at")),
            "chats": chats
        }
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting user by ID: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chats/{chat_id}")
async def get_chat_by_id_for_context(chat_id: str, db: Database = Depends(get_database)):
    """Get a specific chat by ID (for ChatContext)."""
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        chats_collection = db.chats
        chat_doc = chats_collection.find_one({"chat_id": chat_id})
        
        if not chat_doc:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        # Convert messages to expected format
        messages = []
        stored_messages = chat_doc.get("messages", [])
        for msg in stored_messages:
            message = {
                "_id": msg.get("_id", "unknown"),
                "sender": msg.get("role", "user"),
                "content": msg.get("content", msg.get("text", "")),
                "timestamp": msg.get("timestamp", datetime.now()).isoformat(),
                "status": msg.get("status", "sent"),
                "isLink": msg.get("isLink", False),
                "linkUrl": msg.get("linkUrl"),
                "tags": msg.get("tags", [])
            }
            messages.append(message)
        
        return {
            "chat_id": chat_doc.get("chat_id"),
            "user_id": chat_doc.get("user_id"),
            "status": chat_doc.get("status"),
            "created_at": chat_doc.get("created_at", datetime.now()).isoformat(),
            "updated_at": chat_doc.get("updated_at", datetime.now()).isoformat(),
            "messages": messages,
            "state": chat_doc.get("state", {})
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting chat by ID: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chats/{chat_id}/send")
async def send_message_to_chat(chat_id: str, request: dict, db: Database = Depends(get_database)):
    """Send a message to a chat (for ChatContext)."""
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        chats_collection = db.chats
        content = request.get("content", "")
        
        if not content:
            raise HTTPException(status_code=400, detail="Message content is required")
        
        # Add message to chat
        message = {
            "_id": f"msg_{int(datetime.now().timestamp())}",
            "role": "user",
            "content": content,
            "timestamp": to_iso_string(datetime.now()),
            "status": "sent"
        }
        
        result = chats_collection.update_one(
            {"chat_id": chat_id},
            {
                "$push": {"messages": message},
                "$set": {"updated_at": datetime.now()}
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        return {"success": True, "message": "Message sent successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error sending message: {e}")
        raise HTTPException(status_code=500, detail=str(e))
