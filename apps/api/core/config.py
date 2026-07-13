"""
Centralized environment configuration.
All services read settings from here instead of calling os.getenv() directly,
so there is a single source of truth for required env vars.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Postgres
    postgres_url: str = "postgresql+asyncpg://dis_user:dis_password@localhost:5432/digital_identity"

    # Qdrant
    qdrant_host: str = "localhost"
    qdrant_port: int = 6333
    qdrant_collection: str = "document_chunks"

    # Neo4j
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "dis_password"

    # Local Auth
    jwt_secret: str = "local_dev_secret_key_1234567890"

    # LLM providers
    anthropic_api_key: str = ""
    # Check docs.claude.com for the current recommended model string —
    # update here if a newer Claude model is available when you're building.
    anthropic_model: str = "claude-sonnet-4-5-20250929"
    openai_api_key: str = ""
    gemini_api_key: str = ""

    # App
    environment: str = "development"
    cors_origins: list[str] = ["http://localhost:3000"]


@lru_cache
def get_settings() -> Settings:
    return Settings()
