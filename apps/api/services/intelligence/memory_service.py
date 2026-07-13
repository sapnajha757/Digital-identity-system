"""
Persistent AI Memory Service — Module 1.
Stores conversation history, dismissed/accepted recommendations, user corrections.
Ensures the AI never repeats identical advice.
"""
import logging
import uuid
import hashlib
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models.document import AIMemory, AIRecommendation, AINotification

logger = logging.getLogger(__name__)


async def get_or_create_memory(db: AsyncSession, user_id: uuid.UUID) -> AIMemory:
    """Retrieve or initialize the AI memory record for a user."""
    stmt = select(AIMemory).where(AIMemory.user_id == user_id)
    result = await db.execute(stmt)
    memory = result.scalar_one_or_none()
    if memory is None:
        memory = AIMemory(
            user_id=user_id,
            conversation_history=[],
            dismissed_recommendation_ids=[],
            accepted_recommendation_ids=[],
            user_corrections=[],
            last_advice_hashes=[]
        )
        db.add(memory)
        await db.commit()
        await db.refresh(memory)
    return memory


async def record_conversation(db: AsyncSession, user_id: uuid.UUID, query: str, answer: str) -> None:
    """Store a conversation turn in persistent memory."""
    try:
        memory = await get_or_create_memory(db, user_id)
        history = list(memory.conversation_history or [])
        history.append({
            "query": query,
            "answer": answer[:500],
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        memory.conversation_history = history[-50:]
        await db.commit()
    except Exception as e:
        logger.error(f"Failed to record conversation: {e}")


async def dismiss_item(db: AsyncSession, user_id: uuid.UUID, item_type: str, item_id: str) -> bool:
    """Mark a recommendation or notification as dismissed."""
    try:
        if item_type == "recommendation":
            stmt = select(AIRecommendation).where(
                AIRecommendation.id == uuid.UUID(item_id),
                AIRecommendation.user_id == user_id
            )
            result = await db.execute(stmt)
            item = result.scalar_one_or_none()
            if item:
                item.status = "dismissed"
                memory = await get_or_create_memory(db, user_id)
                dismissed = list(memory.dismissed_recommendation_ids or [])
                if item_id not in dismissed:
                    dismissed.append(item_id)
                memory.dismissed_recommendation_ids = dismissed
                await db.commit()
                return True
        elif item_type == "notification":
            stmt = select(AINotification).where(
                AINotification.id == uuid.UUID(item_id),
                AINotification.user_id == user_id
            )
            result = await db.execute(stmt)
            notif = result.scalar_one_or_none()
            if notif:
                notif.is_dismissed = True
                await db.commit()
                return True
    except Exception as e:
        logger.error(f"Failed to dismiss item: {e}")
    return False


async def accept_item(db: AsyncSession, user_id: uuid.UUID, item_type: str, item_id: str) -> bool:
    """Mark a recommendation as accepted or a notification as read."""
    try:
        if item_type == "recommendation":
            stmt = select(AIRecommendation).where(
                AIRecommendation.id == uuid.UUID(item_id),
                AIRecommendation.user_id == user_id
            )
            result = await db.execute(stmt)
            item = result.scalar_one_or_none()
            if item:
                item.status = "accepted"
                memory = await get_or_create_memory(db, user_id)
                accepted = list(memory.accepted_recommendation_ids or [])
                if item_id not in accepted:
                    accepted.append(item_id)
                memory.accepted_recommendation_ids = accepted
                await db.commit()
                return True
        elif item_type == "notification":
            stmt = select(AINotification).where(
                AINotification.id == uuid.UUID(item_id),
                AINotification.user_id == user_id
            )
            result = await db.execute(stmt)
            notif = result.scalar_one_or_none()
            if notif:
                notif.is_read = True
                await db.commit()
                return True
    except Exception as e:
        logger.error(f"Failed to accept item: {e}")
    return False


def compute_advice_hash(title: str, description: str) -> str:
    """Compute a stable hash to detect duplicate advice across sessions."""
    combined = f"{title.lower().strip()}{description.lower().strip()[:100]}"
    return hashlib.md5(combined.encode()).hexdigest()


async def is_duplicate_advice(db: AsyncSession, user_id: uuid.UUID, title: str, description: str) -> bool:
    """Return True if this advice was already delivered to the user."""
    try:
        memory = await get_or_create_memory(db, user_id)
        h = compute_advice_hash(title, description)
        return h in (memory.last_advice_hashes or [])
    except Exception:
        return False


async def record_advice_hash(db: AsyncSession, user_id: uuid.UUID, title: str, description: str) -> None:
    """Record that this advice was delivered so it will not repeat."""
    try:
        memory = await get_or_create_memory(db, user_id)
        h = compute_advice_hash(title, description)
        hashes = list(memory.last_advice_hashes or [])
        if h not in hashes:
            hashes.append(h)
        memory.last_advice_hashes = hashes[-200:]
        await db.commit()
    except Exception as e:
        logger.error(f"Failed to record advice hash: {e}")
