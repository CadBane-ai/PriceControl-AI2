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
# .env.example
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"
NEXTAUTH_SECRET="your-super-secret-key-for-nextauth"
NEXTAUTH_URL="http://localhost:3000"
VLLM_BASE_URL="http://your-gpu-host-ip:8000"
VLLM_API_KEY="your-secret-key-for-vllm"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```
---
