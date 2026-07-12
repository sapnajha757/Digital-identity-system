"""
Grounded chat endpoint: retrieves relevant chunks (same retrieval as
/search, via services/rag/retrieval.py) and generates a natural-language
answer strictly from them.
"""
import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import CurrentUser, current_user
from db.postgres import get_db
from models.document import User
from schemas.document import ChatRequest, ChatResponse
from services.rag.pipeline import generate_answer
from services.rag.retrieval import retrieve

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(current_user),
):
    user_result = await db.execute(select(User).where(User.auth_id == uuid.UUID(user.auth_id)))
    db_user = user_result.scalar_one_or_none()
    if db_user is None:
        return ChatResponse(
            query=payload.query,
            answer="You don't have any documents uploaded yet — upload something first and ask again.",
            sources=[],
        )

    results = await retrieve(payload.query, payload.top_k, db_user.id, db)
    answer = generate_answer(payload.query, results)

    return ChatResponse(query=payload.query, answer=answer, sources=results)
