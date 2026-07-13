"""
Proactive AI Notification Engine — Module 3.
Generates contextual, evidence-backed notifications without requiring user prompts.
"""
import logging
import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from models.document import Document, Entity, DocumentCategory, Category, AINotification
from schemas.document import AINotificationOut, NotificationsResponse

logger = logging.getLogger(__name__)


async def generate_notifications(db: AsyncSession, owner_id: str) -> NotificationsResponse:
    """Generate and return proactive AI notifications for the user."""
    try:
        user_uuid = uuid.UUID(owner_id)
    except ValueError:
        return NotificationsResponse(notifications=[], unread_count=0)

    # Return cached notifications generated within the last 24h
    cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
    existing_stmt = select(AINotification).where(
        AINotification.user_id == user_uuid,
        AINotification.is_dismissed == False,  # noqa: E712
        AINotification.created_at >= cutoff
    ).order_by(AINotification.created_at.desc())
    existing = (await db.execute(existing_stmt)).scalars().all()

    if not existing:
        await _generate_fresh_notifications(db, user_uuid)
        existing = (await db.execute(existing_stmt)).scalars().all()

    out = [
        AINotificationOut(
            id=n.id, category=n.category, message=n.message,
            reason=n.reason, evidence=n.evidence, confidence=n.confidence,
            suggested_action=n.suggested_action, is_read=n.is_read,
            is_dismissed=n.is_dismissed, created_at=n.created_at
        ) for n in existing
    ]
    unread = sum(1 for n in existing if not n.is_read)
    return NotificationsResponse(notifications=out, unread_count=unread)


async def _generate_fresh_notifications(db: AsyncSession, user_uuid: uuid.UUID) -> None:
    """Generate rule-based proactive notifications grounded in user profile data."""
    notifications_to_add = []
    now = datetime.now(timezone.utc)

    docs = (await db.execute(
        select(Document).where(Document.user_id == user_uuid)
    )).scalars().all()

    cat_stmt = (
        select(Category.name, func.count(DocumentCategory.document_id))
        .join(DocumentCategory, DocumentCategory.category_id == Category.id)
        .join(Document, Document.id == DocumentCategory.document_id)
        .where(Document.user_id == user_uuid, Document.status == "completed")
        .group_by(Category.name)
    )
    category_counts = {name: count for name, count in (await db.execute(cat_stmt)).all()}

    entity_rows = (await db.execute(
        select(Entity.entity_type, Entity.entity_value)
        .join(Document, Document.id == Entity.document_id)
        .where(Document.user_id == user_uuid)
    )).all()
    skills = list({r[1] for r in entity_rows if r[0] in ("skill", "technology")})

    n_projects = category_counts.get("Projects", 0)
    n_certs = category_counts.get("Certificates", 0)
    n_internships = category_counts.get("Internships", 0)

    # Rule 1: Resume staleness
    resume_docs = [d for d in docs if "resume" in d.original_filename.lower()]
    if resume_docs:
        newest_resume = max(resume_docs, key=lambda d: d.uploaded_at)
        days_old = (now - newest_resume.uploaded_at.replace(tzinfo=timezone.utc)).days
        if days_old > 90:
            notifications_to_add.append(AINotification(
                user_id=user_uuid,
                category="RESUME_ALERT",
                message=f"Your resume hasn't been updated in {days_old} days.",
                reason=f"{newest_resume.original_filename} was last uploaded {days_old} days ago. New projects and credentials catalogued since then are not reflected in your resume.",
                evidence=f"Document: {newest_resume.original_filename}, uploaded {newest_resume.uploaded_at.date()}",
                confidence=0.95,
                suggested_action="Upload an updated resume incorporating your latest projects and certifications."
            ))

    # Rule 2: Frontend-heavy profile with no deployment evidence
    frontend_skills = [s for s in skills if s.lower() in ["react", "next.js", "vue", "angular", "css", "html", "tailwind"]]
    deploy_skills = [s for s in skills if s.lower() in ["docker", "kubernetes", "aws", "gcp", "azure", "nginx", "terraform"]]
    if len(frontend_skills) >= 2 and len(deploy_skills) == 0:
        notifications_to_add.append(AINotification(
            user_id=user_uuid,
            category="SKILLS_GAP",
            message="Strong frontend profile detected, but no backend deployment evidence found.",
            reason=f"Skills extracted include {', '.join(frontend_skills[:3])}, confirming frontend expertise. No Docker, Kubernetes, or cloud deployment documentation was found.",
            evidence=f"Frontend skills: {', '.join(frontend_skills)} | Deployment skills: none detected",
            confidence=0.88,
            suggested_action="Add a Dockerfile or cloud deployment configuration to your next project."
        ))

    # Rule 3: Portfolio lacks measurable outcomes
    if n_projects >= 2:
        notifications_to_add.append(AINotification(
            user_id=user_uuid,
            category="PORTFOLIO_ALERT",
            message="Your portfolio lacks measurable project outcomes.",
            reason="Recruiters expect quantified impact (e.g., '40% latency reduction', '10K daily users'). Project documents analyzed do not contain explicit performance KPIs.",
            evidence=f"{n_projects} projects in portfolio — no quantified metrics detected",
            confidence=0.80,
            suggested_action="Add a Results section to each project with at least one measurable metric."
        ))

    # Rule 4: Internship gap
    if n_internships == 0 and n_projects >= 2:
        notifications_to_add.append(AINotification(
            user_id=user_uuid,
            category="DAILY_BRIEFING",
            message="Adding one internship document could increase your Identity Score by approximately 5%.",
            reason="Internship experience is a high-signal professional validator. Currently no internship documents are detected in your profile.",
            evidence=f"Current: {n_projects} projects, {n_certs} certificates, 0 internships",
            confidence=0.90,
            suggested_action="Upload an internship offer letter, experience certificate, or recommendation letter."
        ))

    for notif in notifications_to_add:
        db.add(notif)
    if notifications_to_add:
        await db.commit()
