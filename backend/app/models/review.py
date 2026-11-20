from datetime import datetime
from typing import Optional
from sqlalchemy import CheckConstraint, Column, DateTime, UniqueConstraint, func
from sqlmodel import Field, SQLModel

class Review(SQLModel, table=True):
    __tablename__ = "reviews"
    __table_args__ = (
        UniqueConstraint("session_id", "author_id", name="uq_review_per_author"),
        CheckConstraint("rating BETWEEN 1 AND 5", name="ck_review_rating"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="sessions.id", nullable=False)
    author_id: int = Field(foreign_key="users.id", nullable=False)
    # Stored rather than derived, so a profile's reviews are one indexed lookup.
    subject_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    rating: int = Field(nullable=False)
    comment: str = Field(default="", nullable=False)
    created_at: datetime = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False))
