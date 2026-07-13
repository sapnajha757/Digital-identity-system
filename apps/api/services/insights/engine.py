import logging
import asyncio
import uuid
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.neo4j import get_session
from services.categorization.llm_client import call_json
from schemas.document import InsightItem
from models.document import Document, Entity, DocumentCategory, Category

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
Role: You are an expert career advisor, recruiter, and portfolio optimization AI.
Objective: Analyze the user's uploaded professional documents, categories, extracted entities, and knowledge graph relationships to generate highly personalized, high-value, actionable career insights.

You must return a single JSON object with a key "insights" containing a list of objects. Each object in the list must represent a distinct career insight and have the following keys:
1. "type": One of ["skills", "gaps", "certifications", "trends", "improvements"]
2. "title": A concise, engaging title for the insight (e.g., "FastAPI Expertise Found" or "Missing Cloud Deployment Project")
3. "description": A short explanation of the finding, backed by the user's graph/document data.
4. "impact": One of ["high", "medium", "low"]
5. "actionable_step": A specific, concrete task the user can do to act on this insight (e.g., "Build a serverless Python project and upload the documentation," or "Certify your React skills on freeCodeCamp").

Rules:
- Ground your analysis strictly in the user's actual document data and entities.
- Do NOT fabricate achievements, roles, or skills that are not supported by the document context.
- Be constructive and action-oriented.

JSON Schema:
{
  "insights": [
    {
      "type": "gaps|skills|certifications|trends|improvements",
      "title": "string",
      "description": "string",
      "impact": "high|medium|low",
      "actionable_step": "string"
    }
  ]
}
Do not return any surrounding markdown block or conversational filler. Only return raw, parseable JSON.
"""

def _query_neo4j(owner_id: str):
    query = """
    MATCH (n)
    WHERE n.owner_id = $owner_id
    OPTIONAL MATCH (n)-[r]->(m)
    WHERE m.owner_id = $owner_id
    RETURN n, r, m
    """
    nodes_summary = {}
    edges_summary = []
    
    try:
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
    except Exception as e:
        logger.error(f"Error querying Neo4j for insights: {e}")
    return nodes_summary, edges_summary

async def generate_insights(db: AsyncSession, owner_id: str) -> list[InsightItem]:
    # 1. Fetch data from Postgres
    try:
        user_uuid = uuid.UUID(owner_id)
    except ValueError:
        logger.error(f"Invalid owner_id UUID format: {owner_id}")
        return []

    # Completed documents
    doc_stmt = select(Document).where(Document.user_id == user_uuid, Document.status == "completed")
    doc_res = await db.execute(doc_stmt)
    docs = doc_res.scalars().all()

    if not docs:
        # Fallback insights for empty state
        return [
            InsightItem(
                type="improvements",
                title="Dossier Initialized",
                description="Your professional dossier is currently empty. Upload your certificates, resume, or project reports to generate tailored career insights.",
                impact="high",
                actionable_step="Upload a PDF certificate or project report to get started."
            )
        ]

    # Entities (skills, technologies, roles, organizations)
    entity_stmt = select(Entity).join(Document, Document.id == Entity.document_id).where(Document.user_id == user_uuid)
    entity_res = await db.execute(entity_stmt)
    entities = entity_res.scalars().all()

    # Document categories
    cat_stmt = (
        select(Category.name, Document.id)
        .join(DocumentCategory, DocumentCategory.category_id == Category.id)
        .join(Document, Document.id == DocumentCategory.document_id)
        .where(Document.user_id == user_uuid)
    )
    cat_res = await db.execute(cat_stmt)
    categories = cat_res.all()

    # 2. Query Neo4j
    nodes_summary, edges_summary = await asyncio.to_thread(_query_neo4j, owner_id)

    # 3. Construct LLM prompt
    user_prompt = "Here is the user's professional metadata retrieved from their verified documents:\n\n"
    user_prompt += "Documents:\n"
    for doc in docs:
        user_prompt += f"- {doc.original_filename} ({doc.file_type}) uploaded on {doc.uploaded_at.date()}\n"

    user_prompt += "\nDocument Categories:\n"
    for cat_name, doc_id in categories:
        matching_doc = next((d for d in docs if d.id == doc_id), None)
        doc_name = matching_doc.original_filename if matching_doc else "Unknown"
        user_prompt += f"- Document '{doc_name}' is classified as: {cat_name}\n"

    user_prompt += "\nExtracted Entities:\n"
    for entity in entities:
        user_prompt += f"- {entity.entity_type.upper()}: {entity.entity_value} (confidence: {entity.confidence:.2f})\n"

    if nodes_summary or edges_summary:
        user_prompt += "\nKnowledge Graph structure:\n"
        user_prompt += "Nodes:\n"
        for node in nodes_summary.values():
            user_prompt += f"- {node['name']} ({node['label']})\n"
        user_prompt += "Relationships:\n"
        for edge in edges_summary:
            user_prompt += f"- {edge['from']} -[{edge['type']}]-> {edge['to']}\n"

    user_prompt += "\nBased on this information, analyze their portfolio and generate 3 to 5 key insights matching the requested format."

    try:
        response_dict = await asyncio.to_thread(call_json, SYSTEM_PROMPT, user_prompt)
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
        skills_found = list({e.entity_value for e in entities if e.entity_type in ["skill", "technology"]})
        fallback = [
            InsightItem(
                type="skills",
                title="Active Developer Portfolio",
                description=f"You have active projects and skills documented in your dossier, including {', '.join(skills_found[:3]) if skills_found else 'your uploaded topics'}.",
                impact="medium",
                actionable_step="Keep adding certifications to validate these skills officially."
            )
        ]
        return fallback

