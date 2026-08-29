
**What changed:** Updated architecture diagram to show parallel execution, Docker, SAE, Pydantic validation. Added Input Limits table. Added Deployment section. Added Anonymous Auth to Core Features. Added Tech Stack section. Everything else is original.

---

## `docs/ARCHITECTURE.md`

```markdown
# VYNX — System Architecture

## 1. Architecture Overview

VYNX uses a modular architecture.

Frontend:
React + Vite + TypeScript + Tailwind CSS

Backend:
Python + FastAPI (containerized with Docker)

AI:
Qwen via Alibaba Cloud API

Database:
Supabase (PostgreSQL)

Authentication (MVP):
Supabase Anonymous Sign-in

Deployment:
Alibaba Cloud SAE (Serverless App Engine) via Docker container

Source Control:
GitHub

---

## 2. High-Level Architecture

```text
USER
|
v
React + Vite Frontend
|
| HTTPS
v
FastAPI API (Docker / Alibaba Cloud SAE)
|
Input Validation (Pydantic, character limits)
|
Input Normalization
|
Signal Extraction
|
+---- asyncio.gather (parallel) ----+
|                                   |
v                                   v
Deterministic Rules             Qwen AI
(~50ms)                        (~2-5s)
|                                   |
+----------------+------------------+
                 |
            Evidence Fusion
     (Base + Penalty/Reward + Hard Veto)
                 |
          Risk Calculation
                 |
          Result Generation
                 |
     +-----------+-----------+
     |                       |
     v                       v
 API Response           Supabase
                        (Anonymous UUID)
                        History