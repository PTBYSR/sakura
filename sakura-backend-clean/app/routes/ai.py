"""
AI and chat-related API routes.
"""
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from app.models.chat_model import ChatMessage, ChatResponse, AOPRequest, AOPResponse, HealthResponse
from app.services.langgraph_service import get_langgraph_service, LangGraphService
from app.services.vector_store_service import get_vector_store_service, VectorStoreService
from app.core.database import get_database
from pymongo.database import Database

router = APIRouter(prefix="/api", tags=["AI"])


@router.post("/chat", response_model=ChatResponse)
async def chat(
    message: ChatMessage,
    langgraph_service: LangGraphService = Depends(get_langgraph_service)
):
    """Process a chat message through the AI agent."""
    try:
        response = langgraph_service.process_chat_message(
            message.message, 
            message.session_id
        )
        
        return ChatResponse(
            response=response,
            session_id=message.session_id,
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/aop", response_model=AOPResponse)
async def run_aop(
    request: AOPRequest,
    langgraph_service: LangGraphService = Depends(get_langgraph_service),
    db: Database = Depends(get_database)
):
    """Run an Agent Operating Procedure workflow."""
    try:
        # Create a simple storage interface for AOP state management
        class SimpleStorage:
            def __init__(self, db: Database):
                self.db = db
                self.collection = db.chat_states
            
            def get_state(self, chat_id: str):
                doc = self.collection.find_one({"chat_id": chat_id})
                return doc.get("state", {}) if doc else {}
            
            def set_chat_state(self, chat_id: str, state: dict):
                self.collection.update_one(
                    {"chat_id": chat_id},
                    {"$set": {"state": state, "updated_at": datetime.now()}},
                    upsert=True
                )
            
            def clear_state(self, chat_id: str):
                self.collection.delete_one({"chat_id": chat_id})
        
        storage = SimpleStorage(db)
        response = langgraph_service.run_aop(
            request.aop_name,
            request.user_message,
            request.chat_id,
            storage
        )
        
        # Check if AOP is completed
        current_state = storage.get_state(request.chat_id)
        completed = not current_state.get("current_step")
        
        return AOPResponse(
            response=response,
            chat_id=request.chat_id,
            completed=completed
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health", response_model=HealthResponse)
async def health_check(
    vector_store_service: VectorStoreService = Depends(get_vector_store_service)
):
    """Health check endpoint."""
    print("🏥 Health check endpoint accessed")
    vector_store_status = "initialized" if vector_store_service.is_initialized() else "not initialized"
    
    return HealthResponse(
        status="healthy",
        vector_store=vector_store_status,
        timestamp=datetime.now().isoformat()
    )

