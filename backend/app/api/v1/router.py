from fastapi import APIRouter
from app.api.v1.endpoints.auth import auth
from app.api.v1.endpoints.users import users

# Every endpoint lives under /api/v1, the base path in API_INTEGRATION_MAP.md. Add new routers here.
api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth)
api_router.include_router(users)
