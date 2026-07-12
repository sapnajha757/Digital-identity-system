"""
Module 3a orchestrator: chunk extracted text -> embed -> upsert vectors to
Qdrant -> store pointer rows in Postgres (embedding_chunks). Called from
the ingestion pipeline after categorization succeeds.

Qdrant payload carries only {document_id, chunk_index} — the chunk text
itself lives in Postgres (embedding_chunks.chunk_text), never duplicated
into the vector payload.
"""
import logging
import uuid

from qdrant_client.models import PointStruct
from sqlalchemy import delete, select

from core.config import get_settings
from db.postgres import async_session_factory
from db.qdrant import get_qdrant_client
from models.document import DocumentMetadata, EmbeddingChunk
from services.embeddings.chunker import chunk_text
from services.embeddings.embedder import embed_texts

logger = logging.getLogger(__name__)


async def run(document_id: uuid.UUID) -> None:
    settings = get_settings()

    async with async_session_factory() as db:
        result = await db.execute(
            select(DocumentMetadata).where(DocumentMetadata.document_id == document_id)
        )
        metadata = result.scalar_one_or_none()
        if metadata is None or not metadata.extracted_text:
            logger.warning("Embedding skipped: no extracted text for %s", document_id)
            return

        chunks = chunk_text(metadata.extracted_text)
        if not chunks:
            return

        try:
            vectors = embed_texts(chunks)
        except Exception:
            logger.exception("Embedding generation failed for %s", document_id)
            return

        client = get_qdrant_client()

        # Clear prior chunks (Qdrant points + Postgres pointers) so
        # reprocessing a document never leaves orphaned vectors behind.
        old_rows = await db.execute(
            select(EmbeddingChunk).where(EmbeddingChunk.document_id == document_id)
        )
        old_point_ids = [str(row.qdrant_point_id) for row in old_rows.scalars().all()]
        if old_point_ids:
            client.delete(collection_name=settings.qdrant_collection, points_selector=old_point_ids)
        await db.execute(delete(EmbeddingChunk).where(EmbeddingChunk.document_id == document_id))

        points = []
        for index, (chunk, vector) in enumerate(zip(chunks, vectors)):
            point_id = uuid.uuid4()
            points.append(
                PointStruct(
                    id=str(point_id),
                    vector=vector,
                    payload={"document_id": str(document_id), "chunk_index": index},
                )
            )
            db.add(
                EmbeddingChunk(
                    document_id=document_id,
                    chunk_index=index,
                    chunk_text=chunk,
                    qdrant_point_id=point_id,
                )
            )

        client.upsert(collection_name=settings.qdrant_collection, points=points)
        await db.commit()
