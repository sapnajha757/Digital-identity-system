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

    import base64
    settings = get_settings()
    payload = None
    exceptions = []

    # Attempt 1: Decode using the raw secret string
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except jwt.PyJWTError as exc:
        exceptions.append(f"Raw secret decoding failed: {exc}")

    # Attempt 2: Decode using base64-decoded secret bytes (common for Supabase JWT secret)
    if payload is None:
        try:
            # Add padding if needed
            secret_str = settings.supabase_jwt_secret
            padded_secret = secret_str + "=" * ((4 - len(secret_str) % 4) % 4)
            decoded_secret = base64.b64decode(padded_secret)
            payload = jwt.decode(
                credentials.credentials,
                decoded_secret,
                algorithms=["HS256"],
                audience="authenticated",
            )
        except Exception as exc:
            exceptions.append(f"Base64-decoded secret decoding failed: {exc}")

    if payload is None:
        print(f"[DEBUG AUTH ERROR] JWT decoding failed. Errors: {exceptions}")
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

    return CurrentUser(auth_id=auth_id, email=payload.get("email"))