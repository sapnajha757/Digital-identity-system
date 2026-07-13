"""
AI Career Planner — Module 5.
Generates adaptive roadmaps: 30 days, 90 days, placement, interview paths.
"""
import logging
import uuid
import asyncio
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models.document import Document, Entity, DocumentCategory, Category
from schemas.document import CareerPlanOut, CareerPlanResponse, RoadmapMilestone
from services.categorization.llm_client import call_json

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
You are an expert career coach. Generate structured career roadmaps for a professional.
Return JSON:
{"plans": [{"plan_type": "30_days|90_days|placement|interview", "title": "str", "milestones": [{"week": 1, "title": "str", "description": "str", "action_items": ["str"], "impact": "high|medium|low"}]}]}
Generate 2-3 plans. Each plan should have 3-5 milestones. Ground plans in the user's actual skills and gaps.
Return ONLY valid JSON, no markdown.
"""


async def generate_career_plans(db: AsyncSession, owner_id: str) -> CareerPlanResponse:
    """Generate dynamic career roadmaps based on user profile."""
    try:
        user_uuid = uuid.UUID(owner_id)
    except ValueError:
        return _fallback_plans()

    docs = (await db.execute(
        select(Document).where(Document.user_id == user_uuid, Document.status == "completed")
    )).scalars().all()

    entity_rows = (await db.execute(
        select(Entity.entity_type, Entity.entity_value)
        .join(Document, Document.id == Entity.document_id)
        .where(Document.user_id == user_uuid)
    )).all()
    skills = list({r[1] for r in entity_rows if r[0] in ("skill", "technology")})

    cat_rows = (await db.execute(
        select(Category.name)
        .join(DocumentCategory, DocumentCategory.category_id == Category.id)
        .join(Document, Document.id == DocumentCategory.document_id)
        .where(Document.user_id == user_uuid)
    )).all()
    categories = [r[0] for r in cat_rows]

    if not docs:
        return _fallback_plans()

    user_prompt = f"""User profile:
- Current skills: {', '.join(skills[:12])}
- Document categories present: {', '.join(set(categories))}
- Total verified documents: {len(docs)}

Generate roadmaps for: 30-day quick wins, 90-day skill building, and placement preparation.
Tailor specifically to their skill set."""

    try:
        resp = await asyncio.to_thread(call_json, SYSTEM_PROMPT, user_prompt)
        plans = []
        for raw in resp.get("plans", []):
            milestones = [
                RoadmapMilestone(
                    week=m.get("week", 1),
                    title=m.get("title", ""),
                    description=m.get("description", ""),
                    action_items=m.get("action_items", []),
                    impact=m.get("impact", "medium")
                ) for m in raw.get("milestones", [])
            ]
            plans.append(CareerPlanOut(
                plan_type=raw.get("plan_type", "30_days"),
                title=raw.get("title", "Career Roadmap"),
                milestones=milestones,
                generated_at=datetime.now(timezone.utc)
            ))
        return CareerPlanResponse(plans=plans, active_plan_type="30_days")
    except Exception as e:
        logger.error(f"Career planner LLM failed: {e}")
        return _fallback_plans()


def _fallback_plans() -> CareerPlanResponse:
    return CareerPlanResponse(
        plans=[
            CareerPlanOut(
                plan_type="30_days",
                title="30-Day Quick Wins",
                milestones=[
                    RoadmapMilestone(week=1, title="Profile Audit", description="Review and update all uploaded documents", action_items=["Upload latest resume", "Add missing certifications"], impact="high"),
                    RoadmapMilestone(week=2, title="Skill Gap Analysis", description="Identify top 3 missing skills for target role", action_items=["Review job descriptions", "List required skills"], impact="high"),
                    RoadmapMilestone(week=4, title="First Project Sprint", description="Start a new project demonstrating a key skill", action_items=["Pick a project idea", "Set up repository", "Document progress"], impact="medium"),
                ],
                generated_at=datetime.now(timezone.utc)
            ),
            CareerPlanOut(
                plan_type="placement",
                title="Placement Preparation Path",
                milestones=[
                    RoadmapMilestone(week=1, title="Resume Optimization", description="ATS-optimize resume for target companies", action_items=["Add quantified impact metrics", "Include target keywords"], impact="high"),
                    RoadmapMilestone(week=3, title="Portfolio Polish", description="Ensure all projects have proper documentation", action_items=["Add README files", "Include live demo links"], impact="high"),
                    RoadmapMilestone(week=6, title="Interview Preparation", description="Practice system design and coding problems", action_items=["Complete 30 LeetCode problems", "Practice 5 system design questions"], impact="high"),
                ],
                generated_at=datetime.now(timezone.utc)
            ),
        ],
        active_plan_type="30_days"
    )
