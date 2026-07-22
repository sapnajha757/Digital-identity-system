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