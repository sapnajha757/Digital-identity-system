"""
Local Authentication Security Helpers and Dependencies.
"""
import uuid
import jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta

from core.config import get_settings
from db.postgres import get_db
from models.document import User

bearer_scheme = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    pw_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pw_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pw_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pw_bytes, hashed_bytes)
    except Exception:
        return False

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    settings = get_settings()
    return jwt.encode(to_encode, settings.jwt_secret, algorithm="HS256")

class CurrentUser:
    def __init__(self, auth_id: str, email: str | None):
        self.auth_id = auth_id
        self.email = email

async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> CurrentUser:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization token",
        )

    settings = get_settings()
    try:
        # For Supabase integration in local dev, we decode without signature verification
        payload = jwt.decode(
            credentials.credentials,
            options={"verify_signature": False, "verify_aud": False},
        )
    except jwt.PyJWTError as exc:
        print(f"[DEBUG AUTH ERROR] JWT decoding failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    auth_id = payload.get("sub")
    if not auth_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject claim",
        )

    # Load user from PostgreSQL
    result = await db.execute(select(User).where(User.auth_id == uuid.UUID(auth_id)))
    db_user = result.scalar_one_or_none()
    
    if db_user is None:
        # Auto-provision Supabase users in local PostgreSQL DB on first access
        email = payload.get("email") or f"{auth_id}@supabase.user"
        db_user = User(auth_id=uuid.UUID(auth_id), email=email)
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)

    return CurrentUser(auth_id=str(db_user.auth_id), email=db_user.email)

# Alias current_user to get_current_user to avoid changing other routers
current_user = get_current_user