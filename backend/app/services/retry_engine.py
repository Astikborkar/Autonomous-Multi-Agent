import logging
import asyncio

logger = logging.getLogger(__name__)

# Exponential Backoff Retry Policy
RETRY_BACKOFF_SCHEDULE = [1, 5, 15, 30, 60]  # seconds delay per retry attempt
MAX_RETRY_LIMIT = len(RETRY_BACKOFF_SCHEDULE)

class RetryEngine:
    @staticmethod
    def get_backoff_delay(retry_count: int) -> int:
        """
        Returns backoff delay in seconds for the given retry_count (1-indexed).
        """
        if retry_count <= 0:
            return 0
        idx = min(retry_count - 1, MAX_RETRY_LIMIT - 1)
        return RETRY_BACKOFF_SCHEDULE[idx]

    @staticmethod
    def can_retry(retry_count: int) -> bool:
        """
        Determines whether further retries are allowed under policy.
        """
        return retry_count < MAX_RETRY_LIMIT

    @classmethod
    async def wait_before_retry(cls, retry_count: int):
        delay = cls.get_backoff_delay(retry_count)
        logger.info(f"Retry Engine: Applying exponential backoff delay of {delay}s for attempt {retry_count}")
        await asyncio.sleep(delay)
