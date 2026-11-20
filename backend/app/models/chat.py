from datetime import datetime
from enum import Enum
from typing import Optional
from sqlalchemy import CheckConstraint, DateTime, Index, UniqueConstraint, func
from sqlmodel import Column, Field, SQLModel

class MessageKind(str, Enum):
    TEXT = "text"
    SWAP_REQUEST = "swap_request"

class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"
    __table_args__ = (
        UniqueConstraint("member_a_id", "member_b_id", name="uq_conversation_members"),
        CheckConstraint("member_a_id < member_b_id", name="ck_member_order"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    member_a_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    member_b_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    last_message_at: Optional[datetime] = Field(default=None, index=True, sa_type=DateTime(timezone=True))
    created_at: datetime = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False))


class ConversationRead(SQLModel, table=True):
    __tablename__ = "conversation_reads"

    conversation_id: int = Field(foreign_key="conversations.id", primary_key=True, nullable=False)
    user_id: int = Field(foreign_key="users.id", primary_key=True, nullable=False)
    last_read_at: datetime = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False))

class Message(SQLModel, table=True):
    __tablename__ = "messages"
    __table_args__ = (
        Index("ix_messages_conversation_sent", "conversation_id", "sent_at"),
        # Enum columns store the member name (TEXT), not its value (text).
        CheckConstraint(
            "(kind = 'TEXT' AND body IS NOT NULL AND swap_request_id IS NULL) OR "
            "(kind = 'SWAP_REQUEST' AND swap_request_id IS NOT NULL AND body IS NULL)",
            name="ck_message_payload"
        ),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", nullable=False)
    sender_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    kind: MessageKind = Field(nullable=False)
    body: Optional[str] = Field(default=None, nullable=True)
    swap_request_id: Optional[int] = Field(default=None, foreign_key="swap_requests.id", nullable=True)
    sent_at: datetime = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False))
