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

Retrieves the latest 20 scan results from the database.

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

## Error Responses

- **422 Unprocessable Entity**: Request validation failed (invalid input_type, content too long)
- **413 Payload Too Large**: Request body exceeds 100,000 bytes
- **429 Too Many Requests**: Rate limit exceeded (20 requests per minute per IP)

## Security Headers

All API responses include the following security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`