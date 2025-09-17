# 11. Development Workflow
## Local Development Setup
### Prerequisites
* **Node.js:** `v20.x` (LTS)
* **pnpm:** `~9.x`
* **Git**
### Initial Setup
```bash
git clone <repository-url>
cd pricecontrol
pnpm install
cp .env.example .env
```
### Development Commands
```bash
# Start the development server
pnpm dev

# Run all tests
pnpm test
```
## Environment Configuration
```bash
# .env.example (apps/web)
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"
NEXTAUTH_SECRET="your-super-secret-key-for-nextauth"
NEXTAUTH_URL="http://localhost:3000"

# Preferred initial provider for LLM access (OpenRouter → Cerebras models)
OPENROUTER_API_KEY="your-openrouter-key"
# Optional: attribution + base URL
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
OPENROUTER_SITE_URL="http://localhost:3000"
OPENROUTER_APP_NAME="PriceControl"

# Future scale-up: direct Cerebras (keep commented until enabled)
# CEREBRAS_API_KEY="your-cerebras-api-key"
# CEREBRAS_BASE_URL="https://api.cerebras.ai"

STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Password recovery & email
RESEND_API_KEY="re_..."
MAIL_FROM="noreply@example.com"

# Usage limits & rate limiting
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

## Notes
- The `/api/ai` route streams a mock response when `OPENROUTER_API_KEY` is not set, enabling local UI development without credentials.
- The model picker configuration lives in `apps/web/lib/models.ts` and drives both the UI dropdown and the default model resolution on the server.
- After introducing the `password_reset_tokens` table, run `pnpm -C apps/web drizzle:generate` and `pnpm -C apps/web drizzle:migrate` to keep Neon aligned.
- Resend offers a sandbox inbox; keep it enabled locally and disable sandbox mode in production deployments.
- Seed Upstash with a development token or create a lightweight in-memory stub when `UPSTASH_REDIS_REST_URL` is undefined so the usage badge can render during local work.
---
