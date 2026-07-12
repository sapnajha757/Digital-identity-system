"""
Returns the knowledge graph (nodes + edges) for a user, in a shape
React Flow can render directly. Graph writes happen in Module 3
(services/knowledge_graph); this only reads from Neo4j.
"""
from fastapi import APIRouter, Depends

from core.security import CurrentUser, current_user
from db.neo4j import get_session
from schemas.document import GraphEdge, GraphNode, GraphResponse

router = APIRouter(prefix="/graph", tags=["graph"])


@router.get("", response_model=GraphResponse)
async def get_knowledge_graph(user: CurrentUser = Depends(current_user)):
    query = """
    MATCH (n)-[r]->(m)
    WHERE n.owner_id = $owner_id AND m.owner_id = $owner_id
    RETURN n, r, m
    LIMIT 200
    """
    nodes: dict[str, GraphNode] = {}
    edges: list[GraphEdge] = []

    with get_session() as session:
        records = session.run(query, owner_id=user.auth_id)
        for record in records:
            n, r, m = record["n"], record["r"], record["m"]
            for node in (n, m):
                node_id = str(node.get("id"))
                if node_id not in nodes:
                    nodes[node_id] = GraphNode(
                        id=node_id,
                        label=node.get("name", node_id),
                        type=list(node.labels)[0] if node.labels else "Unknown",
                    )
            edges.append(
                GraphEdge(source=str(n.get("id")), target=str(m.get("id")), relationship=r.type)
            )

    return GraphResponse(nodes=list(nodes.values()), edges=edges)
