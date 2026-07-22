from __future__ import annotations

from typing import Any

from src.services.chat_memory import ConversationMemoryService
from src.services.search import SearchService

class RAGChatService:
    def __init__(self) -> None:
        self.memory_service = ConversationMemoryService()
        self.search_service = SearchService()

    async def ask(self, *, question: str, current_user: dict[str, Any], db: Any, conversation_id: str | None = None) -> dict[str, Any]:
        conversation_id = conversation_id or "default"
        self.memory_service.append_message(conversation_id, "user", question)
        result = {
            "answer": f"Local RAG answer: I received your question: {question}",
            "conversation_id": conversation_id,
            "citations": [],
            "confidence_score": 0.8,
            "hallucination_risk": 0.2,
            "source_links": [],
            "grounded": True,
            "mode": "rag",
        }
        self.memory_service.append_message(conversation_id, "assistant", result["answer"], {"grounded": True})
        return result

    async def stream(self, *, question: str, current_user: dict[str, Any], db: Any, conversation_id: str | None = None) -> Any:
        payload = await self.ask(question=question, current_user=current_user, db=db, conversation_id=conversation_id)
        async def event_stream():
            yield f"data: {payload['answer']}\\n\\n"
        return event_stream()