import asyncio
import os
import pytest
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession

# A migrated, disposable database: never the dev one. Example:
# TEST_DATABASE_URL=postgresql+asyncpg://myuser:password@localhost:5432/skillswap_migrate uv run pytest
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL")


@pytest.fixture
def in_rollback():
    """Runs an async test body against a session whose writes are always rolled back."""
    if not TEST_DATABASE_URL:
        pytest.skip("TEST_DATABASE_URL is not set")

    def run(body):
        async def wrapper():
            engine = create_async_engine(TEST_DATABASE_URL)
            async with engine.connect() as conn:
                transaction = await conn.begin()
                try:
                    async with AsyncSession(bind=conn, expire_on_commit=False) as session:
                        await body(session)
                finally:
                    await transaction.rollback()
            await engine.dispose()

        asyncio.run(wrapper())

    return run
