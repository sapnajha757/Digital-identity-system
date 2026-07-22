import os

class Settings:
    app_name = os.getenv("APP_NAME", "Digital Identity System")
    api_prefix = os.getenv("API_PREFIX", "/api")
    database_url = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./digital_identity.db")
    cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    openai_api_key = os.getenv("OPENAI_API_KEY", "")

settings = Settings()