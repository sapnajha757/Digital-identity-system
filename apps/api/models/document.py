"""
SQLAlchemy models mirroring apps/api/db/schema.sql.
Kept as thin data classes — business logic lives in services/, not here.
"""
import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, CheckConstraint, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    auth_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    hashed_password: Mapped[str | None] = mapped_column(String, nullable=True)
    full_name: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, onupdate=datetime.utcnow, default=datetime.utcnow)

    documents: Mapped[list["Document"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"
    __table_args__ = (
        CheckConstraint("file_type in ('pdf','docx','image','link')", name="ck_documents_file_type"),
        CheckConstraint(
            "status in ('pending','processing','completed','failed')", name="ck_documents_status"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    original_filename: Mapped[str] = mapped_column(String, nullable=False)
    file_type: Mapped[str] = mapped_column(String, nullable=False)
    storage_path: Mapped[str] = mapped_column(String, nullable=False)
    file_size_bytes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False, default="pending")
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    processed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship(back_populates="documents")
    metadata_: Mapped["DocumentMetadata | None"] = relationship(
        back_populates="document", uselist=False, cascade="all, delete-orphan"
    )


class DocumentMetadata(Base):
    __tablename__ = "document_metadata"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), unique=True
    )
    extracted_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    ocr_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    page_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    language: Mapped[str] = mapped_column(String, default="en")
    ai_summary: Mapped[str | None] = mapped_column(Text, nullable=True)

    document: Mapped["Document"] = relationship(back_populates="metadata_")


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)


class DocumentCategory(Base):
    __tablename__ = "document_categories"

    document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), primary_key=True
    )
    category_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("categories.id"), primary_key=True
    )
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)


class Entity(Base):
    __tablename__ = "entities"
    __table_args__ = (
        CheckConstraint(
            "entity_type in ('skill','technology','organization','date','role')",
            name="ck_entities_type",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"))
    entity_type: Mapped[str] = mapped_column(String, nullable=False)
    entity_value: Mapped[str] = mapped_column(String, nullable=False)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)


class EmbeddingChunk(Base):
    __tablename__ = "embedding_chunks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"))
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    chunk_text: Mapped[str] = mapped_column(Text, nullable=False)
    qdrant_point_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    document_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True
    )
    event_date: Mapped[date] = mapped_column(Date, nullable=False)
    event_type: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    date_inferred: Mapped[bool] = mapped_column(Boolean, default=False)


# ─── V2 Intelligence Engine Models ────────────────────────────────────────────

class AIMemory(Base):
    """Persistent AI memory per user — stores conversation history, dismissed/accepted items."""
    __tablename__ = "ai_memory"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    conversation_history: Mapped[list | None] = mapped_column(JSONB, nullable=True, default=list)
    dismissed_recommendation_ids: Mapped[list | None] = mapped_column(JSONB, nullable=True, default=list)
    accepted_recommendation_ids: Mapped[list | None] = mapped_column(JSONB, nullable=True, default=list)
    user_corrections: Mapped[list | None] = mapped_column(JSONB, nullable=True, default=list)
    last_advice_hashes: Mapped[list | None] = mapped_column(JSONB, nullable=True, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)


class AIRecommendation(Base):
    """Personalized AI recommendations grounded in user's documents and knowledge graph."""
    __tablename__ = "ai_recommendations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    category: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    why_it_matters: Mapped[str] = mapped_column(Text, nullable=False)
    expected_impact: Mapped[str] = mapped_column(String, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.8)
    supporting_documents: Mapped[list | None] = mapped_column(JSONB, nullable=True, default=list)
    knowledge_graph_evidence: Mapped[str | None] = mapped_column(Text, nullable=True)
    timeline_references: Mapped[list | None] = mapped_column(JSONB, nullable=True, default=list)
    status: Mapped[str] = mapped_column(String, default="active")  # active, accepted, dismissed
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class AINotification(Base):
    """Proactive AI notifications generated without user prompts."""
    __tablename__ = "ai_notifications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    category: Mapped[str] = mapped_column(String, nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    evidence: Mapped[str | None] = mapped_column(Text, nullable=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.85)
    suggested_action: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    is_dismissed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class CareerPlan(Base):
    """Dynamic career roadmaps generated for the user."""
    __tablename__ = "career_plans"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    plan_type: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    milestones: Mapped[list | None] = mapped_column(JSONB, nullable=True, default=list)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    profile_snapshot_hash: Mapped[str | None] = mapped_column(String, nullable=True)


class CareerSimulation(Base):
    """Career path simulation results."""
    __tablename__ = "career_simulations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    target_role: Mapped[str] = mapped_column(String, nullable=False)
    missing_skills: Mapped[list | None] = mapped_column(JSONB, nullable=True, default=list)
    required_projects: Mapped[list | None] = mapped_column(JSONB, nullable=True, default=list)
    timeline_months: Mapped[int] = mapped_column(Integer, default=6)
    probability_of_success: Mapped[float] = mapped_column(Float, default=0.5)
    salary_estimate_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    salary_estimate_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    learning_order: Mapped[list | None] = mapped_column(JSONB, nullable=True, default=list)
    risk_factors: Mapped[list | None] = mapped_column(JSONB, nullable=True, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
