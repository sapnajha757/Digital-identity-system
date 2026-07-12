"""
Semantic search endpoint. Embeds the query with bge-large-en-v1.5, searches
Qdrant filtered to the current user's documents, joins back to Postgres for
chunk text and filename. RAG-style `answer` generation lands in Module 5
(services/rag) — results retrieval is fully live here.
"""
"""
Semantic search endpoint. Retrieval logic is shared with /chat via
services/rag/retrieval.py so both stay consistent. This endpoint returns
raw ranked chunks — no generated answer (see /chat for that).
"""
import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import CurrentUser, current_user
from db.postgres import get_db
from models.document import User
from schemas.document import SearchRequest, SearchResponse
from services.rag.retrieval import retrieve

router = APIRouter(prefix="/search", tags=["search"])


@router.post("", response_model=SearchResponse)
async def semantic_search(
    payload: SearchRequest,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(current_user),
):
    user_result = await db.execute(select(User).where(User.auth_id == uuid.UUID(user.auth_id)))
    db_user = user_result.scalar_one_or_none()
    if db_user is None:
        return SearchResponse(query=payload.query, results=[], answer=None)

    results = await retrieve(payload.query, payload.top_k, db_user.id, db)
    return SearchResponse(query=payload.query, results=results, answer=None)
