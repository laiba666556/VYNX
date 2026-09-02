# VYNX — API Specification

## Base

Development:
```text
http://localhost:8000
```

## Endpoints

### GET /api/health

Health check endpoint to verify the API is running.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

### POST /api/scan

Scans a URL, message or email for phishing and scam indicators.

**Query Parameters:**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `session_id` | UUID v4 string | No | Anonymous guest session generated in the browser. The scan is stored with this id so `/api/history` and `/api/stats` can be scoped to one device. Omit it to store an unscoped scan. A malformed value returns **422**. |

**Request Body:**
```json
{
  "input_type": "url|message|email",
  "content": "string (max 2000 chars for url/message, 10000 for email)"
}
```

**Response:**
```json
{
  "risk_score": "number (0-100)",
  "verdict": "string (SAFE|SPAM|SUSPICIOUS|PHISHING|UNKNOWN)",
  "risk_level": "string (LOW|MEDIUM|HIGH|CRITICAL)",
  "signals": "string[] (list of triggered detection rules)",
  "ai_available": "boolean",
  "ai_explanation": "string|null (AI analysis if available)",
  "confidence": "number (0.0-1.0)",
  "recommended_action": "string (suggested action based on risk level)"
}
```

### GET /api/history

Retrieves the latest 20 scan results, newest first.

**Query Parameters:**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `session_id` | UUID v4 string | No | When supplied, only scans stored with that session id are returned. Without it, the endpoint returns the most recent scans across every session. A malformed value returns **422**. |

**Response:**
```json
[
  {
    "input_type": "string",
    "risk_score": "number",
    "verdict": "string",
    "risk_level": "string",
    "signals": "string[]",
    "ai_explanation": "string|null",
    "created_at": "string (timestamp)"
  }
]
```

### GET /api/stats

Aggregates stored scans for the dashboard. Runs as a single SQL query.

**Query Parameters:**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `session_id` | UUID v4 string | No | Scope the aggregates to one guest session. Without it, the response covers every stored scan. A malformed value returns **422**. |

**Response:**
```json
{
  "total_scans": "number",
  "verdict_counts": { "SAFE": 0, "SPAM": 0, "SUSPICIOUS": 0, "PHISHING": 0, "UNKNOWN": 0 },
  "risk_level_counts": { "LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0 },
  "threats_blocked": "number (SUSPICIOUS + PHISHING)",
  "safe_pct": "number (percentage of scans verdicted SAFE, 1 decimal)",
  "last_scan_at": "string|null (timestamp of the newest scan)"
}
```

A session with no scans returns zeroed counters and `last_scan_at: null` — it is not an error.

## Error Responses

- **422 Unprocessable Entity**: Request validation failed (invalid input_type, content too long, or a `session_id` that is not a UUID v4)
- **413 Payload Too Large**: Request body exceeds 100,000 bytes
- **429 Too Many Requests**: Rate limit exceeded (20 requests per minute per IP)

The UI maps these to plain-language toasts: 413 → "Content too large — trim it and try again", 422 → "Check your input — it did not pass validation", 429 → "Too many scans — wait a minute and try again", 500 → "Server error while scanning — please try again". A failed `fetch` (backend down) shows "Backend unreachable — start the server and try again".

## Security Headers

All API responses include the following security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`