import uuid
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import CurrentUser, current_user
from db.neo4j import get_session
from db.postgres import get_db
from models.document import User
from schemas.document import GraphEdge, GraphNode, GraphResponse

router = APIRouter(prefix="/graph", tags=["graph"])


@router.get("", response_model=GraphResponse)
async def get_knowledge_graph(
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(current_user),
):
    query = """
    MATCH (n)-[r]->(m)
    WHERE n.owner_id = $owner_id AND m.owner_id = $owner_id
    RETURN n, r, m
    LIMIT 200
    """
    nodes: dict[str, GraphNode] = {}
    edges: list[GraphEdge] = []

    # Get the user.id from Postgres
    result = await db.execute(select(User).where(User.auth_id == uuid.UUID(user.auth_id)))
    db_user = result.scalar_one_or_none()
    owner_id = str(db_user.id) if db_user else user.auth_id

    with get_session() as session:
        records = session.run(query, owner_id=owner_id)
        for record in records:
            n, r, m = record["n"], record["r"], record["m"]
            for node in (n, m):
                node_id = str(node.get("id"))
                if node_id not in nodes:
                    # Collect all node properties
                    node_props = dict(node.items()) if hasattr(node, "items") else {}
                    nodes[node_id] = GraphNode(
                        id=node_id,
                        label=node.get("name", node_id),
                        type=list(node.labels)[0] if node.labels else "Unknown",
                        properties=node_props,
                    )
            
            # Map edge attributes
            edge_props = dict(r.items()) if hasattr(r, "items") else {}
            confidence = edge_props.pop("confidence", 1.0)
            reason = edge_props.pop("reason", "Direct relationship")
            timestamp = edge_props.pop("timestamp", None)
            
            edges.append(
                GraphEdge(
                    source=str(n.get("id")),
                    target=str(m.get("id")),
                    relationship=r.type,
                    confidence=confidence,
                    reason=reason,
                    metadata=edge_props,
                    timestamp=timestamp,
                )
            )

    return GraphResponse(nodes=list(nodes.values()), edges=edges)

