# VYNX — Architecture

## 1. Architecture Overview

VYNX uses a layered architecture combining a React frontend, FastAPI backend, deterministic cybersecurity rules, optional Qwen AI analysis, evidence fusion, and SQLite persistence.

```text
┌──────────────────────────────┐
│        React + Vite          │
│                              │
│ Scanner / Dashboard /        │
│ History / Theme / UI         │
└──────────────┬───────────────┘
               │ HTTP
               ▼
┌──────────────────────────────┐
│          FastAPI             │
│                              │
│ Validation + Security        │
│ Middleware + Rate Limiting   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       Analysis Layer         │
│                              │
│  ┌────────────────────────┐  │
│  │ Deterministic Rules    │  │
│  └────────────────────────┘  │
│              +               │
│  ┌────────────────────────┐  │
│  │ Qwen AI Analysis       │  │
│  │ Optional               │  │
│  └────────────────────────┘  │
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│       Evidence Fusion        │
│                              │
│ Base Score + AI Delta +      │
│ Hard-Veto Indicators         │
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│        Risk Result           │
│                              │
│ Score / Verdict / Confidence │
│ Signals / Explanation /      │
│ Recommended Action           │
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│            SQLite            │
│       Session History        │
└──────────────────────────────┘
```

---

## 2. Frontend

### Technology

* React
* TypeScript
* Vite
* Tailwind CSS

### Responsibilities

The frontend handles:

* Scanner interface
* URL/message/email input
* Scan requests
* Risk-result presentation
* Dashboard
* History
* Theme switching
* Loading states
* Empty states
* Error states
* Accessibility
* Guest session management

The frontend communicates with the backend through HTTP APIs.

---

## 3. Backend

### Technology

* Python
* FastAPI
* Pydantic
* SQLite

### Responsibilities

The backend handles:

* Request validation
* Security middleware
* Rate limiting
* Input-size protection
* Scan orchestration
* Deterministic detection
* Qwen integration
* Evidence fusion
* Risk scoring
* History
* Statistics
* API error handling

---

## 4. Detection Pipeline

A scan follows this general flow:

```text
User Input
    ↓
Input Validation
    ↓
Security Checks
    ↓
Input Normalization
    ↓
Deterministic Detection
    ↓
Qwen AI Analysis
    ↓
Evidence Fusion
    ↓
Risk Score
    ↓
Verdict + Explanation
    ↓
Persist Scan Metadata
    ↓
Return API Response
```

---

## 5. Deterministic Detection Engine

The rule engine provides predictable cybersecurity analysis.

It evaluates signals including:

* Suspicious URLs
* Look-alike domains
* Brand impersonation
* Pakistani organization impersonation
* Threat language
* Urgency
* OTP requests
* Sensitive information requests
* Social engineering
* Known malicious indicators
* English patterns
* Roman Urdu patterns
* Urdu-script patterns

The deterministic layer provides a reliable fallback when AI is unavailable.

---

## 6. Qwen AI Layer

Qwen is used as an optional contextual-analysis layer.

The backend sends normalized scan information to Qwen and receives structured AI analysis.

The AI output is treated as untrusted external data and is validated before being used.

The AI does not directly control application behavior.

---

## 7. Evidence Fusion

VYNX does not blindly trust the AI result.

The final result is generated using multiple evidence sources.

```text
Rule Engine
     │
     ├── Base Risk Score
     │
Qwen AI
     │
     ├── AI Risk Delta
     │
Blacklist / Hard Rules
     │
     └── Hard-Veto Signals
            │
            ▼
      Evidence Fusion
            │
            ▼
      Final Risk Score
```

This approach reduces dependence on a single model prediction.

---

## 8. Database

### Current Database

The current MVP uses:

**SQLite**

The database stores scan history associated with a guest session ID.

The current MVP does not require Supabase.

---

## 9. Guest Sessions

The application currently uses anonymous browser sessions.

The frontend generates a UUID and stores it locally.

The session identifier is sent with relevant requests and is used to scope:

* Scan history
* Dashboard statistics

No password or traditional authentication is required.

---

## 10. Security Architecture

Security controls include:

* Pydantic validation
* Request-size limits
* Per-type input limits
* Rate limiting
* Security headers
* Untrusted-input handling
* No automatic URL execution
* No automatic browsing of submitted URLs
* Environment-based API secrets
* AI output validation

---

## 11. Current Deployment Architecture

The current repository is designed to run locally with:

```text
Frontend → localhost:5173
Backend  → localhost:8000
Database → local SQLite
Qwen    → DashScope API
```

Production Alibaba Cloud deployment is a future step and should not be considered part of the current MVP implementation.

---

## 12. Future Architecture

Future production infrastructure may include:

```text
React Frontend
      ↓
Alibaba Cloud Deployment
      ↓
FastAPI Backend
      ↓
Supabase / Managed Database
      ↓
Qwen AI
      ↓
Monitoring / Logging
```

This future architecture is separate from the current SQLite-based MVP.
