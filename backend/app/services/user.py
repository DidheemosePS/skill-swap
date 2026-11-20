import jwt
from fastapi import HTTPException, Request, status
from sqlmodel import select
from app.core.engine import SessionDep
from app.core.security import ALGORITHM, SECRET_KEY
from app.models.user import User

async def get_users(session: SessionDep):
    result = await session.exec(select(User))
    users = result.all()
    return users

async def get_current_user(request: Request, session: SessionDep):
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Login session expired",
        )

    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

    if payload.get("type") != "access" or not str(payload.get("sub", "")).isdigit():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    user = await session.get(User, int(payload["sub"]))

    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user
