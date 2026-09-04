# VYNX — Product Requirements Document

## 1. Product Overview

**VYNX** is an AI-powered phishing, scam, and suspicious-content detector designed with a focus on users in Pakistan.

VYNX analyzes:

* URLs
* SMS/messages
* Emails

It supports content written in:

* English
* Roman Urdu
* Urdu script

The system combines deterministic cybersecurity detection rules with optional Qwen AI analysis to produce an explainable **0–100 risk score**.

VYNX is designed to help users understand whether suspicious content may be dangerous without requiring cybersecurity expertise.

---

## 2. Problem

Phishing and scam messages commonly use:

* Urgency and fear
* Fake account warnings
* Requests for OTPs or personal information
* Fake bank or government identities
* Look-alike domains
* Suspicious links
* Social engineering
* Roman Urdu and Urdu-language messaging

Generic phishing detectors may not adequately account for the language, organizations, banks, telecom providers, and communication patterns commonly encountered by Pakistani users.

VYNX addresses this gap through localized deterministic detection rules combined with contextual AI analysis.

---

## 3. Target Users

### Primary Users

* General internet users
* Students
* Mobile users
* Email users
* People who receive suspicious SMS messages
* Users who are unsure whether a URL or message is legitimate

### Secondary Users

* Cybersecurity learners
* Developers
* Security awareness teams
* Hackathon/demo evaluators

---

## 4. Core Features

### 4.1 URL Scanning

Users can submit a URL for analysis.

VYNX evaluates signals such as:

* Suspicious domains
* Look-alike domains
* URL structure
* Known malicious indicators
* Brand impersonation
* Suspicious paths and patterns

---

### 4.2 Message Scanning

Users can submit SMS or message content.

The system analyzes:

* Threat language
* Urgency
* Sensitive-information requests
* Social engineering
* Suspicious links
* Language-specific patterns
* Brand or organization impersonation

---

### 4.3 Email Scanning

Users can submit email content and optionally provide sender information.

The system can analyze:

* Sender information
* Email content
* Suspicious language
* Urgency
* Social engineering
* Links
* Sensitive-information requests
* Impersonation indicators

---

## 5. AI Analysis

VYNX optionally uses **Qwen AI** for contextual analysis.

The AI provides additional contextual reasoning that complements the deterministic detection engine.

The AI result can contribute:

* AI risk delta
* Confidence
* Explanation
* Suspicious signals

The AI layer is not the sole source of truth.

If Qwen is unavailable, VYNX continues operating using the deterministic rule engine.

---

## 6. Risk Scoring

VYNX combines multiple evidence sources.

Conceptually:

```text
Base Rule Score
       +
Qwen AI Risk Delta
       +
Hard-Veto Indicators
       ↓
Final Risk Score
       ↓
Verdict + Risk Level + Confidence + Signals
```

The final score is normalized to a **0–100 range**.

The system also produces a human-readable explanation and recommended action.

---

## 7. Detection Categories

VYNX can identify suspicious content associated with categories such as:

* PHISHING
* SPAM
* MALICIOUS LINKS
* SUSPICIOUS CONTENT

---

## 8. Localization

VYNX includes detection patterns relevant to Pakistani users.

Examples include:

* Roman Urdu threat language
* Urdu-script patterns
* Pakistani bank impersonation
* Telecom impersonation
* Requests for OTPs
* Requests for CNIC/NADRA-related information
* Localized social-engineering patterns

Localization is implemented through deterministic detection rules rather than relying entirely on the AI model.

---

## 9. Privacy Model

The current MVP does not require traditional user accounts.

Instead:

* A browser-generated UUID identifies a guest session.
* The UUID is stored locally in the browser.
* Scan history is associated with the session ID.
* No password is required.
* Sign-out removes the local session identifier.
* History is device/session scoped.

The application is designed to minimize the amount of persistent user information stored.

---

## 10. Current MVP

The current repository implements:

* URL scanning
* Message scanning
* Email scanning
* English detection
* Roman Urdu detection
* Urdu-script detection
* Deterministic rule engine
* Qwen AI integration
* AI fallback
* Evidence fusion
* Risk scoring
* Confidence calculation
* Explainable results
* Guest sessions
* Scan history
* Dashboard statistics
* Light/dark themes
* Responsive frontend
* Security middleware
* Rate limiting
* Input validation
* SQLite persistence
* Error handling
* Accessibility improvements
* Backend tests

---

## 11. Non-Goals of the Current MVP

The current version does **not** provide:

* Traditional user registration/login
* Supabase authentication
* Cloud-hosted Supabase database
* Automatic browsing of submitted URLs
* Automatic opening/execution of suspicious content
* Community-submitted blacklist management
* Production monitoring through Sentry
* Production cloud deployment

These are intentionally outside the current MVP scope or are future improvements.

---

## 12. Future Roadmap

The following are planned improvements and are **not currently implemented in the submitted MVP**:

1. Supabase authentication and cross-device sessions
2. Sentry monitoring and crash reporting
3. Alibaba Cloud production deployment
4. Community blacklist submissions and review
5. Expanded threat-intelligence integrations
6. Additional language support
7. Improved model-based classification
8. More advanced email parsing
9. Production-scale database infrastructure

---

## 13. Success Criteria

VYNX succeeds when a user can:

1. Open the application.
2. Submit a suspicious URL, message, or email.
3. Receive a risk score.
4. Understand why the content was flagged.
5. See relevant threat signals.
6. Receive a recommended action.
7. Review previous scans.
8. Use the application without creating an account.

---

## 14. Hackathon Objective

VYNX demonstrates how deterministic cybersecurity rules and generative AI can work together to create an explainable phishing and scam detection system.

The project specifically demonstrates Qwen AI integration while maintaining deterministic fallback behavior for reliability and security.
