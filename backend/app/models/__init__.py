# Importing every model registers its table on SQLModel.metadata, which Alembic reads.
from app.models import availability, chat, outcome, review, session, skill, swap_request, user, wallet  # noqa: F401
