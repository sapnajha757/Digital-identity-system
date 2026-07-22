from __future__ import annotations

from typing import Any


class ConversationMemoryService:
    def __init__(self, max_messages: int = 12) -> None:
        self._store: dict[str, list[dict[str, Any]]] = {}
        self._max_messages = max_messages

    def append_message(self, conversation_id: str, role: str, content: str, metadata: dict[str, Any] | None = None) -> None:
        if not conversation_id:
            return
        history = self._store.setdefault(conversation_id, [])
        history.append({"role": role, "content": content, "metadata": metadata or {}})
        if len(history) > self._max_messages:
            self._store[conversation_id] = history[-self._max_messages:]

    def get_history(self, conversation_id: str) -> list[dict[str, Any]]:
        if not conversation_id:
            return []
        return list(self._store.get(conversation_id, []))