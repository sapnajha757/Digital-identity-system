from fastapi import APIRouter, Depends
from core.security import CurrentUser, current_user
from schemas.document import DashboardMetricsResponse
from services.insights.dashboard import get_dashboard_metrics

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/metrics", response_model=DashboardMetricsResponse)
async def get_dashboard_data(user: CurrentUser = Depends(current_user)):
    return get_dashboard_metrics(user.auth_id)
