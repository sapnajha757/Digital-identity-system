from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.config import settings
from src.routers.documents import get_current_user, get_db
from src.schemas.identity_score import IdentityScoreDashboardResponse
from src.services.identity_score import IdentityScoreService

router = APIRouter(prefix=f"{settings.api_prefix}/identity-score", tags=["identity-score"])
identity_score_service = IdentityScoreService()


@router.post("/refresh", response_model=IdentityScoreDashboardResponse)
async def refresh_identity_score(
    owner_id: str | None = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    payload = await identity_score_service.compute_for_user(db=db, current_user=current_user, owner_id=owner_id)
    return IdentityScoreDashboardResponse(**payload)


@router.get("/dashboard", response_model=IdentityScoreDashboardResponse)
async def get_identity_score_dashboard(
    owner_id: str | None = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    payload = await identity_score_service.get_latest_snapshot(db=db, current_user=current_user, owner_id=owner_id)
    if not payload:
        payload = await identity_score_service.compute_for_user(db=db, current_user=current_user, owner_id=owner_id)
    return IdentityScoreDashboardResponse(**payload)