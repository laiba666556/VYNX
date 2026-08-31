
# VYNX — Implementation Phases
```markdown
# VYNX — Implementation Phases

## Phase 0 — Project Foundation

### Goal
Create a clean development environment.

### Tasks
- create project structure (see directory tree in project root)
- initialize Git
- configure Python environment (virtualenv, requirements.txt)
- configure frontend environment (npm create vite, install dependencies)
- create `.env.example` with all variables including input limits
- create Dockerfile for FastAPI backend
- establish documentation (all files in docs/)
- create basic tests (pytest for backend, vitest for frontend)

### Done When
Project starts successfully, `docker build` succeeds, and basic test infrastructure works.

---

## Phase 1 — Detection Engine

### Goal
Build VYNX's deterministic analysis engine and Evidence Fusion logic.

### URL Signals
Implement:
- length
- hostname
- subdomains
- IP address host
- suspicious characters
- encoding
- punycode
- suspicious keywords
- path/query anomalies
- URL shorteners

### Message/Email Signals
Implement:
- urgency
- fear
- threats
- OTP requests
- password requests
- credential requests
- financial requests
- suspicious links
- impersonation
- social engineering
- Pakistani scam patterns
- English
- Urdu
- mixed Urdu-English

### Risk System (Evidence Fusion)
Implement:
- evidence collection (list of triggered signals with weights)
- base score calculation (sum of weights, capped at 100)
- AI delta integration (add ai_risk_delta from -20 to +20, clamp 0–100)
- Hard Veto checks (blacklisted domain/IP → instant 100)
- risk score 0–100
- verdict mapping (0-25 SAFE, 26-50 SPAM, 51-75 SUSPICIOUS, 76-100 PHISHING, fallback UNKNOWN)
- risk level mapping (0-25 LOW, 26-50 MEDIUM, 51-75 HIGH, 76-100 CRITICAL)
- confidence calculation

### Tests
Create representative examples for:
- SAFE
- SPAM
- SUSPICIOUS
- PHISHING
- UNKNOWN

### Definition of Done
The detection engine can analyze test samples without any external API. Evidence Fusion formula produces correct scores for all test cases.

---

## Phase 2 — FastAPI Backend

### Goal
Expose the detection engine through APIs.

Implement:
```text
POST /api/scan
GET /api/history
GET /api/health