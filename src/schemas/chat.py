from __future__ import annotations

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1)
    conversation_id: str | None = None
    stream: bool = False


class ChatResponse(BaseModel):
    answer: str
    conversation_id: str
    citations: list[dict] = Field(default_factory=list)
    confidence_score: float
    hallucination_risk: float
    source_links: list[str] = Field(default_factory=list)
    grounded: bool
    mode: str = "rag"