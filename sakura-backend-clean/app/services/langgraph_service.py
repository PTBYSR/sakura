"""
Real LangGraph service with AI models and workflows.
"""
import json
import logging
import re
import time
from pathlib import Path
from typing import Dict, List, Optional, Any
from typing_extensions import TypedDict
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from langsmith import traceable

from app.core.settings import Settings
from app.services.vector_store_service import VectorStoreService


# Define the state for LangGraph
class State(TypedDict):
    messages: List[Any]


@tool
def retrieve_from_kb(query: str, top_k: int = 3) -> str:
    """Retrieve information from the knowledge base."""
    try:
        # This will be injected by the service
        vector_store_service = getattr(retrieve_from_kb, '_vector_store_service', None)
        if not vector_store_service:
            return "Knowledge base not available"
        
        results = vector_store_service.similarity_search(query, top_k)
        if not results:
            return "No relevant information found in knowledge base"
        
        # Format results
        formatted_results = []
        for i, doc in enumerate(results, 1):
            content = doc.page_content
            metadata = doc.metadata
            formatted_results.append(f"{i}. {content}")
        
        return "\n".join(formatted_results)
    except Exception as e:
        logging.error(f"Error retrieving from knowledge base: {e}")
        return "Error retrieving information from knowledge base"


class LangGraphService:
    """Service for managing AI workflows with LangGraph."""
    
    def __init__(self, settings: Settings, vector_store_service: VectorStoreService):
        self.settings = settings
        self.vector_store_service = vector_store_service
        self.aops: List[Dict] = []
        self.llm = None
        self.graph = None
        self._initialized = False
        
    def initialize_ai_service(self) -> None:
        """Initialize LangGraph and AI components."""
        print("🧠 Initializing real AI service with LangGraph...")
        
        try:
            # Load AOPs
            self._load_aops()
            
            # Initialize LLM
            self._init_llm()
            
            # Build LangGraph
            self._build_graph()
            
            self._initialized = True
            print("✅ Real AI service initialized successfully")
            
        except Exception as e:
            print(f"❌ Error initializing AI service: {e}")
            raise
    
    def _load_aops(self) -> None:
        """Load Agent Operating Procedures from JSON file."""
        try:
            aop_path = Path(self.settings.aops_file_path)
            if aop_path.exists():
                with open(aop_path, "r", encoding="utf-8") as f:
                    self.aops = json.load(f)
                print(f"📂 Loaded {len(self.aops)} AOPs")
            else:
                # Create default AOPs
                self.aops = [
                    {
                        "aop_name": "Customer Support",
                        "description": "Handle general customer inquiries",
                        "steps": [
                            {
                                "id": "greet_customer",
                                "type": "action",
                                "action": "greet_customer",
                                "user_prompt": "Hello! How can I help you today?",
                                "success_next": "handle_inquiry"
                            }
                        ]
                    }
                ]
                print("📂 Created default AOPs")
        except Exception as e:
            print(f"❌ Error loading AOPs: {e}")
            self.aops = []
    
    def _init_llm(self) -> None:
        """Initialize the language model."""
        try:
            print("🤖 Initializing Google Gemini model...")
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-2.0-flash",
                temperature=0.7,
                google_api_key=self.settings.google_api_key
            )
            print("✅ Gemini model initialized successfully")
        except Exception as e:
            print(f"❌ Error initializing LLM: {e}")
            raise
    
    def _build_graph(self) -> None:
        """Build the LangGraph workflow."""
        try:
            print("🔗 Building LangGraph...")
            
            # Bind tools to LLM
            tools = [retrieve_from_kb]
            llm_with_tools = self.llm.bind_tools(tools)
            
            # Inject vector store service into the tool
            retrieve_from_kb._vector_store_service = self.vector_store_service
            
            def chatbot(state: State):
                """Process messages through the chatbot."""
                print("🤖 Processing message through chatbot...")
                try:
                    response = llm_with_tools.invoke(state["messages"])
                    return {"messages": [response]}
                except Exception as e:
                    print(f"❌ Error in chatbot processing: {e}")
                    raise
            
            def tools_condition(state: State):
                """Determine if tools should be called."""
                last_message = state["messages"][-1]
                if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
                    return "tools"
                return END
            
            # Build the graph
            builder = StateGraph(State)
            builder.add_node("chatbot", chatbot)
            builder.add_node("tools", ToolNode(tools))
            builder.add_edge(START, "chatbot")
            builder.add_conditional_edges("chatbot", tools_condition)
            builder.add_edge("tools", "chatbot")
            
            self.graph = builder.compile()
            print("✅ LangGraph built successfully")
            
        except Exception as e:
            print(f"❌ Error building graph: {e}")
            raise
    
    def process_chat_message(self, query: str, session_id: str) -> str:
        """Process a chat message through the LangGraph pipeline."""
        if not self._initialized:
            return "AI service not initialized"
        
        print(f"💬 Processing chat message for session: {session_id}")
        print(f"📝 User query: '{query}'")
        
        try:
            # Create user message with system context
            from langchain_core.messages import AIMessage
            
            system_prompt = (
                "You are a knowledgeable and professional customer support assistant for Heirs Insurance Group. "
                "Always assume the customer is asking about Heirs Life or Heirs General Insurance products, services, "
                "claims, policies, or digital channels unless otherwise specified. Provide clear, accurate, and reassuring "
                "answers, guiding customers through insurance options, claims processes, payments, and account support. "
                "If you are unsure or the query is outside Heirs Insurance, politely clarify or redirect the customer."
            )
            
            # Combine system prompt with user query
            full_query = f"System: {system_prompt}\n\nUser: {query}"
            
            messages = [
                HumanMessage(content=full_query)
            ]
            
            print("🚀 Invoking LangGraph...")
            state = self.graph.invoke({"messages": messages})
            
            raw_response = state["messages"][-1].content
            print(f"🔄 Raw response length: {len(raw_response)} characters")
            
            # Clean formatting
            formatted = raw_response.replace("\\n", "\n")
            formatted = re.sub(r"\*\*|\*", "", formatted)
            formatted = "\n".join(line.strip() for line in formatted.split("\n") if line.strip())
            
            print("✅ Message processed successfully")
            return formatted
            
        except Exception as e:
            print(f"❌ Error processing chat message: {e}")
            return f"I apologize, but I encountered an error processing your request: {str(e)}"
    
    def run_aop(self, aop_name: str, user_message: str, chat_id: str, storage: Any) -> str:
        """Run an Agent Operating Procedure (AOP) workflow."""
        if not self._initialized:
            return "AI service not initialized"
        
        aop = next((a for a in self.aops if a["aop_name"] == aop_name), None)
        if not aop:
            return f"AOP '{aop_name}' not found"
        
        print(f"🚀 Running AOP: {aop_name}")
        
        # For now, return a simple response
        # In a full implementation, this would handle complex AOP workflows
        return f"Running AOP '{aop_name}' for message: {user_message}"


# Global LangGraph service instance
langgraph_service: Optional[LangGraphService] = None


def init_langgraph_service(settings: Settings, vector_store_service: VectorStoreService) -> LangGraphService:
    """Initialize LangGraph service."""
    global langgraph_service
    langgraph_service = LangGraphService(settings, vector_store_service)
    langgraph_service.initialize_ai_service()
    return langgraph_service


def get_langgraph_service() -> LangGraphService:
    """Get LangGraph service instance for dependency injection."""
    if not langgraph_service:
        raise Exception("LangGraph service not initialized. Call init_langgraph_service() first.")
    return langgraph_service