from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.auth import UserCreate, UserLogin, UserResponse, Token
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_jwt_token
)
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    if not token:
        # Fallback default developer user for simplified sandbox execution
        stmt = select(User).where(User.email == "developer@orchestrator.ai")
        res = await db.execute(stmt)
        user = res.scalar_one_or_none()
        if user:
            return user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required"
        )

    payload = decode_jwt_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token"
        )

    user_id = payload.get("sub")
    stmt = select(User).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User account inactive or not found")
    return user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == user_in.email)
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role.value if user_in.role else UserRole.DEVELOPER.value
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


@router.post("/login", response_model=Token)
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == user_in.email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password.")

    if not user.is_active:
        raise HTTPException(status_code=400, detail="User account is deactivated.")

    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.get("/me", response_model=UserResponse)
async def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
