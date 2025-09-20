# 13. Security and Performance
## Security Requirements
* **Frontend:** Strict Content-Security-Policy (CSP) will be implemented.
* **Backend:** All API inputs will be validated with Zod; rate limiting will be enforced with Upstash Redis.
* **Authentication:** Secure, HTTP-only cookies will be used for session management via NextAuth.js. Secrets will be stored as Vercel Environment Variables.
* **Password Reset:** Reset tokens are generated using cryptographically secure randomness, hashed before persistence, scoped to a 1-hour TTL, and invalidated after use. `/auth/forgot-password` and `/auth/reset-password` are rate-limited per IP + account, and successful resets trigger session revocation.
* **Usage Gating:** `recordUsage` checks are executed before each LLM call; limits are enforced server-side to prevent client tampering. Usage counters reside in Redis with automatic midnight expiry and audit logs capture limit breaches.
* **Stripe Webhooks:** The webhook handler reads the raw body, verifies signatures with the Stripe SDK, and rejects unverified or replayed events. Subscription downgrades triggered by missed payments must fire alerts before setting `subscription_status='free'`.
* **Governed Data Access:** The Transparency Service validates every OpenRouter `web` plugin result against the allow-list before it reaches the model; tool call logs capture source IDs, engines used, and denial details for auditability and monitoring.
## Performance Optimization
* **Frontend:** Route-based code-splitting, lazy-loading, and skeleton loaders will be used.
* **Backend:** A caching layer with Upstash Redis will be implemented for frequently accessed data, and cron jobs will pre-warm caches.
* **Operational Monitoring:** Emit metrics for password reset attempts, Redis throttle hits, and usage-limit denials to observability tooling (Sentry/PostHog). Configure alerts when >5 reset failures occur per minute or when >10% of free-tier requests hit quota in a 1-hour window.
---
