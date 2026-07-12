"""
Module 1 orchestrator. Runs as a background task after upload:
    download stored file -> extract text -> write document_metadata ->
    flip document.status to completed/failed.

AI principle in effect here: ocr_confidence is always stored, never
discarded — low-confidence extractions get flagged downstream (Module 2)
rather than silently treated as ground truth.
"""
import logging
import uuid
from datetime import datetime, timezone

from sqlalchemy import select

from db.postgres import async_session_factory
from models.document import Document, DocumentMetadata
from services.categorization import pipeline as categorization_pipeline
from services.embeddings import pipeline as embeddings_pipeline
from services.ingestion.extractor import extract
from services.ingestion.storage import download_file
from services.knowledge_graph import pipeline as knowledge_graph_pipeline
from services.timeline import pipeline as timeline_pipeline

logger = logging.getLogger(__name__)

# Below this OCR confidence, downstream categorization should treat the
# extracted text as low-trust and hedge in its output.
LOW_CONFIDENCE_THRESHOLD = 0.6


async def run(document_id: uuid.UUID) -> None:
    async with async_session_factory() as db:
        result = await db.execute(select(Document).where(Document.id == document_id))
        document = result.scalar_one_or_none()
        if document is None:
            logger.error("Ingestion pipeline: document %s not found", document_id)
            return

        document.status = "processing"
        await db.commit()

        try:
            file_bytes = download_file(document.storage_path)
            extraction = extract(document.file_type, file_bytes)

            if extraction.confidence is not None and extraction.confidence < LOW_CONFIDENCE_THRESHOLD:
                logger.warning(
                    "Low OCR confidence (%.2f) for document %s", extraction.confidence, document_id
                )

            db.add(
                DocumentMetadata(
                    document_id=document.id,
                    extracted_text=extraction.text,
                    ocr_confidence=extraction.confidence,
                    page_count=extraction.page_count,
                )
            )
            await db.commit()

            # Module 2: classify + extract entities. Runs in its own session;
            # a categorization failure shouldn't roll back the extraction
            # that already succeeded, so it's intentionally decoupled here.
            await categorization_pipeline.run(document.id)

            # Module 3: embeddings (Qdrant) and knowledge graph (Neo4j) both
            # depend on categorization output but not on each other, so a
            # failure in one doesn't block the other.
            await embeddings_pipeline.run(document.id)
            await knowledge_graph_pipeline.run(document.id)

            # Module 4: timeline placement also depends only on categorization
            # output (categories + date entities), independent of Module 3.
            await timeline_pipeline.run(document.id)

            document.status = "completed"
            document.processed_at = datetime.now(timezone.utc)
            await db.commit()

        except Exception:
            logger.exception("Ingestion pipeline failed for document %s", document_id)
            document.status = "failed"
            await db.commit()
