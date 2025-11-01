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
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from langchain_core.tools import tool, StructuredTool
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode

try:
    from langsmith import traceable
except ImportError:
    # Optional: LangSmith for tracing
    traceable = lambda func: func  # No-op decorator if not installed

from app.core.settings import Settings
from app.services.vector_store_service import VectorStoreService


# Define the state for LangGraph
class State(TypedDict):
    messages: List[Any]
    last_user_query: Optional[str]


@tool
def retrieve_from_kb(query: str, top_k: int = 5) -> str:
    """
    Retrieve relevant information from the knowledge base for answering questions.
    Use this tool when the user asks a factual question that might be answered by your knowledge base,
    such as questions about products, company information, FAQs, processes, or specific topics.
    
    DO NOT use this tool for:
    - Simple greetings (hello, hi, how are you)
    - General conversation
    - Questions that don't require factual information from the knowledge base
    
    Returns formatted results with FAQs prioritized when available.
    """
    try:
        # This will be injected by the service
        vector_store_service = getattr(retrieve_from_kb, '_vector_store_service', None)
        if not vector_store_service:
            return "Knowledge base not available"
        
        # Get more results to ensure we have enough after filtering
        # Use similarity search with scores to filter out low-relevance results
        # Retrieve more candidates to ensure we have good options
        print(f"🔍 FAISS query: {query}")
        results_with_scores = vector_store_service.similarity_search_with_score(query, top_k * 5)
        preview = [
            {
                "score": round(float(score), 3),
                "source": doc.metadata.get("source"),
                "title": doc.metadata.get("title"),
            }
            for doc, score in results_with_scores[:max(1, min(5, len(results_with_scores)))]
        ]
        print(f"📚 FAISS candidates ({len(results_with_scores)} total): {preview}")


        if not results_with_scores:
            return "No relevant information found in knowledge base for your query. Please try rephrasing your question or check if the information exists in the knowledge base."
        
        # Filter by similarity threshold - exclude results that are too dissimilar
        # Lower score = more similar. Typical good scores are < 1.0
        # Use a stricter threshold to reduce noise - focus on highly relevant results
        SIMILARITY_THRESHOLD = 2.0  # Stricter threshold to filter out noise
        filtered_results_with_scores = [(doc, score) for doc, score in results_with_scores if score < SIMILARITY_THRESHOLD]
        
        # Sort by similarity score (lower is better) and take top results
        filtered_results_with_scores.sort(key=lambda x: x[1])
        # Take top N results after filtering, but don't exceed original top_k * 2
        max_results = min(top_k * 2, len(filtered_results_with_scores))
        results = [doc for doc, score in filtered_results_with_scores[:max_results]]
        
        if not results:
            return "No relevant information found in knowledge base for your query. The search did not find sufficiently similar content. Please try rephrasing your question or check if the information exists in the knowledge base."
        
        # Separate FAQs from other content
        faqs = []
        other_docs = []
        
        for doc in results:
            metadata = doc.metadata
            if metadata.get("type") == "faq" and metadata.get("source") == "faq":
                faqs.append(doc)
            else:
                other_docs.append(doc)
        
        # Basic relevance filter
        q_tokens = [t.lower() for t in re.findall(r"\w+", query) if len(t) > 2]
        
        def looks_relevant(doc):
            text = (doc.page_content or "").lower()
            source = str(doc.metadata.get("source", "")).lower()
            title = str(doc.metadata.get("title", "")).lower()
            
            # If query has no significant tokens, accept all documents
            if not q_tokens:
                return True
            
            # Check if query tokens appear in content, source, or title
            searchable_text = f"{text} {source} {title}"
            return any(tok in searchable_text for tok in q_tokens)

        # Filter and prioritize FAQs, but be more lenient
        filtered_faqs = [d for d in faqs if looks_relevant(d)][:top_k]
        # Limit other docs to reduce noise - prioritize most relevant ones
        other_limit = max(3, top_k - len(filtered_faqs)) if filtered_faqs else top_k
        filtered_other = [d for d in other_docs if looks_relevant(d)][:other_limit]
        
        # If keyword filter is too strict and we got nothing, relax it and use similarity scores
        if not filtered_faqs and not filtered_other and results:
            # Fall back to top similarity-scored results, but limit to reduce noise
            sorted_results = sorted(results_with_scores, key=lambda x: x[1])[:top_k * 2]
            for doc, score in sorted_results:
                if doc.metadata.get("type") == "faq" and doc.metadata.get("source") == "faq":
                    if doc not in filtered_faqs:
                        filtered_faqs.append(doc)
                else:
                    if doc not in filtered_other:
                        filtered_other.append(doc)
                if len(filtered_faqs) + len(filtered_other) >= top_k * 2:
                    break

        # Format results with clear FAQ section
        formatted_results = []
        
        # Add FAQs section
        if filtered_faqs:
            formatted_results.append("=== FREQUENTLY ASKED QUESTIONS (FAQs) ===")
            for i, doc in enumerate(filtered_faqs, 1):
                content = doc.page_content
                metadata = doc.metadata
                
                # Extract question and answer from FAQ
                if "\n\n" in content:
                    question, answer = content.split("\n\n", 1)
                    formatted_results.append(f"\nFAQ #{i}:")
                    formatted_results.append(f"Q: {question.strip()}")
                    formatted_results.append(f"A: {answer.strip()[:500]}")  # Truncate answer if too long
                else:
                    formatted_results.append(f"\nFAQ #{i}:")
                    formatted_results.append(f"Q&A: {content.strip()[:600]}")
            
            formatted_results.append("\n")
        
        # Add other documents section
        if filtered_other:
            formatted_results.append("=== ADDITIONAL INFORMATION ===")
            doc_count = 0
            for doc in filtered_other:
                content = doc.page_content
                metadata = doc.metadata
                source = metadata.get("source", "knowledge base")
                
                # Skip the default welcome message
                content_lower = content.lower().strip()
                if "welcome to sakura ai assistant" in content_lower and len(content_lower) < 100:
                    continue
                
                doc_count += 1
                # Truncate to keep responses focused, but use longer limit to capture important info
                snippet = content[:1500].rstrip()
                formatted_results.append(f"\n{doc_count}. [{source}] {snippet}")
        
        if not formatted_results:
            return "No relevant information found in knowledge base for your query. Please try rephrasing your question or check if the information exists in the knowledge base."
        
        return "\n".join(formatted_results)
    except Exception as e:
        logging.error(f"Error retrieving from knowledge base: {e}")
        return f"Error retrieving information from knowledge base: {str(e)}"


class LangGraphService:
    """Service for managing AI workflows with LangGraph."""
    
    def __init__(self, settings: Settings, vector_store_service: VectorStoreService):
        self.settings = settings
        self.vector_store_service = vector_store_service
        self.aops: List[Dict] = []
        self.llm = None
        self.graph = None
        self._initialized = False
        self.system_prompt: str = ""
        
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
            self.system_prompt = (
    "You are an AI customer concierge for this company.\n"
    "Your job is to answer user questions clearly and professionally using the company’s verified knowledge base and FAQs.\n"
    "Always provide the actual answer — do not restate your instructions.\n"
    "Try to summarize the answer in a few sentences. And always make sure the customer understands the answer.\n"
    "If no relevant information is available, say so politely and offer to escalate.\n"
)

 
            # Use lower temperature for more deterministic, factual responses
            # Try gemini-2.0-flash-exp first, fallback to gemini-2.0-flash
            try:
                self.llm = ChatGoogleGenerativeAI(
                    model="gemini-2.0-flash-exp",
                    temperature=0.1,  # Lower temperature for more factual, less creative responses
                    google_api_key=self.settings.google_api_key
                )
                print("✅ Using gemini-2.0-flash-exp model")
            except Exception:
                # Fallback to standard flash model
                self.llm = ChatGoogleGenerativeAI(
                    model="gemini-2.0-flash",
                    temperature=0.1,  # Lower temperature for more factual, less creative responses
                    google_api_key=self.settings.google_api_key
                )
                print("✅ Using gemini-2.0-flash model (fallback)")
            print("✅ Gemini model initialized successfully")
        except Exception as e:
            print(f"❌ Error initializing LLM: {e}")
            raise
    
    def _build_graph(self) -> None:
        """Build the LangGraph workflow."""
        try:
            print("🔗 Building LangGraph...")
            
            # Collect all tools (knowledge base only)
            tools = [retrieve_from_kb]
            
            # Bind tools to LLM
            llm_with_tools = self.llm.bind_tools(tools)
            
            # Inject vector store service into the tool
            retrieve_from_kb._vector_store_service = self.vector_store_service
            
            def chatbot(state: State):
                """Process messages through the chatbot."""
                print("🤖 Processing message through chatbot...")
                try:
                    # Use full message history so tool outputs are preserved
                    msgs = state.get("messages", [])
                    if not msgs:
                        return {"messages": [
                            HumanMessage(content="Please enter a question.")
                        ]}

                    has_user = any(type(m).__name__ == 'HumanMessage' for m in msgs)
                    has_tool_results = any(type(m).__name__ == 'ToolMessage' for m in msgs)
                    current_query: Optional[str] = state.get("last_user_query")
                    prepared_msgs = [SystemMessage(content=self.system_prompt)]
                    
                    if has_user:
                        # Find the original user query and tool results
                        user_msg = next((m for m in msgs if type(m).__name__ == 'HumanMessage'), None)
                        tool_msgs = [m for m in msgs if type(m).__name__ == 'ToolMessage']
                        
                        if user_msg:
                            current_query = getattr(user_msg, 'content', '')

                        if user_msg and tool_msgs:
                            # We have tool results - provide them as context for the LLM
                            user_query = current_query or getattr(user_msg, 'content', '')
                            tool_content = "\n\n".join([getattr(tm, 'content', '') for tm in tool_msgs])
                            
                            # Create a message with retrieved context, but allow LLM to use its knowledge
                            instruction = (
                                f"USER QUESTION: {user_query}\n\n"
                                f"RETRIEVED CONTEXT FROM KNOWLEDGE BASE:\n{tool_content}\n\n"
                                f"Please answer the user's question. Use the retrieved context above to inform your response. "
                                f"If FAQs are provided, they are prioritized and should be used. "
                                f"You may supplement with your general knowledge to provide a complete and helpful answer."
                            )
                            prepared_msgs.append(HumanMessage(content=instruction))
                        elif user_msg and not has_tool_results:
                            # First call - no tool results yet
                            # Let the LLM decide whether to use the tool based on the query
                            # Simple greetings/conversation should be handled naturally
                            prepared_msgs.append(user_msg)
                        else:
                            prepared_msgs.extend(msgs)
                    else:
                        # Synthesize a user turn from tool output to satisfy Gemini's user requirement
                        # This happens when only ToolMessage is present (langgraph didn't preserve HumanMessage)
                        print(f"🧩 Synthesizing user turn from tool output ({len(msgs)} messages available)")
                        user_query = current_query or ""
                        for msg in msgs:
                            if type(msg).__name__ == 'AIMessage' and hasattr(msg, 'tool_calls') and msg.tool_calls:
                                # Extract query from tool call
                                for tool_call in msg.tool_calls:
                                    if tool_call.get('name') == 'retrieve_from_kb':
                                        user_query = tool_call.get('args', {}).get('query', '')
                                        break
                                break
                        
                        if user_query:
                            print(f"🧩 Reconstructed human question: {user_query}")
                            current_query = user_query
                        last_content = getattr(msgs[-1], 'content', '') if msgs else ''
                        
                        if user_query:
                            synthesized = (
                                f"The user asked: '{user_query}'.\n\n"
                                f"Here is relevant information from the knowledge base:\n{last_content}\n\n"
                                f"Based on the above, write a clear and complete answer to the user's question. "
                                f"Do not repeat these instructions or explain your process. "
                                f"Just provide the answer directly, in a natural and helpful tone. "
                                f"If the information is missing, say so politely."
                            )

                        else:
                            # Fallback if we can't extract the query
                            synthesized = (
                                f"RETRIEVED CONTEXT FROM KNOWLEDGE BASE:\n\n{str(last_content)}\n\n"
                                f"Please use the retrieved context above to inform your response. "
                                f"If FAQs are provided, prioritize them. You may supplement with your knowledge to provide a helpful answer."
                            )
                        prepared_msgs.append(HumanMessage(content=synthesized))
                    print("🧠 LLM input:")
                    for i, msg in enumerate(prepared_msgs):
                        role = type(msg).__name__.replace("Message", "")
                        content = getattr(msg, 'content', '')
                        snippet = content if content is None else str(content)[:500]
                        print(f"  [{i}] {role}: {snippet}")
                    response = llm_with_tools.invoke(prepared_msgs)
                    try:
                        preview = getattr(response, 'content', str(response))
                        print(f"🤖 LLM raw output: {str(preview)[:500]}")
                    except Exception:
                        pass
                    update = {"messages": [response]}
                    if current_query:
                        update["last_user_query"] = current_query
                    return update
                except Exception as e:
                    print(f"❌ Error in chatbot processing: {e}")
                    raise
            
            def tools_condition(state: State):
                """Determine if tools should be called."""
                messages = state.get("messages", [])
                last_message = messages[-1]
                
                # Check if we've already called tools (avoid infinite loop)
                has_tool_results = any(type(m).__name__ == 'ToolMessage' for m in messages)
                
                # If LLM wants to call tools, go to tools
                if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
                    return "tools"
                
                # If this is the first user message and no tools have been called yet, force tool call
                user_messages = [m for m in messages if type(m).__name__ == 'HumanMessage']
                if len(user_messages) == 1 and not has_tool_results:
                    # Force tool invocation by manually calling retrieve_from_kb
                    # Actually, we can't do this here - let the LLM decide but encourage it
                    # For now, return END and let the improved prompt/tool description handle it
                    pass
                
                return END
            
            # Build the graph
            builder = StateGraph(State)
            builder.add_node("chatbot", chatbot)
            builder.add_node("tools", ToolNode(tools))
            builder.add_edge(START, "chatbot")
            builder.add_conditional_edges("chatbot", tools_condition)
            builder.add_edge("tools", "chatbot")
            
            self.graph = builder.compile()
            print(f"✅ LangGraph built successfully with {len(tools)} tools")
            
        except Exception as e:
            print(f"❌ Error building graph: {e}")
            raise
    
    def process_chat_message(self, query: str, session_id: str) -> str:
        """Process a chat message through the LangGraph pipeline."""
        if not self._initialized:
            return "AI service not initialized"
        
        print(f"💬 Processing chat message for session: {session_id}")
        print(f"🧑‍💻 Human question: {query}")
        
        try:
            if not query or not str(query).strip():
                return "Please enter a question."
            # Create user message with system context
            from langchain_core.messages import AIMessage
            
            # Use the class system prompt (already set during initialization)
            # Provide both system and human messages to enforce persona
            messages = [
                SystemMessage(content=self.system_prompt),
                HumanMessage(content=query)
            ]
            
            print("🚀 Invoking LangGraph workflow...")
            state = self.graph.invoke({"messages": messages, "last_user_query": query})
            
            raw_response = state["messages"][-1].content
            print(f"📝 Model response preview: {raw_response[:500]}")
            
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
