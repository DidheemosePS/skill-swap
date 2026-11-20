from enum import Enum
from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, Index, text
from sqlmodel import Field, SQLModel


class SlotHoldStatus(str, Enum):
    ON_HOLD = "on_hold"
    BOOKED = "booked"

# The three-column key is the "one row per hour" rule.
class AvailabilitySlot(SQLModel, table=True):
    __tablename__ = "availability_slots"

    user_id: int = Field(foreign_key="users.id", primary_key=True)
    weekday: int = Field(primary_key=True) # 0 to 6 (Monday to Sunday)
    start_hour: int = Field(primary_key=True) # 0 to 23

# A hold that expires or whose request is declined is deleted, so every row here blocks its hour.
class SlotHold(SQLModel, table=True):
    __tablename__ = "slot_holds"
    __table_args__ = (
        Index(
            "ix_slot_holds_mentor_active",
            "mentor_id",
            "starts_at",
            unique=True,
            postgresql_where=text("status IN ('ON_HOLD', 'BOOKED')"),
        ),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    mentor_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    holder_id: int = Field(foreign_key="users.id", nullable=False)
    starts_at: datetime = Field(nullable=False, sa_type=DateTime(timezone=True))
    status: SlotHoldStatus = Field(default=SlotHoldStatus.ON_HOLD, nullable=False)
    swap_request_id: Optional[int] = Field(default=None, foreign_key="swap_requests.id", nullable=True)
    expires_at: Optional[datetime] = Field(default=None, nullable=True, sa_type=DateTime(timezone=True))
