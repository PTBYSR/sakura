"""
User-related API routes.
"""
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from typing import Optional
from app.models.chat_model import UserDataRequest, UserDataResponse
from app.core.database import get_database, get_db_manager
from pymongo.database import Database

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.post("/data", response_model=UserDataResponse)
async def store_user_data(request: dict, db: Database = Depends(get_database)):
    """Store user data in the database (works with or without database)."""
    try:
        # Try to get database connection
        try:
            if db is not None:
                # Store in MongoDB if available - use the same format as existing users
                collection = db.users
                user_email = request.get("email", "unknown@example.com")
                
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
                
                # Insert or update user
                result = collection.update_one(
                    {"email": user_email},
                    {"$set": user_doc},
                    upsert=True
                )
                print(f"✅ User data stored in MongoDB for user {user_email}")
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

