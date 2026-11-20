import uuid
from datetime import datetime, timedelta, timezone
import pytest
from fastapi import HTTPException
from starlette.requests import Request
from app.core.security import create_jwt_token
from app.models.user import AuthSession, User
from app.services.google_auth import refresh_access_token


def request_with_refresh_cookie(token: str) -> Request:
    return Request({"type": "http", "headers": [(b"cookie", f"refresh_token={token}".encode())]})


def test_a_revoked_refresh_token_is_refused(in_rollback):
    async def body(session):
        user = User(name="Ana")
        session.add(user)
        await session.flush()

        token = create_jwt_token(data={"sub": str(user.id)}, expires_delta=timedelta(days=1),
                                 token_type="refresh", jti=str(uuid.uuid4()))
        row = AuthSession(token_hash=token["jti"], user_id=user.id, expires_at=token["expire"])
        session.add(row)
        await session.flush()

        # Live token: a new access token comes back.
        response = await refresh_access_token(request_with_refresh_cookie(token["encoded_jwt"]), session)
        assert "access_token=" in response.headers["set-cookie"]

        # After sign-out the same token must not work.
        row.revoked_at = datetime.now(timezone.utc)
        await session.flush()
        with pytest.raises(HTTPException) as refused:
            await refresh_access_token(request_with_refresh_cookie(token["encoded_jwt"]), session)
        assert refused.value.status_code == 401

    in_rollback(body)
