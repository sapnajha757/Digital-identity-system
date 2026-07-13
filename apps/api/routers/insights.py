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
from routers.documents import get_or_create_user

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("", response_model=InsightsResponse)
async def get_insights(
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(current_user),
):
    db_user = await get_or_create_user(db, user)
    insights = await generate_insights(db, str(db_user.id))
        
    return InsightsResponse(
        insights=insights,
        updated_at=datetime.now(timezone.utc)
    )

