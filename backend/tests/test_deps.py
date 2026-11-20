import secrets
from datetime import datetime, timedelta, timezone
import pytest
from fastapi import HTTPException, Response
from starlette.requests import Request
from app.api.v1.deps import get_current_user
from app.core.security import SESSION_COOKIE, hash_session_token
from app.models.user import AuthSession, User

NOW = datetime.now(timezone.utc)


def request_with(cookie: str | None) -> Request:
    headers = [(b"cookie", f"{SESSION_COOKIE}={cookie}".encode())] if cookie else []
    return Request({"type": "http", "headers": headers})


async def signed_in(session, expires_in: timedelta, revoked: bool = False):
    user = User(name="Ana")
    session.add(user)
    await session.flush()
    token = secrets.token_urlsafe(32)
    row = AuthSession(token_hash=hash_session_token(token), user_id=user.id, expires_at=NOW + expires_in,
                      revoked_at=NOW if revoked else None)
    session.add(row)
    await session.flush()
    return user, token, row


async def status_for(session, cookie):
    with pytest.raises(HTTPException) as refused:
        await get_current_user(request_with(cookie), Response(), session)
    return refused.value.status_code


def test_every_bad_cookie_gets_401(in_rollback):
    async def body(session):
        _, live, _ = await signed_in(session, timedelta(days=20))
        _, revoked, _ = await signed_in(session, timedelta(days=20), revoked=True)
        _, expired, _ = await signed_in(session, timedelta(seconds=-1))

        assert await status_for(session, None) == 401
        assert await status_for(session, "not-a-real-token") == 401
        assert await status_for(session, revoked) == 401
        assert await status_for(session, expired) == 401
        # The stored hash itself must not work as a cookie.
        assert await status_for(session, hash_session_token(live)) == 401

    in_rollback(body)


def test_a_valid_cookie_loads_the_user_without_renewing(in_rollback):
    async def body(session):
        user, token, row = await signed_in(session, timedelta(days=20))
        response = Response()
        assert (await get_current_user(request_with(token), response, session)).id == user.id
        assert "set-cookie" not in response.headers  # 20 days left: no renewal yet
        assert row.expires_at == NOW + timedelta(days=20)

    in_rollback(body)


def test_a_session_near_expiry_slides_forward(in_rollback):
    async def body(session):
        _, token, row = await signed_in(session, timedelta(days=3))
        response = Response()
        await get_current_user(request_with(token), response, session)
        assert row.expires_at > NOW + timedelta(days=29)
        assert f"{SESSION_COOKIE}={token}" in response.headers["set-cookie"]

    in_rollback(body)
