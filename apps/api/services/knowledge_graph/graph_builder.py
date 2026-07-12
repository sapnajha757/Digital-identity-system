import uuid
from datetime import datetime, timezone

from db.neo4j import get_session

# Maps a document category to the Neo4j node label it represents.
# Academics / Skills / Others don't map to a distinct node type in the graph.
CATEGORY_TO_NODE_LABEL = {
    "Certificates": "Certificate",
    "Achievements": "Achievement",
    "Internships": "Internship",
    "Projects": "Project",
}

# Single-document relationship rules: category -> relationship type toward Skill.
# Values come only from this fixed internal dict (never user input), so
# building Cypher label/relationship strings from them is safe.
CATEGORY_RELATIONSHIP_RULES = {
    "Certificates": "GRANTS",
    "Projects": "USED_IN",
    "Achievements": "DEMONSTRATES",
}


def build_graph_for_document(
    document_id: uuid.UUID,
    owner_id: str,
    file_type: str,
    original_filename: str,
    categories: list[str],
    skill_entities: list[str],
    organization_entities: list[str] = None,
    event_date: str = None,
) -> None:
    with get_session() as session:
        session.execute_write(
            _write_graph,
            document_id,
            owner_id,
            file_type,
            original_filename,
            categories,
            skill_entities,
            organization_entities,
            event_date,
        )


def enrich_graph_relationships(owner_id: str) -> None:
    with get_session() as session:
        session.execute_write(_enrich_relationships, owner_id)


def _write_graph(
    tx,
    document_id,
    owner_id,
    file_type,
    original_filename,
    categories,
    skill_entities,
    organization_entities,
    event_date,
):
    doc_id = str(document_id)
    event_date_str = str(event_date) if event_date else None
    timestamp = datetime.now(timezone.utc).isoformat()

    tx.run(
        """
        MERGE (d:Document {id: $doc_id})
        SET d.owner_id = $owner_id, d.type = $file_type, d.name = $name, d.date = $date
        """,
        doc_id=doc_id,
        owner_id=owner_id,
        file_type=file_type,
        name=original_filename,
        date=event_date_str,
    )

    if organization_entities:
        for org_name in organization_entities:
            tx.run(
                """
                MERGE (o:Organization {name: $org_name, owner_id: $owner_id})
                WITH o
                MATCH (d:Document {id: $doc_id})
                MERGE (d)-[r:AT_ORGANIZATION]->(o)
                SET r.confidence = 1.0, r.reason = "Extracted association with organization", r.timestamp = $timestamp
                """,
                org_name=org_name,
                owner_id=owner_id,
                doc_id=doc_id,
                timestamp=timestamp,
            )

    for category in categories:
        node_label = CATEGORY_TO_NODE_LABEL.get(category)
        if node_label is None:
            continue

        tx.run(
            f"""
            MERGE (n:{node_label} {{id: $doc_id}})
            SET n.owner_id = $owner_id, n.name = $name, n.date = $date
            WITH n
            MATCH (d:Document {{id: $doc_id}})
            MERGE (d)-[r:REPRESENTS]->(n)
            SET r.confidence = 1.0, r.reason = "Primary category representation", r.timestamp = $timestamp
            """,
            doc_id=doc_id,
            owner_id=owner_id,
            name=original_filename,
            date=event_date_str,
            timestamp=timestamp,
        )

        relationship = CATEGORY_RELATIONSHIP_RULES.get(category)
        if relationship is None:
            continue

        for skill_name in skill_entities:
            # Determine single doc relationship metadata
            confidence = 0.85
            reason = f"Skill extracted from {category[:-1]} text"
            if relationship == "GRANTS":
                confidence = 0.95
                reason = "Certificate explicitly certifies skill"
            elif relationship == "DEMONSTRATES":
                confidence = 0.80
                reason = "Achievement demonstrates skill"

            tx.run(
                f"""
                MERGE (s:Skill {{name: $skill_name, owner_id: $owner_id}})
                WITH s
                MATCH (n:{node_label} {{id: $doc_id}})
                MERGE (n)-[r:{relationship}]->(s)
                SET r.confidence = $confidence, r.reason = $reason, r.timestamp = $timestamp
                """,
                skill_name=skill_name,
                owner_id=owner_id,
                doc_id=doc_id,
                confidence=confidence,
                reason=reason,
                timestamp=timestamp,
            )


def _enrich_relationships(tx, owner_id: str):
    timestamp = datetime.now(timezone.utc).isoformat()

    # 1. (Certificate)-[:VALIDATES_SKILL_FOR]->(Project)
    tx.run(
        """
        MATCH (c:Certificate {owner_id: $owner_id})-[:GRANTS]->(s:Skill)<-[:USED_IN]-(p:Project {owner_id: $owner_id})
        MERGE (c)-[r:VALIDATES_SKILL_FOR]->(p)
        SET r.confidence = 0.90, 
            r.reason = "Certificate validates skill (" + s.name + ") used in Project", 
            r.timestamp = $timestamp
        """,
        owner_id=owner_id,
        timestamp=timestamp,
    )

    # 2. (Project)-[:RELATED_PROJECT]->(Project) if they share 2+ skills
    tx.run(
        """
        MATCH (p1:Project {owner_id: $owner_id})-[:USED_IN]->(s:Skill)<-[:USED_IN]-(p2:Project {owner_id: $owner_id})
        WHERE p1.id < p2.id
        WITH p1, p2, count(s) as shared_count, collect(s.name) as shared_skills
        WHERE shared_count >= 2
        MERGE (p1)-[r:RELATED_PROJECT]-(p2)
        SET r.shared_skills_count = shared_count, 
            r.shared_skills = shared_skills,
            r.confidence = CASE WHEN shared_count * 0.2 > 0.95 THEN 0.95 ELSE shared_count * 0.2 END,
            r.reason = "Projects share " + shared_count + " skills",
            r.timestamp = $timestamp
        """,
        owner_id=owner_id,
        timestamp=timestamp,
    )

    # 3. (Project/Achievement)-[:PART_OF_INTERNSHIP]->(Internship) via shared organization
    tx.run(
        """
        MATCH (d1:Document {owner_id: $owner_id})-[:REPRESENTS]->(p)
        MATCH (d2:Document {owner_id: $owner_id})-[:REPRESENTS]->(i:Internship)
        WHERE (p:Project OR p:Achievement)
        MATCH (d1)-[:AT_ORGANIZATION]->(o:Organization)<-[:AT_ORGANIZATION]-(d2)
        MERGE (p)-[r:PART_OF_INTERNSHIP]->(i)
        SET r.confidence = 0.95, 
            r.reason = "Project/Achievement completed at same organization (" + o.name + ") as Internship", 
            r.timestamp = $timestamp
        """,
        owner_id=owner_id,
        timestamp=timestamp,
    )


