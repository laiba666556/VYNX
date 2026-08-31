# VYNX

## AI-Powered Phishing and Spam Detector

VYNX is a web application designed to help users identify potentially dangerous URLs, messages, SMS, and emails.

VYNX focuses on understandable security analysis, including English, Urdu, mixed Urdu-English content, social engineering, suspicious links, sender impersonation, and Pakistan-specific scam patterns.

---

## Core Features

- URL/message/email scanning
- Rule engine covering English, Roman-Urdu and Urdu-script phishing patterns
- Sender spoofing and look-alike domain detection
- Blacklist hard-veto for known malicious indicators
- Qwen AI contextual analysis that degrades gracefully when no API key is configured
- Risk score 0–100 with verdict, confidence, signals and recommended action
- SQLite scan history available via GET /api/history

---

## Roadmap

- Frontend history page
- Supabase anonymous sessions
- Light/dark theme
- Deployment to Alibaba Cloud SAE via Docker

---

## Architecture

```text
React + Vite
↓
FastAPI (Docker on Alibaba Cloud SAE)
↓
Input Validation (Pydantic, strict limits)
↓
Parallel Execution (asyncio)
├── Deterministic Rules  (runs instantly)
└── Qwen AI             (runs in parallel)
↓
Evidence Fusion (Base + Penalty/Reward + Hard Veto)
↓
Risk Result
↓
SQLite (scan history)
```

---

## Running locally

Backend: `pip install -r requirements.txt` then `uvicorn backend.main:app --reload` (port 8000)

Frontend: `npm install` then `npm run dev` (port 5173)

Tests: `pytest`