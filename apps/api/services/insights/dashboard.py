import logging
import asyncio
import uuid
from datetime import datetime, timezone
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from services.categorization.llm_client import call_json
from schemas.document import CareerTwin, DashboardMetricsResponse
from models.document import Document, Entity, DocumentCategory, Category

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
Role: You are an expert career orchestrator, recruiter, and developer mentor.
Objective: Evaluate the user's career records (skills, projects, certifications, internships, achievements) and generate:
1. An AI Narrative: A premium, engaging, natural-language professional career story (around 3-4 sentences). It should describe their progression, key strengths, recent focus, and strategic next steps.
2. A Career Twin layout consisting of predictions on:
   - "current_role_trend": e.g., "Full-Stack AI Developer" or "Data Scientist"
   - "strongest_skills": List of top 3 skills
   - "fastest_growing_skill": e.g., "FastAPI" or "Neo4j"
   - "career_direction": e.g., "AI Systems Engineering" or "Data Infrastructure"
   - "experience_summary": e.g., "Builds end-to-end intelligent pipelines with graph validation."
   - "recommended_next_skill": e.g., "Docker" or "Kubernetes"
   - "recommended_next_project": e.g., "Cloud-Native Model Deployment Portfolio"
   - "career_readiness": Integer between 0 and 100 representing their readiness score.

JSON Schema:
{
  "ai_summary_narrative": "string",
  "career_twin": {
    "current_role_trend": "string",
    "strongest_skills": ["string", "string", "string"],
    "fastest_growing_skill": "string",
    "career_direction": "string",
    "experience_summary": "string",
    "recommended_next_skill": "string",
    "recommended_next_project": "string",
    "career_readiness": 85
  }
}
Do not return any surrounding conversation or markdown. Only return raw, parseable JSON.
"""

async def get_dashboard_metrics(db: AsyncSession, owner_id: str) -> DashboardMetricsResponse:
    try:
        user_uuid = uuid.UUID(owner_id)
    except ValueError:
        logger.error(f"Invalid owner_id UUID format: {owner_id}")
        return DashboardMetricsResponse(
            identity_score=10,
            score_breakdown={},
            career_twin=CareerTwin(
                current_role_trend="Onboarding",
                strongest_skills=[],
                fastest_growing_skill="System Exploration",
                career_direction="Undecided",
                experience_summary="Invalid profile ID.",
                recommended_next_skill="Upload first credential",
                recommended_next_project="Upload a project report to map skills",
                career_readiness=10
            ),
            ai_summary_narrative="Invalid profile setup.",
            stats={},
            updated_at=datetime.now(timezone.utc)
        )

    # 1. Fetch completed documents
    doc_stmt = select(Document).where(Document.user_id == user_uuid, Document.status == "completed")
    doc_res = await db.execute(doc_stmt)
    docs = doc_res.scalars().all()

    # 2. Fetch category counts from Postgres
    cat_stmt = (
        select(Category.name, func.count(DocumentCategory.document_id))
        .join(DocumentCategory, DocumentCategory.category_id == Category.id)
        .join(Document, Document.id == DocumentCategory.document_id)
        .where(Document.user_id == user_uuid, Document.status == "completed")
        .group_by(Category.name)
    )
    cat_res = await db.execute(cat_stmt)
    category_counts = {name: count for name, count in cat_res.all()}

    # 3. Fetch unique skills count
    skills_stmt = (
        select(Entity.entity_value)
        .join(Document, Document.id == Entity.document_id)
        .where(Document.user_id == user_uuid, Entity.entity_type.in_(["skill", "technology"]))
        .distinct()
    )
    skills_res = await db.execute(skills_stmt)
    skills_list = [row[0] for row in skills_res.all()]
    skills_count = len(skills_list)

    # 4. Fetch specific names of projects and certifications
    projects_stmt = (
        select(Document.original_filename)
        .join(DocumentCategory, DocumentCategory.document_id == Document.id)
        .join(Category, Category.id == DocumentCategory.category_id)
        .where(Document.user_id == user_uuid, Category.name == "Projects", Document.status == "completed")
    )
    projects_res = await db.execute(projects_stmt)
    projects_list = [row[0] for row in projects_res.all()]

    certs_stmt = (
        select(Document.original_filename)
        .join(DocumentCategory, DocumentCategory.document_id == Document.id)
        .join(Category, Category.id == DocumentCategory.category_id)
        .where(Document.user_id == user_uuid, Category.name == "Certificates", Document.status == "completed")
    )
    certs_res = await db.execute(certs_stmt)
    certs_list = [row[0] for row in certs_res.all()]

    project_count = category_counts.get("Projects", 0)
    cert_count = category_counts.get("Certificates", 0)
    internship_count = category_counts.get("Internships", 0)
    achievement_count = category_counts.get("Achievements", 0)

    # Calculate Identity Score
    project_score = min(project_count * 15, 45)
    cert_score = min(cert_count * 15, 30)
    internship_score = min(internship_count * 15, 15)
    skills_score = min(skills_count * 2, 10)
    
    identity_score = project_score + cert_score + internship_score + skills_score
    if identity_score == 0:
        identity_score = 10 # Baseline onboarding score
        
    score_breakdown = {
        "Projects (Max 45)": project_score,
        "Certificates (Max 30)": cert_score,
        "Internships (Max 15)": internship_score,
        "Skill Diversity (Max 10)": skills_score
    }

    stats = {
        "total_documents": len(docs),
        "skills_mapped": skills_count
    }

    # Empty State Check
    if not docs:
        fallback_twin = CareerTwin(
            current_role_trend="Onboarding",
            strongest_skills=[],
            fastest_growing_skill="System Exploration",
            career_direction="Undecided",
            experience_summary="Your digital footprint is currently empty.",
            recommended_next_skill="Upload first credential",
            recommended_next_project="Upload a project report to map skills",
            career_readiness=10
        )
        return DashboardMetricsResponse(
            identity_score=identity_score,
            score_breakdown=score_breakdown,
            career_twin=fallback_twin,
            ai_summary_narrative="Welcome to IdentityOS. Upload your project reports, resume, and credentials to begin mapping your career twin.",
            stats=stats,
            updated_at=datetime.now(timezone.utc)
        )

    # Compile prompt context
    user_prompt = f"User profile details:\n"
    user_prompt += f"- Projects: {', '.join(projects_list[:5])}\n"
    user_prompt += f"- Certifications: {', '.join(certs_list[:5])}\n"
    user_prompt += f"- Skills: {', '.join(skills_list[:15])}\n"
    user_prompt += f"- Internship Count: {internship_count}\n"
    user_prompt += f"- Achievements Count: {achievement_count}\n"

    try:
        response_dict = await asyncio.to_thread(call_json, SYSTEM_PROMPT, user_prompt)
        twin_data = response_dict.get("career_twin", {})
        
        career_twin = CareerTwin(
            current_role_trend=twin_data.get("current_role_trend", "Developer"),
            strongest_skills=twin_data.get("strongest_skills", skills_list[:3]),
            fastest_growing_skill=twin_data.get("fastest_growing_skill", "Python"),
            career_direction=twin_data.get("career_direction", "AI Engineering"),
            experience_summary=twin_data.get("experience_summary", "Completed multiple coding dossiers."),
            recommended_next_skill=twin_data.get("recommended_next_skill", "Cloud Ingestion"),
            recommended_next_project=twin_data.get("recommended_next_project", "Build a serverless database API"),
            career_readiness=int(twin_data.get("career_readiness", identity_score))
        )
        
        return DashboardMetricsResponse(
            identity_score=identity_score,
            score_breakdown=score_breakdown,
            career_twin=career_twin,
            ai_summary_narrative=response_dict.get("ai_summary_narrative", "Your profile is mapped."),
            stats=stats,
            updated_at=datetime.now(timezone.utc)
        )
    except Exception:
        logger.exception("Failed to query dashboard LLM narrative, generating rules")
        
        # Rule-based fallback
        strong_skills = skills_list[:3]
        if not strong_skills:
            strong_skills = ["Software Engineering"]
            
        career_twin = CareerTwin(
            current_role_trend="Technical Analyst",
            strongest_skills=strong_skills,
            fastest_growing_skill=strong_skills[0] if strong_skills else "Development",
            career_direction="Software Engineering",
            experience_summary=f"Portfolio containing {project_count} projects and {cert_count} certificates.",
            recommended_next_skill="Docker",
            recommended_next_project="Containerized API deployment with metrics",
            career_readiness=identity_score
        )
        
        narrative = f"You have cataloged a developer profile featuring {project_count} projects and {cert_count} certificates. "
        narrative += f"Your primary competency centers around {', '.join(strong_skills)}. "
        narrative += "To further validate your portfolio, consider adding cloud deployments and completing additional certifications."
        
        return DashboardMetricsResponse(
            identity_score=identity_score,
            score_breakdown=score_breakdown,
            career_twin=career_twin,
            ai_summary_narrative=narrative,
            stats=stats,
            updated_at=datetime.now(timezone.utc)
        )

