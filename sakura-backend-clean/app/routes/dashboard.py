"""
Dashboard-specific API routes for user and chat management.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, Query
from fastapi.responses import JSONResponse
from pymongo.database import Database
from bson import ObjectId
from typing import Optional, Dict, Any, Union
from datetime import datetime
import traceback
import json
import uuid
import asyncio
import httpx
import os

from app.core.database import get_database
from app.services.file_processing_service import get_file_processing_service
from app.services.faq_embedding_service import get_faq_embedding_service
from app.services.langgraph_service import get_langgraph_service
from app.services.embeddings_service import get_embeddings_service
from app.services.redis_publisher import publish_event

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
        
        collection = db.customers
        
        # Get total count
        total = collection.count_documents({})
        
        # Get users with pagination
        cursor = collection.find({}).skip(skip).limit(limit)
        users = []
        
        for doc in cursor:
            # Get chats for this user
            chats_collection = db["customer-chats"]
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
        
        collection = db.customers
        
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
        
        collection = db.customers
        
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


@router.get("/reports/stats")
async def get_reports_stats(db: Database = Depends(get_database)):
    """Get basic chat statistics for reports."""
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        chats_collection = db["customer-chats"]
        
        # Get total number of chats
        total_chats = chats_collection.count_documents({})
        
        # Count chats by channel (assuming channel is stored in chat document)
        # For now, we'll check if there's a channel field, otherwise default to "website"
        all_chats = list(chats_collection.find({}, {"channel": 1, "source": 1}))
        
        whatsapp_chats = 0
        instagram_chats = 0
        website_chats = 0
        
        # Count chats per channel
        for chat in all_chats:
            channel = chat.get("channel") or chat.get("source", "website")
            channel_lower = str(channel).lower()
            
            if "whatsapp" in channel_lower:
                whatsapp_chats += 1
            elif "instagram" in channel_lower:
                instagram_chats += 1
            else:
                # Default to website if no channel specified
                website_chats += 1
        
        # Count chats that agents have discussed with (chats with agent messages)
        agent_chats = 0
        chats_with_messages = chats_collection.find({"messages": {"$exists": True, "$ne": []}})
        for chat in chats_with_messages:
            messages = chat.get("messages", [])
            # Check if any message has role "agent" or "assistant"
            has_agent_message = any(
                msg.get("role") in ["agent", "assistant"] 
                for msg in messages
            )
            if has_agent_message:
                agent_chats += 1
        
        return {
            "success": True,
            "total_chats": total_chats,
            "agent_chats": agent_chats,
            "channels": {
                "whatsapp": whatsapp_chats,
                "instagram": instagram_chats,
                "website": website_chats,
            },
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting reports stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/debug/users-chats")
async def get_debug_users_chats(db: Database = Depends(get_database)):
    """Debug endpoint that returns users with their chats (for dashboard compatibility)."""
    import time
    start_time = time.time()
    print(f"🔄 [DEBUG] /api/debug/users-chats called at {time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        if db is None:
            elapsed = time.time() - start_time
            print(f"⚠️  [DEBUG] Database not available (took {elapsed:.2f}s), returning error")
            raise HTTPException(status_code=503, detail="Database not available. Please ensure MongoDB is running.")
        
        print(f"✅ [DEBUG] Database connection OK (took {time.time() - start_time:.2f}s)")
        
        users_collection = db.customers
        chats_collection = db["customer-chats"]
        
        # Test database connection with a quick query before heavy queries
        try:
            # Use a simple count query to test connection (faster than ping)
            users_collection.count_documents({}, limit=1)
            print(f"✅ [DEBUG] Database connection test successful")
        except Exception as ping_error:
            elapsed = time.time() - start_time
            print(f"❌ [DEBUG] Database connection test failed (took {elapsed:.2f}s): {ping_error}")
            raise HTTPException(status_code=503, detail=f"Database connection test failed: {str(ping_error)}")
        
        # Get all users with a timeout-aware operation
        print(f"📊 [DEBUG] Fetching users from collection...")
        try:
            users_cursor = users_collection.find({}).limit(100)  # Limit to prevent huge queries
            # Force evaluation with timeout - convert to list immediately to catch connection issues
            users_list_temp = list(users_cursor)[:100]  # Limit in memory too
            users_cursor = iter(users_list_temp)
        except Exception as query_error:
            elapsed = time.time() - start_time
            print(f"❌ [DEBUG] Query failed (took {elapsed:.2f}s): {query_error}")
            raise HTTPException(status_code=503, detail=f"Database query failed: {str(query_error)}")
        
        users = []
        
        for user_doc in users_cursor:
            user_email = user_doc.get("email", "unknown@example.com")
            user_name = user_doc.get("name", "Unknown User")
            
            # Log users with "Widget User" name for debugging
            if user_name == "Widget User":
                print(f"🔍 [DEBUG] Found 'Widget User' with email: {user_email}, _id: {user_doc.get('_id')}")
            
            # Get chats for this user (using user_id to match)
            # Try multiple matching strategies
            user_id = user_doc.get("_id")
            user_chats_list = []
            
            # Method 1: Direct ObjectId/string match
            user_chats_list = list(chats_collection.find({"user_id": user_id}))
            
            # Method 2: If no matches and user_id is ObjectId, try string
            if not user_chats_list:
                user_chats_list = list(chats_collection.find({"user_id": str(user_id)}))
            
            # Method 3: If still no matches and user_id is string, try ObjectId
            if not user_chats_list and isinstance(user_id, str):
                try:
                    obj_id = ObjectId(user_id)
                    user_chats_list = list(chats_collection.find({"user_id": obj_id}))
                except:
                    pass
            
            # Method 4: Try original_user_id field if it exists
            if not user_chats_list:
                original_user_id = user_doc.get("user_id")
                if original_user_id:
                    user_chats_list = list(chats_collection.find({"original_user_id": original_user_id}))
                    if not user_chats_list:
                        user_chats_list = list(chats_collection.find({"original_user_id": str(original_user_id)}))
            chats = []
            
            for chat_doc in user_chats_list:
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
                "category": user_doc.get("category", "agent-inbox"),  # Default to agent-inbox to match creation logic
                "status": user_doc.get("status", "active"),
                "location": user_doc.get("location", {}),
                "device": user_doc.get("device", {}),
                "dashboard_user_id": user_doc.get("dashboard_user_id"),  # Link to dashboard user who owns the widget
                "chats": chats
            }
            users.append(user)
        
        elapsed = time.time() - start_time
        print(f"✅ [DEBUG] Returning {len(users)} users (total time: {elapsed:.2f}s)")
        return {"users": users}
        
    except HTTPException:
        # Re-raise HTTP exceptions (like 503 for DB unavailable)
        raise
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"❌ [DEBUG] Error in debug endpoint (took {elapsed:.2f}s): {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# Additional endpoints for ChatContext compatibility
@router.get("/users/{user_id}")
async def get_user_by_id(user_id: str, db: Database = Depends(get_database)):
    """Get a specific user by ID (for ChatContext)."""
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        users_collection = db.customers
        chats_collection = db["customer-chats"]
        
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


@router.get("/dashboard-users/{email}")
async def get_dashboard_user_by_email(email: str, db: Database = Depends(get_database)):
    """Check if a dashboard account user exists in Better Auth's user collection."""
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        # Better Auth stores users in the "user" collection
        user_collection = db.user
        
        # Find user by email (Better Auth uses "email" field directly)
        user_doc = user_collection.find_one({"email": email})
        
        if not user_doc:
            return {
                "exists": False,
                "email": email,
                "message": "Dashboard account user not found"
            }
        
        # Return user info (excluding sensitive data)
        return {
            "exists": True,
            "email": user_doc.get("email"),
            "name": user_doc.get("name"),
            "emailVerified": user_doc.get("emailVerified", False),
            "createdAt": to_iso_string(user_doc.get("createdAt")),
            "updatedAt": to_iso_string(user_doc.get("updatedAt")),
            "id": str(user_doc.get("_id", ""))
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error checking dashboard user: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chats/{chat_id}")
async def get_chat_by_id_for_context(chat_id: str, db: Database = Depends(get_database)):
    """Get a specific chat by ID (for ChatContext)."""
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        chats_collection = db["customer-chats"]
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


@router.post("/dashboard/chats/{chat_id}/send")
async def send_message_to_chat(chat_id: str, request: Request, db: Database = Depends(get_database)):
    """Send a message to a chat (for ChatContext and Widget)."""
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        # Debug: Check what we're receiving
        method = request.method
        content_type = request.headers.get("content-type", "")
        origin = request.headers.get("origin", "")
        print(f"📨 Dashboard send request - Method: {method}, Chat ID: {chat_id}, Content-Type: {content_type}, Origin: {origin}")
        
        # Parse request body - support both JSON and FormData
        chats_collection = db["customer-chats"]
        content = ""
        role = "user"
        
        try:
            # Check content type to determine parsing method
            if "multipart/form-data" in content_type or "application/x-www-form-urlencoded" in content_type:
                # Parse as FormData (for sendBeacon compatibility)
                form_data = await request.form()
                print(f"📥 Parsed FormData: {dict(form_data)}")
                content = form_data.get("content", "")
                role = form_data.get("role", "user")
                
                # Convert to string if needed
                if hasattr(content, 'read'):
                    content = await content.read()
                    content = content.decode('utf-8') if isinstance(content, bytes) else str(content)
                else:
                    content = str(content) if content else ""
                role = str(role) if role else "user"
            else:
                # Default to JSON parsing
                raw_body = await request.body()
                print(f"📦 Raw body length: {len(raw_body)} bytes")
                
                if len(raw_body) == 0:
                    print(f"⚠️ Empty request body received!")
                    raise HTTPException(status_code=400, detail="Request body is empty")
                
                import json
                try:
                    body = json.loads(raw_body.decode('utf-8'))
                    print(f"📥 Parsed JSON body: {body}")
                    content = body.get("content", "")
                    role = body.get("role", "user")
                except json.JSONDecodeError:
                    # If JSON parsing fails, try to parse as form data
                    # Note: This won't work if body was already consumed, but worth trying
                    print(f"⚠️ Failed to parse as JSON, attempting FormData...")
                    raise HTTPException(status_code=400, detail="Invalid JSON in request body. Expected JSON or FormData.")
        except HTTPException:
            raise
        except Exception as e:
            print(f"❌ Failed to parse request body: {e}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=400, detail=f"Invalid request body: {str(e)}")
        
        print(f"💬 Dashboard sending message - Role: '{role}', Content: '{content[:50] if content else 'EMPTY'}'")
        
        if not content:
            raise HTTPException(status_code=400, detail="Message content is required")
        
        # Add message to chat
        message = {
            "_id": f"msg_{int(datetime.now().timestamp())}",
            "role": role,
            "content": content,
            "text": content,  # Store as both content and text for compatibility
            "timestamp": datetime.now(),
            "status": "sent",
            "read": False
        }
        
        print(f"💾 Saving message to DB - Role: '{message['role']}', Chat ID: {chat_id}")
        
        # First check if chat exists
        chat_doc = chats_collection.find_one({"chat_id": chat_id})
        if not chat_doc:
            print(f"⚠️ Chat not found: {chat_id}")
            # Log all available chat_ids for debugging
            all_chats = chats_collection.find({}, {"chat_id": 1, "_id": 0}).limit(10)
            available_chat_ids = [chat.get("chat_id") for chat in all_chats]
            print(f"📋 Sample available chat_ids: {available_chat_ids}")
            raise HTTPException(status_code=404, detail=f"Chat not found: {chat_id}")
        
        result = chats_collection.update_one(
            {"chat_id": chat_id},
            {
                "$push": {"messages": message},
                "$set": {
                    "updated_at": datetime.now(),
                    "last_activity": datetime.now(),
                    "total_messages": {"$size": "$messages"}  # This won't work, we'll recalculate
                }
            }
        )
        
        # Update total_messages count (re-fetch to get updated message count)
        updated_chat_doc = chats_collection.find_one({"chat_id": chat_id})
        if updated_chat_doc:
            chats_collection.update_one(
                {"chat_id": chat_id},
                {"$set": {"total_messages": len(updated_chat_doc.get("messages", []))}}
            )
        
        # Trigger lightweight notification via Redis for real-time update
        try:
            notification = {
                "type": "chat_updates",
                "data": {
                    "type": "chat_message_notification",
                    "chat_id": chat_id,
                    "message_role": role,
                    "timestamp": datetime.now().isoformat()
                }
            }

            await publish_event("chat_updates", notification)
            print("✅ Quick notification published to Redis (dashboard message)")
        except Exception as ws_error:
            print(f"⚠️ Redis notification failed (non-critical): {ws_error}")
            import traceback
            traceback.print_exc()
        
        return {"success": True, "message": "Message sent successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error sending message: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/dashboard/chats/{chat_id}/ai-agent")
async def toggle_ai_agent(chat_id: str, request: dict, db: Database = Depends(get_database)):
    """Toggle AI agent enabled/disabled for a chat."""
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        chats_collection = db["customer-chats"]
        enabled = request.get("enabled", True)
        
        result = chats_collection.update_one(
            {"chat_id": chat_id},
            {
                "$set": {
                    "ai_agent_enabled": enabled,
                    "updated_at": datetime.now()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        return {
            "success": True,
            "ai_agent_enabled": enabled,
            "message": f"AI agent {'enabled' if enabled else 'disabled'} successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error toggling AI agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dashboard/chats/{chat_id}/ai-agent")
async def get_ai_agent_status(chat_id: str, db: Database = Depends(get_database)):
    """Get AI agent enabled status for a chat."""
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        chats_collection = db["customer-chats"]
        chat_doc = chats_collection.find_one({"chat_id": chat_id})
        
        if not chat_doc:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        # Default to True if not set (backward compatibility)
        ai_agent_enabled = chat_doc.get("ai_agent_enabled", True)
        
        return {
            "success": True,
            "ai_agent_enabled": ai_agent_enabled,
            "chat_id": chat_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting AI agent status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/debug/database-overview")
async def get_database_overview(db: Database = Depends(get_database)):
    """Comprehensive database overview endpoint showing all collections and their data."""
    import time
    start_time = time.time()
    print(f"🔄 [DEBUG] /api/debug/database-overview called at {time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available. Please ensure MongoDB is running.")
        
        # Get all collections in the database
        collection_names = db.list_collection_names()
        
        overview = {
            "database_name": db.name,
            "collections": {},
            "statistics": {},
            "timestamp": datetime.now().isoformat()
        }
        
        # Widget Customers Collection
        customers_collection = db.customers
        customers_count = customers_collection.count_documents({})
        customers = []
        if customers_count > 0:
            customers_cursor = customers_collection.find({}).limit(100)
            for customer_doc in customers_cursor:
                customer = {
                    "_id": str(customer_doc.get("_id", "")),
                    "name": customer_doc.get("name", "Unknown"),
                    "email": customer_doc.get("email", "unknown@example.com"),
                    "category": customer_doc.get("category", "agent-inbox"),
                    "status": customer_doc.get("status", "active"),
                    "dashboard_user_id": customer_doc.get("dashboard_user_id"),
                    "ip": customer_doc.get("ip"),
                    "location": customer_doc.get("location", {}),
                    "device": customer_doc.get("device", {}),
                    "created_at": to_iso_string(customer_doc.get("created_at")),
                    "last_seen": to_iso_string(customer_doc.get("last_seen")),
                    "vibe": customer_doc.get("vibe", "neutral"),
                }
                customers.append(customer)
        
        overview["collections"]["customers"] = {
            "count": customers_count,
            "data": customers
        }
        
        # Customer Chats Collection
        chats_collection = db["customer-chats"]
        chats_count = chats_collection.count_documents({})
        chats = []
        if chats_count > 0:
            chats_cursor = chats_collection.find({}).limit(100)
            for chat_doc in chats_cursor:
                chat = {
                    "_id": str(chat_doc.get("_id", "")),
                    "chat_id": chat_doc.get("chat_id", "unknown"),
                    "user_id": str(chat_doc.get("user_id", "")) if chat_doc.get("user_id") else None,
                    "status": chat_doc.get("status", "active"),
                    "created_at": to_iso_string(chat_doc.get("created_at")),
                    "last_activity": to_iso_string(chat_doc.get("last_activity")),
                    "total_messages": chat_doc.get("total_messages", len(chat_doc.get("messages", []))),
                    "messages_count": len(chat_doc.get("messages", [])),
                    "first_message": chat_doc.get("messages", [{}])[0].get("content", "") if chat_doc.get("messages") and len(chat_doc.get("messages", [])) > 0 else None,
                    "last_message": chat_doc.get("messages", [{}])[-1].get("content", "") if chat_doc.get("messages") and len(chat_doc.get("messages", [])) > 0 else None,
                }
                chats.append(chat)
        
        overview["collections"]["customer-chats"] = {
            "count": chats_count,
            "data": chats
        }
        
        # Dashboard Users Collection (Better Auth)
        users_collection = db.user
        dashboard_users_count = users_collection.count_documents({})
        dashboard_users = []
        if dashboard_users_count > 0:
            users_cursor = users_collection.find({}).limit(100)
            for user_doc in users_cursor:
                dashboard_user = {
                    "_id": str(user_doc.get("_id", "")),
                    "email": user_doc.get("email", "unknown@example.com"),
                    "name": user_doc.get("name", "Unknown"),
                    "emailVerified": user_doc.get("emailVerified", False),
                    "createdAt": to_iso_string(user_doc.get("createdAt")),
                    "updatedAt": to_iso_string(user_doc.get("updatedAt")),
                }
                dashboard_users.append(dashboard_user)
        
        overview["collections"]["dashboard_users"] = {
            "count": dashboard_users_count,
            "data": dashboard_users
        }
        
        # Statistics
        total_chats = chats_count
        total_messages = sum(chat.get("messages_count", 0) for chat in chats)
        customers_with_chats = len([c for c in customers if c.get("_id")])
        customers_linked_to_dashboard = len([c for c in customers if c.get("dashboard_user_id")])
        
        overview["statistics"] = {
            "total_widget_customers": customers_count,
            "total_customer_chats": total_chats,
            "total_messages": total_messages,
            "total_dashboard_users": dashboard_users_count,
            "customers_with_chats": customers_with_chats,
            "customers_linked_to_dashboard": customers_linked_to_dashboard,
            "customers_not_linked": customers_count - customers_linked_to_dashboard,
        }
        
        elapsed = time.time() - start_time
        print(f"✅ [DEBUG] Database overview generated (took {elapsed:.2f}s)")
        return overview
        
    except HTTPException:
        raise
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"❌ [DEBUG] Error generating overview (took {elapsed:.2f}s): {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generating database overview: {str(e)}")
