from __future__ import annotations

from typing import Any

class KnowledgeGraphService:
    async def build_for_document(self, db: Any, document: Any) -> dict[str, int]:
        return {"nodes_created": 0, "edges_created": 0}

    async def build_for_documents(self, db: Any, current_user: dict[str, Any]) -> dict[str, int]:
        return {"nodes_created": 0, "edges_created": 0}

    async def list_nodes(self, db: Any, **kwargs: Any) -> dict[str, Any]:
        return {"items": [], "page": 1, "page_size": 20, "total": 0}

    async def list_edges(self, db: Any, **kwargs: Any) -> dict[str, Any]:
        return {"items": [], "page": 1, "page_size": 20, "total": 0}

    async def search_nodes(self, db: Any, **kwargs: Any) -> dict[str, Any]:
        return {"items": [], "page": 1, "page_size": 20, "total": 0}

    async def query_node(self, db: Any, **kwargs: Any) -> dict[str, Any]:
        return {"node": None, "neighbors": []}