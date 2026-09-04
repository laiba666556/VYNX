# VYNX — Project Memory

## 1. Current Project State

VYNX is currently a working hackathon MVP for AI-assisted phishing and scam detection.

The project combines:

* React
* Vite
* FastAPI
* Python
* SQLite
* Deterministic cybersecurity rules
* Qwen AI

---

## 2. Current Architecture

```text
React + Vite
      ↓
FastAPI
      ↓
Validation + Security Middleware
      ↓
Deterministic Rules + Qwen AI
      ↓
Evidence Fusion
      ↓
Risk Result
      ↓
SQLite
```

---

## 3. Current AI Integration

Qwen is integrated as an optional contextual-analysis layer.

Configuration is provided through environment variables.

```text
QWEN_API_KEY=
QWEN_MODEL=qwen-plus
```

The API key must remain local and must never be committed.

---

## 4. AI Failure Strategy

Qwen is not the only detection mechanism.

If the Qwen API is unavailable:

```text
Deterministic Rules
        ↓
Risk Result
```

The application continues operating.

---

## 5. Current Detection Capabilities

VYNX analyzes:

* URLs
* Messages
* Emails

Detection includes:

* Suspicious links
* Look-alike domains
* Brand impersonation
* Pakistani organization impersonation
* Urgency
* Threat language
* Sensitive-information requests
* OTP-related requests
* Social engineering
* Known malicious indicators
* English
* Roman Urdu
* Urdu script

---

## 6. Risk Model

The system combines:

```text
Base Rule Score
+
AI Risk Delta
+
Hard-Veto Indicators
=
Final Risk Score
```

The final risk score is normalized to 0–100.

The result includes:

* Risk score
* Risk level
* Verdict
* Confidence
* Threat signals
* Explanation
* Recommended action

---

## 7. Current Session Model

The MVP does not require user registration.

A UUID is generated for the guest browser session.

The session identifier is stored locally.

It is used to associate:

* Scan history
* Dashboard statistics

Sign-out removes the local session identifier.

---

## 8. Current Database

The MVP uses:

**SQLite**

The database is local to the running backend.

Supabase is not part of the current MVP implementation.

---

## 9. Current Security Controls

Implemented controls include:

* Input validation
* Request-size limits
* Type-specific input limits
* Rate limiting
* Security headers
* AI-output validation
* Environment-based secrets
* Safe error handling
* No automatic URL execution
* No automatic browsing of submitted URLs

---

## 10. Current Frontend

Main application areas include:

* Scanner
* Dashboard
* History

The frontend supports:

* Light mode
* Dark mode
* Theme persistence
* Responsive layout
* Loading states
* Empty states
* Error states
* Toast messages
* Keyboard accessibility
* Focus states
* ARIA/live regions
* Reduced-motion support

---

## 11. Testing

The repository includes backend tests covering:

* Detection behavior
* Language-specific rules
* Scoring
* Blacklist/hard-veto behavior
* Security middleware
* Rate limiting
* History
* Statistics
* Session isolation

The current project documentation reports 31 backend tests.

---

## 12. Important Current Decisions

### Decision 1 — SQLite for MVP

SQLite is intentionally used to keep the current hackathon MVP simple and locally runnable.

### Decision 2 — Anonymous Sessions

Traditional authentication is intentionally not required for the current MVP.

### Decision 3 — Deterministic + AI

Qwen complements deterministic security rules rather than replacing them.

### Decision 4 — No Automatic URL Execution

Submitted URLs are analyzed as data and are never automatically opened or executed.

### Decision 5 — Local Secrets

Qwen credentials are provided through environment variables.

---

## 13. Future Work

Future improvements include:

* Supabase authentication
* Cross-device user accounts
* Managed cloud database
* Alibaba Cloud production deployment
* Sentry monitoring
* Community blacklist submissions
* Expanded threat intelligence
* Additional languages
* More advanced email parsing
* Production scaling

These features are **planned and not currently implemented**.

---

## 14. Documentation Rule

This file describes the **current project state**.

If the implementation changes, this document should be updated so it does not describe planned infrastructure as already implemented.

---

## 15. Hackathon Positioning

VYNX demonstrates an explainable AI-assisted security workflow:

```text
Suspicious Content
       ↓
Deterministic Security Analysis
       +
Qwen Contextual Analysis
       ↓
Evidence Fusion
       ↓
Risk Score
       ↓
Human-Readable Explanation
       ↓
Recommended Action
```

The core goal is to make phishing and scam detection understandable and useful for everyday users, with particular attention to Pakistani communication patterns.
