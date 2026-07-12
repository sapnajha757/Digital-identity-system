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
    properties: dict | None = None


class GraphEdge(BaseModel):
    source: str
    target: str
    relationship: str
    confidence: float | None = 1.0
    reason: str | None = None
    metadata: dict | None = None
    timestamp: str | None = None


class GraphResponse(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]


class InsightItem(BaseModel):
    type: str  # e.g., gaps, skills, certifications, trends, improvements
    title: str
    description: str
    impact: Literal["high", "medium", "low"]
    actionable_step: str


class InsightsResponse(BaseModel):
    insights: list[InsightItem]
    updated_at: datetime


class CareerTwin(BaseModel):
    current_role_trend: str
    strongest_skills: list[str]
    fastest_growing_skill: str
    career_direction: str
    experience_summary: str
    recommended_next_skill: str
    recommended_next_project: str
    career_readiness: int  # 0-100


class DashboardMetricsResponse(BaseModel):
    identity_score: int
    score_breakdown: dict
    career_twin: CareerTwin
    ai_summary_narrative: str
    stats: dict
    updated_at: datetime


