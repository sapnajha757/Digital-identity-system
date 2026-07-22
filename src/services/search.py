from __future__ import annotations

from typing import Any


class SearchService:
    async def search_documents(self, **kwargs: Any) -> dict[str, Any]:
        return {"items": [], "total": 0}