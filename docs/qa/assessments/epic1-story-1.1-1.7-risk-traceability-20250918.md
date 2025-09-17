# Epic 1 Stories 1.1–1.7 Risk Profile & Traceability (2025-09-18)

This document captures the manually prepared risk assessment matrices and requirement traceability mappings for Epic 1 stories 1.1 through 1.7. It reflects updates from PRD v4 and architecture v4.

## Story 1.1 – Project Initialization & Vercel Deployment

### Risk Matrix

| Risk ID | Category | Description | Probability | Impact | Score | Priority | Mitigations / Controls | Notes |
|---------|----------|-------------|-------------|--------|-------|----------|------------------------|-------|
| TECH-1.1 | Technical | pnpm/Next.js scaffold misconfigured, causing build failures in CI | Medium (2) | High (3) | 6 | High | Use template checklist, run `pnpm install && pnpm build` on clean clone before linking Vercel | Add smoke script to README |
| OPS-1.1 | Operational | Vercel linkage not tied to `main`, resulting in orphaned deploys | Medium (2) | High (3) | 6 | High | Document linking steps, verify dashboard commit hash post-deploy, enable deploy notifications | Assign to DevOps |
| SEC-1.1 | Security | Public URL exposes placeholder content with admin hints | Low (1) | Medium (2) | 2 | Low | Replace scaffold copy with neutral text, review README for sensitive links | Monitor after deploy |

### Requirement Traceability

| AC | Requirement Summary | Planned Validation | Coverage Owner |
|----|---------------------|--------------------|---------------|
| 1 | Monorepo scaffold committed to Git | Manual checklist + repo history review | Dev |
| 2 | Next.js App Router app initialized in `apps/web` | pnpm build smoke, lint | Dev |
| 3 | Repo connected to Vercel project | Vercel dashboard screenshot/check | DevOps |
| 4 | Default index deployed and reachable | Automated curl check + manual verification | QA |
| 5 | Deployments auto-trigger from `main` pushes | Test commit on branch + Vercel activity check | DevOps |

---

## Story 1.2 – Database Setup & ORM Integration

### Risk Matrix

| Risk ID | Category | Description | Probability | Impact | Score | Priority | Mitigations / Controls | Notes |
|---------|----------|-------------|-------------|--------|-------|----------|------------------------|-------|
| DATA-1.2 | Data | Drizzle schema drift between local and Neon leads to migration failures | Medium (2) | High (3) | 6 | High | Pin migration outputs, include `drizzle-kit pg` preview in CI, require review of generated SQL | Track in pipeline |
| TECH-1.2 | Technical | Misconfigured `DATABASE_URL` causing runtime crashes | Medium (2) | Medium (2) | 4 | Medium | Add runtime guard in `db/client.ts`, document env requirements, provide sample `.env.local` guidance | Dev |
| OPS-1.2 | Operational | Neon credentials mishandled in repo or CI logs | Low (1) | High (3) | 3 | Low | Explicit secret handling doc, scrub logs, limit Neon role permissions | Security |

### Requirement Traceability

| AC | Requirement Summary | Planned Validation | Coverage Owner |
|----|---------------------|--------------------|---------------|
| 1 | Neon Postgres project created | Infra checklist, Neon console verification | DevOps |
| 2 | App configured with env vars | Config review, `.env.local` lint script | Dev |
| 3 | Drizzle dependencies installed & configured | Code review + unit test for `db/client.ts` | Dev/QA |
| 4 | `users` table schema defined | Schema snapshot review + migration SQL diff | QA |
| 5 | Migration runs successfully against Neon | Run `pnpm drizzle:migrate` in staging | DevOps |

---

## Story 1.3 – Authentication UI Components

### Risk Matrix

| Risk ID | Category | Description | Probability | Impact | Score | Priority | Mitigations / Controls | Notes |
|---------|----------|-------------|-------------|--------|-------|----------|------------------------|-------|
| UX-1.3 | Business | Forms lack validation copy, frustrating onboarding | Medium (2) | Medium (2) | 4 | Medium | Align copy with UX spec, add design review checklist | UX |
| TECH-1.3 | Technical | Divergence between UI validators and backend schemas | Medium (2) | Medium (2) | 4 | Medium | Share Zod schemas via single module, add unit snapshot tests | Dev |
| SEC-1.3 | Security | Client-side validation bypass enabling junk submissions later | Low (1) | Medium (2) | 2 | Low | Ensure Story 1.4+ enforce server validation; document constraint | Security |

### Requirement Traceability

| AC | Requirement Summary | Planned Validation | Coverage Owner |
|----|---------------------|--------------------|---------------|
| 1 | `/signup` page with email/password fields | Playwright page render check | QA |
| 2 | `/login` page with email/password fields | Playwright page render check | QA |
| 3 | Forms use shadcn/Tailwind | Code review + visual diff | Dev/UX |
| 4 | Client-side validation present | Vitest unit tests for schema | Dev |
| 5 | Submit no-ops | Playwright ensures no network call, toast placeholder | QA |

---

## Story 1.4 – User Registration API Endpoint

### Risk Matrix

| Risk ID | Category | Description | Probability | Impact | Score | Priority | Mitigations / Controls | Notes |
|---------|----------|-------------|-------------|--------|-------|----------|------------------------|-------|
| SEC-1.4 | Security | Weak password hashing or missing salting allows credential compromise | Medium (2) | High (3) | 6 | High | Enforce bcrypt 10+, add automated lint to check hashing usage | Security |
| DATA-1.4 | Data | Duplicate user race conditions on concurrent registration | Medium (2) | Medium (2) | 4 | Medium | Ensure DB unique constraint, wrap insert in transaction, test 409 response | Dev |
| OPS-1.4 | Operational | Error logs leak stack traces with secrets | Low (1) | Medium (2) | 2 | Low | Sanitize error responses, centralize logger | DevOps |

### Requirement Traceability

| AC | Requirement Summary | Planned Validation | Coverage Owner |
|----|---------------------|--------------------|---------------|
| 1 | `/api/auth/register` route exists | Supertest route availability test | QA |
| 2 | Accepts POST email/password | Unit + integration tests for payload validation | Dev |
| 3 | Validates data | Zod schema shared with UI, integration negative cases | QA |
| 4 | Password hashed before store | Inspect DB record in test, unit test hashing util | Dev |
| 5 | User inserted into Neon | DB assertion in integration test | QA |
| 6 | Success response returned | Supertest 201 check | QA |
| 7 | Error handling for duplicates | Supertest 409 scenario | QA |

---

## Story 1.5 – User Login & Session Management

### Risk Matrix

| Risk ID | Category | Description | Probability | Impact | Score | Priority | Mitigations / Controls | Notes |
|---------|----------|-------------|-------------|--------|-------|----------|------------------------|-------|
| SEC-1.5 | Security | Session fixation or token reuse due to improper NextAuth callbacks | Medium (2) | High (3) | 6 | High | Review callback config, enforce `session.strategy = "jwt"`, add automated test verifying new tokens per login | Security |
| TECH-1.5 | Technical | Google provider misconfiguration causing login regressions | Medium (2) | Medium (2) | 4 | Medium | Add provider availability test, document env fallback | DevOps |
| OPS-1.5 | Operational | Missing env vars in Vercel leading to prod outage | Medium (2) | Medium (2) | 4 | Medium | Add startup config validator, maintain env matrix in README | Dev |

### Requirement Traceability

| AC | Requirement Summary | Planned Validation | Coverage Owner |
|----|---------------------|--------------------|---------------|
| 1 | Credentials provider validates against Neon | Integration test hitting NextAuth sign-in | QA |
| 2 | `/api/auth/[...nextauth]` handler exposed | NextAuth route smoke test | Dev |
| 3 | `/api/auth/login` helper validates and guides | Supertest verifying response copy | QA |
| 4 | Successful login issues secure session cookie | Playwright end-to-end login + cookie assertions | QA |
| 5 | Invalid credentials generic error | Integration negative test | QA |
| 6 | Google provider surfaced when configured | Provider endpoint test toggling env | DevOps |

---

## Story 1.6 – Connect UI to Auth & Protect Routes

### Risk Matrix

| Risk ID | Category | Description | Probability | Impact | Score | Priority | Mitigations / Controls | Notes |
|---------|----------|-------------|-------------|--------|-------|----------|------------------------|-------|
| SEC-1.6 | Security | Middleware gaps allow unauthenticated dashboard access | Medium (2) | High (3) | 6 | High | Add Playwright auth guard tests, ensure matcher covers edge paths | QA |
| UX-1.6 | Business | Toast messaging missing causing confusion | Medium (2) | Medium (2) | 4 | Medium | Define shared toast utility, regression snapshots | UX |
| OPS-1.6 | Operational | `next` query parameter handling broken leading to redirect loops | Medium (2) | Medium (2) | 4 | Medium | Unit tests for redirect helper, QA scenario coverage | Dev |

### Requirement Traceability

| AC | Requirement Summary | Planned Validation | Coverage Owner |
|----|---------------------|--------------------|---------------|
| 1 | Signup posts to register API with toasts + redirect | Playwright flow test + toast assertion | QA |
| 2 | Login uses credentials flow with toasts | Playwright login test verifying no reload | QA |
| 3 | Redirect to `/dashboard` or `next` target | Playwright scenario with `?next=` | QA |
| 4 | `/dashboard` protected | Middleware unit test + Playwright unauthorized access | QA |
| 5 | Google button + provider error handling | Mock providers endpoint, UI snapshot, error route test | QA/Dev |
| 6 | Logout clears session, returns to login | Playwright logout scenario | QA |

---

## Story 1.7 – Self-Service Password Recovery

### Risk Matrix

| Risk ID | Category | Description | Probability | Impact | Score | Priority | Mitigations / Controls | Notes |
|---------|----------|-------------|-------------|--------|-------|----------|------------------------|-------|
| SEC-1.7 | Security | Reset tokens stored unhashed or not expired, enabling account takeover | Medium (2) | High (3) | 6 | High | Hash tokens (SHA-256), enforce TTL, revoke sessions on use | Security |
| OPS-1.7 | Operational | Email delivery failures leave users locked out | Medium (2) | Medium (2) | 4 | Medium | Integrate Resend status monitoring, queue retries | DevOps |
| PERF-1.7 | Performance | Rate limiter thresholds too low, preventing legitimate resets | Medium (2) | Medium (2) | 4 | Medium | Load test limiter, adjust bucket sizes, log throttle events | QA |

### Requirement Traceability

| AC | Requirement Summary | Planned Validation | Coverage Owner |
|----|---------------------|--------------------|---------------|
| 1 | `/forgot-password` form with shared layout | Playwright render + consistency check | QA |
| 2 | Success state with CTA + try again | Playwright flow verifying UI states | QA |
| 3 | Google CTA present in form + success state | Visual regression test | UX |
| 4 | `/reset-password` validates token | Integration test mocking invalid token → redirect | QA |
| 5 | Reset form enforces match, routes to login on success | Playwright reset flow | QA |
| 6 | `(auth)/error` handles NextAuth errors | Unit tests mapping error codes, Playwright negative path | QA |

---

## Aggregate Recommendations

1. **Testing Priorities**: execute auth end-to-end suite spanning Stories 1.4–1.7, followed by deployment pipeline smoke (Story 1.1) and Drizzle migration validation (Story 1.2).
2. **Monitoring Enhancements**: configure Vercel webhook alerts, Neon migration audit logs, NextAuth provider health check, and Resend delivery dashboards.
3. **Documentation Updates**: maintain environment matrix covering credentials, session secrets, and email tokens; ensure README references the latest onboarding workflow.
4. **Gatekeeping**: treat any unmitigated High (score 6) risks as blockers prior to release; revisit matrix after each major dependency change.

