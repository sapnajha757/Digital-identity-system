"""
Qdrant client wrapper. Vector size 1024 matches BAAI/bge-large-en-v1.5.
Payload stores only {document_id, chunk_id} pointers — never full text,
which stays in Postgres (embedding_chunks.chunk_text) to avoid duplication.
"""
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

from core.config import get_settings

settings = get_settings()

VECTOR_SIZE = 1024  # BAAI/bge-large-en-v1.5 output dimension

_client: QdrantClient | None = None


def get_qdrant_client() -> QdrantClient:
    global _client
    if _client is None:
        _client = QdrantClient(host=settings.qdrant_host, port=settings.qdrant_port)
    return _client


def ensure_collection() -> None:
    """Idempotent: creates the collection only if it doesn't already exist."""
    client = get_qdrant_client()
    existing = {c.name for c in client.get_collections().collections}
    if settings.qdrant_collection not in existing:
        client.create_collection(
            collection_name=settings.qdrant_collection,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
        )
