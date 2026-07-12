# Architecture notes

See the main README for setup. This file tracks architecture decisions as
the project grows past the Day 1 scaffold.

## Database responsibility split

- **Postgres**: source of truth for users, documents, metadata, categories,
  entities, timeline events. Also stores a pointer table (`embedding_chunks`)
  with chunk text for citation display.
- **Qdrant**: vectors only. Payload = `{document_id, chunk_id}`, never full
  text — avoids drift between Postgres and Qdrant copies of the same text.
- **Neo4j**: relationships only. Nodes carry minimal properties
  (`id`, `type`, `name`); full details are always fetched from Postgres by id.

## Processing pipeline

Upload → OCR → Text extraction → Metadata extraction → Entity extraction →
Categorization → Embeddings → Vector DB → Knowledge Graph → Timeline →
Semantic search → Chat assistant

Currently run via FastAPI `BackgroundTasks` (see `routers/documents.py`).
Upgrade path: Celery + Redis when concurrent upload volume needs it.
