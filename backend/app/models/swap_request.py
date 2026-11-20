from datetime import datetime
from enum import Enum
from typing import Optional
from sqlalchemy import CheckConstraint, Column, DateTime, UniqueConstraint, func
from sqlmodel import Field, SQLModel

class SwapType(str, Enum):
    ONE_WAY = "one_way"
    TWO_WAY = "two_way"

class SwapRequestStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    DECLINED = "declined"
    CANCELLED = "cancelled"
    EXPIRED = "expired"

# Holds who, what and when for a swap. Its Session (sessions.swap_request_id) holds only how it went.
class SwapRequest(SQLModel, table=True):
    __tablename__ = "swap_requests"
    __table_args__ = (
        CheckConstraint(
            "(swap_type = 'TWO_WAY' AND return_skill_id IS NOT NULL) OR "
            "(swap_type = 'ONE_WAY' AND return_skill_id IS NULL)",
            name="ck_swap_request_return_skill"
        ),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", nullable=False, index=True)
    swap_type: SwapType = Field(nullable=False)
    # The requester always learns skill_id from the recipient, so the recipient is the teacher and the
    # requester the learner (POST /swap-requests has no direction field). The API derives teacher/learner from these.
    requester_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    recipient_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    skill_id: int = Field(foreign_key="skills.id", nullable=False)
    # Two-way only: what the requester teaches back.
    return_skill_id: Optional[int] = Field(default=None, foreign_key="skills.id", nullable=True)
    note: Optional[str] = Field(default=None, max_length=200, nullable=True)
    counter_note: Optional[str] = Field(default=None, max_length=200, nullable=True)
    last_proposed_by: int = Field(foreign_key="users.id", nullable=False)
    status: SwapRequestStatus = Field(default=SwapRequestStatus.PENDING, nullable=False)
    confirmed_starts_at: Optional[datetime] = Field(default=None, nullable=True, sa_type=DateTime(timezone=True))
    # Who withdrew, declined or called off the session, so the chat can say "you" or "they".
    cancelled_by: Optional[int] = Field(default=None, foreign_key="users.id", nullable=True)
    cancel_reason: Optional[str] = Field(default=None, nullable=True)
    cancelled_at: Optional[datetime] = Field(default=None, nullable=True, sa_type=DateTime(timezone=True))
    # A booked session called off without new times less than 2 hours before the start. It moves a
    # learner's credit to the teacher and counts as one absence for is_reliable. The API returns it as cancellation.late.
    is_late_cancel: bool = Field(default=False, nullable=False)
    has_alternatives: bool = Field(default=False, nullable=False)
    expires_at: Optional[datetime] = Field(default=None, index=True, sa_type=DateTime(timezone=True))
    created_at: datetime = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False))
    updated_at: datetime = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False))

class SwapRequestSlot(SQLModel, table=True):
    __tablename__ = "swap_request_slots"
    __table_args__ = (
        UniqueConstraint("swap_request_id", "starts_at", name="uq_swap_request_slot_time"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    swap_request_id: int = Field(foreign_key="swap_requests.id", nullable=False, index=True)
    starts_at: datetime = Field(nullable=False, sa_type=DateTime(timezone=True))
