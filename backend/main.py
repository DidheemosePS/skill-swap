from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlalchemy import text
from app.api.v1.router import api_router
from app.core.engine import SessionDep, engine

# Tables come from Alembic migrations (uv run alembic upgrade head), never from create_all at startup.
@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await engine.dispose()

app = FastAPI(title="skill-swap-api", lifespan=lifespan)
app.include_router(api_router)

@app.get("/health", name="health_check", tags=["health_check"])
async def health_check(session: SessionDep):
    try: 
        result = await session.exec(text("SELECT 1"))
        return {"status": "healthy", "database": "connected", "result": result.first()[0]}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}