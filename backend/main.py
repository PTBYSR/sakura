from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
print("🔧 Loading environment variables...")
load_dotenv()
print("✅ Environment variables loaded")

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

class ChatResponse(BaseModel):
    response: str
    session_id: str
    timestamp: str
    processing_time: float

# LangGraph State
class State(TypedDict):
    messages: Annotated[list, add_messages]

# Tools
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

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    start_time = time.time()
    session_id = request.session_id or f"session_{int(time.time())}"
    
    print(f"📞 Chat endpoint called")
    print(f"🆔 Session ID: {session_id}")
    print(f"📨 Message: '{request.message}'")
    
    try:
        # Process the message
        response_text = process_chat_message(request.message, session_id)
        
        processing_time = time.time() - start_time
        timestamp = datetime.now().isoformat()
        
        print(f"⏱️  Processing time: {processing_time:.2f} seconds")
        print(f"📤 Response length: {len(response_text)} characters")
        
        return ChatResponse(
            response=response_text,
            session_id=session_id,
            timestamp=timestamp,
            processing_time=processing_time
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Unexpected error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

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