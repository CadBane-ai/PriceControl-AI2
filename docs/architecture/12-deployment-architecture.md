# 12. Deployment Architecture
## Deployment Strategy
* **Frontend & API Layer:** Deployed automatically by Vercel's Git-based workflow. Pushing to a branch creates a Preview URL; merging to `main` deploys to Production.
* **Stripe Webhooks:** Deployed as a Node.js (Edge-disabled) route to ensure raw body access for signature verification. Vercel's dashboard must be configured with the production webhook endpoint URL.
* **Environment Promotion:** Usage limits (Redis), Stripe keys, Resend keys, and governance files (`datasources.yml`) are managed per-environment via Vercel Environment Variables; secrets never checked into git.

## CI/CD Pipeline
The primary CI/CD is managed by Vercel, which automatically runs install, lint, test, and build steps on every push. CI must also run Playwright smoke suites covering login, usage badge rendering, upgrade CTA, and password reset flows before promoting to production.

## Environments
| Environment | URL | Purpose |
| :--- | :--- | :--- |
| **Development** | `http://localhost:3000` | Local development and testing. |
| **Preview** | `pricecontrol-*.vercel.app` | Isolated deployments for each pull request (Shareable for PM/UX reviews). |
| **Production** | `(To be defined)` | The live application for users. |
| **Stripe Webhook Test** | Configured via Stripe CLI tunneling | Used during development to forward webhook events to the local server for end-to-end verification. |

## Backend & Infra Review Checklist
* **Stripe Webhook Hosting:** Confirmed the Next.js route must run on the Node runtime with `runtime = "nodejs"` and `dynamic = "force-dynamic"` so raw body parsing works for signature verification. No `/api/stripe/webhook` implementation exists yet in `apps/web/app/api`; backend needs to add this handler before launch.
* **Environment Wiring:** Production Vercel project must register the webhook endpoint URL inside the Stripe Dashboard. Development teams should script Stripe CLI forwarding (`stripe listen --forward-to localhost:3000/api/stripe/webhook`) to validate end-to-end.
* **Redis Quota Assumptions:** Freemium gating assumes ≤1,000 MAU with 20 requests/day, yielding ~20k INCR operations daily. Upstash free tier supports 100k/day, so capacity is sufficient with ~20% headroom. If limits rise or active users exceed projections, upgrade to the paid plan (10M ops) before rollout.
* **Alerting Hooks:** Observability section expects metrics on webhook failures and Redis throttle hits; ensure logging middleware emits structured events so Vercel/Sentry alerts can be wired once endpoints exist.
---
