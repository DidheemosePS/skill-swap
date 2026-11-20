from typing import Optional
from sqlmodel import SQLModel

# GET /users/me in API_INTEGRATION_MAP.md: just what the shell and route guards need.
class CurrentUser(SQLModel):
    id: int
    name: str
    avatar_url: Optional[str]
    is_onboarded: bool
