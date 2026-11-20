from datetime import datetime, timedelta, timezone
from typing import Annotated
from fastapi import Depends, HTTPException, Request, Response, status
from sqlmodel import select
from app.core.engine import SessionDep
from app.core.security import SESSION_COOKIE, SESSION_DAYS, hash_session_token, set_session_cookie
from app.models.user import AuthSession, User

async def get_current_user(request: Request, response: Response, session: SessionDep) -> User:
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not signed in")

    now = datetime.now(timezone.utc)
    row = (await session.exec(
        select(AuthSession, User).join(User).where(
            AuthSession.token_hash == hash_session_token(token),
            AuthSession.revoked_at.is_(None),
            AuthSession.expires_at > now,
        )
    )).first()
    if row is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session ended, sign in again")

    auth_session, user = row
    # Writes at most hourly (activity) or every ~15 days (sliding expiry), never on every request.
    renew = auth_session.expires_at - now < timedelta(days=SESSION_DAYS / 2)
    stale = user.last_active_at is None or now - user.last_active_at > timedelta(hours=1)
    if renew or stale:
        user.last_active_at = now
        if renew:
            auth_session.expires_at = now + timedelta(days=SESSION_DAYS)
            set_session_cookie(response, token, auth_session.expires_at)
        session.add_all([auth_session, user])
        await session.commit()

    return user

CurrentUserDep = Annotated[User, Depends(get_current_user)]
