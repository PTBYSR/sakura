"""
Real Embeddings service with HuggingFace models.
"""
import os
from typing import Optional
from langchain_huggingface import HuggingFaceEmbeddings
from app.core.settings import Settings


class EmbeddingsService:
    """Service for managing text embeddings."""
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self.embeddings: Optional[HuggingFaceEmbeddings] = None
        
    def get_embeddings(self) -> HuggingFaceEmbeddings:
        """Get or create embeddings instance."""
        if self.embeddings:
            return self.embeddings
            
        api_token = self.settings.huggingface_api_token
        
        if self.settings.render or api_token:
            print("⚡ Using Hugging Face Inference API embeddings")
            if api_token:
                os.environ["HUGGINGFACEHUB_API_TOKEN"] = api_token
            self.embeddings = HuggingFaceEmbeddings(
                model_name=f"sentence-transformers/{self.settings.embedding_model}"
            )
        else:
            print("💻 Using local embeddings")
            self.embeddings = HuggingFaceEmbeddings(
                model_name=f"sentence-transformers/{self.settings.embedding_model}"
            )
        
        return self.embeddings


embeddings_service: Optional[EmbeddingsService] = None


def init_embeddings_service(settings: Settings) -> EmbeddingsService:
    """Initialize embeddings service."""
    global embeddings_service
    embeddings_service = EmbeddingsService(settings)
    embeddings_service.get_embeddings()  # Initialize embeddings on startup
    return embeddings_service


def get_embeddings_service() -> EmbeddingsService:
    """Get embeddings service instance."""
    if not embeddings_service:
        raise Exception("Embeddings service not initialized. Call init_embeddings_service() first.")
    return embeddings_service
