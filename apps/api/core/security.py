"""
Verifies Supabase-issued JWTs on incoming requests.
Use `current_user` as a FastAPI dependency on any route that needs auth.
"""
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from core.config import get_settings

bearer_scheme = HTTPBearer(auto_error=False)


class CurrentUser:
    def __init__(self, auth_id: str, email: str | None):
        self.auth_id = auth_id
        self.email = email


def current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> CurrentUser:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization token",
        )

    settings = get_settings()
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from exc

    auth_id = payload.get("sub")
    if not auth_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject claim",
        )

    return CurrentUser(auth_id=auth_id, email=payload.get("email"))
"""
Verifies Supabase-issued access tokens on incoming requests.
Use `current_user` as a FastAPI dependency on any route that needs auth.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client, create_client

from core.config import get_settings

bearer_scheme = HTTPBearer(auto_error=False)

_admin_client: Client | None = None


def _get_admin_client() -> Client:
    global _admin_client
    if _admin_client is None:
        settings = get_settings()
        _admin_client = create_client(settings.supabase_url, settings.supabase_service_key)
    return _admin_client


class CurrentUser:
    def __init__(self, auth_id: str, email: str | None):
        self.auth_id = auth_id
        self.email = email


def current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> CurrentUser:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization token",
        )

    try:
        response = _get_admin_client().auth.get_user(credentials.credentials)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from exc

    user = response.user if response else None
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    return CurrentUser(auth_id=user.id, email=user.email)