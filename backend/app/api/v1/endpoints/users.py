from typing import Annotated
from fastapi import APIRouter, Depends
from app.core.engine import SessionDep
from app.models.user import User
from app.schemas.user import CurrentUser
from app.services import user

users = APIRouter(tags=["users"])

@users.get("/users", response_model=list[CurrentUser])
async def get_users(session: SessionDep):
    return await user.get_users(session)

@users.get("/users/me", response_model=CurrentUser)
async def read_users_me(
    current_user: Annotated[User, Depends(user.get_current_user)]
):
    return current_user
