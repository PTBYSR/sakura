"""
Pydantic models for API requests and responses.
"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class ChatMessage(BaseModel):
    """Chat message model."""
    message: str
    session_id: str


class ChatResponse(BaseModel):
    """Chat response model."""
    response: str
    session_id: str
    timestamp: str


class UserDataRequest(BaseModel):
    """User data request model."""
    user_id: str
    data: Dict[str, Any]


class UserDataResponse(BaseModel):
    """User data response model."""
    success: bool
    message: str


class AOPRequest(BaseModel):
    """Agent Operating Procedure request model."""
    aop_name: str
    user_message: str
    chat_id: str


class AOPResponse(BaseModel):
    """Agent Operating Procedure response model."""
    response: str
    chat_id: str
    completed: bool


class HealthResponse(BaseModel):
    """Health check response model."""
    status: str
    vector_store: str
    timestamp: str

