from __future__ import annotations

from pydantic import BaseModel, Field


class IdentityScoreDashboardResponse(BaseModel):
    owner_id: str
    overall_score: float
    component_scores: dict = Field(default_factory=dict)
    radar_chart_data: list[dict] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    weak_areas: list[str] = Field(default_factory=list)
    improvement_suggestions: list[str] = Field(default_factory=list)
    career_readiness: dict = Field(default_factory=dict)
    created_at: str | None = None
    history_count: int = 0