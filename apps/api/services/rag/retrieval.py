"""
Shared retrieval logic used by both /search (raw results) and /chat
(results + generated answer). Keeping retrieval in one place means the
two endpoints can never drift in how they filter, rank, or scope results
to a user.
"""
import uuid

from qdrant_client.models import FieldCondition, Filter, MatchAny
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import get_settings
from db.qdrant import get_qdrant_client
from models.document import Document, EmbeddingChunk
from schemas.document import SearchResultItem
from services.embeddings.embedder import embed_query


async def retrieve(
    query: str, top_k: int, user_id: uuid.UUID, db: AsyncSession
) -> list[SearchResultItem]:
    doc_id_result = await db.execute(select(Document.id).where(Document.user_id == user_id))
    user_document_ids = [str(row[0]) for row in doc_id_result.all()]
    if not user_document_ids:
        return []

    query_vector = embed_query(query)
    settings = get_settings()
    client = get_qdrant_client()

    # Filter directly in Qdrant so user isolation is enforced by the query
    # itself, not by post-filtering results after the fact.
    hits = client.search(
        collection_name=settings.qdrant_collection,
        query_vector=query_vector,
        query_filter=Filter(must=[FieldCondition(key="document_id", match=MatchAny(any=user_document_ids))]),
        limit=top_k,
    )
    if not hits:
        return []

    doc_ids = {uuid.UUID(hit.payload["document_id"]) for hit in hits}
    chunk_result = await db.execute(
        select(EmbeddingChunk, Document.original_filename)
        .join(Document, Document.id == EmbeddingChunk.document_id)
        .where(EmbeddingChunk.document_id.in_(doc_ids))
    )
    chunk_lookup = {
        (str(chunk.document_id), chunk.chunk_index): (chunk.chunk_text, filename)
        for chunk, filename in chunk_result.all()
    }

    results = []
    for hit in hits:
        key = (hit.payload["document_id"], hit.payload["chunk_index"])
        chunk_text, filename = chunk_lookup.get(key, ("", ""))
        results.append(
            SearchResultItem(
                document_id=uuid.UUID(hit.payload["document_id"]),
                chunk_text=chunk_text,
                score=hit.score,
                original_filename=filename,
            )
        )
    return results
