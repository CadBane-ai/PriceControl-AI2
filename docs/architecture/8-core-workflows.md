# 8. Core Workflows

## User Login Flow
```mermaid
sequenceDiagram
    participant Browser
    participant WebUI as Web UI (Next.js)
    participant NextAuth as NextAuth Handler
    participant DataService as Neon/Drizzle

    Browser->>WebUI: Submit login form
    WebUI->>NextAuth: signIn("credentials") -> POST /api/auth/callback/credentials
    NextAuth->>DataService: SELECT users WHERE email = ?
    DataService-->>NextAuth: User with passwordHash
    NextAuth-->>NextAuth: Compare bcrypt hash
    alt Credentials valid
        NextAuth-->>Browser: Set session cookie & redirect to /dashboard
    else Invalid credentials
        NextAuth-->>WebUI: Error=CredentialsSignin
        WebUI-->>Browser: Show "Invalid credentials" toast
    end
    opt Google OAuth
        Browser->>NextAuth: Redirect to Google Authorization Endpoint
        NextAuth->>Browser: Redirect back with code/state
        NextAuth->>Google: Exchange code for tokens
        NextAuth-->>Browser: Set session cookie & redirect
    end
```

*The login page conditionally displays the Google button by calling `GET /api/auth/providers`. Both flows use the same NextAuth handler, ensuring consistent session issuance.*

## Password Reset Flow
```mermaid
sequenceDiagram
    participant User
    participant WebUI as Web UI
    participant APILayer as API Layer
    participant PasswordReset as Password Reset Service
    participant Email as Resend
    participant DB as Neon/Drizzle
    participant Redis as Upstash Redis

    User->>WebUI: Submit /forgot-password form (email)
    WebUI->>APILayer: POST /auth/forgot-password
    APILayer->>Redis: INCR password-reset:ip/{hash}
    APILayer->>DB: Create password_reset_tokens (hashed token, expiry)
    APILayer->>Email: Send reset email with link & token
    APILayer-->>WebUI: 202 Accepted (always)
    WebUI-->>User: Show success state

    User->>WebUI: Open reset link & submit new password
    WebUI->>APILayer: POST /auth/reset-password (token, password)
    APILayer->>DB: Validate & consume token, update users.password_hash
    APILayer->>Redis: INCR password-reset:ip/{hash}
    APILayer->>NextAuth: Revoke active sessions (background)
    APILayer-->>WebUI: 204 No Content
    WebUI-->>User: Toast + redirect to /login
```

## Usage Summary Fetch & Freemium Gating
```mermaid
sequenceDiagram
    participant Browser
    participant WebUI as Web UI
    participant UsageAPI as API Layer (Usage Service)
    participant Redis as Upstash Redis
    participant Stripe as Payments Service

    Browser->>WebUI: Load dashboard header
    WebUI->>UsageAPI: GET /api/usage (with session cookie)
    UsageAPI->>Stripe: Lookup user plan (cached)
    UsageAPI->>Redis: GET usage:{userId}:{date}
    UsageAPI-->>WebUI: { plan, usedToday, dailyLimit }
    WebUI-->>Browser: Render badge + upgrade CTA thresholds

    Browser->>WebUI: Submit chat prompt
    WebUI->>LLM API: POST /api/ai (messages)
    LLM API->>Usage Service: recordUsage(userId)
    Usage Service->>Redis: INCR usage:{userId}:{date} EXPIRE midnight
    alt Limit exceeded
        Usage Service-->>LLM API: Throw limit error
        LLM API-->>WebUI: 429 Limit reached
        WebUI-->>Browser: Show upgrade prompt toast
    else Under limit
        Usage Service-->>LLM API: OK
        LLM API-->>Browser: Stream response
    end
```

## Stripe Upgrade & Payment Success Loop
```mermaid
sequenceDiagram
    participant User
    participant WebUI as Web UI (Pricing/Header)
    participant API as Payments API Layer
    participant Stripe
    participant Webhook as Stripe Webhook Endpoint
    participant DB as Neon/Drizzle
    participant Usage as Usage Service

    User->>WebUI: Clicks Upgrade CTA (header badge or /pricing)
    WebUI->>API: POST /stripe/create-checkout-session
    API->>Stripe: Create Checkout Session (plan=Pro)
    Stripe-->>API: Session URL
    API-->>WebUI: { url }
    WebUI->>User: Redirect to Stripe Checkout

    User->>Stripe: Completes payment
    Stripe-->>User: Redirect to /payment-success
    Stripe->>Webhook: checkout.session.completed event
    Webhook->>DB: UPSERT users (subscription_status='pro', plan_expires_at=...)

    User->>WebUI: Lands on /payment-success
    WebUI->>Usage: GET /api/usage
    Usage->>DB: Read subscription_status
    Usage-->>WebUI: Updated usage summary
    WebUI-->>User: Show confirmation + refreshed badge

    opt Manage billing
        User->>WebUI: Clicks "Manage billing"
        WebUI->>API: POST /stripe/create-portal-session
        API->>Stripe: Create portal session
        Stripe-->>API: Portal URL
        API-->>WebUI: { url }
        WebUI->>User: Redirect to Stripe portal
    end
```

## Data Sources Directory Rendering
```mermaid
sequenceDiagram
    participant User
    participant WebUI as Data Sources Page
    participant API as Transparency Service
    participant Registry as datasources.yml

    User->>WebUI: Navigates to /datasources
    WebUI->>API: GET /api/datasources
    API->>Registry: Parse & cache YAML (if stale)
    Registry-->>API: Structured source list
    API-->>WebUI: JSON array (category, cadence, policy URL, status)
    WebUI-->>User: Render searchable/filterable directory
    alt Registry unavailable
        API-->>WebUI: 503 Service Unavailable
        WebUI-->>User: Show inline error + retry CTA
    end
```

## AI Chat Query with Tool Use (OpenRouter -> Cerebras)
```mermaid
sequenceDiagram
    participant User
    participant WebUI as Web UI
    participant APILayer as API Layer
    participant LLMGateway as LLM Gateway
    participant OpenRouter as OpenRouter (Cerebras)
    participant Tool as Governed Tool (web.fetch)
    participant DataAPI as External Data API
    participant AuditLog as Data Persistence

    User->>WebUI: Submits query
    WebUI->>APILayer: POST /api/ai (messages, model, mode)
    APILayer->>LLMGateway: ProcessRequest(messages)
    LLMGateway->>OpenRouter: POST /chat/completions (stream=true)
    OpenRouter-->>LLMGateway: Tool call request (future)
    LLMGateway->>Tool: Validate & Execute(params)
    Tool-->>Tool: Check source against allow-list
    Tool->>DataAPI: Fetch data
    LLMGateway->>AuditLog: Create ToolCallLog entry
    DataAPI-->>Tool: Return financial data
    Tool-->>LLMGateway: Return formatted data
    LLMGateway->>OpenRouter: Provide tool output
    OpenRouter-->>LLMGateway: Stream synthesized answer
    LLMGateway-->>APILayer: Stream response
    APILayer-->>WebUI: Stream response
    WebUI-->>User: Display streaming answer & citation
```

## Conversation Management (Create / Switch / Rename)
```mermaid
sequenceDiagram
    participant User
    participant WebUI as Web UI
    participant APILayer as API Layer
    participant DB as Neon (Drizzle)

    User->>WebUI: Clicks New conversation
    WebUI->>APILayer: POST /api/conversations
    APILayer->>DB: INSERT conversations (user_id, title)
    DB-->>APILayer: Return id, timestamps
    APILayer-->>WebUI: 201 + conversation
    WebUI-->>User: Navigate to /dashboard?conversation=id

    User->>WebUI: Edits title via rename dialog
    WebUI->>APILayer: PATCH /api/conversations/{id} (title)
    APILayer->>DB: UPDATE conversations SET title, updated_at
    DB-->>APILayer: Return updated row
    APILayer-->>WebUI: 200 OK
    WebUI-->>User: Updated list + success toast
```

---
