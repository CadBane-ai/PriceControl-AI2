# Repository Guidelines

This repository is currently docs‑first and will evolve into a T3 Stack monorepo. Read the architecture source of truth in `docs/PriceControl-AI-fullstack-achitecture.md` before contributing.

## Project Structure & Module Organization
- `docs/`: PRD, UI spec, fullstack architecture (start here).
- `.bmad-core/`: internal workflows, checklists, and agent artifacts.
- `.vscode/`: editor recommendations.
- Planned (per docs): `apps/web/` (Next.js), `packages/shared/`, `prompts/`, `datasources.yml`, `.env.example`.

## Build, Test, and Development Commands
Prereqs: Node `v20`, pnpm `^9`.
- Install: `pnpm install` (from repo root).
- Dev server: `pnpm dev` (runs `apps/web`).
- Build: `pnpm build`.
- Lint/format: `pnpm lint` and `pnpm format`.
- Tests: `pnpm test` (unit), `pnpm e2e` (Playwright).
Note: Commands take effect once the T3 scaffold is added; follow the paths above.

## Coding Style & Naming Conventions
- Language: TypeScript (strict). Indent 2 spaces.
- Linting/formatting: ESLint + Prettier (T3 defaults).
- Names: React components `PascalCase` (e.g., `UserProfile.tsx`); hooks `useCamelCase`; files in Next.js routes lowercase; DB tables `snake_case` (see docs §15).

## Testing Guidelines
- Unit/component: Vitest + React Testing Library, colocated next to code as `*.test.ts(x)`.
- Integration: in `__tests__/` where appropriate.
- E2E: Playwright tests in `e2e/`.
- Target coverage ≥ 80% for changed lines; add tests with new features.
- Run `pnpm test` and ensure CI passes before PR.

## Commit & Pull Request Guidelines
- Commits: use Conventional Commits, e.g., `feat(auth): add OAuth flow)`, `fix(api): handle 401`. Scope optional but encouraged.
- PRs must include: clear description, linked issue, screenshots for UI changes, notes on migrations, and updated docs (`docs/`), if applicable.
- Pre‑PR checklist: `pnpm lint`, `pnpm test`, `pnpm build` locally.

## Security & Configuration
- Never commit secrets. Copy `.env.example` → `.env` and fill required vars noted in the architecture doc (DB, NextAuth, vLLM, Stripe, Upstash).
- External data access must follow `datasources.yml` governance; all tool calls should be auditable (see ToolCallLog model in docs).

## Agent‑Specific Instructions
- Keep changes minimal and scoped; do not refactor unrelated code.
- Follow this AGENTS.md and `.bmad-core` workflows. Update documentation alongside code changes.
