# 2. High-Level Architecture

## Technical Summary
The architecture for PriceControl is a full-stack, type-safe web application built upon the T3 Stack foundation. Core capabilities now include self-service password recovery, governed data-source transparency driven by OpenRouter's built-in `web` search plugin, freemium usage metering with upgrade nudges, and a complete Stripe subscription loop. The system features a Next.js frontend with serverless API routes deployed on Vercel, a Neon serverless Postgres database with Drizzle ORM for durable persistence, NextAuth.js for authentication, Upstash Redis for short-lived counters, Resend for transactional email, and Stripe for billing. This cohesive stack is designed for rapid development, scalability, and end-to-end type safety, directly supporting the PRD v4 goals of trust, transparency, and monetization.

## Platform and Infrastructure Choice
* **Platform:** Vercel
* **Key Services:** Vercel Functions, Neon (Postgres), Upstash (Redis), Stripe (Payments), Resend (email), and Cerebras (via OpenRouter) for LLM inference.
* **Deployment Regions:** US-East for primary compute and database services, with global distribution for static assets via Vercel's Edge Network.

## Repository Structure
* **Structure:** Monorepo
* **Monorepo Tool:** The T3 Stack provides a standard monorepo structure managed via npm/pnpm workspaces.

## High Level Architecture Diagram
```mermaid
graph TD
    subgraph User
        A[Browser]
    end

    subgraph "Vercel Platform"
        B[Next.js App / Edge Network]
        C{API Routes / BFF}
        D[NextAuth.js]
        N[Static Assets & datasources.yml]
    end

    subgraph "Persistent Stores"
        E[Neon Postgres<br/>Drizzle ORM]
        F[Upstash Redis]
    end

    subgraph "External Services"
        G[Stripe Checkout & Billing Portal]
        H[OpenRouter (Cerebras)]
        I[Financial Data APIs]
        J[Resend Email]
    end

    A --> B;
    B --> C;
    C --> D;
    C --> E;
    C --> F;
    C --> G;
    C --> H;
    C --> I;
    C --> J;
    B --> N;
    N --> B;
```

## Architectural Patterns
* **Full-stack Type Safety:** Leveraging Zod and TypeScript to ensure type safety from the database schema (Drizzle) through the API layer to the frontend (React).
* **Serverless Functions:** Using Next.js API Routes deployed as serverless functions on Vercel for all backend logic, including usage metering, Stripe webhooks, and password reset flows.
* **Component-Based UI:** Using React Server Components (RSC) within the Next.js App Router for an efficient and modern frontend that powers chat, usage badges, pricing, and the data sources directory.
* **Repository Pattern (via ORM):** Abstracting data access through Drizzle ORM, creating a clean separation between business logic and data persistence while enabling clear audit logs for tool usage and subscription status changes.
* **Governed Data Access:** Enforcing a centralized allow-list (`datasources.yml`) for all outbound data fetches, including filtering OpenRouter `web` plugin results, and exposing the same registry to the UI for transparency.

---
