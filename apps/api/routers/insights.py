from datetime import datetime, timezone
import uuid
from fastapi import APIRouter, Depends

from core.security import CurrentUser, current_user
from schemas.document import InsightsResponse
from services.insights.engine import generate_insights

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("", response_model=InsightsResponse)
async def get_insights(user: CurrentUser = Depends(current_user)):
    insights = generate_insights(user.auth_id)
    return InsightsResponse(
        insights=insights,
        updated_at=datetime.now(timezone.utc)
    )
