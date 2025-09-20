# 7. External APIs

## OpenRouter (Cerebras Provider)
* **Purpose:** Initial LLM access layer to use Cerebras-hosted models via a unified API.
* **Documentation:** https://openrouter.ai/docs
* **Base URL(s):** `https://openrouter.ai/api/v1` (configurable via `OPENROUTER_BASE_URL`).
* **Authentication:** `OPENROUTER_API_KEY` bearer token. Recommended attribution headers: `HTTP-Referer` (site URL) and `X-Title` (app name).
* **Key Endpoints Used:**
    * `POST /chat/completions` with `stream=true` for streaming responses.
    * Built-in `web` search plugin enabled via the request `plugins` array with options (`engine`, `max_results`, `search_prompt`, `web_search_options.search_context_size`).
* **Provider Selection:** Force Cerebras execution with `{ provider: { only: ["Cerebras"] } }`.
* **Governed Web Access:** Returned web results must be filtered against `/datasources.yml` before being forwarded to the LLM; disallowed domains trigger a structured error back to the client.

## Future: Direct Cerebras API
* **Purpose:** Scale-up option to call Cerebras directly when needed.
* **Compatibility:** The backend route is structured so we can swap the OpenRouter call for a direct Cerebras implementation with minimal changes.
* **Authentication/Endpoints:** To be finalized when enabling direct integration.

## Google OAuth
* **Purpose:** Optional social sign-in provider that augments email/password authentication through NextAuth.
* **Documentation:** https://developers.google.com/identity/protocols/oauth2
* **Base URL(s):** https://accounts.google.com and https://oauth2.googleapis.com token endpoints (managed by NextAuth).
* **Authentication:** Requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Tokens are exchanged server-side by NextAuth.
* **Key Endpoints Used:**
    * OAuth 2.0 Authorization Endpoint (user redirect).
    * OAuth 2.0 Token Endpoint (handled server-side by NextAuth).

## Stripe API
* **Purpose:** To handle all payment processing, including creating subscription checkouts and managing customer billing information.
* **Documentation:** [https://stripe.com/docs/api](https://stripe.com/docs/api)
* **Base URL(s):** `https://api.stripe.com`
* **Authentication:** All requests must be authenticated using a secret API key, stored securely in the `STRIPE_SECRET_KEY` environment variable.
* **Key Endpoints Used:**
    * `POST /v1/checkout/sessions` - To create a new checkout session for a user to subscribe.
    * `POST /v1/billing_portal/sessions` - To create a session for the customer portal.
    * Webhook events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted` – delivered to `/api/stripe/webhook`.
* **Notes:** Webhook requests require raw-body parsing and signature verification (`Stripe-Signature` header). Stripe CLI assists with local testing by forwarding events.

## Resend (Transactional Email)
* **Purpose:** Deliver password reset emails and other transactional notifications.
* **Documentation:** https://resend.com/docs
* **Base URL(s):** `https://api.resend.com` (managed via SDK).
* **Authentication:** `RESEND_API_KEY` stored in environment variables; emails sent from `MAIL_FROM`.
* **Key Endpoints Used:**
    * `POST /emails` – Send password reset email using the `password-reset` template with reset link `${NEXTAUTH_URL}/reset-password?token=...`.
* **Notes:** Emails should include a clear expiry window (e.g., 1 hour). Sandbox mode can be toggled for development.

## Upstash Redis (Usage & Rate Limiting)
* **Purpose:** Store short-lived counters for password reset throttling and daily usage tallies for freemium gating.
* **Documentation:** https://upstash.com/docs/redis
* **Base URL(s):** Project-specific REST endpoint (configurable via `UPSTASH_REDIS_REST_URL`).
* **Authentication:** `UPSTASH_REDIS_REST_TOKEN` bearer token.
* **Key Operations:**
    * `INCR` + `EXPIRE` per `password-reset:{userId}` and `password-reset:ip:{hash}` keys.
    * `INCR` + `EXPIRE` per `usage:{userId}:{yyyy-mm-dd}` key with TTL aligned to midnight UTC.
* **Notes:** Rate limiter helper wraps these calls; ensure retries are idempotent and add observability via metrics exported to logging pipeline.

## Financial Data APIs (Governed by Source Registry)
* **Purpose:** To provide the raw financial, economic, and political data required by the LLM to answer user queries. This is a collection of diverse external sources.
* **Documentation:** Each data source is documented in the `/datasources.yml` file, which includes its base URL and terms of use.
* **Integration Notes:** The core integration pattern is **governed access**. All calls to these external APIs **must** pass through the `LLM Gateway Service` and be validated against the `/datasources.yml` allow-list.

---
