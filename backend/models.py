
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional

class ChatMessage(BaseModel):
    role: str
    content: str

class AgentChatRequest(BaseModel):
    user_profile: Dict[str, Any]
    contest: Dict[str, Any]
    stage: str = "inspiration"
    checklist: List[Dict[str, Any]] = Field(default_factory=list)
    workflow_context: Dict[str, Any] = Field(default_factory=dict)
    memory: Dict[str, Any] = Field(default_factory=dict)
    messages: List[ChatMessage] = Field(default_factory=list)

class TextGenerateRequest(BaseModel):
    prompt: str
    mode: str = "text"
    user_profile: Dict[str, Any] = Field(default_factory=dict)
    contest: Dict[str, Any] = Field(default_factory=dict)

class ImageGenerateRequest(BaseModel):
    prompt: str
    user_profile: Dict[str, Any] = Field(default_factory=dict)
    contest: Dict[str, Any] = Field(default_factory=dict)
    size: Optional[str] = "1024x1024"

class VideoGenerateRequest(BaseModel):
    prompt: str
    user_profile: Dict[str, Any] = Field(default_factory=dict)
    contest: Dict[str, Any] = Field(default_factory=dict)
    duration: Optional[int] = 5
    ratio: Optional[str] = "16:9"
