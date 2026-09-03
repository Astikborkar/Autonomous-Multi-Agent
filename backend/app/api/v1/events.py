import json
import logging
import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.core.redis import redis_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/events", tags=["Real-Time SSE Events"])


@router.get("/{workflow_id}")
async def stream_workflow_events(workflow_id: str):
    """
    Server-Sent Events (SSE) streaming endpoint for a specific workflow.
    Publishes live state updates, task progress, and agent logs continuously.
    """
    channel = f"workflow_{workflow_id}"

    async def event_generator():
        yield f"event: ping\ndata: {json.dumps({'status': 'connected', 'workflow_id': workflow_id})}\n\n"
        try:
            async for event_data in redis_manager.subscribe_events(channel):
                event_type = event_data.get("event_type", "message")
                yield f"event: {event_type}\ndata: {json.dumps(event_data)}\n\n"
        except asyncio.CancelledError:
            logger.info(f"SSE client disconnected from workflow channel {channel}")

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@router.get("/dashboard/feed")
async def stream_dashboard_events():
    """
    Server-Sent Events (SSE) streaming endpoint for global dashboard metrics and activity.
    """
    channel = "dashboard_events"

    async def event_generator():
        yield f"event: ping\ndata: {json.dumps({'status': 'dashboard_connected'})}\n\n"
        try:
            async for event_data in redis_manager.subscribe_events(channel):
                event_type = event_data.get("event_type", "message")
                yield f"event: {event_type}\ndata: {json.dumps(event_data)}\n\n"
        except asyncio.CancelledError:
            logger.info("SSE client disconnected from global dashboard feed.")

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
