# 3. Tech Stack

## Technology Stack Table

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
