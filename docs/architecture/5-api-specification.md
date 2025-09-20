# 5. API Specification

```yaml
openapi: 3.0.1
info:
  title: "PriceControl API"
  version: "1.0.0"
  description: "API for the PriceControl financial assistant application."

servers:
  - url: "/api"
    description: "Local development server"

paths:
  /conversations:
    get:
      summary: "List conversations for current user"
      security:
        - cookieAuth: []
      responses:
        '200':
          description: "Array of conversations"
        '401':
          description: "Unauthorized"
    post:
      summary: "Create a new conversation"
      security:
        - cookieAuth: []
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              properties:
                title:
                  type: string
                  description: Optional title for the conversation
      responses:
        '201':
          description: "Conversation created"
        '401':
          description: "Unauthorized"
        '400':
          description: "Invalid input"

  /conversations/{id}:
    patch:
      summary: "Rename a conversation"
      security:
        - cookieAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                title:
                  type: string
      responses:
        '200':
          description: "Conversation renamed"
        '400':
          description: "Invalid input"
        '401':
          description: "Unauthorized"
        '404':
          description: "Not found"
  /auth/register:
    post:
      summary: "Register a new user"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
      responses:
        '201':
          description: "User created successfully"
        '409':
          description: "User with this email already exists"

  /auth/login:
    post:
      summary: "Validate credentials payload (NextAuth helper)"
      description: "Lightweight endpoint that validates the request body and instructs clients to use the NextAuth Credentials flow. Sessions are created by `/auth/[...nextauth]`."
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
      responses:
        '200':
          description: "Payload accepted; response includes guidance on invoking NextAuth."
        '400':
          description: "Invalid request payload."
        '500':
          description: "Unexpected server error."

  /auth/forgot-password:
    post:
      summary: "Initiate password reset email"
      description: "Accepts an email address, generates a single-use reset token when the account exists, dispatches a Resend email, and always returns 202 to avoid user enumeration. Requests are rate-limited per IP + account."
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email]
              properties:
                email:
                  type: string
                  format: email
      responses:
        '202':
          description: "Reset email enqueued (or silently ignored for non-existent accounts)."
        '429':
          description: "Rate limit exceeded."

  /auth/reset-password:
    post:
      summary: "Complete password reset"
      description: "Validates a password reset token, updates the user's password hash, invalidates outstanding tokens, and revokes active sessions."
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [token, password]
              properties:
                token:
                  type: string
                  description: "One-time reset token from the email link"
                password:
                  type: string
                  description: "New password that meets policy requirements"
      responses:
        '204':
          description: "Password updated; no content returned."
        '400':
          description: "Malformed payload or password policy violation."
        '410':
          description: "Token expired or already used."
        '429':
          description: "Rate limit exceeded for reset attempts."
        '500':
          description: "Unexpected server error."

  /ai:
    post:
      summary: "Send chat messages to the AI assistant (streamed response)"
      description: "Authenticated endpoint that proxies chat completions to OpenRouter (Cerebras) and streams tokens back to the client."
      security:
        - cookieAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                messages:
                  type: array
                  description: Ordered chat history including the latest user turn
                  items:
                    # Reference to the Message data model
                mode:
                  type: string
                  enum: [instruct, reasoning]
                  description: High-level mode toggle (maps to curated model IDs)
                model:
                  type: string
                  description: Optional explicit OpenRouter model ID override
                conversationId:
                  type: string
                  description: Optional conversation context ID (future persistence hook)
                webSearch:
                  type: object
                  description: Optional overrides for governed OpenRouter web search plugin usage
                  properties:
                    enabled:
                      type: boolean
                      description: Flag to request governed web access for this turn (default false)
                    engine:
                      type: string
                      enum: [native, exa]
                      description: Preferred OpenRouter search engine; native falls back to Exa automatically when unsupported
                    maxResults:
                      type: integer
                      minimum: 1
                      maximum: 10
                      description: Limits the number of search snippets requested from OpenRouter (defaults to 5)
                    searchPrompt:
                      type: string
                      description: Custom prompt prefix for the search results block (defaults to provider baseline)
                    searchContextSize:
                      type: string
                      enum: [low, medium, high]
                      description: Controls the `web_search_options.search_context_size` value passed to OpenRouter
      responses:
        '200':
          description: "Streams a text/plain token feed that the client renders incrementally."
          content:
            text/plain: {}
        '400':
          description: "Governance rejection (no allow-listed sources or invalid web search request)."
        '401':
          description: "Missing or invalid NextAuth session."
        '502':
          description: "Upstream provider error from OpenRouter or Cerebras."
        '503':
          description: "Provider key missing; development fallback stream is returned."

  /usage:
    get:
      summary: "Fetch current usage totals for the authenticated user"
      description: "Returns the plan tier, counts of requests used today, and the current daily limit to support UI badges and upgrade prompts."
      security:
        - cookieAuth: []
      responses:
        '200':
          description: "Usage summary"
          content:
            application/json:
              schema:
                type: object
                required: [plan, usedToday, dailyLimit]
                properties:
                  plan:
                    type: string
                    enum: [free, pro]
                  usedToday:
                    type: integer
                    minimum: 0
                  dailyLimit:
                    type: integer
                    minimum: 1
        '401':
          description: "Missing or invalid NextAuth session."
        '503':
          description: "Usage data unavailable."

  /stripe/create-checkout-session:
    post:
      summary: "Start a Stripe Checkout session for plan upgrades"
      description: "Authenticated users trigger this endpoint from the Pricing page or usage badge CTA to receive a hosted checkout URL."
      security:
        - cookieAuth: []
      requestBody:
        required: false
      responses:
        '200':
          description: "Checkout session created"
          content:
            application/json:
              schema:
                type: object
                properties:
                  url:
                    type: string
                    format: uri
        '401':
          description: "Missing or invalid session."
        '500':
          description: "Stripe error while creating the session."

  /stripe/create-portal-session:
    post:
      summary: "Send the user to the Stripe Customer Billing Portal"
      description: "Creates a billing portal session so Pro users can manage payment methods, invoices, or cancel their plan."
      security:
        - cookieAuth: []
      requestBody:
        required: false
      responses:
        '200':
          description: "Billing portal session created"
          content:
            application/json:
              schema:
                type: object
                properties:
                  url:
                    type: string
                    format: uri
        '401':
          description: "Missing or invalid session."
        '400':
          description: "User lacks a Stripe customer record."
        '500':
          description: "Stripe error while creating the session."

  /stripe/webhook:
    post:
      summary: "Receive asynchronous subscription lifecycle events"
      description: "Listens for Stripe events (checkout completion, invoice payments, cancellations) and updates user subscription status, customer IDs, and plan expiration."
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
      responses:
        '200':
          description: "Event handled successfully"
        '400':
          description: "Invalid signature or event payload"

  /datasources:
    get:
      summary: "Expose governed data sources to the UI"
      description: "Returns the parsed contents of `datasources.yml`, enabling the Data Sources Directory UI to render categories, update cadence, and policy details."
      security:
        - cookieAuth: []
      responses:
        '200':
          description: "List of allow-listed sources"
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
        '401':
          description: "Missing or invalid session."
        '503':
          description: "Registry unavailable or malformed."

  /auth/[...nextauth]:
    get:
      summary: "NextAuth handler (providers + session)"
      description: "Returns active auth providers and handles session checks. Used by the frontend to discover Google OAuth availability."
      responses:
        '200':
          description: "JSON map of enabled providers."
    post:
      summary: "NextAuth callback handler"
      description: "Processes credential and OAuth sign-in requests. Credentials flow expects form-encoded data; OAuth providers redirect here."
      requestBody:
        required: false
        content:
          application/x-www-form-urlencoded:
            schema:
              type: object
              properties:
                csrfToken:
                  type: string
                callbackUrl:
                  type: string
                json:
                  type: string
                  description: Encoded credentials payload produced by `signIn`.
      responses:
        '200':
          description: "Sign-in succeeded; session cookie issued."
        '302':
          description: "Redirect to callbackUrl or error page."
        '401':
          description: "Invalid credentials or provider failure."

  /health:
    get:
      summary: "Get the health status of the application"
      responses:
        '200':
          description: "Service is healthy"

components:
  securitySchemes:
    cookieAuth:
      type: apiKey
      in: cookie
      name: "next-auth.session-token" # Example name
```

---
