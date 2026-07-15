"""
Module 2 orchestrator. Called from the ingestion pipeline right after
text extraction succeeds:
    extracted_text -> LLM classify + extract entities -> persist
    document_categories, entities, and document_metadata.ai_summary.

Re-running for the same document (e.g. manual reprocess) clears prior
categories/entities first, so results never silently accumulate duplicates.
"""
import logging
import uuid

from sqlalchemy import delete, select

from db.postgres import async_session_factory
from models.document import Category, DocumentCategory, DocumentMetadata, Entity
from services.categorization.llm_client import call_json
from services.categorization.prompts import ENTITY_TYPES, FIXED_CATEGORIES, SYSTEM_PROMPT, build_user_prompt

logger = logging.getLogger(__name__)


async def run(document_id: uuid.UUID) -> None:
    async with async_session_factory() as db:
        result = await db.execute(
            select(DocumentMetadata).where(DocumentMetadata.document_id == document_id)
        )
        metadata = result.scalar_one_or_none()
        if metadata is None or not metadata.extracted_text:
            logger.warning("Categorization skipped: no extracted text for %s", document_id)
            return

        try:
            user_prompt = build_user_prompt(metadata.extracted_text, metadata.ocr_confidence)
            output = call_json(SYSTEM_PROMPT, user_prompt)
        except Exception:
            logger.exception("Categorization LLM call failed for %s", document_id)
            return

        # Defensive validation — never trust LLM output blindly even though
        # the prompt constrains it; a malformed or hallucinated field should
        # be dropped, not crash the pipeline or get written to the DB.
        categories = [
            c
            for c in output.get("categories", [])
            if c.get("name") in FIXED_CATEGORIES and isinstance(c.get("confidence"), (int, float))
        ]
        entities = [
            e for e in output.get("entities", []) if e.get("type") in ENTITY_TYPES and e.get("value")
        ]
        summary = str(output.get("summary", ""))[:2000]

        # Clear prior results so reprocessing a document doesn't duplicate rows.
        await db.execute(delete(DocumentCategory).where(DocumentCategory.document_id == document_id))
        await db.execute(delete(Entity).where(Entity.document_id == document_id))

        category_rows = await db.execute(select(Category))
        category_id_by_name = {c.name: c.id for c in category_rows.scalars().all()}

        for cat in categories:
            category_id = category_id_by_name.get(cat["name"])
            if category_id is None:
                continue
            db.add(
                DocumentCategory(
                    document_id=document_id,
                    category_id=category_id,
                    confidence=float(cat["confidence"]),
                )
            )

        for ent in entities:
            db.add(
                Entity(
                    document_id=document_id,
                    entity_type=ent["type"],
                    entity_value=str(ent["value"])[:500],
                    confidence=float(ent.get("confidence", 0.5)),
                )
            )

        metadata.ai_summary = summary
        await db.commit()
        logger.info("Categorization completed for document %s", document_id)
