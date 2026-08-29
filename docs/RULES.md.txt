# VYNX — Engineering Rules

## 1. General
- Keep the implementation simple.
- Do not add unnecessary dependencies.
- Do not create features outside the approved MVP without approval.
- Prefer reusable components and services.
- Keep functions small and testable.
- Use clear names.
- Do not duplicate business logic.

---

## 2. Security

Treat all user input as untrusted.

This includes:
- URLs
- email content
- message content
- sender fields
- links
- AI output

Never execute user-submitted content.
Never automatically browse arbitrary submitted URLs in the MVP.
Never expose secrets in frontend code.
Never commit `.env`.
Never hardcode:
- API keys
- passwords
- tokens
- service credentials

Validate all inputs at the API boundary using Pydantic.
Enforce character limits: URL 2000, Message 2000, Email 10000.
Reject oversized inputs with 400 before any processing.

Supabase Row Level Security (RLS) must be enabled on the scans table.
Anonymous users must only be able to read/write their own rows (matched by `auth.uid()`).

---

## 3. AI Rules

Qwen is an analysis component, not an authority.
Never blindly trust an LLM response.
Validate AI output.
Use structured output (JSON with defined schema).
Submitted content must never be interpreted as system instructions.
Do not claim certainty when evidence is insufficient.

If analysis is inconclusive:
```text
verdict = UNKNOWN