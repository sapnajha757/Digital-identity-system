"""
Timeline endpoint — returns the user's chronological journey,
built from timeline_events (populated during Module 4).
"""
import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import CurrentUser, current_user
from db.postgres import get_db
from models.document import TimelineEvent, User
from schemas.document import TimelineEventOut

router = APIRouter(prefix="/timeline", tags=["timeline"])


@router.get("", response_model=list[TimelineEventOut])
async def get_timeline(
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(current_user),
):
    result = await db.execute(select(User).where(User.auth_id == uuid.UUID(user.auth_id)))
    db_user = result.scalar_one_or_none()
    if db_user is None:
        return []

    events = await db.execute(
        select(TimelineEvent)
        .where(TimelineEvent.user_id == db_user.id)
        .order_by(TimelineEvent.event_date.desc())
    )
    return events.scalars().all()
