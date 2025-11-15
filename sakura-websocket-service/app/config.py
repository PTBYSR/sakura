"""Configuration for the WebSocket microservice."""
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    service_host: str = Field(default="0.0.0.0", env="WS_SERVICE_HOST")
    service_port: int = Field(default=8001, env="WS_SERVICE_PORT")

    redis_url: str = Field(default="redis://localhost:6379/0", env="WS_REDIS_URL")
    redis_channels: str = Field(
        default="chat_updates,unread_counts,website_status",
        env="WS_REDIS_CHANNELS",
    )

    allowed_origins: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        env="WS_ALLOWED_ORIGINS",
    )

    heartbeat_interval_seconds: int = Field(default=30, env="WS_HEARTBEAT_INTERVAL")

    # MongoDB for periodic snapshots (optional but mirrors original behaviour)
    mongo_uri: str = Field(default="mongodb+srv://paulemechebeco_db_user:dbuser@sakura-cluster.wcmr0rf.mongodb.net/?retryWrites=true&w=majority&appName=sakura-cluster", env="WS_MONGO_URI")
    mongo_db: str = Field(default="sakura", env="WS_MONGO_DB")

    chat_snapshot_interval_seconds: int = Field(default=2, env="WS_CHAT_SNAPSHOT_INTERVAL")
    unread_snapshot_interval_seconds: int = Field(default=5, env="WS_UNREAD_SNAPSHOT_INTERVAL")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]

    @property
    def redis_channel_list(self) -> List[str]:
        return [channel.strip() for channel in self.redis_channels.split(",") if channel.strip()]


settings = Settings()
