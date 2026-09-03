from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models.user import UserRole

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    type: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: Optional[UserRole] = UserRole.DEVELOPER

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str]
    role: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
