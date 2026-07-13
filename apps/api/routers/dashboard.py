import uuid
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import CurrentUser, current_user
from db.postgres import get_db
from models.document import User
from schemas.document import DashboardMetricsResponse
from services.insights.dashboard import get_dashboard_metrics
from routers.documents import get_or_create_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/metrics", response_model=DashboardMetricsResponse)
async def get_dashboard_data(
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(current_user),
):
    db_user = await get_or_create_user(db, user)
    return await get_dashboard_metrics(db, str(db_user.id))

