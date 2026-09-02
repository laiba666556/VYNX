# VYNX

## AI-Powered Phishing and Scam Detector for Pakistan

VYNX checks a suspicious link, SMS, or email before you act on it — in English, Roman-Urdu, and Urdu script. It combines a deterministic rule engine with optional Qwen AI analysis, fuses the evidence into a 0–100 risk score, and tells the user what to do next in plain language.

Built for the Alibaba Cloud AI Hackathon.

---

## Core Features

**Detection**

- URL, message, and email scanning with a single endpoint
- Rule engine covering English, Roman-Urdu, and Urdu-script phishing patterns
- Sender spoofing and look-alike domain detection (including Pakistan-specific bank and telco impersonation)
- Blacklist hard-veto for known malicious indicators
- Qwen AI contextual analysis that degrades gracefully when no API key is configured — the UI labels those results "rule-engine verdict only"
- Evidence fusion: base score + AI delta + hard veto → verdict, risk level, confidence, triggered signals, recommended action

**Product**

- Anonymous guest sessions — the browser generates a UUID, no account needed
- Sidebar navigation with three views: Scanner, Dashboard, History
- Dashboard aggregates for the session: total scans, threats flagged, safe percentage, verdict and risk-level breakdowns
- Scan history scoped to the guest session (latest 20)
- Light and dark themes, chosen before first paint and persisted in `localStorage`
- Glass/chrome UI with motion that respects `prefers-reduced-motion`

**Robustness**

- Rate limiting (20 requests/min/IP), payload-size guard, and security headers on the API
- Strict Pydantic validation with per-type length caps
- SQLite history with an idempotent `session_id` migration for existing databases
- Plain-language toasts for 413, 422, 429, 500, and network failures
- Loading skeletons, empty states, and error states on every view
- React error boundary with a reload path instead of a white screen
- Keyboard support: Ctrl/Cmd + Enter to scan, visible focus rings, `aria-live` results, labelled inputs

---

## Privacy: why there is no password

VYNX uses anonymous guest sessions, so there is no registration, no email, and no password — which also means there is no password store to leak and no reset flow to build. The browser generates a UUID v4, keeps it in `localStorage`, and sends it as `?session_id=` on scan, history, and stats calls. The backend stores scan metadata (type, score, verdict, level, signals, timestamp) against that id and nothing else. Signing out removes the id from the browser, so the app stops showing that history on the device. Full details are in the in-app **Terms & Privacy** modal.

Trade-off, stated honestly: history is device-scoped, not synced across devices. Real accounts (Supabase anonymous sign-in upgraded to email/OAuth) are on the roadmap.

---

## Roadmap

- Supabase auth to carry a guest session across devices
- Sentry crash reporting in the frontend and backend
- Deployment to Alibaba Cloud SAE via Docker
- Community blacklist submissions with review

---

## Architecture

```text
React + Vite (glass UI, guest session in localStorage)
↓
FastAPI (Docker on Alibaba Cloud SAE)
↓
Input Validation (Pydantic, strict limits) + SecurityMiddleware (rate limit, size guard, headers)
↓
Parallel Execution (asyncio)
├── Deterministic Rules  (runs instantly)
└── Qwen AI              (runs in parallel, optional)
↓
Evidence Fusion (Base + Penalty/Reward + Hard Veto)
↓
Risk Result
↓
SQLite (scan history + session-scoped stats)
```

More detail in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/API_SPEC.md`](docs/API_SPEC.md).

---

## Running locally

**Backend** (Python 3.14, port 8000)

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

Optional AI analysis: copy `.env.example` to `.env` and set `DASHSCOPE_API_KEY`. Without it, VYNX still works on rules alone.

**Frontend** (port 5173, proxies `/api` to 8000)

```bash
cd frontend
npm install
npm run dev
```

**Tests**

```bash
.venv\Scripts\python.exe -m pytest tests/backend -q
```

31 tests covering detection rules, Urdu/Roman-Urdu handling, scoring caps, blacklist veto, security middleware, rate limiting, and session-scoped history and stats.

---

## Judge demo script (3 minutes)

1. Open `http://localhost:5173`. Land on the guest sign-in card — point out that there is no email or password field, then open **Terms & Privacy** to show what is and is not stored.
2. Click **Continue as guest**. The Scanner loads first, because that is the job the user came to do.
3. Scan a malicious URL: `http://hbl-login-secure.com/verify`. Show the animated risk meter, the verdict and risk-level chips, the triggered signals, and the recommended action.
4. Scan a legitimate message: a real HBL or Jazz SMS alert text. Show that VYNX says SAFE and explains why — it is not a tool that flags everything.
5. Open **History**: both scans appear, scoped to this guest session only.
6. Open **Dashboard**: totals, threats flagged, safe percentage, and the verdict/risk-level bars.
7. Toggle **Dark mode** in the sidebar, reload the page — the theme persists with no flash of the wrong theme.
8. Ask about abuse: 20 scans/minute per IP returns 429, and the UI says "Too many scans — wait a minute and try again" instead of breaking.
9. Stop the backend and scan again — the toast reads "Backend unreachable", and a React error boundary catches render crashes with a reload button rather than a white screen.

---

## License

See [LICENSE](LICENSE).
