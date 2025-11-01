"""
Real Vector Store service with FAISS.
"""
import os
import json
from pathlib import Path
from typing import List, Optional
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from app.core.settings import Settings
from app.services.embeddings_service import EmbeddingsService


class VectorStoreService:
    """Service for managing vector store operations."""
    
    def __init__(self, settings: Settings, embeddings_service: EmbeddingsService):
        self.settings = settings
        self.embeddings_service = embeddings_service
        self.vector_store: Optional[FAISS] = None
        
    def initialize_vector_store(self) -> None:
        """Initialize FAISS vector store."""
        print("📚 Initializing FAISS vector store...")
        
        try:
            # Try to load existing index
            faiss_path = Path(self.settings.faiss_index_path)
            if faiss_path.exists():
                print("📂 Loading existing FAISS index...")
                self.vector_store = FAISS.load_local(
                    str(faiss_path),
                    self.embeddings_service.get_embeddings(),
                    allow_dangerous_deserialization=True
                )
                print(f"✅ Loaded FAISS index with {self.vector_store.index.ntotal} vectors")
            else:
                print("🆕 Creating new FAISS index...")
                # Create empty vector store
                self.vector_store = FAISS.from_texts(
                    ["Welcome to Sakura AI Assistant!"],
                    self.embeddings_service.get_embeddings()
                )
                # Save the index
                self.vector_store.save_local(str(faiss_path))
                print("✅ Created new FAISS index")
                
        except Exception as e:
            print(f"❌ Error initializing vector store: {e}")
            # Fallback to empty vector store
            self.vector_store = FAISS.from_texts(
                ["Welcome to Sakura AI Assistant!"],
                self.embeddings_service.get_embeddings()
            )
            print("✅ Created fallback FAISS index")
    
    def similarity_search(self, query: str, top_k: int = 3) -> List[Document]:
        """Perform similarity search on the vector store."""
        if self.vector_store is None:
            print("❌ Vector store not initialized")
            return []
        
        try:
            results = self.vector_store.similarity_search(query, k=top_k)
            return results
        except Exception as e:
            print(f"❌ Error during similarity search: {e}")
            return []
    
    def similarity_search_with_score(self, query: str, top_k: int = 3) -> List[tuple]:
        """
        Perform similarity search with scores.
        
        Returns:
            List of tuples (Document, score) where score is the distance
        """
        if self.vector_store is None:
            print("❌ Vector store not initialized")
            return []
        
        try:
            results = self.vector_store.similarity_search_with_score(query, k=top_k)
            return results
        except Exception as e:
            print(f"❌ Error during similarity search with score: {e}")
            return []
    
    def get_vector_store(self) -> Optional[FAISS]:
        """Get the vector store instance."""
        return self.vector_store
    
    def is_initialized(self) -> bool:
        """Check if vector store is initialized."""
        return self.vector_store is not None


# Global vector store service instance
vector_store_service: Optional[VectorStoreService] = None


def init_vector_store_service(settings: Settings, embeddings_service: EmbeddingsService) -> VectorStoreService:
    """Initialize vector store service."""
    global vector_store_service
    vector_store_service = VectorStoreService(settings, embeddings_service)
    vector_store_service.initialize_vector_store()
    return vector_store_service


def get_vector_store_service() -> VectorStoreService:
    """Get vector store service instance for dependency injection."""
    if not vector_store_service:
        raise Exception("Vector store service not initialized. Call init_vector_store_service() first.")
    return vector_store_service
