from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.config import settings
from src.routers.documents import get_current_user, get_db
from src.schemas.graph import GraphBuildResponse, GraphListResponse, GraphQueryResponse
from src.services.knowledge_graph import KnowledgeGraphService

router = APIRouter(prefix=f"{settings.api_prefix}/graph", tags=["graph"])
graph_service = KnowledgeGraphService()


@router.post("/build", response_model=GraphBuildResponse)
async def build_graph(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await graph_service.build_for_documents(db, current_user)
    return GraphBuildResponse(message="Knowledge graph built successfully.", nodes_created=result["nodes_created"], edges_created=result["edges_created"])


@router.get("/nodes", response_model=GraphListResponse)
async def list_nodes(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await graph_service.list_nodes(db)
    return GraphListResponse(**result)


@router.get("/query", response_model=GraphQueryResponse)
async def query_graph(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await graph_service.query_node(db)
    return GraphQueryResponse(**result)