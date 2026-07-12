import logging
from datetime import datetime, timezone
from db.neo4j import get_session
from services.categorization.llm_client import call_json
from schemas.document import CareerTwin, DashboardMetricsResponse

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
You are an expert career orchestrator, recruiter, and developer mentor.
You will evaluate the user's career records (skills, projects, certifications, internships, achievements) and generate:
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

Return a single JSON object with the keys:
{
  "ai_summary_narrative": "...",
  "career_twin": {
    "current_role_trend": "...",
    "strongest_skills": ["...", "...", "..."],
    "fastest_growing_skill": "...",
    "career_direction": "...",
    "experience_summary": "...",
    "recommended_next_skill": "...",
    "recommended_next_project": "...",
    "career_readiness": 85
  }
}
Do not return any surrounding conversation or markdown. Only return raw, parseable JSON.
"""

def get_dashboard_metrics(owner_id: str) -> DashboardMetricsResponse:
    # 1. Fetch nodes and relations to build raw summaries
    query = """
    MATCH (n)
    WHERE n.owner_id = $owner_id
    RETURN labels(n)[0] AS type, count(n) AS count, collect(n.name) AS names
    """
    
    counts = {
        "Project": 0,
        "Certificate": 0,
        "Internship": 0,
        "Skill": 0,
        "Achievement": 0
    }
    
    skills_list = []
    projects_list = []
    certs_list = []
    
    with get_session() as session:
        records = session.run(query, owner_id=owner_id)
        for record in records:
            ntype = record["type"]
            count = record["count"]
            names = record["names"]
            if ntype in counts:
                counts[ntype] = count
            
            if ntype == "Skill":
                skills_list = names
            elif ntype == "Project":
                projects_list = names
            elif ntype == "Certificate":
                certs_list = names

    # 2. Calculate Identity Score
    project_score = min(counts["Project"] * 15, 45)
    cert_score = min(counts["Certificate"] * 15, 30)
    internship_score = min(counts["Internship"] * 15, 15)
    skills_score = min(counts["Skill"] * 2, 10)
    
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
        "total_documents": counts["Project"] + counts["Certificate"] + counts["Internship"] + counts["Achievement"],
        "skills_mapped": counts["Skill"]
    }

    # 3. LLM Career Narrative Generation
    if not skills_list and not projects_list:
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
    user_prompt += f"- Internship Count: {counts['Internship']}\n"
    user_prompt += f"- Achievements Count: {counts['Achievement']}\n"

    try:
        response_dict = call_json(SYSTEM_PROMPT, user_prompt)
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
            experience_summary=f"Portfolio containing {counts['Project']} projects and {counts['Certificate']} certificates.",
            recommended_next_skill="Docker",
            recommended_next_project="Containerized API deployment with metrics",
            career_readiness=identity_score
        )
        
        narrative = f"You have cataloged a developer profile featuring {counts['Project']} projects and {counts['Certificate']} certificates. "
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
