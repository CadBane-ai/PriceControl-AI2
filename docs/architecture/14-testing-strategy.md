# 14. Testing Strategy
## Testing Pyramid
Our strategy is based on the Testing Pyramid, with a large base of unit tests, a smaller layer of integration tests, and a few end-to-end tests for critical flows.
## Test Organization
* **Frontend:** Unit/component tests co-located with components, using Vitest and React Testing Library.
* **Backend:** Unit tests co-located with services; integration tests in a dedicated `__tests__` directory.
* **E2E:** A top-level `e2e/` directory using Playwright.
* **Password Reset Coverage:**
  * Unit tests for token hashing utilities and rate limiter guards.
  * Integration tests that exercise `/api/auth/forgot-password` and `/api/auth/reset-password`, covering success, reused token (410), expired token, and throttle (429) paths.
  * Playwright scenarios validating the end-to-end flow: request reset, follow email link (using test mailbox), submit new password, confirm login works.
* **Usage Meter Coverage:**
  * Unit tests for `UsageService` ensuring counters increment/reset correctly and enforce per-plan limits.
  * API tests for `/api/usage` (auth required, error when Redis unavailable).
  * E2E test that drives the chat UI past the free limit to verify the upgrade prompt and badge color transitions.

## QA & Monitoring Follow-Ups
* Add synthetic checks that hit `/api/usage` hourly to detect Redis outages before users do.
* Configure Sentry alerts for password reset failures (400/410 spikes) and quota denials (429 from `/api/ai`).
* QA should include regression passes on both flows each release: password recovery (desktop/mobile) and usage badge thresholds (free vs pro accounts).
---
