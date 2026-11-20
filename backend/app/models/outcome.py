from datetime import datetime
from enum import Enum
from typing import Optional
from sqlalchemy import Column, DateTime, func
from sqlmodel import Field, SQLModel

# One row per join, from the video provider's webhooks only (the browser never reports attendance); a member
# who drops and rejoins gets two rows. Time in the meeting is summed on read.
class AttendanceRecord(SQLModel, table=True):
    __tablename__ = "attendance_records"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="sessions.id", nullable=False, index=True)
    user_id: int = Field(foreign_key="users.id", nullable=False)
    joined_at: datetime = Field(nullable=False, sa_type=DateTime(timezone=True))
    left_at: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=True))

# A concern a member raised during the 24-hour settle window. The ruling's effect lands on Session.status;
# ruled_against feeds the Reliable Swapper check.
class SessionDispute(SQLModel, table=True):
    __tablename__ = "session_disputes"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="sessions.id", nullable=False, index=True)
    raised_by: int = Field(foreign_key="users.id", nullable=False)
    reason: str = Field(max_length=200, nullable=False)
    raised_at: datetime = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False))
    resolved_at: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=True))
    # The admin who ruled; null while open.
    resolved_by: Optional[int] = Field(default=None, foreign_key="users.id")
    # The member found at fault (the absent one for a no-show); null when nobody was.
    ruled_against: Optional[int] = Field(default=None, foreign_key="users.id", index=True)
