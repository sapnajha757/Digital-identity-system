"""
Document upload and retrieval endpoints.
Upload stores the file in Supabase Storage and hands off to the Module 1
ingestion pipeline (services/ingestion/pipeline.py) as a background task.
"""
import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import CurrentUser, current_user
from db.postgres import get_db
from models.document import Document, User
from schemas.document import DocumentOut, DocumentUploadResponse
from services.ingestion import pipeline
from services.ingestion.storage import upload_file

router = APIRouter(prefix="/documents", tags=["documents"])

ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "image/png": "image",
    "image/jpeg": "image",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
}


async def _get_or_create_user(db: AsyncSession, user: CurrentUser) -> User:
    result = await db.execute(select(User).where(User.auth_id == user.auth_id))
    db_user = result.scalar_one_or_none()
    if db_user is None:
        db_user = User(auth_id=uuid.UUID(user.auth_id), email=user.email or f"{user.auth_id}@unknown.local")
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
    return db_user


@router.post("/upload", response_model=DocumentUploadResponse, status_code=201)
async def upload_document(
    file: UploadFile,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(current_user),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")

    db_user = await _get_or_create_user(db, user)

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    # Unique path per upload avoids collisions when a user uploads two
    # files with the same original name.
    storage_path = f"{db_user.id}/{uuid.uuid4()}-{file.filename}"
    upload_file(file_bytes, storage_path, file.content_type)

    document = Document(
        user_id=db_user.id,
        original_filename=file.filename,
        file_type=ALLOWED_TYPES[file.content_type],
        storage_path=storage_path,
        file_size_bytes=len(file_bytes),
        status="pending",
    )
    db.add(document)
    await db.commit()
    await db.refresh(document)

    background_tasks.add_task(pipeline.run, document.id)

    return DocumentUploadResponse(document_id=document.id, status=document.status)


@router.get("/{document_id}/status", response_model=DocumentOut)
async def get_document_status(
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(current_user),
):
    result = await db.execute(select(Document).where(Document.id == document_id))
    document = result.scalar_one_or_none()
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return document


@router.get("", response_model=list[DocumentOut])
async def list_documents(
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(current_user),
):
    db_user = await _get_or_create_user(db, user)
    result = await db.execute(
        select(Document).where(Document.user_id == db_user.id).order_by(Document.uploaded_at.desc())
    )
    return result.scalars().all()
