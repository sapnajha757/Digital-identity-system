"""
Application entrypoint. Run locally with:
    uvicorn main:app --reload --port 8000
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import get_settings
from db.neo4j import close_driver
from db.qdrant import ensure_collection
from db.postgres import async_session_factory
from routers import chat, documents, graph, search, timeline, insights, dashboard, auth
from routers.auth import get_or_create_demo_user

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: make sure local uploads dir exists
    import os
    os.makedirs("uploads", exist_ok=True)

    try:
        ensure_collection()
        print("[INFO] Qdrant collection is ready.")
    except Exception as e:
        print(f"[WARN] Qdrant is unavailable; vector search will be disabled until it is running: {e}")

    # Create demo user on first run
    try:
        async with async_session_factory() as db:
            from sqlalchemy import text
            await db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS hashed_password TEXT;"))
            await db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();"))
            await db.commit()

            await get_or_create_demo_user(db)
            print("[INFO] Local authentication: Demo user and database columns are ready.")
    except Exception as e:
        print(f"[WARN] Postgres is unavailable; database-backed endpoints will be disabled until it is running: {e}")

    yield
    # Shutdown: close long-lived driver connections cleanly
    close_driver()


app = FastAPI(
    title="Digital Identity System API",
    description="AI-powered academic & professional identity graph",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(documents.router)
app.include_router(search.router)
app.include_router(timeline.router)
app.include_router(graph.router)
app.include_router(chat.router)
app.include_router(insights.router)
app.include_router(dashboard.router)



@app.get("/health")
async def health_check():
    return {"status": "ok", "environment": settings.environment}
