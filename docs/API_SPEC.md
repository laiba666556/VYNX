# VYNX — API Specification

## 1. Base URL

Local backend:

```text
http://localhost:8000
```

---

## 2. Health Check

### `GET /api/health`

Returns the current backend and AI availability.

### Example Response

```json
{
  "status": "ok",
  "ai_available": true
}
```

`ai_available` indicates whether the Qwen AI service is configured and available.

---

## 3. Scan

### `POST /api/scan`

Analyzes a URL, message, or email.

### Request

The request includes:

* Content type
* Content
* Optional sender information
* Session identifier where applicable

### Supported Content Types

```text
url
message
email
```

### Processing

```text
Request
  ↓
Validation
  ↓
Security Checks
  ↓
Rule Analysis
  ↓
Qwen Analysis
  ↓
Evidence Fusion
  ↓
Risk Result
```

### Response Fields

The scan result can contain:

* `risk_score`
* `risk_level`
* `verdict`
* `confidence`
* `signals`
* `explanation`
* `recommended_action`
* AI availability information
* scan metadata

---

## 4. History

### `GET /api/history`

Returns scan history for the current guest session.

History is associated with the session identifier.

The application uses history to populate the History view.

The current implementation stores history in SQLite.

---

## 5. Statistics

### `GET /api/stats`

Returns session-scoped dashboard statistics.

Statistics may include:

* Total scans
* High-risk scans
* Medium-risk scans
* Low-risk scans
* Recent scan information

---

## 6. Validation

All user-controlled input is validated before analysis.

Validation covers:

* Required fields
* Supported scan types
* Maximum input sizes
* Request structure
* Data types

Invalid input is rejected before reaching the analysis layer.

FastAPI/Pydantic validation errors use the application's standard validation response behavior.

---

## 7. HTTP Error Handling

The API may return errors including:

### `413 Payload Too Large`

The request exceeds the permitted payload size.

### `422 Unprocessable Entity`

The request structure or field values fail validation.

### `429 Too Many Requests`

The client exceeded the configured rate limit.

### `500 Internal Server Error`

An unexpected backend error occurred.

### Network / Connection Failure

The frontend displays an appropriate user-facing error when the backend cannot be reached.

---

## 8. Rate Limiting

The API applies rate limiting to protect the service from excessive requests.

The current configured limit is:

```text
20 requests per minute per IP
```

---

## 9. Input Limits

Different scan types have type-specific input limits.

The backend validates these limits before processing.

This prevents excessively large user-controlled content from being sent to the analysis pipeline.

---

## 10. Security Headers

The backend applies security-related HTTP headers to responses.

These are intended to reduce common browser-side security risks.

---

## 11. Session Handling

The current MVP does not use traditional authentication.

A browser-generated UUID is used to associate scan history with the current guest session.

The frontend stores the session identifier locally.

The backend uses the session identifier to scope stored history and statistics.

---

## 12. AI Failure Behavior

Qwen is an optional analysis layer.

If Qwen is unavailable:

```text
Request
   ↓
Deterministic Rules
   ↓
Risk Result
```

The application should continue operating rather than failing the entire scan.

---

## 13. API Security Rules

The API must:

* Treat all user input as untrusted.
* Never execute submitted URLs.
* Never automatically browse submitted URLs.
* Never expose Qwen API keys.
* Validate AI output.
* Validate user input.
* Apply rate limits.
* Enforce request-size limits.
