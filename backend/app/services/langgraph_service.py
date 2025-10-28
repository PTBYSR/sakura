"""
LangGraph service for AI agent workflows and chat processing.
"""
import json
import logging
from typing import Dict, List, Optional, Any
from langchain.chat_models import init_chat_model
from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_core.documents import Document
from typing import Annotated
from typing_extensions import TypedDict
from langsmith import traceable

from app.core.settings import Settings
from app.services.vector_store_service import VectorStoreService


# LangGraph State
class State(TypedDict):
    messages: Annotated[list, add_messages]


class LangGraphService:
    """Service for managing LangGraph workflows and AI agent processing."""
    
    def __init__(self, settings: Settings, vector_store_service: VectorStoreService):
        self.settings = settings
        self.vector_store_service = vector_store_service
        self.llm = None
        self.llm_with_tools = None
        self.graph = None
        self.tools = []
        self.aops = {}
        
    def initialize(self) -> None:
        """Initialize LangGraph components."""
        print("🧠 Initializing LangGraph...")
        
        # Load AOPs
        self._load_aops()
        
        # Initialize tools
        self._initialize_tools()
        
        # Initialize LLM
        self._initialize_llm()
        
        # Build graph
        self._build_graph()
        
        print("✅ LangGraph initialized successfully")
    
    def _load_aops(self) -> None:
        """Load Agent Operating Procedures from JSON file."""
        try:
            with open(self.settings.aops_file_path, "r", encoding="utf-8") as f:
                self.aops = json.load(f)
                print(f"📂 Loaded {len(self.aops)} AOPs")
        except Exception as e:
            print(f"❌ Error loading AOPs: {e}")
            self.aops = {}
    
    def _initialize_tools(self) -> None:
        """Initialize LangGraph tools."""
        self.tools = [self._get_stock_price_tool(), self._retrieve_from_kb_tool()]
        print(f"🔧 Initialized {len(self.tools)} tools")
    
    def _initialize_llm(self) -> None:
        """Initialize the language model."""
        try:
            print("🤖 Connecting to Gemini model...")
            self.llm = init_chat_model("google_genai:gemini-2.0-flash")
            self.llm_with_tools = self.llm.bind_tools(self.tools)
            print("✅ Gemini model initialized successfully")
        except Exception as e:
            print(f"❌ Error initializing model: {e}")
            raise
    
    def _build_graph(self) -> None:
        """Build the LangGraph workflow."""
        print("🔗 Building LangGraph...")
        
        def chatbot(state: State):
            print("🤖 Processing message through chatbot...")
            print(f"📨 Input messages count: {len(state['messages'])}")
            
            try:
                response = self.llm_with_tools.invoke(state["messages"])
                print("✅ LLM response generated successfully")
                return {"messages": [response]}
            except Exception as e:
                print(f"❌ Error in chatbot processing: {e}")
                raise
        
        builder = StateGraph(State)
        builder.add_node(chatbot)
        builder.add_node("tools", ToolNode(self.tools))
        builder.add_edge(START, "chatbot")
        builder.add_conditional_edges("chatbot", tools_condition)
        builder.add_edge("tools", "chatbot")
        
        self.graph = builder.compile()
        print("✅ LangGraph built successfully")
    
    def _get_stock_price_tool(self):
        """Create stock price tool."""
        @tool
        def get_stock_price(symbol: str) -> float:
            """
            Get the current stock price for a given stock symbol.
            This function returns mock stock prices for demonstration purposes.
            """
            # Mock stock prices for demonstration
            mock_prices = {
                "AAPL": 150.25,
                "GOOGL": 2800.50,
                "MSFT": 300.75,
                "TSLA": 800.00,
                "AMZN": 3200.00
            }
            
            price = mock_prices.get(symbol.upper(), 100.00)
            print(f"📈 Mock stock price for {symbol}: ${price}")
            return price
        
        return get_stock_price
    
    def _retrieve_from_kb_tool(self):
        """Create knowledge base retrieval tool."""
        @tool
        def retrieve_from_kb(query: str, top_k: int = 3) -> str:
            """
            Retrieve top-k relevant KB entries for a user query.
            """
            print(f"🔍 Searching knowledge base for: '{query}' (top_k={top_k})")
            
            try:
                results = self.vector_store_service.similarity_search(query, top_k)
                retrieved_content = "\n".join([r.page_content for r in results])
                print(f"📋 Retrieved {len(results)} relevant documents")
                print(f"📄 Content preview: {retrieved_content[:200]}...")
                return retrieved_content
            except Exception as e:
                print(f"❌ Error retrieving from knowledge base: {e}")
                return "Error retrieving information from knowledge base"
        
        return retrieve_from_kb
    
    def get_system_message(self) -> Dict[str, str]:
        """Get the system message for the AI agent."""
        return {
            "role": "system",
            "content": (
                "You are Sakura, an AI customer support assistant for Regirl and Heirs Insurance Group. "
                "You help customers with their inquiries about hair extensions, insurance products, and general support. "
                "You have access to a knowledge base and can retrieve relevant information to answer questions accurately. "
                "Always be helpful, professional, and friendly in your responses. "
                "If you don't know something, use the retrieve_from_kb tool to search for relevant information."
            )
        }
    
    @traceable
    def process_chat_message(self, query: str, session_id: str) -> str:
        """
        Process a chat message through the LangGraph pipeline.
        """
        print(f"💬 Processing chat message for session: {session_id}")
        print(f"📝 User query: '{query}'")
        
        try:
            messages = [
                self.get_system_message(),
                {"role": "user", "content": query}
            ]
            
            print("🚀 Invoking LangGraph...")
            state = self.graph.invoke({"messages": messages})
            
            raw_response = state["messages"][-1].content
            print(f"🔄 Raw response length: {len(raw_response)} characters")
            
            return raw_response
            
        except Exception as e:
            print(f"❌ Error processing chat message: {e}")
            return f"I apologize, but I encountered an error processing your request: {str(e)}"
    
    def run_aop(self, aop_name: str, user_message: str, chat_id: str, storage) -> str:
        """
        Run an Agent Operating Procedure (AOP) workflow.
        """
        aop = next((a for a in self.aops if a["aop_name"] == aop_name), None)
        if not aop:
            return f"AOP '{aop_name}' not found"
        
        print(f"🚀 Running AOP: {aop_name}")
        
        # Get current state
        current_state = storage.get_state(chat_id) or {}
        current_step_id = current_state.get("current_step")
        user_inputs = current_state.get("user_inputs", {})
        
        if not current_step_id:
            # Start the AOP
            first_step_id = aop["steps"][0]["id"]
            storage.set_chat_state(chat_id, {
                "current_step": first_step_id,
                "aop_name": aop_name,
                "user_inputs": {}
            })
            current_step_id = first_step_id
        
        # Process current step
        return self._process_aop_step(aop, current_step_id, user_message, chat_id, storage)
    
    def _process_aop_step(self, aop, step_id: str, user_message: str, chat_id: str, storage) -> str:
        """Process a single step in an AOP workflow."""
        steps = {step["id"]: step for step in aop["steps"]}
        current_step = steps.get(step_id)
        
        if not current_step:
            storage.clear_state(chat_id)
            return f"Step '{step_id}' not found in AOP"
        
        print(f"📋 Processing step: {step_id}")
        
        # Check if this step requires user input
        awaiting_input = storage.get_state(chat_id).get("awaiting_input", False)
        
        if current_step.get("requires_response") and awaiting_input:
            # Process user input
            current_state = storage.get_state(chat_id)
            user_inputs = current_state.get("user_inputs", {})
            provided = user_inputs.get(step_id, user_message)
            
            # Validate input
            validation_prompt = f"""
            You are validating a user's response in a customer support workflow.
            
            Current step: '{step_id}'
            Expected input type: {current_step.get('expected_input', 'any')}
            System asked: "{current_step.get('user_prompt', '')}"
            User provided: "{provided}"
            
            Is this input valid and appropriate? Respond with 'VALID' or 'INVALID' followed by a brief explanation.
            """
            
            try:
                validation_response = self.llm.invoke([{"role": "user", "content": validation_prompt}])
                validation_result = validation_response.content.strip()
                
                if not validation_result.startswith("VALID"):
                    return f"❌ Invalid input: {validation_result}\n\n{current_step.get('user_prompt', 'Please try again.')}"
                
            except Exception as e:
                print(f"⚠️  Validation error: {e}")
                # Continue without validation
            
            # Move to next step
            next_step_id = current_step.get("success_next")
            if next_step_id:
                storage.set_chat_state(chat_id, {
                    "current_step": next_step_id,
                    "awaiting_input": False,
                    "user_inputs": {**user_inputs, step_id: provided}
                })
                return self._process_aop_step(aop, next_step_id, "", chat_id, storage)
            else:
                storage.clear_state(chat_id)
                return f"🎉 {aop['aop_name']} process completed!"
        
        else:
            # Execute step action
            action = current_step.get("action")
            if action:
                # Execute the action (simplified for this example)
                print(f"⚡ Executing action: {action}")
                
                # Check if next step requires user input
                next_step_id = current_step.get("success_next")
                if next_step_id:
                    next_step = steps.get(next_step_id)
                    if next_step and next_step.get("requires_response"):
                        storage.set_chat_state(chat_id, {
                            "current_step": next_step_id,
                            "awaiting_input": True
                        })
                        return next_step.get("user_prompt", "Please provide the required information.")
                    else:
                        return self._process_aop_step(aop, next_step_id, "", chat_id, storage)
                else:
                    storage.clear_state(chat_id)
                    return f"🎉 {aop['aop_name']} process completed!"
            else:
                storage.clear_state(chat_id)
                return f"🎉 {aop['aop_name']} process completed!"


# Global LangGraph service instance
langgraph_service: Optional[LangGraphService] = None


def init_langgraph_service(settings: Settings, vector_store_service: VectorStoreService) -> LangGraphService:
    """Initialize LangGraph service."""
    global langgraph_service
    langgraph_service = LangGraphService(settings, vector_store_service)
    langgraph_service.initialize()
    return langgraph_service


def get_langgraph_service() -> LangGraphService:
    """Get LangGraph service instance for dependency injection."""
    if not langgraph_service:
        raise Exception("LangGraph service not initialized. Call init_langgraph_service() first.")
    return langgraph_service

