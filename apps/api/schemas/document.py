"""
Pydantic schemas for API request/response validation.
Kept separate from SQLAlchemy models so the API contract can evolve
independently of the DB schema.
"""
import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    original_filename: str
    file_type: Literal["pdf", "docx", "image", "link"]
    status: Literal["pending", "processing", "completed", "failed"]
    uploaded_at: datetime
    processed_at: datetime | None = None


class DocumentUploadResponse(BaseModel):
    document_id: uuid.UUID
    status: str
    message: str = "Upload received, processing started."


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5


class SearchResultItem(BaseModel):
    document_id: uuid.UUID
    chunk_text: str
    score: float
    original_filename: str


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResultItem]
    answer: str | None = None  # populated when RAG chat mode is used


class ChatRequest(BaseModel):
    query: str
    top_k: int = 5


class ChatResponse(BaseModel):
    query: str
    answer: str
    sources: list[SearchResultItem]


class TimelineEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    event_date: date
    event_type: str
    title: str
    description: str | None = None
    document_id: uuid.UUID | None = None
    date_inferred: bool = False


class GraphNode(BaseModel):
    id: str
    label: str
    type: str


class GraphEdge(BaseModel):
    source: str
    target: str
    relationship: str


class GraphResponse(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]
