-- Digital Identity System — Postgres schema
-- Loaded automatically by docker-compose on first container start.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users (mirrors Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Raw uploaded documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_filename TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('pdf','docx','image','link')),
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','processing','completed','failed')),
    uploaded_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_documents_user_status ON documents(user_id, status);

-- Extracted content (one row per document)
CREATE TABLE IF NOT EXISTS document_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID UNIQUE NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    extracted_text TEXT,
    ocr_confidence FLOAT CHECK (ocr_confidence BETWEEN 0 AND 1),
    page_count INT,
    language TEXT DEFAULT 'en',
    ai_summary TEXT
);

-- Category taxonomy
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);
INSERT INTO categories (name) VALUES
    ('Projects'), ('Skills'), ('Internships'),
    ('Achievements'), ('Certificates'), ('Academics'), ('Others')
ON CONFLICT (name) DO NOTHING;

-- Many-to-many: document <-> category
CREATE TABLE IF NOT EXISTS document_categories (
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES categories(id),
    confidence FLOAT CHECK (confidence BETWEEN 0 AND 1),
    PRIMARY KEY (document_id, category_id)
);

-- Extracted entities
CREATE TABLE IF NOT EXISTS entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('skill','technology','organization','date','role')),
    entity_value TEXT NOT NULL,
    confidence FLOAT
);
CREATE INDEX IF NOT EXISTS idx_entities_document ON entities(document_id);
CREATE INDEX IF NOT EXISTS idx_entities_type_value ON entities(entity_type, entity_value);

-- Pointer table to vectors (actual vectors live in Qdrant only)
CREATE TABLE IF NOT EXISTS embedding_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    chunk_text TEXT NOT NULL,
    qdrant_point_id UUID NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_embedding_document ON embedding_chunks(document_id);

-- Timeline events
CREATE TABLE IF NOT EXISTS timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    event_date DATE NOT NULL,
    event_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date_inferred BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_timeline_user_date ON timeline_events(user_id, event_date DESC);
