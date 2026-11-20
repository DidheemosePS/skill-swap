from datetime import datetime
from enum import Enum
from typing import List, Optional
from sqlalchemy import Column, DateTime, func
from sqlmodel import Field, Relationship, SQLModel, UniqueConstraint

class UserRole(str, Enum):
    MEMBER = "member"
    ADMIN = "admin"

class AuthProvider(str, Enum):
    GOOGLE = "google"
    GITHUB = "github"

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(nullable=False)
    avatar_url: Optional[str] = Field(default=None)
    headline: Optional[str] = Field(default=None)
    bio: Optional[str] = Field(default=None)
    is_onboarded: bool = Field(default=False)
    timezone: str = Field(default="UTC", nullable=False)
    role: UserRole = Field(default=UserRole.MEMBER, nullable=False)
    last_active_at: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=True))
    created_at: datetime = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False))

    # Relationships
    auth_accounts: List["AuthAccount"] = Relationship(back_populates="user", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    auth_sessions: List["AuthSession"] = Relationship(back_populates="user", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

class AuthAccount(SQLModel, table=True):
    __tablename__ = "auth_accounts"
    __table_args__ = (
        UniqueConstraint("provider", "provider_account_id", name="uq_provider_account_id"),
        UniqueConstraint("user_id", "provider", name="uq_user_provider"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    provider: AuthProvider = Field(nullable=False)
    provider_account_id: str = Field(nullable=False)
    username: str = Field(nullable=False)
    url: Optional[str] = Field(default=None)
    # Off by default: a Google username is the member's email, which must never be public unless they opt in.
    show_on_profile: bool = Field(default=False)

    user: User = Relationship(back_populates="auth_accounts")

# One row per issued refresh token; token_hash is the token's jti.
class AuthSession(SQLModel, table=True):
    __tablename__ = "auth_sessions"

    token_hash: str = Field(primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    created_at: datetime = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False))
    expires_at: datetime = Field(nullable=False, sa_type=DateTime(timezone=True))
    revoked_at: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=True))

    user: User = Relationship(back_populates="auth_sessions")
