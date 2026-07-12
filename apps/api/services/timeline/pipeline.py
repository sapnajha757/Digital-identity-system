"""
Module 4 orchestrator. Runs after categorization: reads a document's
extracted `date` entities + its top category, and writes one timeline_event.

If no date entity was extracted (or none parse cleanly), falls back to the
upload date rather than guessing — and marks `date_inferred=True` so the
frontend can show "estimated date" instead of presenting a guess as fact.
This is a direct application of the "never hallucinate, mention uncertainty"
principle applied to dates specifically.
"""
import logging
import uuid
from datetime import date as date_type

from dateutil import parser as date_parser
from sqlalchemy import delete, select

from db.postgres import async_session_factory
from models.document import Category, Document, DocumentCategory, DocumentMetadata, Entity, TimelineEvent

logger = logging.getLogger(__name__)

# Highest-priority category wins when a document has multiple; order matters.
CATEGORY_PRIORITY = ["Certificates", "Achievements", "Internships", "Projects", "Academics", "Skills", "Others"]

CATEGORY_TO_EVENT_TYPE = {
    "Certificates": "certificate",
    "Achievements": "achievement",
    "Internships": "internship",
    "Projects": "project",
    "Academics": "academic",
    "Skills": "skill",
    "Others": "other",
}


def _pick_primary_category(categories: list[str]) -> str:
    for cat in CATEGORY_PRIORITY:
        if cat in categories:
            return cat
    return "Others"


def _parse_dates(raw_values: list[str]) -> list[date_type]:
    parsed = []
    for value in raw_values:
        try:
            parsed.append(date_parser.parse(value, fuzzy=True).date())
        except (ValueError, OverflowError):
            continue  # unparseable date text — skip rather than guess
    return parsed


async def run(document_id: uuid.UUID) -> None:
    async with async_session_factory() as db:
        doc_result = await db.execute(select(Document).where(Document.id == document_id))
        document = doc_result.scalar_one_or_none()
        if document is None:
            logger.warning("Timeline skipped: document %s not found", document_id)
            return

        cat_result = await db.execute(
            select(Category.name)
            .join(DocumentCategory, DocumentCategory.category_id == Category.id)
            .where(DocumentCategory.document_id == document_id)
        )
        categories = [row[0] for row in cat_result.all()]
        if not categories:
            logger.info("Timeline skipped: no categories for %s", document_id)
            return

        date_entity_result = await db.execute(
            select(Entity.entity_value).where(
                Entity.document_id == document_id, Entity.entity_type == "date"
            )
        )
        raw_dates = [row[0] for row in date_entity_result.all()]
        parsed_dates = _parse_dates(raw_dates)

        if parsed_dates:
            event_date = min(parsed_dates)  # earliest mentioned date — usually the event date, not a deadline
            date_inferred = False
        else:
            event_date = document.uploaded_at.date()
            date_inferred = True

        metadata_result = await db.execute(
            select(DocumentMetadata.ai_summary).where(DocumentMetadata.document_id == document_id)
        )
        ai_summary = metadata_result.scalar_one_or_none()

        primary_category = _pick_primary_category(categories)
        event_type = CATEGORY_TO_EVENT_TYPE.get(primary_category, "other")

        # Idempotent: clear any prior event for this document before inserting.
        await db.execute(delete(TimelineEvent).where(TimelineEvent.document_id == document_id))

        db.add(
            TimelineEvent(
                user_id=document.user_id,
                document_id=document.id,
                event_date=event_date,
                event_type=event_type,
                title=document.original_filename,
                description=ai_summary,
                date_inferred=date_inferred,
            )
        )
        await db.commit()
