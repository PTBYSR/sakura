from fastapi.middleware.cors import CORSMiddleware
from actions import ACTION_HANDLERS
from fastapi import FastAPI, HTTPException
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
from langchain_core.documents import Document
from typing import Annotated
from typing_extensions import TypedDict
from pathlib import Path
import jsonlines
from langchain_community.vectorstores import FAISS


from langchain_huggingface import HuggingFaceEmbeddings, HuggingFaceEndpointEmbeddings


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
    print(f"📂 Loaded {len(AOPS)} AOPs")


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


def get_embeddings():
    """
    Dynamically choose between local and API-based embeddings.
    Uses Hugging Face Inference API on Render or when an API token is present.
    """
    api_token = os.getenv("HUGGINGFACE_API_TOKEN")

    if os.getenv("RENDER") or api_token:
        print("⚡ Using Hugging Face Inference API embeddings")
        # Set the API token as environment variable for HuggingFaceEmbeddings
        if api_token:
            os.environ["HUGGINGFACEHUB_API_TOKEN"] = api_token
        return HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-mpnet-base-v2"
        )
    else:
        print("💻 Using local embeddings (sentence-transformers/all-MiniLM-L6-v2)")
        return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")


# --- Compatibility helper: merge chat state (use when ChatStorage lacks update_state) ---
def merge_chat_state(chat_id: str, new_state: dict):
    """
    Merge `new_state` into the stored chat-state for chat_id.
    This is a shim for ChatStorage implementations that don't expose `update_state`.
    """
    try:
        existing = storage.get_state(chat_id) or {}
    except Exception:
        existing = {}
    # shallow merge
    existing.update(new_state or {})
    # persist merged state back
    storage.set_chat_state(chat_id, existing)



# FastAPI app initialization
app = FastAPI(title="Regirl Chat API", version="1.0.0")

# CORS configuration for Next.js frontend
print("🌐 Setting up CORS for Next.js frontend...")

# Get frontend URLs from environment variable
frontend_urls = os.getenv("FRONTEND_URLS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001")
allowed_origins = [url.strip() for url in frontend_urls.split(",")]

print(f"🔗 Allowed origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Dynamic frontend URLs
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],  # Explicitly include OPTIONS
    allow_headers=["*"],
    expose_headers=["*"],  # Add this
    max_age=3600,  # Cache preflight requests for 1 hour
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
    category: str
    status: str


class UserDataResponse(BaseModel):
    success: bool
    message: str


# LangGraph State
class State(TypedDict):
    messages: Annotated[list, add_messages]

#llm wwrapper for run_aop
def llm(prompt: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": prompt}]
    )
    return response.choices[0].message.content


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
    storage=None,
    llm=None,
    max_retries: int = 3
) -> str:
    """
    Executes an AOP with proper state transitions and step handling.
    """
    logger.info(f"🚀 Running AOP: {aop['aop_name']} for message: '{user_message}'")
    user_inputs = user_inputs or {}

    # Build step map
    steps = {s["id"]: s for s in aop.get("steps", [])}
    if not steps:
        return "⚠️ No steps found in this AOP."

    # Load persistent state for chat
    state = storage.get_state(chat_id) if (chat_id and storage) else {}
    logger.info(f"📄 Current state: {state}")

    current_step_id = state.get("step_id", aop["steps"][0]["id"])
    retry_count = state.get("retry_count", 0)
    awaiting_input = state.get("awaiting_input", False)

    current_step = steps.get(current_step_id)
    if not current_step:
        return "⚠️ Invalid step reference in AOP."

    # PHASE 1: Send prompt if step requires response and we're not awaiting input
    if current_step.get("requires_response") and not awaiting_input:
        prompt = current_step.get("user_prompt", "Please provide the required input.")
        if chat_id:
            storage.add_message(chat_id, "agent", prompt, msg_type="reply")
            storage.set_chat_state(chat_id, {
                "aop_name": aop["aop_name"],
                "step_id": current_step_id,
                "retry_count": retry_count,
                "awaiting_input": True
            })
            logger.info(f"🕒 Awaiting user input for step: {current_step_id}")
        return prompt

    # PHASE 2: Validate input if we're awaiting it
    if current_step.get("requires_response") and awaiting_input:
        provided = user_inputs.get(current_step_id, user_message)

        # Validate input with LLM
        validation_prompt = f"""
You are validating a user's response in a customer support workflow.

Workflow name: '{aop['aop_name']}'
Current step: '{current_step_id}'
Expected input type: {current_step.get('expected_input', 'any')}
System asked: "{current_step.get('user_prompt', '')}"
User replied: "{provided}"

Determine if the user provided valid input or wants to cancel.
Respond strictly in JSON:
{{
  "status": "valid" | "invalid" | "cancel",
  "reason": "short explanation"
}}
""".strip()

        try:
            logger.info("🧠 Validating user input with LLM...")
            llm_raw = llm.invoke(validation_prompt)
            llm_text = getattr(llm_raw, "content", str(llm_raw)).strip()
            llm_text = re.sub(r"^```[a-zA-Z]*\n?", "", llm_text)
            llm_text = re.sub(r"```$", "", llm_text).strip()
            llm_response = json.loads(llm_text)
            logger.info(f"🧠 LLM validation: {llm_response}")
        except:
            llm_response = {"status": "invalid", "reason": "Validation error"}

        status = llm_response.get("status", "invalid")
        reason = llm_response.get("reason", "")

        # Handle cancellation
        if status == "cancel":
            storage.clear_state(chat_id)
            return f"✅ Okay, I've cancelled the {aop['aop_name']} process."

        # Handle invalid input
        if status == "invalid":
            retry_count += 1
            storage.set_chat_state(chat_id, {
                "aop_name": aop["aop_name"],
                "step_id": current_step_id,
                "retry_count": retry_count,
                "awaiting_input": True
            })
            if retry_count >= max_retries:
                storage.clear_state(chat_id)
                return f"⚠️ Too many failed attempts. The {aop['aop_name']} process has been cancelled."
            return f"❌ {reason}. Please try again. ({retry_count}/{max_retries})"

        # Valid input - store it and advance
        state[current_step_id] = provided
        next_step_id = current_step.get("success_next")

        if not next_step_id:
            storage.clear_state(chat_id)
            return f"🎉 {aop['aop_name']} completed successfully!"

        # Process the next step
        return process_next_step(
            aop, steps, next_step_id, state, chat_id, storage, user_message, llm
        )

    # PHASE 3: Handle non-interactive steps (actions/decisions)
    if not current_step.get("requires_response"):
        # Execute the step logic (mock for now)
        logger.info(f"🔧 Executing non-interactive step: {current_step_id}")
        
        # For decision steps, evaluate conditions
        if current_step.get("type") == "decision":
            decision_logic = current_step.get("decision_logic", [])
            # Mock evaluation - in production, evaluate actual conditions
            next_step_id = decision_logic[0].get("next") if decision_logic else None
        else:
            # For action steps, proceed to next
            next_step_id = current_step.get("success_next")

        if not next_step_id:
            storage.clear_state(chat_id)
            return f"🎉 {aop['aop_name']} completed!"

        # Process the next step
        return process_next_step(
            aop, steps, next_step_id, state, chat_id, storage, user_message, llm
        )

    # Default fallback
    return f"🎉 Finished {aop['aop_name']}"


def process_next_step(aop, steps, next_step_id, state, chat_id, storage, user_message, llm):
    """
    Helper function to process the next step in an AOP workflow.
    Recursively handles non-interactive steps until we hit one that needs user input.
    """
    next_step = steps.get(next_step_id)
    if not next_step:
        storage.clear_state(chat_id)
        return f"⚠️ Next step '{next_step_id}' not found. Ending AOP."

    logger.info(f"📍 Moving to step: {next_step_id} (type: {next_step.get('type')})")

    # If next step requires user input, send prompt and wait
    if next_step.get("requires_response"):
        prompt = next_step.get("user_prompt", f"Proceeding to {next_step_id}")
        storage.set_chat_state(chat_id, {
            "aop_name": aop["aop_name"],
            "step_id": next_step_id,
            "retry_count": 0,
            "awaiting_input": True,
            **state
        })
        storage.add_message(chat_id, "agent", prompt, msg_type="reply")
        return prompt

    # Non-interactive step - execute it immediately
    logger.info(f"🔧 Auto-executing non-interactive step: {next_step_id}")
    
    # Update state to this step
    storage.set_chat_state(chat_id, {
        "aop_name": aop["aop_name"],
        "step_id": next_step_id,
        "retry_count": 0,
        "awaiting_input": False,
        **state
    })

    # Execute step logic
    if next_step.get("type") == "decision":
        # Evaluate decision logic
        decision_logic = next_step.get("decision_logic", [])
        
        # For check_booking_status, we mock the evaluation
        if next_step.get("type") == "decision":
            # Fetch all conditions from the JSON step
            decision_logic = next_step.get("decision_logic", [])
            next_next_step_id = None

            # Evaluate conditions dynamically based on current state
            for condition in decision_logic:
                expr = condition.get("condition")
                next_id = condition.get("next")

                try:
                    # Evaluate safely (only against the state dict)
                    if eval(expr, {}, state):
                        next_next_step_id = next_id
                        break
                except Exception as e:
                    print(f"⚠️ Decision evaluation failed for {expr}: {e}")

            # Fallback to first next if no condition matched
            if not next_next_step_id and decision_logic:
                next_next_step_id = decision_logic[0].get("next")

        elif next_step.get("type") == "action":
            # Handle action step generically
            action_id = next_step.get("action")
            next_next_step_id = next_step.get("success_next")

            # Optional: call modular handler if available
            handler = ACTION_HANDLERS.get(action_id)
            if handler:
                state = handler(state)

        else:
            # Default to first condition's next step
            next_next_step_id = decision_logic[0].get("next") if decision_logic else None
            
    elif next_step.get("type") == "action":
        # Execute action and get next step
        next_next_step_id = next_step.get("success_next")
        
        # Mock some actions
        if next_step_id == "check_fare_rules":
            state["fare_rules_checked"] = True
            state["change_fee"] = 50
    else:
        next_next_step_id = next_step.get("success_next")

    # If there's a user_prompt for this step, show it
    if next_step.get("user_prompt"):
        prompt = next_step["user_prompt"]
        storage.add_message(chat_id, "agent", prompt, msg_type="reply")

    # Continue to next step if exists
    if next_next_step_id:
        return process_next_step(
            aop, steps, next_next_step_id, state, chat_id, storage, user_message, llm
        )
    else:
        storage.clear_state(chat_id)
        return f"🎉 {aop['aop_name']} process completed!"

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

    try:
        if llm is None:
            logger.error("❌ LLM not initialized")
            return "none"
        result = llm.invoke(prompt)  # use your initialized LLM
        chosen = result.content.strip()
        logger.info(f"✅ LLM decided: {chosen}")
        return chosen
    except Exception as e:
        logger.error(f"❌ Error in match_aop: {e}")
        return "none"


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
embeddings = get_embeddings()

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

# Initialize LLM globally
llm = None
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






@app.options("/users")
async def options_users():
    """Handle OPTIONS preflight request for /users"""
    return {"status": "ok"}

@app.options("/users/{email}")
async def options_user_by_email(email: str):
    """Handle OPTIONS preflight request for /users/{email}"""
    return {"status": "ok"}

@app.options("/users/{email}/stats")
async def options_user_stats(email: str):
    """Handle OPTIONS preflight request for /users/{email}/stats"""
    return {"status": "ok"}

@app.options("/chats")
async def options_chats():
    """Handle OPTIONS preflight request for /chats"""
    return {"status": "ok"}

@app.options("/chats/{chat_id}")
async def options_chat_by_id(chat_id: str):
    """Handle OPTIONS preflight request for /chats/{chat_id}"""
    return {"status": "ok"}

@app.options("/chat")
async def options_chat():
    """Handle OPTIONS preflight request for /chat"""
    return {"status": "ok"}








# Replace your existing @app.post("/users") endpoint in main.py with this:

@app.post("/users", response_model=UserDataResponse)
async def save_user_endpoint(user_data: UserData):
    print(f"👤 User data endpoint called")
    print(f"📝 Name: {user_data.name}")
    print(f"📧 Email: {user_data.email}")
    print(f"🌍 Location: {user_data.location}")
    print(f"📱 Device: {user_data.device}")
    print(f"🎭 Vibe: {user_data.vibe}")
    print(f"🌐 IP: {user_data.ip}")
    print(f"📂 Category: {user_data.category}")
    print(f"📊 Status: {user_data.status}")
    
    try:
        # Convert Pydantic model to dict
        user_dict = user_data.dict()
        
        # Use the new storage method to save complete user data
        success = storage.save_complete_user_data(user_dict)
        
        if success:
            print(f"✅ User data saved successfully with all fields")
            return UserDataResponse(success=True, message="User stored in MongoDB with complete data")
        else:
            print(f"⚠️ Failed to save user data")
            raise HTTPException(status_code=400, detail="Failed to save user data")
        
    except Exception as e:
        print(f"❌ MongoDB error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"DB error: {str(e)}")


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    start_time = time.time()
    session_id = request.session_id or f"session_{int(time.time())}"

    try:
        if not request.email:
            raise HTTPException(status_code=400, detail="Email is required")

        # 1️⃣ Get or create user
        user = storage.get_or_create_user(request.email)

        # 2️⃣ Get or create chat for user
        chat_id = storage.get_or_create_open_chat(str(user["_id"]))

        # 🧠 3️⃣ Check if chat is mid-AOP (resume if needed)
        # In the /chat endpoint, replace the AOP resume section with:

# 🧠 3️⃣ Check if chat is mid-AOP (resume if needed)
        state = storage.get_state(chat_id)
        if state and "aop_name" in state and "step_id" in state:
            if state["step_id"] == "close_case":
                storage.clear_state(chat_id)
            else:
                ongoing_aop = next((a for a in AOPS if a["aop_name"] == state["aop_name"]), None)
                if ongoing_aop:
                    print(f"🔄 Resuming AOP {state['aop_name']} at step {state['step_id']}")

                    # Pass the current user message as input to resume step
                    user_inputs = {state["step_id"]: request.message}

                    response_text = run_aop(
                        ongoing_aop,
                        request.message,
                        user_inputs=user_inputs,
                        chat_id=chat_id,
                        storage=storage,
                        llm=llm  # ADD THIS - pass the llm instance
                    )

                    # Don't duplicate the message if run_aop already added it
                    # Only add if it's not already in the chat
                    chat = storage.get_chat(chat_id)
                    last_msg = chat["messages"][-1] if chat and chat.get("messages") else None
                    if not (last_msg and last_msg.get("text") == response_text):
                        storage.add_message(
                            chat_id,
                            "agent",
                            response_text,
                            read=True,
                            timestamp=datetime.utcnow()
                        )

                    processing_time = time.time() - start_time
                    return ChatResponse(
                        response=response_text,
                        session_id=chat_id,
                        timestamp=datetime.utcnow().isoformat(),
                        processing_time=processing_time
                    )

        print(f"💀 chat message before it enters MATCH AOP ")

        # 4️⃣ Match AOP for categorization (new AOP detection)
        try:
            aop_name = match_aop.invoke({"user_message": request.message})
        except Exception as e:
            print(f"❌ Error matching AOP: {e}")
            aop_name = None
        aop_name = aop_name if aop_name and aop_name.lower() != "none" else None

        # 5️⃣ Save user message
        storage.add_message(
            chat_id,
            "user",
            request.message,
            read=False,
            tags=[],
            timestamp=datetime.utcnow()
        )

        # 6️⃣ Run AOP or fallback to chatbot
                # 6️⃣ Run or start AOP
        response_text = None

        if aop_name:
            aop = next((a for a in AOPS if a["aop_name"] == aop_name), None)
            if aop:
                print(f"⚙️ Detected new AOP trigger: {aop_name}")

                # 🧠 Get the first step of the AOP
                first_step = aop["steps"][0]
                first_step_id = first_step["id"]
                user_prompt = first_step.get("user_prompt", "Let's get started.")

               # 💾 Save AOP state (mark we are waiting for this step's user input)
                storage.set_chat_state(chat_id, {
                    "aop_name": aop_name,
                    "step_id": first_step_id,
                    "retry_count": 0,     # ✅ use correct key
                    "awaiting_input": True  # ✅ crucial for Phase-2 handling
                })

                # 🗣️ Send the first step prompt (don’t validate yet)
                response_text = user_prompt

            else:
                response_text = "Detected an AOP intent, but could not load it."

        else:
            # No AOP matched — default chatbot handling
            response_text = process_chat_message(request.message, session_id)

        # 7️⃣ Save agent reply
        storage.add_message(
            chat_id,
            "agent",
            response_text,
            read=True,
            tags=[aop_name] if aop_name else [],
            timestamp=datetime.utcnow()
        )

        # 8️⃣ Update chat metadata
        storage.update_chat_metadata(
            chat_id,
            aop_name=aop_name,
            tags=[aop_name] if aop_name else [],
            last_activity=datetime.utcnow(),
            total_messages=storage.get_message_count(chat_id)
        )

        # 9️⃣ Return structured response
        processing_time = time.time() - start_time
        timestamp = datetime.utcnow().isoformat()

        return ChatResponse(
            response=response_text,
            session_id=chat_id,
            timestamp=timestamp,
            processing_time=processing_time
        )

    except Exception as e:
        print(f"❌ Error in /chat: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/chats")
async def get_user_chats(email: str = Query(...)):
    """
    Returns all chats for a given user email with minimal info for dashboard:
    - chat_id
    - last_message
    - unread_count
    - status
    - total_messages
    """
    user = storage.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = str(user["_id"])
    chats_cursor = storage.chats.find({"user_id": user_id})
    
    chats = []
    for chat in chats_cursor:
        messages = chat.get("messages", [])
        chats.append({
            "chat_id": chat["chat_id"],
            "last_message": messages[-1]["content"] if messages else None,
            "unread_count": sum(1 for m in messages if m.get("read") is False),
            "status": chat.get("status", "open"),
            "total_messages": len(messages),
            "tags": chat.get("tags", []),
            "avatar": chat.get("avatar"),
            "visited_pages": chat.get("visited_pages", [])
        })
    
    return {"chats": chats}


# Add these endpoints to your FastAPI app (main.py)

@app.get("/users/{email}")
async def get_user_by_email(email: str):
    """
    Get a specific user's data by email
    """
    print(f"🔍 Fetching user data for email: {email}")
    try:
        user = storage.users.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Convert ObjectId to string for JSON serialization
        user["_id"] = str(user["_id"])
        
        print(f"✅ User found: {user.get('name', 'Unknown')}")
        print(f"📋 User fields: {list(user.keys())}")
        print(f"🔍 Full user data: {user}")  # Debug: see everything
        return {"user": user}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error fetching user: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

from fastapi import HTTPException

@app.get("/debug/users-chats")
async def debug_users_chats(limit: int = 10):
    """
    Debug endpoint to see all users with their chats and messages.
    """
    try:
        # Fetch users
        users = list(storage.users.find({}).limit(limit))
        for user in users:
            user["_id"] = str(user["_id"])

            # Fetch all chats for this user
            chats = list(storage.chats.find({"user_id": user["_id"]}))
            for chat in chats:
                chat["_id"] = str(chat["_id"])
                # Ensure timestamps are serializable
                chat["created_at"] = str(chat.get("created_at"))
                chat["last_activity"] = str(chat.get("last_activity"))
                for msg in chat.get("messages", []):
                    msg["timestamp"] = str(msg.get("timestamp"))
            
            user["chats"] = chats  # attach chats to user

        return {
            "count": len(users),
            "users": users,
            "sample_user_fields": list(users[0].keys()) if users else [],
            "sample_chat_fields": list(users[0]["chats"][0].keys()) if users and users[0]["chats"] else []
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/users")
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """
    Get all users with pagination - returns ALL user fields
    """
    print(f"📊 Fetching all users (skip={skip}, limit={limit})")
    try:
        users = list(storage.users.find({})  # Remove field projection to get ALL fields
        # users = list(storage.users.find({}, {"_id": 1, "name": 1, "email": 1, "created_at": 1, "last_seen": 1})
            .skip(skip)
            .limit(limit))
        
        # Convert ObjectId to string
        for user in users:
            user["_id"] = str(user["_id"])
        
        total_count = storage.users.count_documents({})
        
        print(f"✅ Found {len(users)} users (total: {total_count})")
        print(f"📋 Sample user fields: {list(users[0].keys()) if users else 'No users'}")
        return {
            "users": users,
            "total": total_count,
            "skip": skip,
            "limit": limit
        }
        
    except Exception as e:
        print(f"❌ Error fetching users: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/users/{email}/stats")
async def get_user_stats(email: str):
    """
    Get user statistics including chat count and message count
    """
    print(f"📈 Fetching stats for user: {email}")
    try:
        user = storage.users.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id = str(user["_id"])
        
        # Get chat statistics
        total_chats = storage.chats.count_documents({"user_id": user_id})
        open_chats = storage.chats.count_documents({"user_id": user_id, "status": "open"})
        closed_chats = storage.chats.count_documents({"user_id": user_id, "status": "closed"})
        
        # Get message count across all chats
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$project": {"message_count": {"$size": "$messages"}}}
        ]
        message_stats = list(storage.chats.aggregate(pipeline))
        total_messages = sum(chat.get("message_count", 0) for chat in message_stats)
        
        stats = {
            "email": email,
            "name": user.get("name", "Unknown"),
            "total_chats": total_chats,
            "open_chats": open_chats,
            "closed_chats": closed_chats,
            "total_messages": total_messages,
            "created_at": user.get("created_at"),
            "last_seen": user.get("last_seen")
        }
        
        print(f"✅ Stats compiled for {email}")
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error fetching user stats: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/chats/{chat_id}")
async def get_chat_by_id(chat_id: str):
    """
    Get a specific chat by ID with all messages
    """
    print(f"💬 Fetching chat: {chat_id}")
    try:
        chat = storage.chats.find_one({"chat_id": chat_id})
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        chat["_id"] = str(chat["_id"])
        
        print(f"✅ Chat found with {len(chat.get('messages', []))} messages")
        return {"chat": chat}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error fetching chat: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

    
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






@app.get("/chats/{email}/last")
async def get_last_chat_message(email: str):
    """
    Returns the last message of the most recent chat for a user.
    """
    user = storage.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = str(user["_id"])
    last_chat = storage.chats.find({"user_id": user_id}).sort("created_at", -1).limit(1)
    last_chat = list(last_chat)
    
    if not last_chat:
        return {"last_message": None}
    
    messages = last_chat[0].get("messages", [])
    last_message = messages[-1] if messages else None
    return {"last_message": last_message}








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
    import os
    
    # Get port from environment variable (Render.com sets this)
    port = int(os.environ.get("PORT", 8000))
    
    # Check if we're in production (Render.com sets RENDER=true)
    is_production = os.environ.get("RENDER") == "true"
    
    print("🌟 Starting FastAPI server...")
    print(f"🌐 Port: {port}")
    print(f"🏭 Production mode: {is_production}")
    
    if is_production:
        # Production mode - no reload
        uvicorn.run(app, host="0.0.0.0", port=port, reload=False)
    else:
        # Development mode - with reload
        uvicorn.run(app, host="0.0.0.0", port=port, reload=True)