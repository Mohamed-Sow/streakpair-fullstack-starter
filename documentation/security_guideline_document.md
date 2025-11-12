# Security Guidelines for streakpair-fullstack-starter (StreakPair)

This document outlines security best practices tailored to the `streakpair-fullstack-starter` codebase as the foundation for the **StreakPair** social accountability app. Follow these guidelines to ensure a secure, robust, and maintainable application.

---

## 1. Secure Authentication & Access Control

- **Password Storage:**
  - Use a strong, adaptive hashing algorithm (Argon2 or bcrypt) with a unique salt per user.
  - Enforce a minimum password length (≥12 characters) and complexity (mixed case, digits, symbols).

- **Session Management:**
  - Store session identifiers in a secure, HttpOnly, `Secure`, `SameSite=Strict` cookie.
  - Rotate session IDs on login and privilege changes to prevent fixation.
  - Implement idle and absolute timeouts (e.g., 30 min idle, 8 hr absolute).
  - Provide a server-side logout endpoint that invalidates sessions.

- **JSON Web Tokens (if adopted):**
  - Avoid the `none` algorithm; use `RS256` or `HS256` with a strong secret or private key.
  - Validate the token signature, `exp`, `iat`, and `aud` claims on every request.
  - Store secrets in a vault (e.g., AWS Secrets Manager). Do not commit them to the repo.

- **Role-Based Access Control (RBAC):**
  - Define granular roles (e.g., `user`, `admin`, `group-owner`).
  - Enforce server-side authorization on every API route and page.
  - Validate that a user can only act on resources they own or manage.

- **Multi-Factor Authentication (MFA):**
  - Offer TOTP (e.g., Google Authenticator) or SMS-based second factors for sensitive actions (payments, account changes).

---

## 2. Input Validation & Output Encoding

- **Server-Side Validation:**
  - Validate all incoming data in API routes using a schema validator (e.g., Zod).
  - Reject or sanitize unexpected fields; enforce strict typing in TypeScript.

- **Prevent Injection Attacks:**
  - Use Drizzle ORM’s parameterized queries—never concatenate user input into SQL strings.
  - If invoking shell commands or external processes, strictly whitelist arguments.

- **Cross-Site Scripting (XSS):**
  - Escape or encode all user-generated content in React (the default is safe, avoid using `dangerouslySetInnerHTML`).
  - Implement a strong Content Security Policy (CSP) to restrict script sources.

- **Cross-Site Request Forgery (CSRF):**
  - For state-changing POST/PUT/DELETE requests, use anti-CSRF tokens (Synchronizer Token Pattern or double-submit cookie).

- **Safe Redirects:**
  - Maintain an allow-list of valid internal paths when redirecting (e.g., after login).

---

## 3. Data Protection & Privacy

- **Transport Encryption:**
  - Enforce HTTPS (TLS 1.2+) for all client/server communication.
  - Redirect HTTP → HTTPS via server or CDN configuration.

- **At-Rest Encryption:**
  - Use database-level encryption or disk encryption for PostgreSQL data volumes.

- **Secrets Management:**
  - Store API keys (Stripe, Twilio), database credentials, and JWT secrets in environment variables backed by a secrets manager.
  - Rotate secrets regularly and follow least-privilege when assigning access.

- **PII Handling:**
  - Mask or truncate displayed user data (e.g., phone numbers, email addresses) in logs and UIs.
  - Only collect necessary PII; implement a data-retention policy aligned with GDPR/CCPA.

---

## 4. API & Service Security

- **Rate Limiting & Throttling:**
  - Apply per-IP and per-user rate limits on critical endpoints (login, check-in, payment) to mitigate brute-force and DoS.

- **CORS Configuration:**
  - Restrict `Access-Control-Allow-Origin` to the official StreakPair domains.
  - Only permit required HTTP methods and headers.

- **HTTP Methods & Versioning:**
  - Use correct verbs (GET for reads, POST for creates, PUT/PATCH for updates, DELETE for removes).
  - Prefix API routes with version (`/api/v1/...`) to manage breaking changes.

- **Webhook Security (Stripe/Twilio):**
  - Validate webhook signatures using the provider’s secret.
  - Respond with the correct status codes (2xx on success).

---

## 5. Web Application Security Hygiene

- **Security Headers:**
  - Content-Security-Policy (CSP)
  - Strict-Transport-Security (HSTS)
  - X-Content-Type-Options: `nosniff`
  - X-Frame-Options: `DENY` or `SAMEORIGIN`
  - Referrer-Policy: `no-referrer-when-downgrade`

- **Secure Cookies:**
  - `HttpOnly`, `Secure`, `SameSite=Strict`.

- **Subresource Integrity (SRI):**
  - For any external scripts/stylesheets, include integrity hashes to detect tampering.

- **Disable Client-Side Debugging:**
  - Strip React/Next.js development warnings in production builds.

---

## 6. Infrastructure & Deployment

- **Docker Hardening:**
  - Use minimal base images (e.g., `node:18-alpine`).
  - Run containers as a non-root user.

- **Change Default Credentials:**
  - Ensure the PostgreSQL container uses custom credentials and no default accounts.

- **Network Segmentation:**
  - Expose only necessary ports (80/443 for web, 5432 bound to the internal network).

- **TLS Configuration:**
  - Disable weak ciphers and older protocols (SSLv3, TLS 1.0/1.1).

- **Logging & Monitoring:**
  - Centralize logs (stdout → journald or a log aggregator).
  - Monitor for anomalous spikes in failed logins or API errors.

---

## 7. Dependency Management

- **Lockfiles:**
  - Commit `package-lock.json` or `yarn.lock` to ensure reproducible builds.

- **Vulnerability Scanning:**
  - Integrate SCA tools (e.g., Snyk, GitHub Dependabot) to detect and alert on CVEs.

- **Minimal Footprint:**
  - Audit and remove unused dependencies.
  - Prefer well-maintained libraries with strong security track records.

- **Regular Updates:**
  - Patch Next.js, Tailwind, Drizzle ORM, and other core libs promptly.

---

## 8. CI/CD & Testing

- **Automated Testing:**
  - Unit tests for business logic (Jest/Vitest).
  - Component tests (React Testing Library).
  - End-to-end flows (Playwright/Cypress) covering registration, check-in, and payments.

- **Static Analysis & Linting:**
  - Use ESLint with security plugins (eslint-plugin-security).
  - Enforce TypeScript strict mode.

- **Secret Scanning:**
  - Integrate Pre-commit hooks or GitHub Actions to prevent accidental commits of secrets.

- **Continuous Deployment:**
  - Automate builds and deployments through GitHub Actions or similar, gating on passing tests and security checks.

---

## Recommendations & Next Steps

1. Implement a formal security review or threat modeling session before major feature work.
2. Set up real-time monitoring for suspicious activities (e.g., fail2ban for SSH, alerts on repeated login failures).
3. Document an incident response plan outlining steps for breach detection, containment, and recovery.
4. Schedule regular penetration tests and audits as the project grows.

By embedding these guidelines into your development workflow, the StreakPair application will benefit from a strong security posture, reducing risk as you scale and innovate.