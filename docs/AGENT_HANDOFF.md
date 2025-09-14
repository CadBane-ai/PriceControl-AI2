# Agent Handoff: PriceControl — Current Status and Next Steps

This document captures completed work and precise next steps so a BMAD fullstack agent team can resume without context loss.

## Summary of Decisions
- Project type: Greenfield fullstack; UI included
- Package manager: pnpm; Monorepo layout (`apps/web`)
- Auth: NextAuth — Credentials (Email/Password) + Google OAuth
- Email: Resend for password reset (token TTL 1 hour)
- LLM provider: Together.ai (OpenAI-compatible); dual-model via env
- Charts: recharts
- DB: Neon Postgres via Drizzle ORM; migrations wired; seed data ok
- Rate limiting: Upstash Redis (fallback to in-memory when unset)
- Billing: Stripe (test mode later); stub endpoints now
- Usage gating: 20/day for free tier (env-configurable)
- Testing: Vitest + RTL; Playwright E2E now; GitHub Action on PRs
- Observability: Sentry hooks present but disabled until DSN
- Deployment: Vercel Git integration; PR→Preview, develop→Staging, main→Prod

## Artifacts Created/Updated
- Sharded PRD: `docs/prd/` with `index.md` and sections
- Sharded Architecture: `docs/architecture/` with `index.md` and sections
- Master docs index: `docs/index.md`
- AI UI generation prompt: `docs/ai-frontend-prompt.md`
- Data source allow-list (governed tools): `datasources.yml`
- Script (internal use): `scripts/shard-md.mjs`
- Architecture updated to Together.ai (diagrams, APIs, env): `docs/PriceControl-AI-achitecture.md`
- PRD updated for Together.ai streaming: `docs/PriceControl-AI-PRD.md`

Security note: Rotate any secrets previously shared; store secrets only in local `.env` and Vercel envs.

## Current External Status
- Vercel v0 is generating the frontend scaffold. Next: import the generated app into `apps/web`.

## Next Steps for BMAD Fullstack Agent Team
1) Monorepo Scaffolding
- Create root `package.json` (workspaces: `apps/*`, `packages/*`), `pnpm-workspace.yaml`, `tsconfig.base.json`, `.gitignore`, `README.md`.
- Place v0-generated Next.js app into `apps/web`.
- Add root scripts: `dev`, `build`, `test` to proxy into `apps/web`.

2) Core Dependencies (apps/web)
- Install: `next-auth`, `drizzle-orm`, `pg`, `drizzle-kit`, `zod`, `bcryptjs`, `resend`, `@upstash/ratelimit`, `@upstash/redis`, `@vercel/analytics`, `recharts`, `lucide-react`.
- Testing: `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`.
- E2E: `@playwright/test`.

3) Database & Migrations
- Add `drizzle.config.ts` and scripts: `drizzle:generate`, `drizzle:migrate`.
- Define schema: `users`, `conversations`, `messages`, `tool_call_logs`, `password_reset_tokens`.
- Seed script: 1 free user, 1 pro user, sample conversation, tool logs.

4) Authentication (NextAuth)
- Providers: Credentials (hash/compare with bcrypt) + Google (env-driven).
- Routes: `/api/auth/register`, `/api/auth/login` (Zod-validated).
- `middleware.ts` to protect `/dashboard` and other authenticated routes.

5) Password Reset (Resend)
- `/api/auth/forgot` issues token and emails link via Resend.
- `/api/auth/reset` validates token and sets new password.
- Token table with 1-hour TTL; delete after use.

6) AI Chat (Together.ai)
- Route: `app/api/ai/chat/route.ts` accepts `{ messages, model }` and streams response (SSE) using `TOGETHER_API_KEY`.
- Model selection by env: `TOGETHER_MODEL_INSTRUCT`, `TOGETHER_MODEL_REASONING`.
- Log tool calls to `tool_call_logs`.

7) Data Governance Tools
- Implement allow-list validator using `datasources.yml`.
- Stub initial tools: SEC EDGAR and Yahoo Finance; enforce robots/TOS flags; add basic retry/backoff.

8) Usage Gating
- `/api/usage` returns `{ plan, usedToday, dailyLimit }`.
- Rate limit with Upstash when configured; fallback in-memory for dev.
- Enforce 20/day for free tier; env override.

9) Billing (Stripe) — Stubs Now
- `/api/billing/checkout` returns placeholder URL; later wire to Stripe Checkout.
- `/api/stripe/webhook` placeholder; ignore until keys added.

10) Observability
- Add Sentry init (frontend/backend) but disable until `SENTRY_DSN` present.
- Enable Vercel Analytics.

11) Testing
- Unit/component tests for forms, chat composer, and core utilities.
- Playwright E2E: signup, login, protected `/dashboard`, chat send (stubbed backend), forgot/reset.
- GitHub Action to run E2E on PRs.

12) Environment & Config
- Create `.env.example` (root):
  - `DATABASE_URL=...`
  - `NEXTAUTH_SECRET=...`
  - `NEXTAUTH_URL=http://localhost:3000`
  - `GOOGLE_CLIENT_ID=...` / `GOOGLE_CLIENT_SECRET=...`
  - `TOGETHER_API_KEY=...`
  - `TOGETHER_MODEL_INSTRUCT=meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo`
  - `TOGETHER_MODEL_REASONING=Qwen/Qwen2.5-72B-Instruct`
  - `RESEND_API_KEY=...` / `MAIL_FROM=noreply@example.com`
  - `UPSTASH_REDIS_REST_URL=...` / `UPSTASH_REDIS_REST_TOKEN=...` (optional for now)
  - `STRIPE_SECRET_KEY=...` / `STRIPE_WEBHOOK_SECRET=...` (later)

## Handoff to BMAD
- Workflow: Use `greenfield-fullstack` (move to IDE stage) and proceed with implementation.
- Checklists: Run `po-master-checklist` after scaffolding and before first deploy.
- Tasks: If needed, use `document-project` to update `docs/index.md`, and `execute-checklist` for PO validation.

## Before First Deploy — Quick Checklist
- Monorepo compiles locally; `pnpm dev` runs in `apps/web`.
- Drizzle migrations applied (even if DB URL is placeholder for now).
- Auth (Credentials + Google) works locally; password reset emails send in dev via Resend.
- Chat route streams from Together.ai with valid key.
- E2E tests green in CI; Vercel connected for Preview deployments.

---

Contact/Notes
- Vercel domain to be configured at first deploy; set Google callback to `/api/auth/callback/google` after domain is known.
- Rotate any secrets that were shared in chat; never commit secrets to the repo.

