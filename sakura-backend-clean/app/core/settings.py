"""
Application settings and configuration using Pydantic BaseSettings.
"""
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
    mongo_uri: str = Field(default="mongodb://localhost:27017", env="MONGO_URI")
    db_name: str = Field(default="sakura", env="DB_NAME")

    # Redis / messaging
    redis_url: str = Field(default="redis://localhost:6379/0", env="REDIS_URL")

    # AI / LLM
    openai_api_key: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    google_api_key: Optional[str] = Field(default=None, env="GOOGLE_API_KEY")
    huggingface_api_token: Optional[str] = Field(default=None, env="HUGGINGFACE_API_TOKEN")

    # LangSmith
    langsmith_api_key: Optional[str] = Field(default=None, env="LANGSMITH_API_KEY")
    langsmith_tracing: bool = Field(default=False, env="LANGSMITH_TRACING")
    langsmith_endpoint: Optional[str] = Field(default=None, env="LANGSMITH_ENDPOINT")
    langsmith_project: str = Field(default="Langgraph-tutorial", env="LANGSMITH_PROJECT")

    # LangChain (backward compatibility)
    langchain_api_key: Optional[str] = Field(default=None, env="LANGCHAIN_API_KEY")
    langchain_tracing_v2: bool = Field(default=False, env="LANGCHAIN_TRACING_V2")
    langchain_project: Optional[str] = Field(default=None, env="LANGCHAIN_PROJECT")

    # Deployment
    render: bool = Field(default=False, env="RENDER")

    # File Paths
    jsonl_folder: str = Field(default="./jsonl_data", env="JSONL_FOLDER")
    vector_store_path: str = Field(default="./chroma_db", env="VECTOR_STORE_PATH")
    aops_file_path: str = Field(default="data/aops.json", env="AOPS_FILE_PATH")
    faiss_index_path: str = Field(default="data/faiss_index", env="FAISS_INDEX_PATH")
    regirl_chunk_path: str = Field(default="data/regirl_chunk", env="REGIRL_CHUNK_PATH")

    # Embeddings
    embedding_model: str = Field(default="all-MiniLM-L6-v2", env="EMBEDDING_MODEL")
    max_knowledge_chunks: int = Field(default=5, env="MAX_KNOWLEDGE_CHUNKS")

    # CORS
    frontend_urls: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001",
        env="FRONTEND_URLS"
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

    @property
    def frontend_urls_list(self) -> List[str]:
        """Convert frontend_urls string to list."""
        return [url.strip() for url in self.frontend_urls.split(',')]


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get application settings."""
    return settings
