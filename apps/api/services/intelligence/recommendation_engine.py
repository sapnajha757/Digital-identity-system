"""
AI Recommendation Engine — Module 4.
Generates grounded, evidence-backed, non-repetitive career recommendations.
"""
import logging
import uuid
import asyncio
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models.document import Document, Entity, DocumentCategory, Category, AIRecommendation
from schemas.document import RecommendationOut, RecommendationsResponse
from services.categorization.llm_client import call_json
from services.intelligence.memory_service import (
    get_or_create_memory, is_duplicate_advice, record_advice_hash
)

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
You are an expert career advisor and professional development specialist.
Generate 4-6 highly specific, evidence-grounded recommendations for this professional profile.
Each recommendation must be unique and directly tied to the provided profile data.

Return JSON:
{"recommendations": [{"category": "project|course|certification|hackathon|internship|open_source|resume|portfolio|github|interview", "title": "str", "description": "str", "why_it_matters": "str", "expected_impact": "str", "confidence": 0.0-1.0, "knowledge_graph_evidence": "str"}]}

Rules:
- Ground each recommendation in the user's ACTUAL documents and skills
- Vary categories — never repeat the same category twice
- Be specific with tool names, platform names, and project ideas
- Return ONLY valid JSON, no markdown
"""


async def generate_recommendations(db: AsyncSession, owner_id: str) -> RecommendationsResponse:
    """Generate and persist context-aware, non-repetitive recommendations."""
    try:
        user_uuid = uuid.UUID(owner_id)
    except ValueError:
        return RecommendationsResponse(recommendations=[], total=0)

    # Return existing active recommendations if sufficient
    existing_stmt = select(AIRecommendation).where(
        AIRecommendation.user_id == user_uuid,
        AIRecommendation.status == "active"
    ).order_by(AIRecommendation.created_at.desc()).limit(10)
    existing = (await db.execute(existing_stmt)).scalars().all()

    if len(existing) >= 4:
        return _format_response(existing)

    # Build profile context for LLM
    docs = (await db.execute(
        select(Document).where(Document.user_id == user_uuid, Document.status == "completed")
    )).scalars().all()

    entity_rows = (await db.execute(
        select(Entity.entity_type, Entity.entity_value)
        .join(Document, Document.id == Entity.document_id)
        .where(Document.user_id == user_uuid)
    )).all()
    skills = list({r[1] for r in entity_rows if r[0] in ("skill", "technology")})
    roles = list({r[1] for r in entity_rows if r[0] == "role"})

    cat_rows = (await db.execute(
        select(Category.name, Document.original_filename)
        .join(DocumentCategory, DocumentCategory.category_id == Category.id)
        .join(Document, Document.id == DocumentCategory.document_id)
        .where(Document.user_id == user_uuid)
    )).all()

    if not docs:
        return RecommendationsResponse(recommendations=[], total=0)

    user_prompt = f"""User profile:
- Skills: {', '.join(skills[:15])}
- Roles mentioned: {', '.join(roles[:5])}
- Documents: {', '.join(d.original_filename for d in docs[:8])}
- Categories: {', '.join(f"{cat}:{doc}" for cat, doc in cat_rows[:10])}

Generate specific recommendations grounded in this EXACT profile."""

    try:
        resp = await asyncio.to_thread(call_json, SYSTEM_PROMPT, user_prompt)
        new_recs = []
        for raw in resp.get("recommendations", []):
            title = raw.get("title", "")
            description = raw.get("description", "")
            if await is_duplicate_advice(db, user_uuid, title, description):
                continue
            rec = AIRecommendation(
                user_id=user_uuid,
                category=raw.get("category", "project"),
                title=title,
                description=description,
                why_it_matters=raw.get("why_it_matters", ""),
                expected_impact=raw.get("expected_impact", "Medium"),
                confidence=float(raw.get("confidence", 0.8)),
                knowledge_graph_evidence=raw.get("knowledge_graph_evidence"),
                supporting_documents=[d.original_filename for d in docs[:3]],
                status="active"
            )
            db.add(rec)
            await record_advice_hash(db, user_uuid, title, description)
            new_recs.append(rec)
        await db.commit()
        for r in new_recs:
            await db.refresh(r)
        return _format_response(list(existing) + new_recs)
    except Exception as e:
        logger.error(f"Recommendation LLM failed: {e}")
        return _format_response(existing)


def _format_response(recs: list) -> RecommendationsResponse:
    out = [
        RecommendationOut(
            id=r.id, category=r.category, title=r.title,
            description=r.description, why_it_matters=r.why_it_matters,
            expected_impact=r.expected_impact, confidence=r.confidence,
            supporting_documents=r.supporting_documents,
            knowledge_graph_evidence=r.knowledge_graph_evidence,
            timeline_references=r.timeline_references,
            status=r.status, created_at=r.created_at
        ) for r in recs
    ]
    return RecommendationsResponse(recommendations=out, total=len(out))
