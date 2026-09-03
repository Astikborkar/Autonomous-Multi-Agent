from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.workflows import router as workflows_router
from app.api.v1.agents import router as agents_router
from app.api.v1.events import router as events_router
from app.api.v1.templates import router as templates_router
from app.api.v1.metrics import router as metrics_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router)
api_router.include_router(workflows_router)
api_router.include_router(agents_router)
api_router.include_router(events_router)
api_router.include_router(templates_router)
api_router.include_router(metrics_router)
