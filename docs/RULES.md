# VYNX — Development Rules

## 1. General Principle

VYNX is a cybersecurity-focused application.

All development must prioritize:

1. Security
2. Reliability
3. Explainability
4. Privacy
5. Maintainability
6. User experience

---

## 2. User Input Is Untrusted

All submitted:

* URLs
* Messages
* Emails
* Sender information

must be treated as untrusted input.

Never assume user-provided content is safe.

---

## 3. Never Execute User Content

VYNX must never:

* Execute submitted URLs
* Open submitted URLs automatically
* Download arbitrary resources
* Execute scripts from submitted content
* Treat submitted content as trusted code

The scanner analyzes content without executing it.

---

## 4. AI Output Is Untrusted

Qwen output must not automatically be treated as authoritative.

AI responses must be:

* Parsed
* Validated
* Constrained
* Combined with deterministic evidence

The AI must not directly control security-sensitive application behavior.

---

## 5. Deterministic Fallback

The application must remain usable when Qwen is unavailable.

The deterministic detection engine is the fallback mechanism.

AI failure should not cause the entire scanner to fail.

---

## 6. Secrets

API keys and secrets must never be committed to Git.

Use environment variables.

Example:

```text
QWEN_API_KEY=
QWEN_MODEL=
```

Never place the actual API key in:

* Source code
* README files
* Documentation
* Screenshots
* Frontend code
* Git history

---

## 7. Environment Files

`.env` is local configuration.

`.env.example` may be committed, but it must contain placeholders only.

---

## 8. Validation

All API input must be validated.

Validation should enforce:

* Correct data types
* Required fields
* Supported scan types
* Maximum input lengths
* Request-size limits

---

## 9. Rate Limiting

Public-facing endpoints should be protected against excessive requests.

The current implementation uses:

```text
20 requests/minute/IP
```

---

## 10. Error Handling

Errors should:

* Be handled explicitly
* Avoid exposing secrets
* Avoid exposing internal stack traces to users
* Return appropriate HTTP status codes
* Provide understandable frontend messages

Current important responses include:

```text
413 → Payload Too Large
422 → Validation Error
429 → Rate Limited
500 → Internal Server Error
```

---

## 11. Database

The current MVP uses SQLite.

Database operations should:

* Keep session data scoped
* Avoid unnecessary personal information
* Handle failures safely
* Avoid storing secrets

---

## 12. Privacy

The application should minimize persistent user information.

The current MVP:

* Does not require passwords
* Uses anonymous browser sessions
* Uses UUID-based session identification
* Stores scan metadata against the session
* Keeps history device/session scoped

---

## 13. Frontend Rules

The frontend should:

* Handle loading states
* Handle empty states
* Handle errors
* Provide keyboard accessibility
* Avoid exposing secrets
* Keep API errors understandable
* Respect reduced-motion preferences

---

## 14. Backend Rules

The backend should:

* Validate requests
* Protect secrets
* Apply rate limits
* Apply security middleware
* Validate AI responses
* Avoid executing user content
* Provide deterministic fallback behavior

---

## 15. Dependency Rules

Do not add dependencies without a clear reason.

Before adding a library, evaluate:

* Security
* Maintenance
* Bundle size
* Necessity
* Compatibility

---

## 16. Documentation Rules

Documentation must distinguish between:

### Implemented

Features currently present in the repository.

### Future

Planned features that are not currently implemented.

Documentation must never describe planned infrastructure as currently deployed.

---

## 17. Code Changes

When modifying VYNX:

* Avoid unnecessary rewrites.
* Preserve working functionality.
* Make focused changes.
* Test affected functionality.
* Do not replace the architecture without a clear reason.

---

## 18. Hackathon Integrity

The repository must accurately represent the submitted implementation.

Do not claim that a feature is implemented if it only exists in:

* A roadmap
* A design document
* A planned phase
* A prototype concept

---

## 19. Security Boundary

VYNX is a detection and analysis system.

It should identify and explain suspicious content.

It should not:

* Attack websites
* Exploit vulnerabilities
* Execute malicious payloads
* Automatically interact with suspicious websites
* Perform unauthorized security testing
