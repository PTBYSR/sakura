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
    langgraph_service: LangGraphService = Depends(get_langgraph_service),
    db: Database = Depends(get_database)
):
    """Process a chat message through the AI agent."""
    try:
        print(f"📨 Received chat request for session: {message.session_id}")
        print(f"📝 Message content: {message.message[:200] if message.message else 'None'}")
        
        # Check if AI agent is enabled for this chat
        # session_id is typically the chat_id
        chat_id = message.session_id
        
        if db is not None:
            chats_collection = db["customer-chats"]
            chat_doc = chats_collection.find_one({"chat_id": chat_id})
            
            if chat_doc:
                # Check AI agent enabled status (default to True for backward compatibility)
                ai_agent_enabled = chat_doc.get("ai_agent_enabled", True)
                print(f"🤖 AI agent enabled status: {ai_agent_enabled}")
                
                if not ai_agent_enabled:
                    # AI agent is disabled, return a message indicating manual response needed
                    print("⚠️ AI agent is disabled for this chat")
                    return ChatResponse(
                        response="AI agent responses are currently disabled. A human agent will respond soon.",
                        session_id=message.session_id,
                        timestamp=datetime.now().isoformat()
                    )
            else:
                print(f"⚠️ Chat document not found for chat_id: {chat_id}")
        else:
            print("⚠️ Database not available")
        
        # AI agent is enabled, process normally
        print(f"🚀 Processing message through LangGraph service...")
        response = langgraph_service.process_chat_message(
            message.message, 
            message.session_id
        )
        
        print(f"✅ Successfully processed message, response length: {len(response) if response else 0}")
        
        return ChatResponse(
            response=response,
            session_id=message.session_id,
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        import traceback
        error_traceback = traceback.format_exc()
        print(f"❌ Error in /api/chat endpoint: {str(e)}")
        print(f"📋 Full traceback:\n{error_traceback}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


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


@router.get("/system-prompt")
async def get_system_prompt(
    db: Database = Depends(get_database)
):
    """Get the current AI agent system prompt."""
    try:
        if db is not None:
            collection = db["ai-settings"]
            settings_doc = collection.find_one({"type": "system_prompt"})
            
            if settings_doc:
                return {
                    "success": True,
                    "system_prompt": settings_doc.get("system_prompt", ""),
                    "updated_at": settings_doc.get("updated_at", datetime.now().isoformat())
                }
        
        # Default system prompt if not found in database
        default_prompt = (
            "You are an AI customer concierge for this company.\n"
            "Your job is to answer user questions clearly and professionally using the company's verified knowledge base and FAQs.\n"
            "Always provide the actual answer — do not restate your instructions.\n"
            "Try to summarize the answer in a few sentences. And always make sure the customer understands the answer.\n"
            "If no relevant information is available, say so politely and offer to escalate.\n"
        )
        
        return {
            "success": True,
            "system_prompt": default_prompt,
            "updated_at": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"❌ Error getting system prompt: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/system-prompt")
async def update_system_prompt(
    request: dict,
    db: Database = Depends(get_database),
    langgraph_service: LangGraphService = Depends(get_langgraph_service)
):
    """Update the AI agent system prompt."""
    try:
        system_prompt = request.get("system_prompt", "").strip()
        
        if not system_prompt:
            raise HTTPException(status_code=400, detail="System prompt cannot be empty")
        
        if db is not None:
            collection = db["ai-settings"]
            collection.update_one(
                {"type": "system_prompt"},
                {
                    "$set": {
                        "system_prompt": system_prompt,
                        "updated_at": datetime.now()
                    }
                },
                upsert=True
            )
            print(f"✅ System prompt updated in database")
        
        # Update the LangGraph service's system prompt immediately
        langgraph_service.system_prompt = system_prompt
        print(f"✅ System prompt updated in LangGraph service")
        
        return {
            "success": True,
            "message": "System prompt updated successfully",
            "updated_at": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating system prompt: {e}")
        raise HTTPException(status_code=500, detail=str(e))

