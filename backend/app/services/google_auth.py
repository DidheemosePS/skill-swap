import os
import secrets
import uuid
import httpx2
import jwt
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode
from fastapi import HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlmodel import select
from app.core.engine import SessionDep
from app.core.security import ACCESS_TOKEN_EXPIRE, ALGORITHM, REFRESH_TOKEN_EXPIRE, SECRET_KEY, create_jwt_token
from app.models.user import AuthAccount, AuthProvider, AuthSession, User


GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
IS_PRODUCTION = ENVIRONMENT == "production"

def google_login():
    state_jwt = create_jwt_token(
        data={"nonce": secrets.token_hex(16)},
        expires_delta=timedelta(seconds=120),
        token_type="google_auth_state"
    )

    params = {
        "response_type": "code",
        "client_id": GOOGLE_CLIENT_ID,
        "scope": "openid email profile",
        "redirect_uri": REDIRECT_URI,
        "state": state_jwt["encoded_jwt"]
    }
    google_provider_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"

    return RedirectResponse(url=google_provider_url, status_code=303)

def _set_cookie(response: Response, key: str, token: dict):
    response.set_cookie(
        key=key,
        value=token["encoded_jwt"],
        httponly=True,
        secure=IS_PRODUCTION,
        samesite="lax",
        expires=token["expire"]
    )

def _access_token(user_id: int):
    return create_jwt_token(data={"sub": str(user_id)}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE), token_type="access")

async def google_auth_callback(session: SessionDep, code: str = None, state: str = None, error: str = None):
    if error:
        raise HTTPException(status_code=400, detail=f"Google Auth Error: {error}")
    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing code or state parameter")

    try:
        payload = jwt.decode(state, SECRET_KEY, algorithms=[ALGORITHM])
        token_type: str = payload.get("type")

        if token_type != "google_auth_state":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )

    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

    token_url = "https://oauth2.googleapis.com/token"
    payload = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    async with httpx2.AsyncClient() as client:
        token_response = await client.post(token_url, data=payload)

        if token_response.status_code != 200:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to fetch tokens from Google: {token_response.text}"
            )

        token_data = token_response.json()
        id_token = token_data.get("id_token")

    jwts_client = jwt.PyJWKClient("https://www.googleapis.com/oauth2/v3/certs")
    signing_key = jwts_client.get_signing_key_from_jwt(id_token)
    google_user_info = jwt.decode(id_token, key=signing_key.key, algorithms=["RS256"], audience=GOOGLE_CLIENT_ID)

    account = (await session.exec(select(AuthAccount).where(
        AuthAccount.provider == AuthProvider.GOOGLE,
        AuthAccount.provider_account_id == google_user_info["sub"],
    ))).first()

    if account:
        user_id = account.user_id
    else:
        email = google_user_info.get("email")
        db_user = User(name=google_user_info.get("name") or email, avatar_url=google_user_info.get("picture"))
        db_user.auth_accounts.append(AuthAccount(
            provider=AuthProvider.GOOGLE,
            provider_account_id=google_user_info["sub"],
            username=email,
        ))
        session.add(db_user)
        await session.commit()
        user_id = db_user.id

    access_token = _access_token(user_id)
    refresh_token = create_jwt_token(
        jti=str(uuid.uuid4()),
        data={"sub": str(user_id)},
        expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE),
        token_type="refresh"
    )

    session.add(AuthSession(token_hash=refresh_token["jti"], user_id=user_id, expires_at=refresh_token["expire"]))
    await session.commit()

    redirect_response = RedirectResponse(url="http://127.0.0.1:8000/docs#", status_code=303)
    _set_cookie(redirect_response, "access_token", access_token)
    return redirect_response

async def refresh_access_token(request: Request, session: SessionDep):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing refresh token cookie",
        )

    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

    if payload.get("type") != "refresh" or not payload.get("jti"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    # A signed-out (revoked) or unknown token never mints a new access token.
    db_refresh_token = await session.get(AuthSession, payload["jti"])
    if not db_refresh_token or db_refresh_token.revoked_at is not None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session ended, sign in again")

    redirect_response = RedirectResponse(url="http://127.0.0.1:8000/docs#", status_code=303)
    _set_cookie(redirect_response, "access_token", _access_token(db_refresh_token.user_id))
    return redirect_response

async def logout(request: Request, response: Response, session: SessionDep):
    refresh_token = request.cookies.get("refresh_token")

    if refresh_token:
        try:
            payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
            jti = payload.get("jti")

            if jti and payload.get("type") == "refresh":
                db_refresh_token = await session.get(AuthSession, jti)

                if db_refresh_token and db_refresh_token.revoked_at is None:
                    db_refresh_token.revoked_at = datetime.now(timezone.utc)
                    session.add(db_refresh_token)
                    await session.commit()

        # An expired or broken cookie still signs the browser out below.
        except jwt.InvalidTokenError:
            pass

    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")

    return {"message": "Successfully logged out"}
