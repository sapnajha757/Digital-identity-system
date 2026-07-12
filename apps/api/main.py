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
from routers import chat, documents, graph, search, timeline

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: make sure the Qdrant collection exists before any request lands
    ensure_collection()
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

app.include_router(documents.router)
app.include_router(search.router)
app.include_router(timeline.router)
app.include_router(graph.router)
app.include_router(chat.router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "environment": settings.environment}
