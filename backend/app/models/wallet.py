from datetime import datetime
from enum import Enum
from typing import Optional
from sqlalchemy import CheckConstraint, Column, DateTime, func
from sqlmodel import Field, SQLModel

class TransactionType(str, Enum):
    ONBOARDING_BONUS = "onboarding_bonus"
    TEACHING_REWARD = "teaching_reward"
    SESSION_BOOKING = "session_booking"
    ESCROW_REFUND = "escrow_refund"

class TransactionStatus(str, Enum):
    SETTLED = "settled"
    IN_ESCROW = "in_escrow"

# The balance, cached for a fast read and a row lock (SELECT ... FOR UPDATE) when booking.
# Always change it in the same database transaction as its ledger row.
class Wallet(SQLModel, table=True):
    __tablename__ = "wallets"
    __table_args__ = (
        CheckConstraint("credits >= 0 AND escrow_credits >= 0", name="ck_wallet_not_negative"),
    )

    user_id: int = Field(foreign_key="users.id", primary_key=True)
    credits: int = Field(default=0, nullable=False)
    escrow_credits: int = Field(default=0, nullable=False)
    updated_at: datetime = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False))

# The ledger, and the record of truth for every credit movement.
class Transaction(SQLModel, table=True):
    __tablename__ = "transactions"
    __table_args__ = (
        CheckConstraint("amount <> 0", name="ck_transaction_amount"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    type: TransactionType = Field(nullable=False)
    amount: int = Field(nullable=False)
    status: TransactionStatus = Field(nullable=False)
    # Null for platform grants such as the onboarding bonus.
    partner_id: Optional[int] = Field(default=None, foreign_key="users.id")
    # A credit is held when the request is sent, before any session exists, so both links are kept.
    swap_request_id: Optional[int] = Field(default=None, foreign_key="swap_requests.id")
    session_id: Optional[int] = Field(default=None, foreign_key="sessions.id")
    created_at: datetime = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False))
    settled_at: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=True))
