"""
User-related API routes.
"""
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from app.models.chat_model import UserDataRequest, UserDataResponse
from app.core.database import get_database
from pymongo.database import Database

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.post("/data", response_model=UserDataResponse)
async def store_user_data(
    request: UserDataRequest,
    db: Database = Depends(get_database)
):
    """Store user data in the database."""
    try:
        # Store user data in MongoDB
        collection = db.user_data
        result = collection.update_one(
            {"user_id": request.user_id},
            {"$set": {"data": request.data, "updated_at": datetime.now()}},
            upsert=True
        )
        
        return UserDataResponse(
            success=True,
            message=f"User data stored successfully for user {request.user_id}"
        )
    except Exception as e:
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
