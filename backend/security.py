import time
from collections import defaultdict, deque
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

MAX_BODY_BYTES = 100_000

class SecurityMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, rate_limit: int = 20, window: float = 60.0):
        super().__init__(app)
        self.rate_limit = rate_limit
        self.window = window
        self.hits = defaultdict(deque)

    async def dispatch(self, request, call_next):
        content_length = request.headers.get("content-length")
        if content_length and content_length.isdigit() and int(content_length) > MAX_BODY_BYTES:
            return JSONResponse({"detail": "Payload too large"}, status_code=413)

        if request.url.path == "/api/scan":
            ip = request.client.host if request.client else "unknown"
            now = time.monotonic()
            window_hits = self.hits[ip]
            while window_hits and now - window_hits[0] > self.window:
                window_hits.popleft()
            if len(window_hits) >= self.rate_limit:
                return JSONResponse({"detail": "Too many requests"}, status_code=429)
            window_hits.append(now)

        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "no-referrer"
        return response