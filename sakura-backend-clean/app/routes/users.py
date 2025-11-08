"""
User-related API routes.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from fastapi.responses import JSONResponse
from bson import ObjectId
from pymongo.database import Database
from typing import Optional
from datetime import datetime
import asyncio
import traceback
import json
import httpx
import os
import uuid

from app.core.database import get_database
from app.models.chat_model import UserDataRequest, UserDataResponse
from app.services.redis_publisher import publish_event

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.post("/data", response_model=UserDataResponse)
async def store_user_data(request: dict, db: Database = Depends(get_database)):
    """Store user data in the database (works with or without database)."""
    try:
        # Try to get database connection
        try:
            if db is not None:
                # Store in MongoDB if available - use the same format as existing customers
                collection = db.customers
                user_email = request.get("email", "unknown@example.com")
                user_id = request.get("user_id")  # Widget userId if provided
                
                # Create user document in the same format as existing users
                user_doc = {
                    "email": user_email,
                    "name": request.get("name", "Unknown User"),
                    "created_at": request.get("timestamp", datetime.now().isoformat()),
                    "last_seen": request.get("lastSeen", datetime.now().isoformat()),
                    "total_visits": request.get("totalVisits", 1),
                    "ip": request.get("ip"),
                    "location": request.get("location", {}),
                    "device": request.get("device", {}),
                    "vibe": request.get("vibe", "neutral"),
                    "visitDuration": request.get("visitDuration", 0),
                    "visit_duration": request.get("visitDuration", 0),
                    "chat_id": request.get("chatId"),
                    "timestamp": request.get("timestamp", datetime.now().isoformat()),
                    "category": request.get("category", "agent-inbox"),
                    "status": request.get("status", "active")
                }
                
                # If user_id provided (dashboard user ID from widget link), store it as dashboard_user_id
                # This links the widget customer to the dashboard user who owns the widget
                if user_id:
                    user_doc["dashboard_user_id"] = user_id
                    print(f"🔗 Linking widget customer to dashboard user: {user_id}")
                
                # Create/update customer by email (customers have their own _id, not the dashboard user's ID)
                result = collection.update_one(
                    {"email": user_email},
                    {"$set": user_doc},
                    upsert=True
                )
                print(f"✅ Widget customer stored/updated by email: {user_email}" + (f" (linked to dashboard user: {user_id})" if user_id else ""))
            else:
                print("⚠️  Database not available, storing user data in memory only")
        except Exception as db_error:
            print(f"⚠️  Database error (continuing without DB): {db_error}")
        
        # Always return success (even without database)
        user_id = request.get("chatId", request.get("email", "unknown"))
        return UserDataResponse(
            success=True,
            message=f"User data received successfully for {user_id}"
        )
    except Exception as e:
        print(f"❌ Error processing user data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/data/{user_id}")
async def get_user_data(
    user_id: str,
    db: Database = Depends(get_database)
):
    """Retrieve user data from the database."""
    try:
        collection = db.user_data
        user_doc = collection.find_one({"user_id": user_id})
        
        if not user_doc:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "user_id": user_id,
            "data": user_doc.get("data", {}),
            "updated_at": user_doc.get("updated_at")
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chats/create")
async def create_chat_instance(request: dict, db: Database = Depends(get_database)):
    """Create a new chat instance tied to a user.
    
    Accepts either:
    - user_id: Look up customer by _id or user_id reference field
    - email: Look up customer by email (fallback when user_id not provided)
    
    TODO: Add session verification to ensure the authenticated user
    matches the user_id in the request. For now, any valid user_id or email can create chats.
    """
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        user_id = request.get("user_id")
        user_email = request.get("email")
        
        if not user_id and not user_email:
            raise HTTPException(status_code=400, detail="Either user_id or email is required")
        
        # Optional: name and email from request (if provided by widget/frontend)
        provided_name = request.get("name")
        provided_email = request.get("email") or user_email
        
        # Verify user exists, or create if doesn't exist
        customers_collection = db.customers
        user_obj_id = None
        user_doc = None
        can_create_with_objectid = False
        
        # If user_id provided, try to find by ID first
        if user_id:
            # Try ObjectId first
            try:
                user_obj_id = ObjectId(user_id)
                can_create_with_objectid = True
                user_doc = customers_collection.find_one({"_id": user_obj_id})
                print(f"🔍 Looking for user with ObjectId: {user_obj_id}")
            except Exception as e:
                # user_id is not a valid ObjectId (might be a string UUID from Better Auth)
                print(f"ℹ️  User ID is not a valid ObjectId: {user_id} (this is OK for Better Auth)")
                # Try string match
                user_doc = customers_collection.find_one({"_id": user_id})
            
            # If not found by ID, also try user_id reference field
            if not user_doc:
                user_doc = customers_collection.find_one({"user_id": user_id})
        
        # If still not found and email provided, try email lookup
        if not user_doc and provided_email:
            print(f"🔍 User not found by ID, trying email lookup: {provided_email}")
            user_doc = customers_collection.find_one({"email": provided_email})
            if user_doc:
                print(f"✅ Found user by email: {provided_email}")
                # Set user_obj_id based on found document's _id
                try:
                    user_obj_id = ObjectId(user_doc.get("_id"))
                    can_create_with_objectid = True
                except:
                    pass
        
        # If user doesn't exist, create a customer record
        if not user_doc:
            print(f"📝 User not found, creating customer record for: {user_id}")
            # Use provided name/email if available, otherwise use defaults
            customer_name = provided_name if provided_name else f"User {user_id[:8]}"  # Show first 8 chars of ID
            customer_email = provided_email if provided_email else f"user_{user_id}@widget.local"
            
            # Create a minimal customer record
            new_customer = {
                "email": customer_email,
                "name": customer_name,
                "created_at": datetime.now(),
                "category": "agent-inbox",  # All initial chats go to agent-inbox
                "status": "active"
            }
            
            print(f"📝 Creating customer with name: '{customer_name}', email: '{customer_email}'")
            
            # Try different ID formats
            inserted = False
            if can_create_with_objectid and user_obj_id:
                try:
                    customers_collection.insert_one({"_id": user_obj_id, **new_customer})
                    user_doc = customers_collection.find_one({"_id": user_obj_id})
                    inserted = True
                    print(f"✅ Created customer record with ObjectId: {user_obj_id}")
                except Exception as e:
                    print(f"⚠️  Failed to create with ObjectId: {e}")
            
            # If ObjectId insert failed or not applicable, try string _id
            if not inserted:
                try:
                    customers_collection.insert_one({"_id": user_id, **new_customer})
                    user_doc = customers_collection.find_one({"_id": user_id})
                    inserted = True
                    print(f"✅ Created customer record with string ID: {user_id}")
                except Exception as e:
                    print(f"⚠️  Failed to create with string ID: {e}")
                    # Last resort: generate new ObjectId but store user_id as reference
                    try:
                        import uuid
                        new_obj_id = ObjectId()
                        customers_collection.insert_one({
                            "_id": new_obj_id,
                            "user_id": user_id,  # Store original ID as reference
                            **new_customer
                        })
                        user_doc = customers_collection.find_one({"_id": new_obj_id})
                        inserted = True
                        print(f"✅ Created customer record with new ObjectId, referenced user_id: {user_id}")
                    except Exception as e3:
                        print(f"❌ Could not create customer record in any format: {e3}")
                        raise HTTPException(
                            status_code=500, 
                            detail=f"Failed to create customer record: {str(e3)}"
                        )
            
            if not user_doc:
                raise HTTPException(
                    status_code=500,
                    detail=f"Created customer record but could not retrieve it"
                )
        
        # Update customer name/email if provided and current values are defaults
        # This helps if customer was created with "Widget User" and we now have better info
        if provided_name or provided_email:
            update_fields = {}
            current_name = user_doc.get("name", "")
            current_email = user_doc.get("email", "")
            
            # Update name if provided and current is a default value
            if provided_name and (current_name == "Widget User" or current_name.startswith("User ") or not current_name):
                update_fields["name"] = provided_name
            
            # Update email if provided and current is a default widget email
            if provided_email and ("@widget.local" in current_email or not current_email or current_email == "unknown@example.com"):
                update_fields["email"] = provided_email
            
            if update_fields:
                print(f"📝 Updating customer with better info: {update_fields}")
                try:
                    customers_collection.update_one(
                        {"_id": user_doc.get("_id")},
                        {"$set": update_fields}
                    )
                    # Refresh user_doc to get updated values
                    user_doc = customers_collection.find_one({"_id": user_doc.get("_id")})
                except Exception as e:
                    print(f"⚠️  Failed to update customer info: {e}")
        
        # Use the user_id from the document or the one we found
        # If we created a new ObjectId but stored original user_id as reference, use the ObjectId for chats
        # but also store the original user_id for lookup
        final_user_id = user_doc.get("_id")
        original_user_id = user_doc.get("user_id") or user_id  # Original Better Auth ID if stored
        
        # Generate chat ID
        import uuid
        chat_id = str(uuid.uuid4())
        
        # Create chat document
        chats_collection = db["customer-chats"]
        chat_doc = {
            "chat_id": chat_id,
            "user_id": final_user_id,  # MongoDB _id (ObjectId or string)
            "original_user_id": original_user_id if original_user_id != str(final_user_id) else None,  # Better Auth ID if different
            "status": "open",
            "created_at": datetime.now(),
            "last_activity": datetime.now(),
            "updated_at": datetime.now(),
            "total_messages": 0,
            "messages": []
        }
        
        result = chats_collection.insert_one(chat_doc)
        
        print(f"✅ Created new chat {chat_id} for user {user_id}")
        
        return {
            "success": True,
            "chat_id": chat_id,
            "user_id": str(user_doc.get("_id")),
            "message": "Chat instance created successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error creating chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chats/{chat_id}/send")
async def send_message_to_chat(
    chat_id: str, 
    request: Request,
    db: Database = Depends(get_database),
    background_tasks: BackgroundTasks = None
):
    """Send a message to a chat (for Widget)."""
    print(f"\n{'='*60}")
    print(f"📥 WIDGET MESSAGE RECEIVED")
    print(f"{'='*60}")
    print(f"Chat ID: {chat_id}")
    print(f"{'='*60}\n")
    
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        # Parse request body - support both JSON and FormData/Blob
        content_type = request.headers.get("content-type", "")
        content = ""
        role = "user"
        
        try:
            if "application/json" in content_type:
                # Parse as JSON
                body = await request.json()
                print(f"📥 Parsed JSON body: {body}")
                content = body.get("content", "")
                role = body.get("role", "user")
            elif "multipart/form-data" in content_type or "application/x-www-form-urlencoded" in content_type:
                # Parse as FormData
                form_data = await request.form()
                print(f"📥 Parsed FormData: {dict(form_data)}")
                content = form_data.get("content", "")
                role = form_data.get("role", "user")
                if hasattr(content, 'read'):
                    content = await content.read()
                    content = content.decode('utf-8') if isinstance(content, bytes) else str(content)
                else:
                    content = str(content) if content else ""
                role = str(role) if role else "user"
            else:
                # Try to parse as JSON (for Blob with application/json type)
                try:
                    body = await request.json()
                    print(f"📥 Parsed as JSON (default): {body}")
                    content = body.get("content", "")
                    role = body.get("role", "user")
                except:
                    # If JSON parsing fails, try reading raw body and parsing manually
                    raw_body = await request.body()
                    if raw_body:
                        try:
                            import json
                            body = json.loads(raw_body.decode('utf-8'))
                            print(f"📥 Parsed from raw body: {body}")
                            content = body.get("content", "")
                            role = body.get("role", "user")
                        except:
                            raise HTTPException(status_code=400, detail="Could not parse request body as JSON or FormData")
                    else:
                        raise HTTPException(status_code=400, detail="Request body is empty")
        except HTTPException:
            raise
        except Exception as e:
            print(f"❌ Failed to parse request body: {e}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=400, detail=f"Invalid request body: {str(e)}")
        
        chats_collection = db["customer-chats"]
        
        print(f"💬 Message content: '{content[:100]}'")
        print(f"👤 Message role: '{role}'")
        
        if not content:
            raise HTTPException(status_code=400, detail="Message content is required")
        
        # Add message to chat
        message = {
            "_id": f"msg_{int(datetime.now().timestamp())}",
            "role": role,
            "content": content,
            "text": content,  # Store as both for compatibility
            "timestamp": datetime.now(),
            "status": "sent",
            "read": False
        }
        
        # Check if chat exists
        chat_doc = chats_collection.find_one({"chat_id": chat_id})
        if not chat_doc:
            print(f"⚠️  Chat not found: {chat_id}")
            raise HTTPException(status_code=404, detail=f"Chat not found: {chat_id}")
        
        # Add message to chat
        result = chats_collection.update_one(
            {"chat_id": chat_id},
            {
                "$push": {"messages": message},
                "$set": {
                    "updated_at": datetime.now(),
                    "last_activity": datetime.now()
                }
            }
        )
        
        # Update total_messages count
        updated_chat_doc = chats_collection.find_one({"chat_id": chat_id})
        if updated_chat_doc:
            chats_collection.update_one(
                {"chat_id": chat_id},
                {"$set": {"total_messages": len(updated_chat_doc.get("messages", []))}}
            )
        
        # Trigger lightweight notification via Redis for real-time dashboard update
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
            print("✅ Quick notification published to Redis (widget message)")
        except Exception as ws_error:
            print(f"⚠️ Redis notification failed (non-critical): {ws_error}")
            import traceback
            traceback.print_exc()
        
        print(f"✅ Message saved to chat {chat_id} (role: {role})")
        return {"success": True, "message": "Message sent successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error sending message: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/chats")
async def get_user_chats(
    user_id: str,
    db: Database = Depends(get_database),
    # TODO: Add session verification when auth is integrated
    # For now, this endpoint is accessible to anyone with the user_id
    # In production, verify that the session user_id matches the requested user_id
):
    """Get all chat instances for a specific user."""
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        customers_collection = db.customers
        chats_collection = db["customer-chats"]
        
        # Find user (try ObjectId first, then string, then user_id reference field)
        user_doc = None
        search_id = None
        
        # Try ObjectId first
        try:
            user_obj_id = ObjectId(user_id)
            user_doc = customers_collection.find_one({"_id": user_obj_id})
            if user_doc:
                search_id = user_obj_id
                print(f"✅ Found user by ObjectId _id: {user_obj_id}")
        except:
            pass
        
        # If not found, try string _id
        if not user_doc:
            user_doc = customers_collection.find_one({"_id": user_id})
            if user_doc:
                search_id = user_id
                print(f"✅ Found user by string _id: {user_id}")
        
        # If still not found, try user_id reference field (for records created with new ObjectId)
        if not user_doc:
            user_doc = customers_collection.find_one({"user_id": user_id})
            if user_doc:
                # Use the _id from the found document for chat lookup
                search_id = user_doc.get("_id")
                print(f"✅ Found user by user_id reference field: {user_id} (stored _id: {search_id})")
        
        # If still not found, try email (for widget polling)
        if not user_doc:
            user_doc = customers_collection.find_one({"email": user_id})
            if user_doc:
                search_id = user_doc.get("_id")
                print(f"✅ Found user by email: {user_id} (stored _id: {search_id})")
        
        if not user_doc:
            print(f"❌ User not found with ID or email: {user_id}")
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get all chats for this user
        # Try multiple ways to find chats (ObjectId, string, or user_id reference)
        user_chats_list = list(chats_collection.find({"user_id": search_id}))
        # Try string match if no results
        if not user_chats_list:
            user_chats_list = list(chats_collection.find({"user_id": str(search_id)}))
        # Also check if user_id was stored as a reference field
        if not user_chats_list and user_doc.get("user_id"):
            user_chats_list = list(chats_collection.find({"user_id": user_doc.get("user_id")}))
            if not user_chats_list:
                user_chats_list = list(chats_collection.find({"user_id": str(user_doc.get("user_id"))}))
        
        chats = []
        for chat_doc in user_chats_list:
            chat = {
                "chat_id": chat_doc.get("chat_id", "unknown"),
                "status": chat_doc.get("status", "open"),
                "created_at": chat_doc.get("created_at", datetime.now()).isoformat() if isinstance(chat_doc.get("created_at"), datetime) else str(chat_doc.get("created_at", datetime.now())),
                "last_activity": chat_doc.get("last_activity", datetime.now()).isoformat() if isinstance(chat_doc.get("last_activity"), datetime) else str(chat_doc.get("last_activity", datetime.now())),
                "total_messages": chat_doc.get("total_messages", len(chat_doc.get("messages", []))),
                "messages": []
            }
            
            # Convert messages
            for msg in chat_doc.get("messages", []):
                message = {
                    "_id": msg.get("_id", f"msg_{msg.get('timestamp', datetime.now())}"),
                    "role": msg.get("role", "user"),
                    "text": msg.get("text", msg.get("content", "")),
                    "content": msg.get("content", msg.get("text", "")),
                    "timestamp": msg.get("timestamp", datetime.now()).isoformat() if isinstance(msg.get("timestamp"), datetime) else str(msg.get("timestamp", datetime.now())),
                    "read": msg.get("read", True)
                }
                chat["messages"].append(message)
            
            chats.append(chat)
        
        return {
            "user_id": str(user_doc.get("_id")),
            "user_name": user_doc.get("name", "Unknown User"),
            "user_email": user_doc.get("email", "Unknown"),
            "chats": chats,
            "total_chats": len(chats)
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting user chats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

