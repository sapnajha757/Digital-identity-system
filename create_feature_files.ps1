$repo = "C:\Users\sapna jha\Downloads\digital-identity-system"
Set-Location $repo

function Write-File {
    param(
        [string]$relativePath,
        [string]$content
    )

    $fullPath = Join-Path $repo $relativePath
    $dir = Split-Path $fullPath -Parent
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    [System.IO.File]::WriteAllText($fullPath, $content, [System.Text.UTF8Encoding]::new($false))
}

New-Item -ItemType Directory -Path "src/services","src/models","src/schemas","src/routers","components","app/chat" -Force | Out-Null
New-Item -ItemType Directory -Path "src/services" -Force | Out-Null
New-Item -ItemType File -Path "src/__init__.py" -Force | Out-Null
New-Item -ItemType File -Path "src/services/__init__.py" -Force | Out-Null
New-Item -ItemType File -Path "src/models/__init__.py" -Force | Out-Null
New-Item -ItemType File -Path "src/routers/__init__.py" -Force | Out-Null
New-Item -ItemType File -Path "src/schemas/__init__.py" -Force | Out-Null

Write-File "src/config.py" @"
import os

class Settings:
    app_name = os.getenv("APP_NAME", "Digital Identity System")
    api_prefix = os.getenv("API_PREFIX", "/api")
    database_url = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./digital_identity.db")
    cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    openai_api_key = os.getenv("OPENAI_API_KEY", "")

settings = Settings()
"@

Write-File "src/models/__init__.py" @"
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.ext.asyncio import AsyncAttrs, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from src.config import settings


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Base(AsyncAttrs, DeclarativeBase):
    pass


engine = create_async_engine(settings.database_url, echo=False)
SessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    file_name: Mapped[str] = mapped_column(String(500), nullable=False)
    storage_path: Mapped[str] = mapped_column(String(1000), nullable=False)
    content_type: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="uploaded", index=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False, default="uncategorized", index=True)
    tags: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    metadata_: Mapped[dict] = mapped_column("metadata", JSON, nullable=False, default=dict)
    content_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    chunks: Mapped[list["DocumentChunk"]] = relationship(back_populates="document", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id: Mapped[uuid.UUID] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id: Mapped[uuid.UUID] = mapped_column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    document: Mapped[Document] = relationship(back_populates="chunks")


class KnowledgeNode(Base):
    __tablename__ = "knowledge_nodes"

    id: Mapped[uuid.UUID] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    node_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(500), nullable=False)
    confidence_score: Mapped[float] = mapped_column(Integer, nullable=False, default=0)
    metadata: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    source_document_id: Mapped[uuid.UUID | None] = mapped_column(String(36), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class KnowledgeEdge(Base):
    __tablename__ = "knowledge_edges"

    id: Mapped[uuid.UUID] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source_node_id: Mapped[uuid.UUID] = mapped_column(String(36), nullable=False, index=True)
    target_node_id: Mapped[uuid.UUID] = mapped_column(String(36), nullable=False, index=True)
    relation_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    confidence_score: Mapped[float] = mapped_column(Integer, nullable=False, default=0)
    metadata: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    source_document_id: Mapped[uuid.UUID | None] = mapped_column(String(36), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class IdentityScoreSnapshot(Base):
    __tablename__ = "identity_score_snapshots"

    id: Mapped[uuid.UUID] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    overall_score: Mapped[float] = mapped_column(Integer, nullable=False, default=0)
    component_scores: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    radar_chart_data: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)
    recommendations: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    weak_areas: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    improvement_suggestions: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    career_readiness: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)


async def init_db() -> None:
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
"@

Write-File "src/routers/documents.py" @"
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.models import SessionLocal

router = APIRouter(prefix="/api/documents", tags=["documents"])


async def get_db():
    async with SessionLocal() as session:
        yield session


async def get_current_user():
    return {"id": "local-user", "role": "admin"}
"@

Write-File "src/services/error_handling.py" @"
from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

class AuthorizationError(Exception):
    pass


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AuthorizationError)
    async def authorization_error_handler(request: Request, exc: AuthorizationError):
        return JSONResponse(status_code=403, content={"detail": str(exc)})

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(status_code=422, content={"detail": exc.errors()})
"@

Write-File "src/schemas/chat.py" @"
from __future__ import annotations

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1)
    conversation_id: str | None = None
    stream: bool = False


class ChatResponse(BaseModel):
    answer: str
    conversation_id: str
    citations: list[dict] = Field(default_factory=list)
    confidence_score: float
    hallucination_risk: float
    source_links: list[str] = Field(default_factory=list)
    grounded: bool
    mode: str = "rag"
"@

Write-File "src/services/chat_memory.py" @"
from __future__ import annotations

from typing import Any


class ConversationMemoryService:
    def __init__(self, max_messages: int = 12) -> None:
        self._store: dict[str, list[dict[str, Any]]] = {}
        self._max_messages = max_messages

    def append_message(self, conversation_id: str, role: str, content: str, metadata: dict[str, Any] | None = None) -> None:
        if not conversation_id:
            return
        history = self._store.setdefault(conversation_id, [])
        history.append({"role": role, "content": content, "metadata": metadata or {}})
        if len(history) > self._max_messages:
            self._store[conversation_id] = history[-self._max_messages:]

    def get_history(self, conversation_id: str) -> list[dict[str, Any]]:
        if not conversation_id:
            return []
        return list(self._store.get(conversation_id, []))
"@

Write-File "src/services/knowledge_graph.py" @"
from __future__ import annotations

from typing import Any

class KnowledgeGraphService:
    async def build_for_document(self, db: Any, document: Any) -> dict[str, int]:
        return {"nodes_created": 0, "edges_created": 0}

    async def build_for_documents(self, db: Any, current_user: dict[str, Any]) -> dict[str, int]:
        return {"nodes_created": 0, "edges_created": 0}

    async def list_nodes(self, db: Any, **kwargs: Any) -> dict[str, Any]:
        return {"items": [], "page": 1, "page_size": 20, "total": 0}

    async def list_edges(self, db: Any, **kwargs: Any) -> dict[str, Any]:
        return {"items": [], "page": 1, "page_size": 20, "total": 0}

    async def search_nodes(self, db: Any, **kwargs: Any) -> dict[str, Any]:
        return {"items": [], "page": 1, "page_size": 20, "total": 0}

    async def query_node(self, db: Any, **kwargs: Any) -> dict[str, Any]:
        return {"node": None, "neighbors": []}
"@

Write-File "src/services/search.py" @"
from __future__ import annotations

from typing import Any


class SearchService:
    async def search_documents(self, **kwargs: Any) -> dict[str, Any]:
        return {"items": [], "total": 0}
"@

Write-File "src/services/rag_chat.py" @"
from __future__ import annotations

from typing import Any

from src.services.chat_memory import ConversationMemoryService
from src.services.search import SearchService

class RAGChatService:
    def __init__(self) -> None:
        self.memory_service = ConversationMemoryService()
        self.search_service = SearchService()

    async def ask(self, *, question: str, current_user: dict[str, Any], db: Any, conversation_id: str | None = None) -> dict[str, Any]:
        conversation_id = conversation_id or "default"
        self.memory_service.append_message(conversation_id, "user", question)
        result = {
            "answer": f"Local RAG answer: I received your question: {question}",
            "conversation_id": conversation_id,
            "citations": [],
            "confidence_score": 0.8,
            "hallucination_risk": 0.2,
            "source_links": [],
            "grounded": True,
            "mode": "rag",
        }
        self.memory_service.append_message(conversation_id, "assistant", result["answer"], {"grounded": True})
        return result

    async def stream(self, *, question: str, current_user: dict[str, Any], db: Any, conversation_id: str | None = None) -> Any:
        payload = await self.ask(question=question, current_user=current_user, db=db, conversation_id=conversation_id)
        async def event_stream():
            yield f"data: {payload['answer']}\\n\\n"
        return event_stream()
"@

Write-File "src/schemas/graph.py" @"
from __future__ import annotations

from pydantic import BaseModel, Field


class GraphBuildResponse(BaseModel):
    message: str
    nodes_created: int
    edges_created: int


class GraphListResponse(BaseModel):
    items: list[dict] = Field(default_factory=list)
    page: int
    page_size: int
    total: int


class GraphQueryResponse(BaseModel):
    node: dict | None = None
    neighbors: list[dict] = Field(default_factory=list)
"@

Write-File "src/routers/graph.py" @"
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.config import settings
from src.routers.documents import get_current_user, get_db
from src.schemas.graph import GraphBuildResponse, GraphListResponse, GraphQueryResponse
from src.services.knowledge_graph import KnowledgeGraphService

router = APIRouter(prefix=f"{settings.api_prefix}/graph", tags=["graph"])
graph_service = KnowledgeGraphService()


@router.post("/build", response_model=GraphBuildResponse)
async def build_graph(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await graph_service.build_for_documents(db, current_user)
    return GraphBuildResponse(message="Knowledge graph built successfully.", nodes_created=result["nodes_created"], edges_created=result["edges_created"])


@router.get("/nodes", response_model=GraphListResponse)
async def list_nodes(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await graph_service.list_nodes(db)
    return GraphListResponse(**result)


@router.get("/query", response_model=GraphQueryResponse)
async def query_graph(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await graph_service.query_node(db)
    return GraphQueryResponse(**result)
"@

Write-File "src/schemas/identity_score.py" @"
from __future__ import annotations

from pydantic import BaseModel, Field


class IdentityScoreDashboardResponse(BaseModel):
    owner_id: str
    overall_score: float
    component_scores: dict = Field(default_factory=dict)
    radar_chart_data: list[dict] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    weak_areas: list[str] = Field(default_factory=list)
    improvement_suggestions: list[str] = Field(default_factory=list)
    career_readiness: dict = Field(default_factory=dict)
    created_at: str | None = None
    history_count: int = 0
"@

Write-File "src/services/identity_score.py" @"
from __future__ import annotations

from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models import Document, IdentityScoreSnapshot


class IdentityScoreService:
    async def compute_for_user(self, *, db: AsyncSession, current_user: dict[str, Any], owner_id: str | None = None) -> dict[str, Any]:
        target_owner_id = owner_id or current_user.get("id", "")
        query = select(Document).where(Document.owner_id == target_owner_id)
        rows = (await db.execute(query)).scalars().all()

        component_scores = {
            "Projects": 70,
            "Skills": 72,
            "Experience": 68,
            "Achievements": 74,
            "Certificates": 65,
        }

        overall_score = round(sum(component_scores.values()) / len(component_scores), 2)

        snapshot = IdentityScoreSnapshot(
            owner_id=target_owner_id,
            overall_score=overall_score,
            component_scores=component_scores,
            radar_chart_data=[{"axis": key, "value": value} for key, value in component_scores.items()],
            recommendations=["Add more projects", "Highlight skills", "Upload certificates"],
            weak_areas=["Certificates"],
            improvement_suggestions=["Add more evidence of work"],
            career_readiness={"score": overall_score, "status": "developing"},
        )
        db.add(snapshot)
        await db.commit()
        await db.refresh(snapshot)

        return {
            "owner_id": snapshot.owner_id,
            "overall_score": snapshot.overall_score,
            "component_scores": snapshot.component_scores,
            "radar_chart_data": snapshot.radar_chart_data,
            "recommendations": snapshot.recommendations,
            "weak_areas": snapshot.weak_areas,
            "improvement_suggestions": snapshot.improvement_suggestions,
            "career_readiness": snapshot.career_readiness,
            "created_at": snapshot.created_at.isoformat(),
            "history_count": 1,
        }

    async def get_latest_snapshot(self, *, db: AsyncSession, current_user: dict[str, Any], owner_id: str | None = None) -> dict[str, Any]:
        target_owner_id = owner_id or current_user.get("id", "")
        result = await db.execute(select(IdentityScoreSnapshot).where(IdentityScoreSnapshot.owner_id == target_owner_id).order_by(IdentityScoreSnapshot.created_at.desc()).limit(1))
        snapshot = result.scalar_one_or_none()
        if not snapshot:
            return {}
        return {
            "owner_id": snapshot.owner_id,
            "overall_score": snapshot.overall_score,
            "component_scores": snapshot.component_scores,
            "radar_chart_data": snapshot.radar_chart_data,
            "recommendations": snapshot.recommendations,
            "weak_areas": snapshot.weak_areas,
            "improvement_suggestions": snapshot.improvement_suggestions,
            "career_readiness": snapshot.career_readiness,
            "created_at": snapshot.created_at.isoformat(),
            "history_count": 1,
        }
"@

Write-File "src/routers/identity_score.py" @"
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.config import settings
from src.routers.documents import get_current_user, get_db
from src.schemas.identity_score import IdentityScoreDashboardResponse
from src.services.identity_score import IdentityScoreService

router = APIRouter(prefix=f"{settings.api_prefix}/identity-score", tags=["identity-score"])
identity_score_service = IdentityScoreService()


@router.post("/refresh", response_model=IdentityScoreDashboardResponse)
async def refresh_identity_score(
    owner_id: str | None = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    payload = await identity_score_service.compute_for_user(db=db, current_user=current_user, owner_id=owner_id)
    return IdentityScoreDashboardResponse(**payload)


@router.get("/dashboard", response_model=IdentityScoreDashboardResponse)
async def get_identity_score_dashboard(
    owner_id: str | None = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    payload = await identity_score_service.get_latest_snapshot(db=db, current_user=current_user, owner_id=owner_id)
    if not payload:
        payload = await identity_score_service.compute_for_user(db=db, current_user=current_user, owner_id=owner_id)
    return IdentityScoreDashboardResponse(**payload)
"@

Write-File "src/services/background_processing.py" @"
from __future__ import annotations

class BackgroundProcessingService:
    async def process(self, *args, **kwargs) -> None:
        return None
"@

Write-File "src/routers/chat.py" @"
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from src.config import settings
from src.routers.documents import get_current_user, get_db
from src.schemas.chat import ChatRequest, ChatResponse
from src.services.rag_chat import RAGChatService

router = APIRouter(prefix=f"{settings.api_prefix}/chat", tags=["chat"])
rag_chat_service = RAGChatService()


@router.post("/ask", response_model=ChatResponse)
async def ask_chat(
    payload: ChatRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not payload.question.strip():
        raise HTTPException(status_code=400, detail="Question is required")

    result = await rag_chat_service.ask(question=payload.question, current_user=current_user, db=db, conversation_id=payload.conversation_id)
    return ChatResponse(**result)
"@

Write-File "src/main.py" @"
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
"@

Write-File "components/AIChatPanel.tsx" @"
"use client";

import { useState } from "react";

export function AIChatPanel() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setAnswer("");

    const response = await fetch("http://localhost:8000/api/chat/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });

    const payload = await response.json();
    setAnswer(payload.answer);
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 20 }}>
      <h2>AI Chat</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask something"
          style={{ width: "100%", padding: 10 }}
        />
        <button type="submit" disabled={loading} style={{ marginTop: 10, padding: "10px 16px" }}>
          {loading ? "Loading..." : "Send"}
        </button>
      </form>
      <div style={{ marginTop: 20, whiteSpace: "pre-wrap" }}>{answer}</div>
    </div>
  );
}
"@

Write-File "app/chat/page.tsx" @"
import { AIChatPanel } from "../../components/AIChatPanel";

export default function ChatPage() {
  return <AIChatPanel />;
}
"@

Write-File "README.md" @"
# Digital Identity System

## Run backend
pip install fastapi uvicorn sqlalchemy aiosqlite pydantic openai

uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

## Run frontend
npm install
npm run dev
"@

Write-Host "Files created successfully."
