from datetime import datetime, timezone
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import CurrentUser, current_user
from db.postgres import get_db
from models.document import User
from schemas.document import InsightsResponse
from services.insights.engine import generate_insights

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("", response_model=InsightsResponse)
async def get_insights(
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(current_user),
):
    result = await db.execute(select(User).where(User.auth_id == uuid.UUID(user.auth_id)))
    db_user = result.scalar_one_or_none()
    if db_user is None:
        # Fallback to Supabase auth_id
        insights = generate_insights(user.auth_id)
    else:
        insights = generate_insights(str(db_user.id))
        
    return InsightsResponse(
        insights=insights,
        updated_at=datetime.now(timezone.utc)
    )

