import os
import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.config import settings
from app.db.base import Base

logger = logging.getLogger(__name__)

# Determine database URL
db_url = settings.DATABASE_URL
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Check if SQLite fallback should be used for standalone execution without PG
USE_SQLITE = os.getenv("USE_SQLITE", "false").lower() in ("true", "1", "t")
if USE_SQLITE:
    db_url = "sqlite+aiosqlite:///./orchestrator.db"

engine = create_async_engine(
    db_url,
    echo=False,
    future=True,
    pool_pre_ping=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables initialized successfully.")


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
