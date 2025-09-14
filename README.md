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
