from __future__ import annotations

from pydantic import BaseModel, Field


class GraphBuildResponse(BaseModel):
    message: str
    nodes_created: int
    edges_created: int


class GraphListResponse(BaseModel):
    items: list[dict] = Field(default_factory=list)
    page: int
    page_size: int
    total: int


class GraphQueryResponse(BaseModel):
    node: dict | None = None
    neighbors: list[dict] = Field(default_factory=list)