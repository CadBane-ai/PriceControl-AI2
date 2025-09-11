# PriceControl Fullstack Architecture Document

## 1. Introduction

This document outlines the complete fullstack architecture for PriceControl. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

### Starter Template or Existing Project
The project will be bootstrapped using the **T3 Stack**. This provides a pre-configured, production-ready starting point that includes:
* Next.js (App Router)
* TypeScript
* Tailwind CSS
* Drizzle ORM (for database access)
* NextAuth.js (for authentication)

This choice accelerates initial setup and enforces end-to-end type safety.

### Change Log
| Date | Version | Description | Author |
| :--- | :--- | :--- | :--- |
| 2025-09-05 | 1.0 | Initial architecture draft. | Winston (Architect) |

---
## 2. High-Level Architecture

### Technical Summary
The architecture for PriceControl will be a full-stack, type-safe web application built upon the T3 Stack foundation. It will feature a Next.js frontend with serverless API routes deployed on Vercel, a Neon serverless Postgres database with Drizzle ORM for data persistence, and NextAuth.js for authentication. This cohesive stack is designed for rapid development, scalability, and end-to-end type safety, directly supporting the project's goal of delivering a reliable financial analysis tool.

### Platform and Infrastructure Choice
* **Platform:** Vercel
* **Key Services:** Vercel Functions, Neon (Postgres), Upstash (Redis), Stripe (Payments), and a separate GPU host for the vLLM service.
* **Deployment Regions:** US-East for primary compute and database services, with global distribution for static assets via Vercel's Edge Network.

### Repository Structure
* **Structure:** Monorepo
* **Monorepo Tool:** The T3 Stack provides a standard monorepo structure managed via npm/pnpm workspaces.

### High Level Architecture Diagram
```mermaid
graph TD
    subgraph User
        A[Browser]
    end

    subgraph "Vercel Platform"
        B[Next.js App / Edge Network] --> C{API Routes};
        B --> D[NextAuth.js];
    end

    subgraph "Data & Services"
        E[Neon Postgres / Drizzle ORM]
        F[Upstash Redis]
        G[Stripe Payments]
        H[External Financial APIs]
    end

    subgraph "AI Layer (External Host)"
        I[vLLM Service]
    end

    A --> B;
    C --> D;
    C --> E;
    C --> F;
    C --> G;
    C --> H;
    C --> I;
```

### Architectural Patterns
* **Full-stack Type Safety:** Leveraging Zod and TypeScript to ensure type safety from the database schema (Drizzle) through the API layer to the frontend (React).
* **Serverless Functions:** Using Next.js API Routes deployed as serverless functions on Vercel for all backend logic.
* **Component-Based UI:** Using React Server Components (RSC) within the Next.js App Router for an efficient and modern frontend.
* **Repository Pattern (via ORM):** Abstracting data access through Drizzle ORM, creating a clean separation between business logic and data persistence.

---
## 3. Tech Stack

### Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Language** | TypeScript | `~5.4` | Primary language for type safety. | T3 Stack default; ensures end-to-end type safety. |
| **Frontend Framework**| Next.js | `~14.2` | Core application framework. | App Router & RSC provide a modern, performant foundation. |
| **UI Library** | shadcn/ui | `Latest` | Component library for UI construction. | Provides accessible, unstyled components to build a custom design. |
| **State Management** | Zustand | `~4.5` | Lightweight client-side state management. | Simple, effective, and unopinionated. Scales well without boilerplate. |
| **Backend Language** | TypeScript | `~5.4` | Primary language for API routes. | T3 Stack default; maintains consistency with the frontend. |
| **Backend Framework**| Next.js API Routes | `~14.2` | Serverless backend for API logic. | Co-located with the frontend for a seamless developer experience. |
| **API Style** | RESTful API Routes| `N/A` | Defines how the client and server communicate. | Simple, well-understood pattern for creating API endpoints in Next.js. |
| **Database** | Neon Postgres | `16` | Serverless PostgreSQL database. | Excellent for Vercel deployments with features like serverless branching. |
| **ORM** | Drizzle ORM | `~0.30` | Database toolkit for interacting with Postgres. | T3 Stack default; lightweight, performant, and type-safe. |
| **Authentication** | NextAuth.js | `~5.0` | Handles user authentication and sessions. | T3 Stack default; flexible and deeply integrated with Next.js. |
| **Cache & Rate Limit**| Upstash Redis | `N/A` | Caching and rate-limiting middleware. | High-performance, serverless Redis ideal for Vercel Edge functions. |
| **Payments** | Stripe Billing | `N/A` | Handles subscriptions and payments. | Industry standard with robust APIs and pre-built UI components. |
| **Frontend Testing** | Vitest & RTL | `~1.6` | For unit and component testing. | Modern, fast testing framework that works well with React Testing Library. |
| **E2E Testing** | Playwright | `~1.44` | For end-to-end application testing. | Powerful and reliable for testing real user flows across browsers. |
| **Observability** | Sentry & PostHog | `N/A` | Error tracking and product analytics. | As specified in the plan for comprehensive monitoring. |
| **Deployment** | Vercel | `N/A` | Hosting platform for the Next.js app. | Provides a seamless deployment experience and global Edge Network. |

---
## 4. Data Models

### User
* **Purpose:** Represents an end-user of the application. This model stores authentication information, subscription status, and links to other data like conversation history.
* **Key Attributes:**
    * `id`: `string` - Unique identifier for the user (e.g., a UUID).
    * `email`: `string` - The user's login email, which must be unique.
    * `passwordHash`: `string` - The securely hashed password for authentication.
    * `stripeCustomerId`: `string` (nullable) - The user's unique ID in the Stripe system, linking them to their billing information.
    * `subscriptionStatus`: `enum ('free' | 'pro')` - The user's current subscription tier, which controls access to features.
    * `createdAt`: `Date` - Timestamp of when the user account was created.
    * `updatedAt`: `Date` - Timestamp of the last update to the user record.
#### TypeScript Interface
```typescript
export interface User {
  id: string;
  email: string;
  stripeCustomerId: string | null;
  subscriptionStatus: 'free' | 'pro';
  createdAt: Date;
  updatedAt: Date;
}
```

### Conversation
* **Purpose:** Represents a single, distinct chat session between a user and the AI. It acts as a container for all messages exchanged within that session and allows users to maintain separate contexts for different topics.
* **Relationships:** A `User` can have many `Conversations`. Each `Conversation` belongs to exactly one `User`.
* **Key Attributes:**
    * `id`: `string` - A unique identifier for the conversation.
    * `userId`: `string` - A foreign key that links this conversation to the `User` who initiated it.
    * `title`: `string` - A short, descriptive title for the conversation, which can be auto-generated from the first user query (e.g., "SEC Filings for TSLA").
    * `createdAt`: `Date` - Timestamp of when the conversation was started.
    * `updatedAt`: `Date` - Timestamp of when the last message was added.
#### TypeScript Interface
```typescript
import type { User } from './user';

export interface Conversation {
  id: string;
  userId: User['id'];
  title: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Message
* **Purpose:** Represents a single turn within a `Conversation`, containing the text from either the user or the AI assistant. A collection of messages, ordered by time, forms the complete chat history.
* **Relationships:** A `Conversation` can have many `Messages`. Each `Message` belongs to exactly one `Conversation`.
* **Key Attributes:**
    * `id`: `string` - A unique identifier for the message.
    * `conversationId`: `string` - A foreign key that links this message to its parent `Conversation`.
    * `role`: `enum ('user' | 'assistant')` - Specifies whether the message was sent by the user or generated by the AI.
    * `content`: `text` - The actual text content of the message.
    * `createdAt`: `Date` - Timestamp of when the message was created.
#### TypeScript Interface
```typescript
import type { Conversation } from './conversation';

export interface Message {
  id: string;
  conversationId: Conversation['id'];
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}
```

### ToolCallLog
* **Purpose:** To create an immutable audit trail of every time the AI assistant uses a tool (e.g., `web.fetch`). This is critical for compliance with data source terms, debugging issues, and ensuring the data governance rules are being followed.
* **Relationships:** A `Message` from the assistant can be associated with one or more `ToolCallLogs`. Each log is also linked to the `User` and `Conversation` for easy querying.
* **Key Attributes:**
    * `id`: `string` - A unique identifier for the log entry.
    * `conversationId`: `string` - Foreign key linking to the `Conversation`.
    * `toolName`: `string` - The name of the tool that was called (e.g., 'web.fetch').
    * `toolInput`: `json` - The parameters the LLM passed to the tool.
    * `status`: `enum ('success' | 'failure')` - Indicates if the tool executed successfully.
    * `createdAt`: `Date` - Timestamp of when the tool call occurred.
#### TypeScript Interface
```typescript
import type { Conversation } from './conversation';

export interface ToolCallLog {
  id: string;
  conversationId: Conversation['id'];
  toolName: string;
  toolInput: Record<string, any>;
  status: 'success' | 'failure';
  createdAt: Date;
}
```

---
## 5. API Specification

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
      summary: "Log in a user and create a session"
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
          description: "Login successful, session cookie set"
        '401':
          description: "Invalid credentials"

  /ai/chat:
    post:
      summary: "Send a message to the AI assistant"
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
                  items:
                    # Reference to the Message data model
                mode:
                  type: string
                  enum: [instruct, thinking]
      responses:
        '200':
          description: "A streaming text response from the AI assistant."
          content:
            text/event-stream: {}
            
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
## 6. Components

### Component Diagram
```mermaid
graph TD
    subgraph "PriceControl System (Vercel)"
        A[Web UI <br> Next.js / React]
        B[API Layer <br> Next.js API Routes]
        C[Authentication Service <br> NextAuth.js]
        D[Data Persistence Service <br> Drizzle ORM]
        E[LLM Gateway Service]
        F[Payments Service <br> Stripe Integration]
    end

    subgraph "External Systems"
        G[User's Browser]
        H[vLLM Service <br> GPU Host]
        I[Stripe API]
        J[Financial Data APIs]
        K[Neon Postgres DB]
    end

    G --> A;
    A --> B;
    B --> C;
    B --> E;
    B --> F;
    C --> D;
    D --> K;
    E --> H;
    E --> J;
    F --> I;
```

### Component List

#### Web UI (Next.js Frontend)
* **Responsibility:** To render the entire user interface, manage all client-side state (e.g., chat history, UI state), and serve as the primary entry point for all user interactions. It is responsible for making secure, authenticated requests to the API Layer for all business logic.
* **Key Interfaces:** Exposes a responsive web interface to the user's browser. It consumes the RESTful API defined in the API Specification.
* **Dependencies:** It is highly dependent on the API Layer for all data, authentication, and AI functionality.
* **Technology Stack:** Next.js `~14.2`, React, TypeScript, Tailwind CSS, shadcn/ui, Zustand.

#### API Layer (Next.js API Routes)
* **Responsibility:** To act as the secure backend-for-frontend (BFF). Its primary responsibility is to receive requests from the Web UI, orchestrate the necessary business logic by calling other internal services (like Auth, Payments, LLM), and return data in a format the frontend can easily consume.
* **Key Interfaces:** Exposes the RESTful API defined in the OpenAPI Specification. It provides the endpoints for all application functionality.
* **Dependencies:** Depends on the Authentication Service, Data Persistence Service, LLM Gateway Service, and Payments Service to fulfill requests.
* **Technology Stack:** Next.js `~14.2` API Routes, TypeScript, Zod (for request validation).

#### Authentication Service (NextAuth.js)
* **Responsibility:** To handle all aspects of user authentication and session management. Its sole responsibility is to verify user identities, create and manage secure sessions (e.g., via cookies), and provide the API Layer with the mechanisms to protect endpoints.
* **Key Interfaces:** Exposes middleware and helper functions used by the API Layer to protect routes. It also provides both the client and server components with the current user's session state.
* **Dependencies:** Depends on the Data Persistence Service to retrieve and verify user credentials.
* **Technology Stack:** NextAuth.js `~5.0`.

#### Data Persistence Service (Drizzle + Neon)
* **Responsibility:** To manage all interactions with the Neon Postgres database. It is responsible for executing queries, managing schema migrations, and providing a type-safe data access layer for other services. It ensures the application's business logic is decoupled from the raw database implementation.
* **Key Interfaces:** Exposes a set of type-safe functions and objects via Drizzle ORM for creating, reading, updating, and deleting data. It is consumed by any service that needs to interact with the database.
* **Dependencies:** Depends directly on the Neon Postgres database service.
* **Technology Stack:** Drizzle ORM `~0.30`, Neon Serverless Driver, Postgres `16`.

#### LLM Gateway Service
* **Responsibility:** To serve as the dedicated and secure interface between our application and the external vLLM service. It is responsible for loading system prompts, constructing the final request to the LLM, defining and providing the available tools, and most critically, enforcing the data source governance by validating all tool calls against the `/datasources.yml` allow-list.
* **Key Interfaces:** Exposes a primary function to the API Layer that takes the conversation context (messages, selected model) and returns a readable stream of the AI's response.
* **Dependencies:** Depends on the external vLLM Service for text generation and the Data Persistence Service to create an audit log of all tool calls.
* **Technology Stack:** TypeScript, Vercel AI SDK, Zod (for tool parameter validation).

#### Payments Service (Stripe Integration)
* **Responsibility:** To handle all interactions related to billing and subscriptions. It is responsible for creating Stripe Checkout sessions for new subscriptions and processing incoming webhooks from Stripe to update a user's subscription status in our database.
* **Key Interfaces:** Exposes an internal API consumed by the main API Layer to initiate payments. It also exposes a public webhook endpoint to receive events directly from the Stripe API.
* **Dependencies:** Depends on the external Stripe API for all payment processing and on the Data Persistence Service to update the `User` model with subscription changes.
* **Technology Stack:** Stripe Node.js library, Next.js API Routes.

---
## 7. External APIs

### vLLM Service API (for Qwen3)
* **Purpose:** To provide the core AI text generation capabilities for the application.
* **Documentation:** This is an OpenAI-compatible API served by our self-hosted vLLM instance. It will adhere to the standard OpenAI Chat Completions API format.
* **Base URL(s):** To be defined in the `VLLM_BASE_URL` environment variable, pointing to our privately hosted GPU server.
* **Authentication:** A static API key, stored in the `VLLM_API_KEY` environment variable, will be used to secure the endpoint from public access.
* **Key Endpoints Used:**
    * `POST /v1/chat/completions` - The standard endpoint for generating streaming chat responses.

### Stripe API
* **Purpose:** To handle all payment processing, including creating subscription checkouts and managing customer billing information.
* **Documentation:** [https://stripe.com/docs/api](https://stripe.com/docs/api)
* **Base URL(s):** `https://api.stripe.com`
* **Authentication:** All requests must be authenticated using a secret API key, stored securely in the `STRIPE_SECRET_KEY` environment variable.
* **Key Endpoints Used:**
    * `POST /v1/checkout/sessions` - To create a new checkout session for a user to subscribe.
    * `POST /v1/billing_portal/sessions` - To create a session for the customer portal.

### Financial Data APIs (Governed by Source Registry)
* **Purpose:** To provide the raw financial, economic, and political data required by the LLM to answer user queries. This is a collection of diverse external sources.
* **Documentation:** Each data source is documented in the `/datasources.yml` file, which includes its base URL and terms of use.
* **Integration Notes:** The core integration pattern is **governed access**. All calls to these external APIs **must** pass through the `LLM Gateway Service` and be validated against the `/datasources.yml` allow-list.

---
## 8. Core Workflows

### User Login Flow
```mermaid
sequenceDiagram
    participant Browser
    participant WebUI as Web UI (Next.js)
    participant APILayer as API Layer
    participant AuthService as Auth Service
    participant DataService as Data Persistence

    Browser->>WebUI: User submits login form
    WebUI->>APILayer: POST /api/auth/login (email, password)
    APILayer->>AuthService: AuthenticateUser(credentials)
    AuthService->>DataService: GetUserByEmail(email)
    DataService-->>AuthService: Return user record (with hash)
    AuthService-->>AuthService: Compare password with hash
    alt Credentials Valid
        AuthService-->>APILayer: Return success + user session
        APILayer-->>WebUI: Return 200 OK, Set-Cookie header
        WebUI-->>Browser: Redirect to /dashboard
    else Credentials Invalid
        AuthService-->>APILayer: Return authentication error
        APILayer-->>WebUI: Return 401 Unauthorized
        WebUI-->>Browser: Display "Invalid credentials" error
    end
```

### AI Chat Query with Tool Use
```mermaid
sequenceDiagram
    participant User
    participant WebUI as Web UI
    participant APILayer as API Layer
    participant LLMGateway as LLM Gateway
    participant vLLM as vLLM Service (External)
    participant Tool as Governed Tool (web.fetch)
    participant DataAPI as External Data API
    participant AuditLog as Data Persistence

    User->>WebUI: Submits query
    WebUI->>APILayer: POST /api/ai/chat
    APILayer->>LLMGateway: ProcessRequest(messages)
    LLMGateway->>vLLM: streamText(prompt, tools)
    vLLM-->>LLMGateway: Request to use Tool(params)
    LLMGateway->>Tool: Validate & Execute(params)
    Tool-->>Tool: Check source against allow-list
    Tool->>DataAPI: Fetch data
    LLMGateway->>AuditLog: Create ToolCallLog entry
    DataAPI-->>Tool: Return financial data
    Tool-->>LLMGateway: Return formatted data
    LLMGateway->>vLLM: Provide tool output
    vLLM-->>LLMGateway: Stream synthesized answer
    LLMGateway-->>APILayer: Stream response
    APILayer-->>WebUI: Stream response
    WebUI-->>User: Display streaming answer & citation
```

---
## 9. Database Schema
```sql
-- Create custom ENUM types for status fields to ensure data integrity
CREATE TYPE subscription_status AS ENUM ('free', 'pro');
CREATE TYPE message_role AS ENUM ('user', 'assistant');
CREATE TYPE tool_call_status AS ENUM ('success', 'failure');

-- Create the users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    stripe_customer_id TEXT,
    subscription_status subscription_status DEFAULT 'free',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create the conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create the messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role message_role NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create the tool_call_logs table for auditing
CREATE TABLE tool_call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    tool_name TEXT NOT NULL,
    tool_input JSONB NOT NULL,
    status tool_call_status NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for faster lookups on foreign keys
CREATE INDEX ON conversations (user_id);
CREATE INDEX ON messages (conversation_id);
CREATE INDEX ON tool_call_logs (conversation_id);

```
---
## 10. Unified Project Structure
```plaintext
pricecontrol/
├── apps/
│   └── web/                    # The main Next.js application
│       ├── src/
│       │   ├── app/            # Next.js App Router layout and pages
│       │   ├── components/     # UI components (shadcn/ui)
│       │   ├── lib/            # Helper functions, utilities
│       │   └── server/         # Server-side logic, API routes, Drizzle schema
│       └── ...
├── packages/
│   └── shared/                 # Shared code between packages
│       └── src/
│           └── types/          # Shared TypeScript types and Zod schemas
├── prompts/                    # Directory for .mdx system prompts
│   └── base-system.mdx
├── .env.example                # Template for environment variables
├── datasources.yml             # The master source registry for the AI
├── package.json                # Root package.json for monorepo workspaces
└── tsconfig.json               # Root TypeScript configuration
```
---
## 11. Development Workflow
### Local Development Setup
#### Prerequisites
* **Node.js:** `v20.x` (LTS)
* **pnpm:** `~9.x`
* **Git**
#### Initial Setup
```bash
git clone <repository-url>
cd pricecontrol
pnpm install
cp .env.example .env
```
#### Development Commands
```bash
# Start the development server
pnpm dev

# Run all tests
pnpm test
```
### Environment Configuration
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
## 12. Deployment Architecture
### Deployment Strategy
* **Frontend & API Layer:** Deployed automatically by Vercel's Git-based workflow. Pushing to a branch creates a Preview URL; merging to `main` deploys to Production.
* **vLLM Service:** Deployed manually for the MVP on a dedicated GPU host.
### CI/CD Pipeline
The primary CI/CD is managed by Vercel, which automatically runs install, lint, test, and build steps on every push.
### Environments
| Environment | URL | Purpose |
| :--- | :--- | :--- |
| **Development** | `http://localhost:3000` | Local development and testing. |
| **Preview** | `pricecontrol-*.vercel.app` | Isolated deployments for each pull request. |
| **Production** | `(To be defined)` | The live application for users. |
---
## 13. Security and Performance
### Security Requirements
* **Frontend:** Strict Content-Security-Policy (CSP) will be implemented.
* **Backend:** All API inputs will be validated with Zod; rate limiting will be enforced with Upstash Redis.
* **Authentication:** Secure, HTTP-only cookies will be used for session management via NextAuth.js. Secrets will be stored as Vercel Environment Variables.
### Performance Optimization
* **Frontend:** Route-based code-splitting, lazy-loading, and skeleton loaders will be used.
* **Backend:** A caching layer with Upstash Redis will be implemented for frequently accessed data, and cron jobs will pre-warm caches.
---
## 14. Testing Strategy
### Testing Pyramid
Our strategy is based on the Testing Pyramid, with a large base of unit tests, a smaller layer of integration tests, and a few end-to-end tests for critical flows.
### Test Organization
* **Frontend:** Unit/component tests co-located with components, using Vitest and React Testing Library.
* **Backend:** Unit tests co-located with services; integration tests in a dedicated `__tests__` directory.
* **E2E:** A top-level `e2e/` directory using Playwright.
---
## 15. Coding Standards
### Critical Fullstack Rules
* **Type Safety:** All code must be strictly typed using TypeScript; avoid `any`.
* **Environment Variables:** Access environment variables only through the type-safe schema.
* **Data Access:** All database queries must go through the Drizzle ORM layer.
### Naming Conventions
| Element | Convention | Example |
| :--- | :--- | :--- |
| **Components (React)** | `PascalCase` | `UserProfile.tsx` |
| **Hooks (React)** | `camelCase` with `use` prefix | `useUserData.ts` |
| **Database Tables** | `snake_case` | `user_profiles` |
---
## 16. Error Handling Strategy
A unified strategy will be used. Backend API errors will conform to a standardized JSON structure. A global error handler will catch all exceptions, log them to Sentry, and return the structured error to the client, which will display a user-friendly message.
---
## 17. Monitoring and Observability
### Monitoring Stack
* **Frontend Monitoring:** Vercel Analytics and PostHog.
* **Backend Monitoring:** Vercel Observability.
* **Error Tracking:** Sentry for both frontend and backend.
* **Performance Monitoring:** Sentry for detailed transaction tracing.
### Key Metrics
* **Frontend:** Core Web Vitals, JavaScript Error Rate, User Funnels.
* **Backend:** API Error Rate, API Response Time, vLLM Service Health, Database Health.
---
## 18. Checklist Results Report
* **Overall Architecture Readiness:** High
* **Final Decision:** The architecture is comprehensive, robust, and directly aligned with all previously defined requirements. It is a solid blueprint for development. I recommend we **proceed to implementation**.