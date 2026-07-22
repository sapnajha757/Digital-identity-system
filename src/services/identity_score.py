from __future__ import annotations

from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models import Document, IdentityScoreSnapshot


class IdentityScoreService:
    async def compute_for_user(self, *, db: AsyncSession, current_user: dict[str, Any], owner_id: str | None = None) -> dict[str, Any]:
        target_owner_id = owner_id or current_user.get("id", "")
        query = select(Document).where(Document.owner_id == target_owner_id)
        rows = (await db.execute(query)).scalars().all()

        component_scores = {
            "Projects": 70,
            "Skills": 72,
            "Experience": 68,
            "Achievements": 74,
            "Certificates": 65,
        }

        overall_score = round(sum(component_scores.values()) / len(component_scores), 2)

        snapshot = IdentityScoreSnapshot(
            owner_id=target_owner_id,
            overall_score=overall_score,
            component_scores=component_scores,
            radar_chart_data=[{"axis": key, "value": value} for key, value in component_scores.items()],
            recommendations=["Add more projects", "Highlight skills", "Upload certificates"],
            weak_areas=["Certificates"],
            improvement_suggestions=["Add more evidence of work"],
            career_readiness={"score": overall_score, "status": "developing"},
        )
        db.add(snapshot)
        await db.commit()
        await db.refresh(snapshot)

        return {
            "owner_id": snapshot.owner_id,
            "overall_score": snapshot.overall_score,
            "component_scores": snapshot.component_scores,
            "radar_chart_data": snapshot.radar_chart_data,
            "recommendations": snapshot.recommendations,
            "weak_areas": snapshot.weak_areas,
            "improvement_suggestions": snapshot.improvement_suggestions,
            "career_readiness": snapshot.career_readiness,
            "created_at": snapshot.created_at.isoformat(),
            "history_count": 1,
        }

    async def get_latest_snapshot(self, *, db: AsyncSession, current_user: dict[str, Any], owner_id: str | None = None) -> dict[str, Any]:
        target_owner_id = owner_id or current_user.get("id", "")
        result = await db.execute(select(IdentityScoreSnapshot).where(IdentityScoreSnapshot.owner_id == target_owner_id).order_by(IdentityScoreSnapshot.created_at.desc()).limit(1))
        snapshot = result.scalar_one_or_none()
        if not snapshot:
            return {}
        return {
            "owner_id": snapshot.owner_id,
            "overall_score": snapshot.overall_score,
            "component_scores": snapshot.component_scores,
            "radar_chart_data": snapshot.radar_chart_data,
            "recommendations": snapshot.recommendations,
            "weak_areas": snapshot.weak_areas,
            "improvement_suggestions": snapshot.improvement_suggestions,
            "career_readiness": snapshot.career_readiness,
            "created_at": snapshot.created_at.isoformat(),
            "history_count": 1,
        }