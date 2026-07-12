import uuid
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import CurrentUser, current_user
from db.postgres import get_db
from models.document import User
from schemas.document import DashboardMetricsResponse
from services.insights.dashboard import get_dashboard_metrics

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/metrics", response_model=DashboardMetricsResponse)
async def get_dashboard_data(
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(current_user),
):
    result = await db.execute(select(User).where(User.auth_id == uuid.UUID(user.auth_id)))
    db_user = result.scalar_one_or_none()
    if db_user is None:
        # Fallback to empty metrics query
        return get_dashboard_metrics(user.auth_id)
    return get_dashboard_metrics(str(db_user.id))

