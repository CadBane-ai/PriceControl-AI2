# PriceControl-AI2

(ignore this easter egg: marmot)

Monorepo scaffold using pnpm workspaces with the Next.js app located at `apps/web`. 

## Getting Started

Prerequisites:
- Node.js 20.x
- pnpm 9.x

Install and run from the repo root:

```
pnpm install
pnpm dev
```

This proxies to `apps/web` and starts the Next.js dev server on port 3000.
Create `apps/web/.env.local` for local env configuration (see below).

## Workspace Layout
- `apps/web` — Next.js App Router app (imported from Vercel v0). Most features still use mock API implementations, but the password recovery flow now depends on live email + rate limiting credentials (see below).
- `packages/*` — Reserved for future shared packages.

## Notes
- Environment configuration and secrets will be added in a later story.
- See `docs/stories/1.1.monorepo-scaffold-and-import-v0-frontend.md` for the story tracking this change.

## Database & Drizzle (Story 1.2)
This project uses Neon Postgres with Drizzle ORM for migrations.

Prerequisites:
- Create a Neon Postgres database
- Set `DATABASE_URL` in `apps/web/.env.local` (Neon usually needs `?sslmode=require`)

Commands (from `apps/web`):
```
cd apps/web
# ensure Node 20 & pnpm 9
corepack enable && corepack prepare pnpm@9.12.2 --activate

# install deps
pnpm install

# generate and run migrations
pnpm drizzle:generate
pnpm drizzle:migrate
```

Notes:
- Do not commit secrets. Configure `DATABASE_URL` in Vercel for deployments.
- Only the `users` table is introduced in this story. Additional tables are added in later stories.

## Auth & Sessions (Story 1.5)
This project uses NextAuth (Auth.js) with a Credentials provider and JWT sessions.

Environment (local, not committed): add the following to `apps/web/.env.local`
- `NEXTAUTH_SECRET=your-strong-secret`
- `NEXTAUTH_URL=http://localhost:3000`
- `DATABASE_URL=postgresql://.../db?sslmode=require` (from Story 1.2)
- `GOOGLE_CLIENT_ID=...` (optional, enables Google sign-in button)
- `GOOGLE_CLIENT_SECRET=...`

Endpoints:
- NextAuth handlers: `GET/POST /api/auth/[...nextauth]`
- Registration API (Story 1.4): `POST /api/auth/register` { email, password }
- Login helper (this story): `POST /api/auth/login` → returns guidance to use credentials flow

Client login flow (wired in Story 1.6):
- Use NextAuth helper, e.g. `signIn('credentials', { email, password, redirect: false })`
- On success, session cookie is set; read with `getServerSession` on server routes.
- Provider list fetched via `GET /api/auth/providers` to toggle Google button availability.

## Route Protection (Story 1.6)
This app uses a middleware-based approach to guard protected routes.

- Middleware: `apps/web/middleware.ts` uses `next-auth/jwt` `getToken` to require auth.
- Protected paths: `/dashboard`, `/account`, `/billing` (adjust via `matcher` and `PROTECTED_PATHS`).
- Unauthenticated users are redirected to `/login?next=...` where `next` preserves the full destination (path + query).
- Client-side guard: `components/auth-guard.tsx` also checks `useSession` (secondary, optional).
- Login and signup cards surface success/error toasts and redirect to `/dashboard` or the requested `next` target after successful auth.
- Google OAuth errors are surfaced through `(auth)/error` and contextual messaging on the login page.

## Password Recovery (Story 1.7)
Self-service password reset endpoints, UI, and rate limiting are implemented end-to-end.

- User-facing routes: `/forgot-password`, `/reset-password`, and `(auth)/error` for Auth.js failures.
- API routes: `POST /api/auth/forgot-password` (issues reset token + email) and `POST /api/auth/reset-password` (consumes token, rotates password + session version, clears auth cookies).
- Rate limiting uses Upstash Redis per IP/user. Email delivery uses Resend. Reset tokens are hashed with SHA-256 salted by `PASSWORD_RESET_TOKEN_SECRET`.
- Sessions are invalidated after a password change by bumping a user-specific `session_version` that NextAuth checks on every request.

Environment (add to `apps/web/.env.local` in addition to Story 1.5 values):
- `RESEND_API_KEY` / `MAIL_FROM` for transactional email delivery.
- `PASSWORD_RESET_TOKEN_SECRET` to salt reset token hashes.
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` to back the rate limiter.
- `PUBLIC_APP_URL` (optional) overrides the base URL used in reset links when different from `NEXTAUTH_URL`.

Operational notes:
- Resend failures are logged but do not leak user existence; the API always returns `202`.
- Reset links expire after 60 minutes and are single-use. Only the newest pending token per user remains valid.
- Sessions created before the reset are revoked automatically; stale JWTs no longer pass `getServerSession` and affected users are redirected to sign in again.
