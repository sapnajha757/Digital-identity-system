"""
Builds knowledge graph relationships for a single document, derived from
its categories + extracted skill/technology entities. Neo4j nodes store
minimal properties (id, name, owner_id) only — full details are always
fetched from Postgres by id, per the architecture's no-duplication rule.

Cross-document relationships (e.g. Project -> Internship inferred from
chronology across multiple documents) are intentionally out of scope for
a single-document write — see docs/architecture.md "Future improvements".
"""
import uuid

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
                MERGE (d)-[:AT_ORGANIZATION]->(o)
                """,
                org_name=org_name,
                owner_id=owner_id,
                doc_id=doc_id,
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
            MERGE (d)-[:REPRESENTS]->(n)
            """,
            doc_id=doc_id,
            owner_id=owner_id,
            name=original_filename,
            date=event_date_str,
        )

        relationship = CATEGORY_RELATIONSHIP_RULES.get(category)
        if relationship is None:
            continue

        for skill_name in skill_entities:
            tx.run(
                f"""
                MERGE (s:Skill {{name: $skill_name, owner_id: $owner_id}})
                WITH s
                MATCH (n:{node_label} {{id: $doc_id}})
                MERGE (n)-[:{relationship}]->(s)
                """,
                skill_name=skill_name,
                owner_id=owner_id,
                doc_id=doc_id,
            )


def _enrich_relationships(tx, owner_id: str):
    # 1. (Certificate)-[:VALIDATES_SKILL_FOR]->(Project)
    tx.run(
        """
        MATCH (c:Certificate {owner_id: $owner_id})-[:GRANTS]->(s:Skill)<-[:USED_IN]-(p:Project {owner_id: $owner_id})
        MERGE (c)-[:VALIDATES_SKILL_FOR]->(p)
        """,
        owner_id=owner_id,
    )

    # 2. (Project)-[:RELATED_PROJECT]->(Project) if they share 2+ skills
    tx.run(
        """
        MATCH (p1:Project {owner_id: $owner_id})-[:USED_IN]->(s:Skill)<-[:USED_IN]-(p2:Project {owner_id: $owner_id})
        WHERE p1.id < p2.id
        WITH p1, p2, count(s) as shared_count, collect(s.name) as shared_skills
        WHERE shared_count >= 2
        MERGE (p1)-[r:RELATED_PROJECT]-(p2)
        SET r.shared_skills_count = shared_count, r.shared_skills = shared_skills
        """,
        owner_id=owner_id,
    )

    # 3. (Project/Achievement)-[:PART_OF_INTERNSHIP]->(Internship) via shared organization
    tx.run(
        """
        MATCH (d1:Document {owner_id: $owner_id})-[:REPRESENTS]->(p)
        MATCH (d2:Document {owner_id: $owner_id})-[:REPRESENTS]->(i:Internship)
        WHERE (p:Project OR p:Achievement)
        MATCH (d1)-[:AT_ORGANIZATION]->(o:Organization)<-[:AT_ORGANIZATION]-(d2)
        MERGE (p)-[:PART_OF_INTERNSHIP]->(i)
        """,
        owner_id=owner_id,
    )

