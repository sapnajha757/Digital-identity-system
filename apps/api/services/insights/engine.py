import logging
from datetime import datetime, timezone
from db.neo4j import get_session
from services.categorization.llm_client import call_json
from schemas.document import InsightItem

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
You are an expert career advisor, recruiter, and portfolio optimization AI.
You will analyze the user's knowledge graph (skills, projects, certifications, internships, achievements) and generate highly personalized, high-value, actionable career insights.

You must return a single JSON object with a key "insights" containing a list of objects. Each object in the list must represent a distinct career insight and have the following keys:
1. "type": One of ["skills", "gaps", "certifications", "trends", "improvements"]
2. "title": A concise, engaging title for the insight (e.g., "FastAPI Expertise Found" or "Missing Cloud Deployment Project")
3. "description": A short explanation of the finding, backed by the user's graph data.
4. "impact": One of ["high", "medium", "low"]
5. "actionable_step": A specific, concrete task the user can do to act on this insight (e.g., "Build a serverless Python project and upload the documentation," or "Certify your React skills on freeCodeCamp").

Constrain the output to exactly the JSON structure:
{
  "insights": [
    {
      "type": "gaps",
      "title": "...",
      "description": "...",
      "impact": "high",
      "actionable_step": "..."
    }
  ]
}
Do not return any surrounding markdown block or conversational filler. Only return raw, parseable JSON.
"""

def generate_insights(owner_id: str) -> list[InsightItem]:
    # Query current nodes and relationships from Neo4j
    query = """
    MATCH (n)
    WHERE n.owner_id = $owner_id
    OPTIONAL MATCH (n)-[r]->(m)
    WHERE m.owner_id = $owner_id
    RETURN n, r, m
    """
    
    nodes_summary = {}
    edges_summary = []
    
    with get_session() as session:
        records = session.run(query, owner_id=owner_id)
        for record in records:
            n = record["n"]
            if n:
                n_id = str(n.get("id") or n.get("name"))
                if n_id not in nodes_summary:
                    nodes_summary[n_id] = {
                        "name": n.get("name", n_id),
                        "label": list(n.labels)[0] if n.labels else "Node",
                        "date": n.get("date")
                    }
            r, m = record["r"], record["m"]
            if r and m:
                edges_summary.append({
                    "from": n.get("name", str(n.get("id"))),
                    "to": m.get("name", str(m.get("id"))),
                    "type": r.type
                })
                
    if not nodes_summary:
        # Fallback insights for empty state
        return [
            InsightItem(
                type="improvements",
                title="System Initialized",
                description="Your Digital Identity portfolio is empty. Add your first certificate, project report, or resume to unlock detailed AI Insights.",
                impact="high",
                actionable_step="Upload a PDF certificate or project report to get started."
            )
        ]
        
    # Compile prompt
    user_prompt = f"Here is the user's current knowledge graph representation:\n\n"
    user_prompt += "Nodes:\n"
    for nid, node in nodes_summary.items():
        date_str = f" dated {node['date']}" if node.get("date") else ""
        user_prompt += f"- {node['name']} ({node['label']}){date_str}\n"
    user_prompt += "\nRelationships:\n"
    for edge in edges_summary:
        user_prompt += f"- {edge['from']} -[{edge['type']}]-> {edge['to']}\n"
        
    user_prompt += "\nBased on this information, analyze their portfolio and generate 3 to 5 key insights matching the requested format."

    try:
        response_dict = call_json(SYSTEM_PROMPT, user_prompt)
        items = []
        for raw in response_dict.get("insights", []):
            try:
                items.append(
                    InsightItem(
                        type=raw.get("type", "improvements"),
                        title=raw.get("title", "Insight"),
                        description=raw.get("description", ""),
                        impact=raw.get("impact", "medium"),
                        actionable_step=raw.get("actionable_step", "")
                    )
                )
            except Exception:
                logger.exception("Failed to parse individual insight item")
        return items
    except Exception:
        logger.exception("Failed to fetch insights from LLM, generating fallback rules")
        # Rule-based fallback insights in case the LLM is unavailable
        skills_found = [n['name'] for n in nodes_summary.values() if n['label'] == 'Skill']
        fallback = [
            InsightItem(
                type="skills",
                title="Active Developer Portfolio",
                description=f"You have active projects and skills documented in your graph, including {', '.join(skills_found[:3]) if skills_found else 'your uploaded topics'}.",
                impact="medium",
                actionable_step="Keep adding certifications to validate these skills officially."
            )
        ]
        return fallback
