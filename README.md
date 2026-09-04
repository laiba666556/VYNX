# VYNX

## AI-Powered Phishing and Scam Detector for Pakistan

VYNX helps users detect suspicious **URLs, SMS messages, and emails** before they interact with them.

It combines a deterministic security rule engine with optional **Qwen AI** contextual analysis and fuses the evidence into a **0–100 risk score**, risk level, confidence, detected signals, and a recommended action.

VYNX is designed with Pakistan-specific phishing patterns in mind, including **English, Roman-Urdu, and Urdu-script content**, bank and telecom impersonation, suspicious links, urgency tactics, and requests for sensitive information.

> Built for the Alibaba Cloud AI Hackathon.

---

## Core Features

### Detection

* URL, message, and email scanning through a unified API
* Deterministic rule engine for:

  * English phishing patterns
  * Roman-Urdu phishing patterns
  * Urdu-script phishing patterns
  * Urgency and threat language
  * Sensitive-information requests
  * Suspicious links
  * Sender spoofing
  * Look-alike domains
  * Pakistan-specific bank and telecom impersonation
* Blacklist hard-veto for known malicious indicators
* Optional Qwen AI contextual analysis
* Graceful AI fallback when Qwen is unavailable
* Evidence fusion combining:

  * Deterministic base score
  * AI score adjustment
  * Security penalties/rewards
  * Hard-veto conditions
* Final result includes:

  * Verdict
  * Risk score
  * Risk level
  * Detection confidence
  * Triggered signals
  * Recommended action
  * Plain-language explanation

### Product

* Anonymous guest sessions with no registration required
* Browser-generated UUID for session identification
* Scanner for URL, SMS, and email analysis
* Session-scoped scan history
* Dashboard with:

  * Total scans
  * Threats flagged
  * Safe percentage
  * Verdict breakdown
  * Risk-level breakdown
* Latest 20 scans shown in history
* Light and dark themes
* Theme persistence using `localStorage`
* Glass/chrome visual design
* Motion that respects `prefers-reduced-motion`
* Responsive interface
* Accessible keyboard navigation and labelled controls

---

## How VYNX Works

```text
User
  |
  v
React + Vite Frontend
  |
  v
FastAPI Backend
  |
  +-----------------------------+
  |                             |
  v                             v
Input Validation          Security Middleware
(Pydantic)                Rate Limit / Size Guard
  |                       Security Headers
  +-------------+---------------+
                |
                v
       Parallel Analysis
          /           \
         /             \
        v               v
Deterministic        Qwen AI
Rule Engine          (Optional)
        \               /
         \             /
          +-----------+
                |
                v
         Evidence Fusion
                |
                v
        Risk & Verdict Result
                |
                v
          SQLite History
```

### Current MVP

The current application runs locally with:

* **Frontend:** React + Vite + TypeScript
* **Styling:** Tailwind CSS / custom glass-neon UI
* **Backend:** Python + FastAPI
* **AI:** Qwen through DashScope
* **Detection:** Deterministic security rules + Qwen contextual analysis
* **Database:** SQLite
* **Session management:** Anonymous browser UUID
* **Testing:** Pytest
* **Source control:** GitHub

### Planned Production Architecture

Production deployment is planned for Alibaba Cloud.

Future infrastructure may include:

* Alibaba Cloud deployment
* Docker-based backend deployment
* Supabase authentication
* Managed PostgreSQL storage
* Cross-device user history
* Sentry monitoring
* Community blacklist management

These components are **roadmap items and are not presented as currently deployed functionality**.

---

## Privacy: Why There Is No Password

VYNX currently uses anonymous guest sessions.

There is:

* No registration
* No email collection
* No password
* No password database
* No password reset flow

The browser generates a UUID v4 and stores it locally.

That session identifier is sent with scan, history, and statistics requests so the backend can keep the user's scan history separated from other sessions.

The backend stores scan metadata such as:

* Scan type
* Risk score
* Verdict
* Risk level
* Signals
* Timestamp
* Session identifier

VYNX does not require users to create an account to use the scanner.

### Privacy Trade-off

Because the current MVP uses a browser-scoped anonymous session, history is **device/browser scoped**.

If the user changes device or clears browser storage, their previous guest history is not automatically available.

Cross-device accounts and persistent authentication are planned for a future version.

---

## Security & Robustness

VYNX is designed to treat scanned content as **untrusted input**.

The backend includes:

* Pydantic input validation
* Per-input length limits
* Payload-size protection
* Rate limiting
* Security headers
* Structured error handling
* SQLite session isolation
* AI failure fallback
* Environment-based secret management

The frontend includes:

* Loading states
* Empty states
* Error states
* Network-error handling
* 413 payload-too-large handling
* 422 validation-error handling
* 429 rate-limit handling
* 500 server-error handling
* React error boundary
* Keyboard shortcuts
* Visible focus states
* `aria-live` result announcements
* Reduced-motion support

### AI Safety Boundary

Qwen is used as a contextual analysis component.

The deterministic rule engine remains an independent security layer, allowing VYNX to continue producing a result when AI analysis is unavailable.

API keys are stored through environment variables and are not committed to the repository.

---

## Roadmap

The following capabilities are planned for future versions:

### Authentication & Accounts

* Supabase authentication
* Guest-to-account upgrade
* Email/OAuth authentication
* Cross-device history

### Infrastructure

* Alibaba Cloud production deployment
* Docker-based deployment
* Managed database infrastructure
* Production monitoring

### Security

* Sentry crash reporting
* Expanded threat intelligence
* Community blacklist submissions
* Blacklist review workflow

### Product

* More advanced analytics
* Improved multilingual detection
* Additional phishing and scam categories
* Expanded user education and explanations

---

## Project Structure

```text
VYNX/
│
├── ai/
│   └── qwen_client.py
│
├── backend/
│   ├── main.py
│   ├── ...
│   └── API/security logic
│
├── detection/
│   ├── ...
│   └── deterministic detection rules
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── tests/
│   └── backend/
│
├── docs/
│   ├── API_SPEC.md
│   ├── ARCHITECTURE.md
│   ├── DESIGN.md
│   ├── MEMORY.md
│   ├── PHASES.md
│   ├── PRD.md
│   └── RULES.md
│
├── .env.example
├── .gitignore
├── LICENSE
├── README.md
└── requirements.txt
```

---

## Running Locally

### 1. Backend

Python 3.14 is currently used for the backend.

Create and activate the virtual environment:

```powershell
python -m venv .venv
.venv\Scripts\activate
```

Install dependencies:

```powershell
pip install -r requirements.txt
```

Start FastAPI:

```powershell
uvicorn backend.main:app --reload
```

The backend runs on:

```text
http://localhost:8000
```

### 2. Optional Qwen AI

Copy the example environment file:

```powershell
Copy-Item .env.example .env
```

Add the Qwen API key to `.env`:

```env
QWEN_API_KEY=your_key_here
QWEN_MODEL=qwen-plus
```

The application can still operate using the deterministic rule engine when Qwen is unavailable.

**Never commit `.env` or expose your API key publicly.**

### 3. Frontend

Open another PowerShell terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

The frontend communicates with the FastAPI backend through the `/api` routes.

---

## Testing

From the project root:

```powershell
.venv\Scripts\python.exe -m pytest tests/backend -q
```

The test suite covers areas including:

* Detection rules
* English phishing patterns
* Roman-Urdu handling
* Urdu-script handling
* Risk scoring
* Score caps
* Blacklist hard-veto
* Security middleware
* Rate limiting
* Session-scoped history
* Session-scoped statistics

---

## Judge Demo — 3 Minutes

### 1. Open VYNX

Open:

```text
http://localhost:5173
```

Show the guest entry screen.

Point out that VYNX does **not require an email or password**.

Open **Terms & Privacy** to demonstrate what information is stored.

### 2. Start a Guest Session

Click:

**Continue as guest**

The Scanner opens first because scanning is the primary task.

### 3. Demonstrate a Malicious URL

Use:

```text
http://hbl-login-secure.com/verify
```

Show:

* Risk score
* Risk level
* Verdict
* Detection confidence
* Triggered signals
* Recommended action
* Explanation

Explain that VYNX combines deterministic security rules with contextual AI analysis.

### 4. Demonstrate a Legitimate Message

Use a legitimate HBL or Jazz notification.

Show that VYNX can identify safe content instead of simply flagging everything as malicious.

### 5. Show History

Open **History**.

Demonstrate that the scans from the current guest session are stored and displayed.

### 6. Show Dashboard

Open **Dashboard**.

Demonstrate:

* Total scans
* Threats flagged
* Safe percentage
* Verdict distribution
* Risk-level distribution

### 7. Demonstrate Dark Mode

Toggle dark mode.

Reload the page and show that the selected theme persists.

### 8. Demonstrate Rate Limiting

Trigger repeated requests until the API rate limit is reached.

VYNX should return a `429` response and show a user-friendly message instead of breaking.

### 9. Demonstrate Backend Failure Handling

Stop the backend and attempt another scan.

The frontend should show a backend/network error state rather than failing silently.

---

## API Overview

| Endpoint       | Method | Purpose                               |
| -------------- | ------ | ------------------------------------- |
| `/api/health`  | GET    | Backend health check                  |
| `/api/scan`    | POST   | Analyze URL, message, or email        |
| `/api/history` | GET    | Retrieve session scan history         |
| `/api/stats`   | GET    | Retrieve session dashboard statistics |

Detailed API behavior is documented in:

* `docs/API_SPEC.md`
* `docs/ARCHITECTURE.md`

---

## Hackathon Objective

VYNX demonstrates how generative AI can be combined with deterministic security logic to create a practical intelligent agent for phishing and scam detection.

The project focuses on a real-world problem affecting users who receive suspicious:

* Links
* SMS messages
* Emails
* Bank impersonation messages
* Telecom impersonation messages
* Urgent requests for sensitive information

Rather than relying exclusively on an AI model, VYNX combines **rule-based security signals, contextual Qwen analysis, and evidence fusion** to produce a more explainable risk assessment.

---

## License

See [`LICENSE`](LICENSE).
<!-- README updated -->
