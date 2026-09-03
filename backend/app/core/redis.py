import json
import logging
import asyncio
from typing import AsyncGenerator, Dict, Any, Optional
import redis.asyncio as aioredis
from app.core.config import settings

logger = logging.getLogger(__name__)

class RedisManager:
    def __init__(self):
        self.redis: Optional[aioredis.Redis] = None
        self._fallback_subscribers: Dict[str, list] = {}

    async def connect(self):
        try:
            self.redis = aioredis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=2
            )
            await self.redis.ping()
            logger.info("Successfully connected to Redis.")
        except Exception as e:
            logger.warning(f"Redis connection failed ({e}). Operating in memory event channel mode.")
            self.redis = None

    async def disconnect(self):
        if self.redis:
            await self.redis.close()
            logger.info("Redis connection closed.")

    async def publish_event(self, channel: str, data: Dict[str, Any]):
        message = json.dumps(data)
        if self.redis:
            try:
                await self.redis.publish(channel, message)
                # Also publish to global dashboard channel
                await self.redis.publish("dashboard_events", message)
                return
            except Exception as e:
                logger.error(f"Failed to publish event to Redis channel {channel}: {e}")

        # Fallback in-memory delivery if redis connection is unavailable
        if channel in self._fallback_subscribers:
            for queue in list(self._fallback_subscribers[channel]):
                await queue.put(message)
        if "dashboard_events" in self._fallback_subscribers:
            for queue in list(self._fallback_subscribers["dashboard_events"]):
                await queue.put(message)

    async def subscribe_events(self, channel: str) -> AsyncGenerator[Dict[str, Any], None]:
        if self.redis:
            pubsub = self.redis.pubsub()
            await pubsub.subscribe(channel)
            try:
                async for message in pubsub.listen():
                    if message["type"] == "message":
                        try:
                            data = json.loads(message["data"])
                            yield data
                        except json.JSONDecodeError:
                            continue
            except asyncio.CancelledError:
                await pubsub.unsubscribe(channel)
                await pubsub.close()
                return
            except Exception as e:
                logger.error(f"Error reading from Redis channel {channel}: {e}")

        # Fallback generator
        queue = asyncio.Queue()
        if channel not in self._fallback_subscribers:
            self._fallback_subscribers[channel] = []
        self._fallback_subscribers[channel].append(queue)

        try:
            while True:
                data_str = await queue.get()
                try:
                    data = json.loads(data_str)
                    yield data
                except Exception:
                    continue
        except asyncio.CancelledError:
            if channel in self._fallback_subscribers and queue in self._fallback_subscribers[channel]:
                self._fallback_subscribers[channel].remove(queue)
            return

redis_manager = RedisManager()
