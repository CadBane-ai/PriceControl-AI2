# PriceControl-AI2

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
