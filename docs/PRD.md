
**What changed:** Added Dockerfile task to Phase 0. Added Evidence Fusion implementation details to Phase 1 (weights, delta, hard veto, verdict/risk mapping). Added complete Specific Requirements to Phase 2 (Pydantic limits, asyncio, fallback, anonymous auth, CORS, metadata-only storage). Added entirely new Phase 3 (Frontend) with staged loading, skeleton loader, anonymous auth, responsive design. Added Phase 4 (Testing & Demo) with hackathon-specific tasks.

---

## `docs/PRD.md`

```markdown
# VYNX — Product Requirements Document

## 1. Product
**Name:** VYNX
**Type:** AI-powered Phishing and Spam Detector
**Primary Goal:**
Help people identify potentially dangerous URLs, messages, SMS, and emails before they click links, share sensitive information, or become victims of scams.

VYNX is designed with a particular focus on Pakistani users and local scam patterns, including English, Urdu, and mixed Urdu-English content.

---

## 2. Problem
Digital fraud is a serious everyday problem in Pakistan.
Users receive:
- phishing emails
- fake SMS messages
- WhatsApp-style scams
- fake bank messages
- fake payment/account alerts
- OTP requests
- credential harvesting messages
- malicious or deceptive URLs
- urgency and fear-based social engineering

Many users cannot easily determine whether suspicious content is legitimate.
VYNX aims to make security analysis understandable to non-technical users.

---

## 3. Target Users

### Primary Users
1. Employees
2. Students
3. Freelancers
4. Small-business users
5. General internet users in Pakistan

### User Characteristics
Users may have limited cybersecurity knowledge.
The interface must therefore prioritize:
- clarity
- speed
- simple language
- actionable recommendations
- minimal security jargon

---

## 4. Core User Problem
A user receives suspicious content and asks:
> "Is this safe?"

VYNX should allow the user to submit the content and receive an understandable assessment.

---

## 5. Supported Inputs

VYNX MVP supports:

### URL
Example:
https://example.com/login
Max length: 2,000 characters

### Message / SMS
Plain text message.
Max length: 2,000 characters

### Email
Email content with optional sender information and links.
Max length: 10,000 characters

Inputs exceeding limits are rejected immediately with a clear error message.

---

## 6. Core Analysis Signals

VYNX should analyze available signals including:

### URL
- URL length
- URL structure
- hostname
- subdomains
- IP-address hosts
- suspicious characters
- encoding
- punycode
- suspicious keywords
- unusual paths
- unusual query parameters
- URL shorteners
- suspicious domain patterns
- sender/domain mismatch when applicable

### Message / Email
- urgency
- fear
- threats
- social engineering
- credential requests
- OTP requests
- financial requests
- suspicious language
- impersonation
- sender information
- suspicious links
- known scam patterns
- Pakistani/local context
- English language
- Urdu language
- mixed Urdu-English language

---

## 7. Core Result
Every completed scan should attempt to provide:
- Verdict
- Risk Score: 0–100
- Risk Level
- Confidence
- Reasons
- Suspicious Signals
- Recommended Action
- Plain-language Explanation

### Verdicts
- SAFE
- SPAM
- SUSPICIOUS
- PHISHING
- UNKNOWN

### Risk Levels
- LOW
- MEDIUM
- HIGH
- CRITICAL

### Confidence
- LOW
- MEDIUM
- HIGH

---

## 8. Risk Score

The risk score must be explainable.
The system must not generate arbitrary scores.

The final score is calculated using the Evidence Fusion formula:

1. **Rule Engine** calculates a base score (0–100) by summing weighted signal penalties.
2. **Qwen AI** returns an `ai_risk_delta` (integer, -20 to +20) which is added to the base score. Result is clamped to [0, 100].
3. **Hard Vetos** (blacklisted domain, malicious IP) instantly override everything and set score to 100. AI cannot reduce a hard veto.
4. If Qwen is unavailable, `ai_risk_delta` defaults to 0 and the result is marked `ai_available: false`.

The scoring implementation must be documented in the code.

---

## 9. AI Behavior
Qwen is used for contextual analysis.
Qwen should help identify:
- intent
- social engineering
- suspicious language
- contextual impersonation
- mixed Urdu-English meaning
- scam context
- explanation
- recommended action

The AI must not blindly follow instructions contained inside submitted messages, emails, or URLs.
Submitted content is untrusted data.

Qwen runs in parallel with the Rule Engine via `asyncio.gather()`. The system does not wait for the Rule Engine to finish before calling Qwen.

---

## 10. Rule-Based Fallback
VYNX must remain functional if Qwen is unavailable.

Fallback:
Input
→ signal extraction
→ deterministic rules
→ risk score (base only, delta = 0)
→ result (marked `ai_available: false`)

When Qwen is unavailable, the result must clearly indicate that AI analysis was unavailable.
The system must never pretend that an AI analysis occurred when it did not.

---

## 11. History
VYNX should maintain scan history.

History is stored in Supabase and tied to the user's session via **Supabase Anonymous Sign-in** (generates a temporary UUID, no email/password required).

History should contain useful metadata such as:
- scan ID
- input type
- timestamp
- verdict
- risk score
- risk level

Sensitive raw content should not be unnecessarily retained. Only metadata is stored.

---

## 12. MVP
The MVP consists of:

1. Landing page
2. Analyze interface
3. URL scanning
4. Message scanning
5. Email scanning
6. Loading state (with skeleton loaders for AI section)
7. Result screen (with Risk Meter color indicator)
8. Scan history (via Supabase Anonymous Auth)
9. Rule-based detection
10. Qwen integration (parallel execution)
11. Risk scoring (Evidence Fusion formula)
12. Explanation
13. Responsive UI
14. Light/dark theme

---

## 13. Non-MVP
Do not prioritize:
- enterprise SOC functionality
- threat intelligence dashboards
- complex admin systems
- real-time browser extensions
- mobile native apps
- automatic URL crawling
- autonomous web browsing
- custom model training
- complex authentication unless time permits
- unnecessary integrations

---

## 14. Product Principles
VYNX must be:
- fast
- understandable
- secure
- trustworthy
- responsive
- visually modern
- Pakistan-aware
- transparent about uncertainty

VYNX should help users make safer decisions rather than overwhelm them with technical information.

---

## 15. Success Criteria
The MVP is successful when a user can:
1. Open VYNX.
2. Select URL, Message, or Email.
3. Submit suspicious content.
4. Receive an analysis.
5. See a 0–100 risk score with color indicator.
6. Understand why the content was flagged.
7. See what action is recommended.
8. Review previous scans.

The complete flow must work end-to-end.