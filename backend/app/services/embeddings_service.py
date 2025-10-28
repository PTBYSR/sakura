"""
Embeddings service for text vectorization.
"""
import os
from typing import Optional
from langchain_huggingface import HuggingFaceEmbeddings
from app.core.settings import Settings


class EmbeddingsService:
    """Service for handling text embeddings."""
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self.embeddings: Optional[HuggingFaceEmbeddings] = None
        
    def get_embeddings(self) -> HuggingFaceEmbeddings:
        """
        Dynamically choose between local and API-based embeddings.
        Uses Hugging Face Inference API on Render or when an API token is present.
        """
        if self.embeddings:
            return self.embeddings
            
        api_token = self.settings.huggingface_api_token

        if self.settings.render or api_token:
            print("⚡ Using Hugging Face Inference API embeddings")
            # Set the API token as environment variable for HuggingFaceEmbeddings
            if api_token:
                os.environ["HUGGINGFACEHUB_API_TOKEN"] = api_token
            self.embeddings = HuggingFaceEmbeddings(
                model_name=self.settings.embeddings_model_name_api
            )
        else:
            print("💻 Using local embeddings")
            try:
                self.embeddings = HuggingFaceEmbeddings(
                    model_name=self.settings.embeddings_model_name
                )
            except Exception as e:
                print(f"⚠️  Local embeddings failed, falling back to API: {e}")
                # Fallback to API-based embeddings
                self.embeddings = HuggingFaceEmbeddings(
                    model_name=self.settings.embeddings_model_name_api
                )
        
        return self.embeddings


# Global embeddings service instance
embeddings_service: Optional[EmbeddingsService] = None


def init_embeddings_service(settings: Settings) -> EmbeddingsService:
    """Initialize embeddings service."""
    global embeddings_service
    embeddings_service = EmbeddingsService(settings)
    return embeddings_service


def get_embeddings_service() -> EmbeddingsService:
    """Get embeddings service instance for dependency injection."""
    if not embeddings_service:
        raise Exception("Embeddings service not initialized. Call init_embeddings_service() first.")
    return embeddings_service
