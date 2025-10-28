"""
Application settings and configuration using Pydantic BaseSettings.
"""
import os
from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    app_name: str = Field(default="Sakura Backend", env="APP_NAME")
    app_version: str = Field(default="1.0.0", env="APP_VERSION")
    debug: bool = Field(default=False, env="DEBUG")
    
    # Server
    host: str = Field(default="0.0.0.0", env="HOST")
    port: int = Field(default=8000, env="PORT")
    
    # Backend Configuration
    backend_base_url: str = Field(default="http://localhost:8000", env="BACKEND_BASE_URL")
    
    # Database
    mongodb_uri: str = Field(default="mongodb://localhost:27017", env="MONGODB_URI")
    mongodb_db_name: str = Field(default="sakura", env="MONGODB_DB_NAME")
    
    # AI/LLM Configuration
    openai_api_key: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    huggingface_api_token: Optional[str] = Field(default=None, env="HUGGINGFACE_API_TOKEN")
    
    # LangChain Configuration
    langchain_api_key: Optional[str] = Field(default=None, env="LANGCHAIN_API_KEY")
    langchain_tracing_v2: bool = Field(default=False, env="LANGCHAIN_TRACING_V2")
    langchain_project: str = Field(default="sakura-backend", env="LANGCHAIN_PROJECT")
    
    # Vector Database Configuration
    vector_db: str = Field(default="faiss", env="VECTOR_DB")
    
    # Pinecone Configuration (if using Pinecone)
    pinecone_api_key: Optional[str] = Field(default=None, env="PINECONE_API_KEY")
    pinecone_index_name: str = Field(default="sakura-knowledge-base", env="PINECONE_INDEX_NAME")
    
    # Weaviate Configuration (if using Weaviate)
    weaviate_url: Optional[str] = Field(default=None, env="WEAVIATE_URL")
    weaviate_api_key: Optional[str] = Field(default=None, env="WEAVIATE_API_KEY")
    weaviate_index_name: str = Field(default="SakuraKnowledge", env="WEAVIATE_INDEX_NAME")
    
    # CORS Configuration
    frontend_urls: List[str] = Field(
        default=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
        env="FRONTEND_URLS"
    )
    
    # File Paths
    aops_file_path: str = Field(default="aops.json", env="AOPS_FILE_PATH")
    faiss_index_path: str = Field(default="faiss_index", env="FAISS_INDEX_PATH")
    jsonl_data_path: str = Field(default="jsonl_data", env="JSONL_DATA_PATH")
    regirl_chunk_path: str = Field(default="regirl_chunk", env="REGIRL_CHUNK_PATH")
    
    # Embeddings Configuration
    embeddings_model_name: str = Field(default="sentence-transformers/all-MiniLM-L6-v2", env="EMBEDDINGS_MODEL_NAME")
    embeddings_model_name_api: str = Field(default="sentence-transformers/all-mpnet-base-v2", env="EMBEDDINGS_MODEL_NAME_API")
    
    # Deployment
    render: bool = Field(default=False, env="RENDER")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        
        @classmethod
        def parse_env_var(cls, field_name: str, raw_val: str) -> any:
            if field_name == 'frontend_urls':
                return [url.strip() for url in raw_val.split(',')]
            return raw_val


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get application settings."""
    return settings
