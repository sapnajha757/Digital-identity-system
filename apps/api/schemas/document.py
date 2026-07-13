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


# ─── Intelligence Engine Schemas ──────────────────────────────────────────────

class IdentityHealthMetric(BaseModel):
    name: str
    score: float
    trend: str  # up, down, stable
    description: str


class IdentityHealthResponse(BaseModel):
    overall_health: float
    metrics: list[IdentityHealthMetric]
    historical_trend: list[dict]
    milestones: list[str]
    updated_at: datetime


class AINotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    category: str
    message: str
    reason: str
    evidence: str | None = None
    confidence: float
    suggested_action: str
    is_read: bool
    is_dismissed: bool
    created_at: datetime


class NotificationsResponse(BaseModel):
    notifications: list[AINotificationOut]
    unread_count: int


class RecommendationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    category: str
    title: str
    description: str
    why_it_matters: str
    expected_impact: str
    confidence: float
    supporting_documents: list | None = None
    knowledge_graph_evidence: str | None = None
    timeline_references: list | None = None
    status: str
    created_at: datetime


class RecommendationsResponse(BaseModel):
    recommendations: list[RecommendationOut]
    total: int


class RoadmapMilestone(BaseModel):
    week: int
    title: str
    description: str
    action_items: list[str]
    impact: str


class CareerPlanOut(BaseModel):
    plan_type: str
    title: str
    milestones: list[RoadmapMilestone]
    generated_at: datetime


class CareerPlanResponse(BaseModel):
    plans: list[CareerPlanOut]
    active_plan_type: str


class SimulationRequest(BaseModel):
    target_role: str


class SimulationResult(BaseModel):
    target_role: str
    missing_skills: list[str]
    required_projects: list[str]
    timeline_months: int
    probability_of_success: float
    salary_estimate_min: int
    salary_estimate_max: int
    learning_order: list[str]
    risk_factors: list[str]
    evidence_summary: str


class MemoryActionRequest(BaseModel):
    action: str  # accept, dismiss
    item_type: str  # recommendation, notification
    item_id: str


class MemoryActionResponse(BaseModel):
    success: bool
    message: str


class ATSAuditResponse(BaseModel):
    ats_score: int
    missing_keywords: list[str]
    present_keywords: list[str]
    action_verbs: list[str]
    impact_statements: list[str]
    formatting_issues: list[str]
    recommendations: list[str]
    confidence: float
    evidence_documents: list[str]


class PortfolioAuditResponse(BaseModel):
    portfolio_score: int
    github_activity_score: int
    documentation_score: int
    diversity_score: int
    complexity_score: int
    missing_elements: list[str]
    strong_points: list[str]
    recommendations: list[str]
    evidence_documents: list[str]
