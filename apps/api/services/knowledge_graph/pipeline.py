"""
Module 3b orchestrator: reads a document's persisted categories + skill/
technology entities from Postgres, then writes the corresponding nodes
and relationships into Neo4j. Runs after categorization (Module 2) and
alongside embeddings (Module 3a) in the ingestion pipeline.
"""
import logging
import uuid

from sqlalchemy import select

from db.postgres import async_session_factory
from models.document import Category, Document, DocumentCategory, Entity, TimelineEvent
from services.knowledge_graph.graph_builder import build_graph_for_document, enrich_graph_relationships

logger = logging.getLogger(__name__)


async def run(document_id: uuid.UUID) -> None:
    async with async_session_factory() as db:
        doc_result = await db.execute(select(Document).where(Document.id == document_id))
        document = doc_result.scalar_one_or_none()
        if document is None:
            logger.warning("Graph build skipped: document %s not found", document_id)
            return

        cat_result = await db.execute(
            select(Category.name)
            .join(DocumentCategory, DocumentCategory.category_id == Category.id)
            .where(DocumentCategory.document_id == document_id)
        )
        categories = [row[0] for row in cat_result.all()]
        if not categories:
            logger.info("Graph build skipped: no categories for %s", document_id)
            return

        entity_result = await db.execute(
            select(Entity.entity_value).where(
                Entity.document_id == document_id,
                Entity.entity_type.in_(["skill", "technology"]),
            )
        )
        skill_entities = [row[0] for row in entity_result.all()]

        org_result = await db.execute(
            select(Entity.entity_value).where(
                Entity.document_id == document_id,
                Entity.entity_type == "organization",
            )
        )
        org_entities = [row[0] for row in org_result.all()]

        timeline_result = await db.execute(
            select(TimelineEvent.event_date).where(TimelineEvent.document_id == document_id)
        )
        event_date = timeline_result.scalar_one_or_none()

        try:
            build_graph_for_document(
                document_id=document.id,
                owner_id=str(document.user_id),
                file_type=document.file_type,
                original_filename=document.original_filename,
                categories=categories,
                skill_entities=skill_entities,
                organization_entities=org_entities,
                event_date=event_date,
            )
            enrich_graph_relationships(owner_id=str(document.user_id))
        except Exception:
            logger.exception("Graph build failed for %s", document_id)
