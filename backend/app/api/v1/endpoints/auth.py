from fastapi import APIRouter, Request, Response
from app.core.engine import SessionDep
from app.services import google_auth

auth = APIRouter(prefix="/auth", tags=["authentication"])

@auth.get("/login")
def google_login():
    return google_auth.google_login()

@auth.get("/callback")
async def google_auth_callback(session: SessionDep, code: str = None, state: str = None, error: str = None):
    return await google_auth.google_auth_callback(session, code, state, error)

@auth.get("/refresh")
async def refresh_access_token(request: Request, session: SessionDep):
    return await google_auth.refresh_access_token(request, session)

@auth.get("/logout")
async def logout(request: Request, response: Response, session: SessionDep):
    return await google_auth.logout(request, response, session)