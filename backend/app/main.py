import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.redis import redis_manager
from app.db.session import init_db
from app.db.seed import seed_data
from app.api.router import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Autonomous Workflow Orchestrator Backend...")
    # Initialize DB tables & run seeds
    try:
        await init_db()
        await seed_data()
    except Exception as e:
        logger.warning(f"Database initialization deferred or already created: {e}")

    # Connect Redis
    await redis_manager.connect()

    yield

    logger.info("Shutting down backend services...")
    await redis_manager.disconnect()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach API Router
app.include_router(api_router)


@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "redis_connected": redis_manager.redis is not None
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
