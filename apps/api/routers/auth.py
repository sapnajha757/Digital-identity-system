import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import (
    hash_password,
    verify_password,
    create_access_token,
    current_user,
    CurrentUser
)
from db.postgres import get_db
from models.document import User

# The router will be registered in main.py under prefix="/auth"
router = APIRouter(tags=["Authentication"])

class RegisterRequest(BaseModel):
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str | None

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: str
    user: UserResponse

async def get_or_create_demo_user(db: AsyncSession) -> User:
    demo_email = "johndoe@example.com"
    result = await db.execute(select(User).where(User.email == demo_email))
    user = result.scalar_one_or_none()
    if user is None:
        auth_id = uuid.uuid4()
        user = User(
            auth_id=auth_id,
            email=demo_email,
            hashed_password=hash_password("password123"),
            full_name="Demo User"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        if not user.hashed_password:
            user.hashed_password = hash_password("password123")
            await db.commit()
            await db.refresh(user)
    return user

@router.post("/register", response_model=AuthResponse)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Validate email (simple checks)
    if "@" not in req.email or "." not in req.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )

    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if user is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    auth_id = uuid.uuid4()
    user = User(
        auth_id=auth_id,
        email=req.email,
        hashed_password=hash_password(req.password),
        full_name=req.email.split("@")[0]
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": str(user.auth_id), "email": user.email})
    return AuthResponse(
        access_token=token,
        email=user.email,
        user=UserResponse.model_validate(user)
    )
    logger.info("New user registered with email %s", req.email)

@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    
    if user is None or not user.hashed_password or not verify_password(req.password, user.hashed_password):
        # Fallback helper for demo user if they are being accessed for the first time
        if req.email == "johndoe@example.com" and req.password == "password123":
            user = await get_or_create_demo_user(db)
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
    
    token = create_access_token({"sub": str(user.auth_id), "email": user.email})
    return AuthResponse(
        access_token=token,
        email=user.email,
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
async def get_me(user: CurrentUser = Depends(current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.auth_id == uuid.UUID(user.auth_id)))
    db_user = result.scalar_one_or_none()
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return db_user

@router.post("/logout")
async def logout():
    return {"status": "success", "message": "Logged out successfully"}
