from datetime import datetime, timedelta, timezone
import pytest
from sqlalchemy.exc import IntegrityError
from app.models.availability import SlotHold, SlotHoldStatus
from app.models.chat import Conversation, Message, MessageKind
from app.models.skill import Skill
from app.models.swap_request import SwapRequest, SwapType
from app.models.user import User
from app.models.wallet import Wallet

HOUR = datetime(2026, 12, 1, 18, tzinfo=timezone.utc)


async def two_users(session):
    a, b = User(name="Ana"), User(name="Ben")
    session.add_all([a, b])
    await session.flush()
    return a, b


async def rejects(session, row):
    # A savepoint, so one rejected insert doesn't abort the rest of the test's transaction.
    nested = await session.begin_nested()
    session.add(row)
    with pytest.raises(IntegrityError):
        await session.flush()
    await nested.rollback()


def test_a_booked_hour_cannot_be_held_again(in_rollback):
    async def body(session):
        mentor, learner = await two_users(session)
        session.add(SlotHold(mentor_id=mentor.id, holder_id=learner.id, starts_at=HOUR, status=SlotHoldStatus.BOOKED))
        await session.flush()
        await rejects(session, SlotHold(mentor_id=mentor.id, holder_id=learner.id, starts_at=HOUR))
        # A different hour with the same mentor is still free.
        session.add(SlotHold(mentor_id=mentor.id, holder_id=learner.id, starts_at=HOUR + timedelta(hours=1)))
        await session.flush()

    in_rollback(body)


def test_check_constraints_match_stored_enum_names(in_rollback):
    async def body(session):
        a, b = await two_users(session)
        conversation = Conversation(member_a_id=min(a.id, b.id), member_b_id=max(a.id, b.id))
        skill, other = Skill(name="Test Spanish", category="Language"), Skill(name="Test Python", category="Code")
        session.add_all([conversation, skill, other])
        await session.flush()

        # Valid rows pass, which proves the constraints compare against what Postgres actually stores.
        session.add(Message(conversation_id=conversation.id, sender_id=a.id, kind=MessageKind.TEXT, body="Hi"))
        common = dict(conversation_id=conversation.id, requester_id=a.id, recipient_id=b.id,
                      skill_id=skill.id, last_proposed_by=a.id)
        session.add(SwapRequest(swap_type=SwapType.ONE_WAY, **common))
        session.add(SwapRequest(swap_type=SwapType.TWO_WAY, return_skill_id=other.id, **common))
        await session.flush()

        # Invalid rows are refused.
        await rejects(session, Message(conversation_id=conversation.id, sender_id=a.id, kind=MessageKind.TEXT))
        await rejects(session, SwapRequest(swap_type=SwapType.ONE_WAY, return_skill_id=other.id, **common))
        await rejects(session, SwapRequest(swap_type=SwapType.TWO_WAY, **common))

    in_rollback(body)


def test_a_wallet_cannot_go_negative(in_rollback):
    async def body(session):
        user, _ = await two_users(session)
        await rejects(session, Wallet(user_id=user.id, credits=-1))
        await rejects(session, Wallet(user_id=user.id, escrow_credits=-1))

    in_rollback(body)
