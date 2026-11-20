from datetime import datetime, timedelta, timezone
import hashlib
import os
from dotenv import load_dotenv
from fastapi import Response
import jwt

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY").strip()
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE = 15
REFRESH_TOKEN_EXPIRE = 7

SESSION_COOKIE = "session"
SESSION_DAYS = 30
IS_PRODUCTION = os.getenv("ENVIRONMENT", "development") == "production"

def hash_session_token(token: str) -> str:
    # Only the hash is stored, so a leaked auth_sessions row can't be used as a cookie.
    return hashlib.sha256(token.encode()).hexdigest()

def set_session_cookie(response: Response, token: str, expires: datetime):
    response.set_cookie(SESSION_COOKIE, token, httponly=True, secure=IS_PRODUCTION, samesite="lax", expires=expires)

def create_jwt_token(data: dict, expires_delta: timedelta, token_type:str, jti: str | None = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta

    to_encode.update({"exp": expire, "type": token_type})

    if jti is not None:
        to_encode["jti"] = jti

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return {"encoded_jwt": encoded_jwt, "jti": jti, "expire": expire}