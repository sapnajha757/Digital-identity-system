from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from src.config import settings
from src.routers.documents import get_current_user, get_db
from src.schemas.chat import ChatRequest, ChatResponse
from src.services.rag_chat import RAGChatService

router = APIRouter(prefix=f"{settings.api_prefix}/chat", tags=["chat"])
rag_chat_service = RAGChatService()


@router.post("/ask", response_model=ChatResponse)
async def ask_chat(
    payload: ChatRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not payload.question.strip():
        raise HTTPException(status_code=400, detail="Question is required")

    result = await rag_chat_service.ask(question=payload.question, current_user=current_user, db=db, conversation_id=payload.conversation_id)
    return ChatResponse(**result)