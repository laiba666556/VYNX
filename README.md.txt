# VYNX

## AI-Powered Phishing and Spam Detector

VYNX is a web application designed to help users identify potentially dangerous URLs, messages, SMS, and emails.

VYNX focuses on understandable security analysis, including English, Urdu, mixed Urdu-English content, social engineering, suspicious links, sender impersonation, and Pakistan-specific scam patterns.

---

## Core Features

- URL analysis
- Message/SMS analysis
- Email analysis
- AI contextual analysis (Qwen)
- Deterministic security rules (Rule Engine)
- Risk score from 0–100
- Verdict
- Confidence
- Suspicious signals
- Plain-language explanation
- Recommended action
- Scan history (Supabase, anonymous sessions)
- Light/dark mode
- Responsive interface

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
Supabase (Anonymous Auth for history)