"""Tiny in-memory sliding-window rate limiter.

Good enough for the MVP's single API instance (intake form, guest order lookup).
Swap for Redis if the API ever scales horizontally.
"""
import time
from collections import defaultdict, deque
from threading import Lock

from fastapi import HTTPException, Request, status

_hits: dict[str, deque[float]] = defaultdict(deque)
_lock = Lock()


def check_rate_limit(request: Request, scope: str, limit: int, window_seconds: int) -> None:
    ip = request.client.host if request.client else "unknown"
    key = f"{scope}:{ip}"
    now = time.monotonic()
    with _lock:
        q = _hits[key]
        while q and q[0] <= now - window_seconds:
            q.popleft()
        if len(q) >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests — please try again in a little while",
            )
        q.append(now)
