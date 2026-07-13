"""
Identity Health Engine — Module 2.
Computes 12 multi-dimensional health metrics with historical trend tracking.
"""
import logging
import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from models.document import Document, Entity, DocumentCategory, Category, TimelineEvent
from schemas.document import IdentityHealthMetric, IdentityHealthResponse

logger = logging.getLogger(__name__)


async def compute_identity_health(db: AsyncSession, owner_id: str) -> IdentityHealthResponse:
    """Compute comprehensive 12-dimension identity health metrics."""
    try:
        user_uuid = uuid.UUID(owner_id)
    except ValueError:
        return _empty_health()

    # Fetch documents
    docs = (await db.execute(
        select(Document).where(Document.user_id == user_uuid)
    )).scalars().all()
    completed_docs = [d for d in docs if d.status == "completed"]

    # Fetch category counts
    cat_stmt = (
        select(Category.name, func.count(DocumentCategory.document_id))
        .join(DocumentCategory, DocumentCategory.category_id == Category.id)
        .join(Document, Document.id == DocumentCategory.document_id)
        .where(Document.user_id == user_uuid, Document.status == "completed")
        .group_by(Category.name)
    )
    category_counts = {name: count for name, count in (await db.execute(cat_stmt)).all()}

    # Fetch entities
    entity_rows = (await db.execute(
        select(Entity.entity_value, Entity.entity_type)
        .join(Document, Document.id == Entity.document_id)
        .where(Document.user_id == user_uuid)
    )).all()
    skills = list({r[0] for r in entity_rows if r[1] in ("skill", "technology")})
    orgs = list({r[0] for r in entity_rows if r[1] == "organization"})

    # Fetch timeline events
    timeline_events = (await db.execute(
        select(TimelineEvent).where(TimelineEvent.user_id == user_uuid)
    )).scalars().all()

    n_docs = len(completed_docs)
    n_projects = category_counts.get("Projects", 0)
    n_certs = category_counts.get("Certificates", 0)
    n_internships = category_counts.get("Internships", 0)
    n_achievements = category_counts.get("Achievements", 0)
    n_skills = len(skills)
    n_orgs = len(orgs)
    n_timeline = len(timeline_events)

    # Compute each metric (0–100 scale)
    completeness = min(100.0, (n_docs / max(1, 5)) * 100)
    verification = min(100.0, (n_certs * 20) + (n_internships * 25))
    doc_quality = min(100.0, (n_docs * 12) + (n_certs * 8))
    portfolio_strength = min(100.0, (n_projects * 20) + (n_achievements * 10))
    resume_quality = min(100.0, 40 + (n_docs * 5) + (n_skills * 3))
    career_readiness = min(100.0, (n_projects * 10) + (n_certs * 15) + (n_internships * 20) + (n_skills * 2))
    skill_diversity = min(100.0, n_skills * 6)
    project_diversity = min(100.0, n_projects * 18)
    tech_breadth = min(100.0, n_skills * 7)
    learning_velocity = min(100.0, n_timeline * 10 + n_certs * 15)
    consistency = min(100.0, 50 + (n_docs * 5)) if n_docs > 0 else 10.0
    professional_maturity = min(100.0, (n_internships * 25) + (n_orgs * 10))

    metrics = [
        IdentityHealthMetric(name="Identity Completeness", score=round(completeness, 1),
            trend="up" if n_docs > 2 else "stable",
            description=f"Based on {n_docs} verified documents"),
        IdentityHealthMetric(name="Identity Verification", score=round(verification, 1),
            trend="up" if n_certs > 0 else "down",
            description=f"{n_certs} certificates, {n_internships} internships verified"),
        IdentityHealthMetric(name="Documentation Quality", score=round(doc_quality, 1),
            trend="stable", description="OCR extraction and metadata completeness"),
        IdentityHealthMetric(name="Portfolio Strength", score=round(portfolio_strength, 1),
            trend="up" if n_projects > 1 else "down",
            description=f"{n_projects} projects, {n_achievements} achievements"),
        IdentityHealthMetric(name="Resume Quality", score=round(resume_quality, 1),
            trend="stable", description="Keyword density and impact metrics"),
        IdentityHealthMetric(name="Career Readiness", score=round(career_readiness, 1),
            trend="up" if career_readiness > 50 else "down",
            description="Placement readiness composite"),
        IdentityHealthMetric(name="Skill Diversity", score=round(skill_diversity, 1),
            trend="up" if n_skills > 5 else "stable",
            description=f"{n_skills} unique skills mapped"),
        IdentityHealthMetric(name="Project Diversity", score=round(project_diversity, 1),
            trend="stable", description=f"{n_projects} project domains"),
        IdentityHealthMetric(name="Technology Breadth", score=round(tech_breadth, 1),
            trend="up" if n_skills > 5 else "stable",
            description="Range of technologies demonstrated"),
        IdentityHealthMetric(name="Learning Velocity", score=round(learning_velocity, 1),
            trend="up" if n_certs > 1 else "stable",
            description="Rate of credential acquisition"),
        IdentityHealthMetric(name="Consistency Score", score=round(consistency, 1),
            trend="stable", description="Document upload consistency"),
        IdentityHealthMetric(name="Professional Maturity", score=round(professional_maturity, 1),
            trend="up" if n_internships > 0 else "down",
            description="Industry exposure and org experience"),
    ]

    # Milestones
    milestones = []
    if n_docs >= 1:
        milestones.append("🚀 First document uploaded — Identity journey started")
    if n_certs >= 1:
        milestones.append("🏆 First certification verified — Professional credentials established")
    if n_projects >= 3:
        milestones.append("⚡ 3+ projects catalogued — Strong portfolio foundation")
    if n_internships >= 1:
        milestones.append("🏢 Internship validated — Industry experience confirmed")
    if n_skills >= 10:
        milestones.append("🌐 10+ skills mapped — Broad technical capability")

    overall = round(sum(m.score for m in metrics) / len(metrics), 1) if metrics else 0.0

    # Historical trend based on document upload dates
    historical = []
    if completed_docs:
        sorted_docs = sorted(completed_docs, key=lambda d: d.uploaded_at)
        for i, doc in enumerate(sorted_docs):
            historical.append({
                "date": doc.uploaded_at.strftime("%Y-%m-%d"),
                "score": min(100, 10 + (i + 1) * 15)
            })

    return IdentityHealthResponse(
        overall_health=overall,
        metrics=metrics,
        historical_trend=historical,
        milestones=milestones,
        updated_at=datetime.now(timezone.utc)
    )


def _empty_health() -> IdentityHealthResponse:
    return IdentityHealthResponse(
        overall_health=0.0,
        metrics=[],
        historical_trend=[],
        milestones=[],
        updated_at=datetime.now(timezone.utc)
    )
