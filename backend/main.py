from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi import Query
from typing import Optional
import logging
import time
from datetime import datetime

# Import your existing LangGraph components
from langchain.chat_models import init_chat_model
from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode, tools_condition
from langchain.schema import Document
from typing import Annotated
from typing_extensions import TypedDict
from pathlib import Path
import jsonlines
from langchain.docstore.document import Document
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from dotenv import load_dotenv
from langsmith import traceable
from tqdm import tqdm
import re
import json
import os

# Database middleware
from storage import ChatStorage

# Load AOPS data
with open("aops.json", "r", encoding="utf-8") as f:
    AOPS = json.load(f)


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
print("🔧 Loading environment variables...")
load_dotenv()
print("✅ Environment variables loaded")

# MongoDB setup
uri = os.getenv("MONGO_URI")
print(f"🔗 Connecting to MongoDB Atlas: {uri}")

# Initialize storage
storage = ChatStorage(uri)


# FastAPI app initialization
app = FastAPI(title="Regirl Chat API", version="1.0.0")

# CORS configuration for Next.js frontend
print("🌐 Setting up CORS for Next.js frontend...")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
print("✅ CORS configured")

# Pydantic models for API
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    email: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str
    timestamp: str
    processing_time: float

class UserData(BaseModel):
    name: str
    email: str
    ip: str
    location: dict
    device: dict
    timestamp: str
    lastSeen: str
    totalVisits: int
    chatId: str
    vibe: str
    visitDuration: int


class UserDataResponse(BaseModel):
    success: bool
    message: str

# LangGraph State
class State(TypedDict):
    messages: Annotated[list, add_messages]



# AOP Execution
def format_step_for_user(step: dict) -> str:
    """
    Get the human-facing message for a step, using 'user_prompt' if available.
    """
    return step.get("user_prompt", f"➡️ Proceeding with step: {step['id']}")


def run_aop(
    aop: dict,
    user_message: str,
    user_inputs: dict = None,
    chat_id: str = None,
    storage=None
) -> str:
    """
    Executes any AOP step by step, pausing if input is required.
    - Saves debug logs with msg_type="debug"
    - Saves user-facing replies with msg_type="reply"
    - Returns only the latest reply for frontend
    """
    logger.info(f"🚀 Running AOP: {aop['aop_name']} for message: '{user_message}'")

    user_inputs = user_inputs or {}
    steps = {step["id"]: step for step in aop["steps"]}

    # Load state from DB
    state = storage.get_state(chat_id) if chat_id and storage else {}

    # Resume from last step if saved, otherwise start fresh
    current_step_id = state.get("step_id", aop["steps"][0]["id"])
    current_step = steps[current_step_id]

    last_user_reply = None  # <-- what we’ll return to frontend

    # 🔹 Debug log (start)
    if chat_id:
        storage.add_message(chat_id, "agent", f"▶ Starting AOP: {aop['aop_name']}", msg_type="debug")

    while current_step:
        step_id = current_step["id"]
        step_type = current_step["type"]

        # 🔹 Debug log (step info)
        if chat_id:
            storage.add_message(chat_id, "agent", f"➡️ Step {step_id} ({step_type})", msg_type="debug")

        # Format user-facing message
        user_message_out = format_step_for_user(current_step)

        # 🔹 Save agent reply (user sees this)
        if chat_id:
            storage.add_message(chat_id, "agent", user_message_out, msg_type="reply")
        last_user_reply = user_message_out

        # If input required but not yet provided → pause
        if current_step.get("requires_response") and step_id not in user_inputs:
            logger.info(f"⏸ Pausing at step '{step_id}' (waiting for input)")
            if chat_id:
                storage.set_chat_state(chat_id, {
                    "aop_name": aop["aop_name"],
                    "step_id": step_id
                })
            return last_user_reply

        # If input provided → store in state
        if step_id in user_inputs:
            state[step_id] = user_inputs[step_id]
            if chat_id and storage:
                storage.update_state(chat_id, {step_id: user_inputs[step_id]})

        # --- Decision step ---
        if step_type == "decision":
            matched_next = None
            for rule in current_step.get("decision_logic", []):
                condition = rule["condition"]
                try:
                    if eval(condition, {}, state):
                        matched_next = rule["next"]
                        if chat_id:
                            storage.add_message(chat_id, "agent",
                                f"🔀 Condition matched: {condition} → {matched_next}",
                                msg_type="debug"
                            )
                        break
                except Exception as e:
                    logger.error(f"❌ Error evaluating condition '{condition}': {e}")

            if not matched_next:
                if chat_id:
                    storage.add_message(chat_id, "agent",
                        f"⚠️ No matching condition at {step_id}",
                        msg_type="debug"
                    )
                break
            current_step_id = matched_next

        # --- Action step ---
        elif step_type == "action":
            action = current_step.get("action")
            if chat_id:
                storage.add_message(chat_id, "agent", f"⚙️ Executing action: {action}", msg_type="debug")
            current_step_id = current_step.get("success_next")

        else:
            if chat_id:
                storage.add_message(chat_id, "agent", f"❓ Unknown step type: {step_type}", msg_type="debug")
            break

        # Persist step before moving forward
        if chat_id and storage:
            storage.set_chat_state(chat_id, {
                "aop_name": aop["aop_name"],
                "step_id": current_step_id
            })

        current_step = steps.get(current_step_id) if current_step_id else None

    # 🔹 Debug log (end)
    if chat_id:
        storage.add_message(chat_id, "agent", f"🏁 Finished AOP: {aop['aop_name']}", msg_type="debug")

    return last_user_reply or f"✅ Finished {aop['aop_name']}"


# Tools
@tool
def match_aop(user_message: str) -> str:
    """
    Match the user's message to an available AOP.
    Returns the AOP name or 'none'.
    """
    # Give the LLM the list of AOPs
    logger.info(f"🎯 Matching AOP for message: '{user_message}'")
    aop_names = [a["aop_name"] for a in AOPS]
    descriptions = "\n".join([f"- {a['aop_name']}: {a['description']}" for a in AOPS])

    prompt = f"""
    User message: "{user_message}"
    Available AOPs:
    {descriptions}

    Which AOP best matches the user request? 
    Respond with the exact AOP name or 'none' if none apply.
    """

    result = llm.invoke(prompt)  # use your initialized LLM
    chosen = result.content.strip()
    logger.info(f"✅ LLM decided: {chosen}")
    return chosen


@tool
def get_stock_price(symbol: str) -> float:
    """
    Get the current stock price for a given stock symbol.
    This function returns mock stock prices for demonstration purposes.
    """
    print(f"📈 Getting stock price for symbol: {symbol}")
    price = {
        "MSFT": 200.3,
        "AAPL": 200.3,
        "AMZN": 200.3,
        "RIL": 87.6,
    }.get(symbol, 0.0)
    print(f"💰 Stock price for {symbol}: ${price}")
    return price

# Initialize embeddings and vector store
print("🤖 Initializing embeddings...")
embeddings = HuggingFaceEmbeddings()
vector_store = None

def initialize_vector_store():
    global vector_store
    print("📚 Initializing knowledge base...")
    
    kb_folder = Path("jsonl_data")
    index_dir = Path("faiss_index")
    
    if not kb_folder.exists():
        print("⚠️  Warning: jsonl_data folder not found. Creating empty vector store.")
        # Create a dummy document to initialize the vector store
        dummy_doc = Document(page_content="Welcome to Regirl customer support", metadata={"id": "dummy"})
        vector_store = FAISS.from_documents([dummy_doc], embeddings)
        return
    
    if index_dir.exists():
        print("🔄 Loading cached FAISS index...")
        try:
            vector_store = FAISS.load_local(
                str(index_dir),
                embeddings,
                allow_dangerous_deserialization=True
            )
            print("✅ FAISS index loaded successfully")
        except Exception as e:
            print(f"❌ Error loading FAISS index: {e}")
            print("🔄 Building new index...")
            build_new_index(kb_folder, index_dir)
    else:
        print("⚡ Building FAISS index from JSONL files...")
        build_new_index(kb_folder, index_dir)

def build_new_index(kb_folder: Path, index_dir: Path):
    global vector_store
    docs = []
    
    jsonl_files = list(kb_folder.glob("*.jsonl"))
    print(f"📄 Found {len(jsonl_files)} JSONL files")
    
    for file in jsonl_files:
        print(f"📖 Processing file: {file.name}")
        try:
            with jsonlines.open(file) as reader:
                for obj in reader:
                    docs.append(Document(
                        page_content=obj["text"],
                        metadata={"id": obj["id"]}
                    ))
        except Exception as e:
            print(f"❌ Error processing {file.name}: {e}")
    
    print(f"📚 Total documents loaded: {len(docs)}")
    
    if docs:
        print("🔨 Building FAISS index...")
        vector_store = FAISS.from_documents(docs, embeddings)
        vector_store.save_local(str(index_dir))
        print("✅ FAISS index built and saved")
    else:
        print("⚠️  No documents found, creating dummy vector store")
        dummy_doc = Document(page_content="Welcome to Regirl customer support", metadata={"id": "dummy"})
        vector_store = FAISS.from_documents([dummy_doc], embeddings)

@tool
def retrieve_from_kb(query: str, top_k: int = 3) -> str:
    """
    Retrieve top-k relevant KB entries for a user query.
    """
    print(f"🔍 Searching knowledge base for: '{query}' (top_k={top_k})")
    
    if vector_store is None:
        print("❌ Vector store not initialized")
        return "Knowledge base not available"
    
    try:
        results = vector_store.similarity_search(query, k=top_k)
        retrieved_content = "\n".join([r.page_content for r in results])
        print(f"📋 Retrieved {len(results)} relevant documents")
        print(f"📄 Content preview: {retrieved_content[:200]}...")
        return retrieved_content
    except Exception as e:
        print(f"❌ Error retrieving from knowledge base: {e}")
        return "Error retrieving information from knowledge base"

# Initialize LangGraph
print("🧠 Initializing LangGraph...")
tools = [get_stock_price, retrieve_from_kb]

try:
    print("🤖 Connecting to Gemini model...")
    llm = init_chat_model("google_genai:gemini-2.0-flash")
    llm_with_tools = llm.bind_tools(tools)
    print("✅ Gemini model initialized successfully")
except Exception as e:
    print(f"❌ Error initializing model: {e}")
    raise

def chatbot(state: State):
    print("🤖 Processing message through chatbot...")
    print(f"📨 Input messages count: {len(state['messages'])}")
    
    try:
        response = llm_with_tools.invoke(state["messages"])
        print("✅ LLM response generated successfully")
        return {"messages": [response]}
    except Exception as e:
        print(f"❌ Error in chatbot processing: {e}")
        raise

# Build the graph
print("🔗 Building LangGraph...")
builder = StateGraph(State)
builder.add_node(chatbot)
builder.add_node("tools", ToolNode(tools))
builder.add_edge(START, "chatbot")
builder.add_conditional_edges("chatbot", tools_condition)
builder.add_edge("tools", "chatbot")

graph = builder.compile()
print("✅ LangGraph built successfully")

# System message
system_message = {
    "role": "system",
    "content": (
        "You are a knowledgeable and professional customer support assistant for Heirs Insurance Group. "
        "Always assume the customer is asking about Heirs Life or Heirs General Insurance products, services, "
        "claims, policies, or digital channels unless otherwise specified. Provide clear, accurate, and reassuring "
        "answers, guiding customers through insurance options, claims processes, payments, and account support. "
        "If you are unsure or the query is outside Heirs Insurance, politely clarify or redirect the customer."
    )
}


def save_user_data(user_data: UserData) -> bool:
    """
    Save user data to a JSON file, appending to existing data
    """
    try:
        users_file = "users.json"
        
        # Load existing users or create empty list
        if os.path.exists(users_file):
            with open(users_file, 'r', encoding='utf-8') as f:
                users = json.load(f)
        else:
            users = []
        
        # Convert Pydantic model to dict
        user_dict = user_data.dict()
        
        # Append new user
        users.append(user_dict)
        
        # Save back to file with proper formatting
        with open(users_file, 'w', encoding='utf-8') as f:
            json.dump(users, f, indent=2, ensure_ascii=False)
        
        print(f"✅ User data saved: {user_data.name} ({user_data.email})")
        print(f"📊 Total users: {len(users)}")
        return True
        
    except Exception as e:
        print(f"❌ Error saving user data: {e}")
        return False

@traceable
def process_chat_message(query: str, session_id: str) -> str:
    """
    Process a chat message through the LangGraph pipeline
    """
    print(f"💬 Processing chat message for session: {session_id}")
    print(f"📝 User query: '{query}'")
    
    try:
        messages = [
            system_message,
            {"role": "user", "content": query}
        ]
        
        print("🚀 Invoking LangGraph...")
        state = graph.invoke({"messages": messages})
        
        raw_response = state["messages"][-1].content
        print(f"🔄 Raw response length: {len(raw_response)} characters")
        
        # Clean formatting
        formatted = raw_response.replace("\\n", "\n")
        formatted = re.sub(r"\*\*|\*", "", formatted)
        formatted = "\n".join(line.strip() for line in formatted.split("\n") if line.strip())
        
        print("✅ Message processed successfully")
        return formatted
        
    except Exception as e:
        print(f"❌ Error processing message: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

# API Routes



@app.get("/")
async def root():
    print("🏠 Root endpoint accessed")
    return {"message": "Regirl Chat API is running!", "status": "healthy"}

@app.get("/health")
async def health_check():
    print("🏥 Health check endpoint accessed")
    vector_store_status = "initialized" if vector_store is not None else "not initialized"
    return {
        "status": "healthy",
        "vector_store": vector_store_status,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/users", response_model=UserDataResponse)
async def save_user_endpoint(user_data: UserData):
    print(f"👤 User data endpoint called")
    print(f"📝 Name: {user_data.name}")
    print(f"📧 Email: {user_data.email}")
    print(f"🌍 Location: {user_data.location.get('city', 'Unknown')}, {user_data.location.get('country', 'Unknown')}")
    

    try:
        user = storage.get_or_create_user(email=user_data.email, name=user_data.name)
        return UserDataResponse(success=True, message="User stored in MongoDB")
    except Exception as e:
        print(f"❌ MongoDB error: {e}")
        raise HTTPException(status_code=500, detail="DB error")



    # try:
    #     # Save user data to JSON file
    #     success = save_user_data(user_data)

        
        
    #     if success:
    #         return UserDataResponse(
    #             success=True,
    #             message="User data saved successfully"
    #         )
    #     else:
    #         raise HTTPException(status_code=500, detail="Failed to save user data")
            
    # except HTTPException:
    #     raise
    # except Exception as e:
    #     print(f"❌ Unexpected error in user endpoint: {e}")
    #     raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    start_time = time.time()
    session_id = request.session_id or f"session_{int(time.time())}"
    
    logger.info(f"📞 Chat request received | Session: {session_id} | Email: {request.email}")
    logger.info(f"📝 User message: '{request.message}'")
    try:
        # Example: email should come from frontend/user context
        user_email = request.email  
        if not user_email:
            raise HTTPException(status_code=400, detail="Email is required")

        user = storage.get_or_create_user(user_email)

        # Start new chat if none exists
        chat_id = storage.get_or_create_open_chat(str(user["_id"]))


        # Save user message
        storage.add_message(chat_id, "user", request.message)


        # 🔹 First, check if an AOP applies
        aop_name = match_aop(request.message)
        if aop_name and aop_name.lower() != "none":
            logger.info(f"🤖 AOP detected: {aop_name}")
            aop = next((a for a in AOPS if a["aop_name"] == aop_name), None)
            if aop:
                response_text = run_aop(aop, request.message, chat_id=chat_id, storage=storage)
            else:
                logger.error(f"⚠️ AOP '{aop_name}' not found in definitions")
                response_text = "I detected an AOP intent, but could not load it."
        else:
            # Fallback to normal chatbot
            logger.info("💬 No AOP triggered, falling back to normal chatbot")
            response_text = process_chat_message(request.message, session_id)




       
        # Save agent reply
        storage.add_message(chat_id, "agent", response_text)

        processing_time = time.time() - start_time
        timestamp = datetime.now().isoformat()

        logger.info(f"✅ Chat handled successfully in {processing_time:.2f}s")

        return ChatResponse(
            response=response_text,
            session_id=chat_id,
            timestamp=timestamp,
            processing_time=processing_time
        )
    except Exception as e:
        print(f"❌ Error in /chat: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    print(f"📨 Message: '{request.message}'")


@app.get("/chats")
async def get_chats(email: str = Query(...)):
    """
    Return all chats for a given user email.
    """
    user = storage.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    chats = list(storage.chats.find({"user_id": str(user["_id"])}, {"_id": 0}))
    return {"chats": chats} 

    
    # try:
    #     # Process the message
    #     response_text = process_chat_message(request.message, session_id)
        
    #     processing_time = time.time() - start_time
    #     timestamp = datetime.now().isoformat()
        
    #     print(f"⏱️  Processing time: {processing_time:.2f} seconds")
    #     print(f"📤 Response length: {len(response_text)} characters")
        
    #     return ChatResponse(
    #         response=response_text,
    #         session_id=session_id,
    #         timestamp=timestamp,
    #         processing_time=processing_time
    #     )
        
    # except HTTPException:
    #     raise
    # except Exception as e:
    #     print(f"❌ Unexpected error in chat endpoint: {e}")
    #     raise HTTPException(status_code=500, detail="Internal server error")

# Startup event
@app.on_event("startup")
async def startup_event():
    print("🚀 Starting up Regirl Chat API...")
    print("📚 Initializing knowledge base...")
    initialize_vector_store()
    print("✅ Startup complete - API ready to serve requests!")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    print("🛑 Shutting down Regirl Chat API...")
    print("✅ Shutdown complete")

if __name__ == "__main__":
    import uvicorn
    print("🌟 Starting FastAPI server...")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)