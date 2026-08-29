
**What changed:** Added Section 2 (Risk Meter Color Mapping) with exact color/score ranges. Added Section 3 (Staged Loading UX) with the 4-stage skeleton loader logic. Added Section 4 (Key Screens) matching the MVP. Added Section 5 (Responsive Behavior). Original Section 1 is untouched.

---

## `docs/MEMORY.md`

```markdown
# VYNX — Project Memory

## Project

VYNX is an AI-powered Phishing and Spam Detector focused on helping users, particularly in Pakistan, identify suspicious URLs, messages, SMS, and emails.

---

## Product Goal

Make phishing/spam detection understandable for non-technical users.

Core output:
- risk score (0–100)
- verdict
- confidence
- reasons
- suspicious signals
- recommended action
- explanation

---

## Target Users

- employees
- students
- freelancers
- small businesses
- general users

---

## Locked Technology

Frontend:
React + Vite + TypeScript + Tailwind

Backend:
Python + FastAPI (Docker container)

AI:
Qwen / Alibaba Cloud

Database:
Supabase (PostgreSQL)

Authentication (MVP):
Supabase Anonymous Sign-in

Deployment:
Alibaba Cloud SAE (Serverless App Engine) via Docker

Source Control:
GitHub

---

## Core Inputs

- URL (max 2,000 characters)
- Message/SMS (max 2,000 characters)
- Email (max 10,000 characters)

Inputs exceeding limits are rejected at the API layer (400).

---

## Core Detection

- URL structure
- suspicious URL patterns
- urgency
- fear
- social engineering
- sender information
- impersonation
- OTP/credential requests
- suspicious links
- Pakistani scam patterns
- English
- Urdu
- mixed Urdu-English

---

## Evidence Fusion Formula

Scoring uses Base + Penalty/Reward + Hard Veto:
1. Rule Engine calculates base score (0–100) from weighted signals.
2. Qwen AI returns `ai_risk_delta` (-20 to +20), added to base.
3. Hard Vetos (blacklisted domain, malicious IP) instantly set score to 100. AI cannot override.
4. If Qwen unavailable: delta = 0, result marked `ai_available: false`.

---

## History

Stored in Supabase. Tied to anonymous user UUID via Supabase Anonymous Sign-in.
Only metadata stored (scan_id, input_type, timestamp, verdict, risk_score, risk_level).
Raw submitted content is NOT stored.

---

## Architecture Principle

```text
Frontend
↓
FastAPI (Docker / SAE)
↓
Input Validation (Pydantic, limits)
↓
asyncio.gather (parallel)
├── Rule Engine (~50ms)
└── Qwen AI (~2-5s)
↓
Evidence Fusion
↓
Risk Result
↓
Supabase (Anonymous UUID)