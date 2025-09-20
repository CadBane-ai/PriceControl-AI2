# 6. Components

## Component Diagram
```mermaid
graph TD
    subgraph "PriceControl System (Vercel)"
        A[Web UI <br> Next.js / React]
        B[API Layer <br> Next.js API Routes]
        C[Authentication Service <br> NextAuth.js]
        D[Data Persistence Service <br> Drizzle ORM]
        E[LLM Gateway Service]
        F[Payments Service <br> Stripe Integration]
        G[Usage Service]
        H[Password Reset Service]
        I[Transparency Service]
    end

    subgraph "External Systems"
        J[User's Browser]
        K[OpenRouter (Cerebras Provider)]
        L[Stripe API & Webhooks]
        M[Financial Data APIs]
        N[Neon Postgres DB]
        O[Upstash Redis]
        P[Resend Email]
        Q[datasources.yml]
    end

    J --> A;
    A --> B;
    B --> C;
    B --> D;
    B --> E;
    B --> F;
    B --> G;
    B --> H;
    B --> I;
    C --> D;
    D --> N;
    E --> K;
    E --> M;
    F --> L;
    G --> O;
    H --> O;
    H --> P;
    I --> Q;
```

## Component List

### Web UI (Next.js Frontend)
* **Responsibility:** To render the entire user interface, manage all client-side state (e.g., chat history, UI state), and serve as the primary entry point for all user interactions. It is responsible for making secure, authenticated requests to the API Layer for all business logic.
* **Key Interfaces:** Exposes a responsive web interface to the user's browser. It consumes the RESTful API defined in the API Specification.
* **Dependencies:** It is highly dependent on the API Layer for all data, authentication, and AI functionality.
* **Technology Stack:** Next.js `~14.2`, React, TypeScript, Tailwind CSS, shadcn/ui, Zustand.

### API Layer (Next.js API Routes)
* **Responsibility:** To act as the secure backend-for-frontend (BFF). Its primary responsibility is to receive requests from the Web UI, orchestrate the necessary business logic by calling other internal services (like Auth, Payments, LLM), and return data in a format the frontend can easily consume.
* **Key Interfaces:** Exposes the RESTful API defined in the OpenAPI Specification. It provides the endpoints for all application functionality.
* **Dependencies:** Depends on the Authentication Service, Data Persistence Service, LLM Gateway Service, and Payments Service to fulfill requests.
* **Technology Stack:** Next.js `~14.2` API Routes, TypeScript, Zod (for request validation).

### Authentication Service (NextAuth.js)
* **Responsibility:** To handle all aspects of user authentication and session management. Its sole responsibility is to verify user identities, create and manage secure sessions (e.g., via cookies), and provide the API Layer with the mechanisms to protect endpoints. It manages both email/password credentials and Google OAuth sign-in when the provider is configured.
* **Key Interfaces:** Exposes middleware and helper functions used by the API Layer to protect routes. It also provides both the client and server components with the current user's session state and the list of configured providers (used to toggle Google sign-in on the UI).
* **Dependencies:** Depends on the Data Persistence Service to retrieve and verify user credentials.
* **Technology Stack:** NextAuth.js `~5.0`, NextAuth Credentials provider, Google OAuth (via `next-auth/providers/google`).

### Password Reset Service
* **Responsibility:** Issue and manage self-service password reset flows. Generates single-use reset tokens, persists them with expirations, dispatches email via Resend, and validates tokens when users set a new password. Invalidates outstanding tokens and revokes sessions after a successful reset.
* **Key Interfaces:**
  * `POST /api/auth/forgot-password` – accepts user email, enforces rate limiting, creates token records, and enqueues email delivery.
  * `POST /api/auth/reset-password` – accepts `token` + `newPassword`, validates token hash/expiry, updates `users.passwordHash`, and marks tokens as consumed.
* **Dependencies:** Drizzle ORM (`password_reset_tokens` table), NextAuth (for session revocation), Resend API (email delivery), Upstash Redis (per-account/IP throttling for requests).
* **Technology Stack:** Next.js API routes, Drizzle ORM, Resend Node SDK, crypto utilities for token hashing, Upstash Redis rate limiter.

### Data Persistence Service (Drizzle + Neon)
* **Responsibility:** To manage all interactions with the Neon Postgres database. It is responsible for executing queries, managing schema migrations, and providing a type-safe data access layer for other services. It ensures the application's business logic is decoupled from the raw database implementation.
* **Key Interfaces:** Exposes a set of type-safe functions and objects via Drizzle ORM for creating, reading, updating, and deleting data. It is consumed by any service that needs to interact with the database.
* **Dependencies:** Depends directly on the Neon Postgres database service.
* **Technology Stack:** Drizzle ORM `~0.30`, Neon Serverless Driver, Postgres `16`.

### LLM Gateway Service
* **Responsibility:** Dedicated and secure interface between our app and the LLM provider. Initially integrates with OpenRouter to access Cerebras-hosted models; structured to support direct Cerebras API later. Loads prompts, constructs requests (including the OpenRouter `web` plugin configuration), and enforces data-source governance (`/datasources.yml`) by filtering plugin results before they reach the model.
* **Key Interfaces:** Streams responses to the API Layer from `/api/ai`. Accepts `messages`, optional `mode`, and explicit `model` (OpenRouter model ID). Returns a readable token stream. When web access is requested it submits `plugins: [{ id: 'web', engine, max_results, search_prompt, web_search_options }]` to OpenRouter, consumes the streamed search payload, and forwards only allow-listed snippets back upstream.
* **Dependencies:** Depends on OpenRouter (Cerebras provider) for inference today; later, may call Cerebras API directly. Depends on the Transparency Service for allow-list validation, and on Data Persistence for conversation/message storage plus plugin-call audit logs (future stories).
* **Technology Stack:** TypeScript, Vercel AI SDK (OpenAIStream/StreamingTextResponse), Zod (validation), OpenRouter Web Search parameters.

### Usage Service
* **Responsibility:** Track per-user chat consumption for freemium gating and surface usage summaries to the UI. Coordinates with the LLM Gateway to increment counters, enforces daily limits, and returns aggregated usage metrics for the dashboard badge.
* **Key Interfaces:**
  * Internal helper invoked by `/api/ai` before streaming responses to ensure a request is within quota (`recordUsage(userId)` returning remaining quota or throwing limit errors).
  * `GET /api/usage` endpoint that returns `{ plan, usedToday, dailyLimit }` for the authenticated user.
* **Dependencies:** Upstash Redis (or alternative low-latency store) for per-user day buckets, Stripe subscription data (via Payments Service) to determine plan limits, Drizzle ORM if long-term usage analytics are persisted.
* **Technology Stack:** Next.js API routes, Upstash Redis REST API, TypeScript business logic, Zod validation.

### Transparency Service (Data Source Registry)
* **Responsibility:** Surface the governed data-source registry to both the AI tooling pipeline and the UI. Ensures `/datasources.yml` is parsed, cached, and available for validation, display, and domain-to-source resolution.
* **Key Interfaces:**
  * Provides helpers such as `isAllowedSource(sourceId)` and `resolveDomain(domain)` that the LLM Gateway uses to vet OpenRouter `web` plugin results, returning both allow/deny decisions and normalized source metadata.
  * `GET /api/datasources` exposes the parsed registry to the Data Sources Directory UI with categories, cadence, and policy metadata.
* **Dependencies:** Reads from the repo-level `datasources.yml`, caches parsed content in memory (and optionally in Redis) with change detection, and shares utility functions with the governance checks in the LLM Gateway.
* **Technology Stack:** TypeScript parser for YAML (`yaml` package), shared governance utilities, caching via in-process memoization or Redis, shadcn/ui table components on the frontend.

### Payments Service (Stripe Integration)
* **Responsibility:** Handle billing lifecycle: create Stripe Checkout sessions, launch billing portal sessions, and reconcile webhooks that mutate subscription status and `plan_expires_at` columns.
* **Key Interfaces:** Exposes an internal API consumed by the main API Layer to initiate payments. It also exposes a public webhook endpoint to receive events directly from the Stripe API.
* **Dependencies:** Depends on the external Stripe API for all payment processing and on the Data Persistence Service to update the `User` model with subscription changes.
* **Technology Stack:** Stripe Node.js library, Next.js API Routes.

---
