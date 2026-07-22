from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import settings
from src.models import init_db
from src.routers.chat import router as chat_router
from src.routers.documents import router as documents_router
from src.routers.graph import router as graph_router
from src.routers.identity_score import router as identity_score_router
from src.services.error_handling import register_exception_handlers

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)
app.include_router(documents_router)
app.include_router(chat_router)
app.include_router(graph_router)
app.include_router(identity_score_router)

@app.get("/health")
async def health():
    return {"status": "ok"}