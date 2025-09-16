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

This proxies to `apps/web` and starts the Next.js dev server.

## Workspace Layout
- `apps/web` — Next.js App Router app (imported from Vercel v0). Currently uses mock API implementations and does not require environment variables.
- `packages/*` — Reserved for future shared packages.

## Notes
- Environment configuration and secrets will be added in a later story.
- See `docs/stories/1.1.monorepo-scaffold-and-import-v0-frontend.md` for the story tracking this change.

## Database & Drizzle (Story 1.2)
This project uses Neon Postgres with Drizzle ORM for migrations.

Prerequisites:
- Create a Neon Postgres database
- Set `DATABASE_URL` locally (Neon usually needs `?sslmode=require`)

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

Environment (local, not committed):
- `NEXTAUTH_SECRET=your-strong-secret`
- `NEXTAUTH_URL=http://localhost:3000`
- `DATABASE_URL=postgresql://.../db?sslmode=require` (from Story 1.2)

Endpoints:
- NextAuth handlers: `GET/POST /api/auth/[...nextauth]`
- Registration API (Story 1.4): `POST /api/auth/register` { email, password }
- Login helper (this story): `POST /api/auth/login` → returns guidance to use credentials flow

Client login flow (wired in Story 1.6):
- Use NextAuth helper, e.g. `signIn('credentials', { email, password, redirect: false })`
- On success, session cookie is set; read with `getServerSession` on server routes.

## Route Protection (Story 1.6)
This app uses a middleware-based approach to guard protected routes.

- Middleware: `apps/web/middleware.ts` uses `next-auth/jwt` `getToken` to require auth.
- Protected paths: `/dashboard`, `/account`, `/billing` (adjust via `matcher` and `PROTECTED_PATHS`).
- Unauthenticated users are redirected to `/login` with a `next` query param.
- Client-side guard: `components/auth-guard.tsx` also checks `useSession` (secondary, optional).
