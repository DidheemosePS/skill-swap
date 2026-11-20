from datetime import datetime
from enum import Enum
from typing import Optional
from sqlalchemy import Column, DateTime, func
from sqlmodel import Field, SQLModel

class SessionStatus(str, Enum):
    CONFIRMED = "confirmed"
    # The end time has passed. The attendance records already decide the outcome; credit moves 24 hours
    # after the end, or at once when both members confirm.
    AWAITING_SETTLEMENT = "awaiting_settlement"
    COMPLETED = "completed"
    # A member raised a concern in the 24-hour window; credit stays held until an admin decides.
    DISPUTED = "disputed"
    # One member never joined (absent_user_id says who).
    NO_SHOW_CONFIRMED = "no_show_confirmed"
    # Neither joined: any credit goes back to the learner and both are marked absent.
    MUTUAL_NO_SHOW = "mutual_no_show"
    CANCELLED = "cancelled"

# Created when a request is accepted. Who, what and when stay on the request (one source of truth);
# the session holds only the meeting and how it went. Sessions are always 60 minutes.
class Session(SQLModel, table=True):
    __tablename__ = "sessions"

    id: Optional[int] = Field(default=None, primary_key=True)
    swap_request_id: int = Field(foreign_key="swap_requests.id", unique=True, nullable=False)
    meeting_url: Optional[str] = Field(default=None)
    # The Daily room, created when the request is accepted; attendance webhooks find the session by it.
    room_name: Optional[str] = Field(default=None, unique=True)
    status: SessionStatus = Field(default=SessionStatus.CONFIRMED, nullable=False, index=True)
    # Set with no_show_confirmed: the member who wasn't there.
    absent_user_id: Optional[int] = Field(default=None, foreign_key="users.id")
    # Confirm now, one per member while awaiting_settlement; once both are set it settles at once.
    # The API returns them as confirmed_by.
    teacher_confirmed_at: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=True))
    learner_confirmed_at: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=True))
    created_at: datetime = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False))
