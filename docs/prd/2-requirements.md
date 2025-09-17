# 2. Requirements

## Functional Requirements

1.  **FR1: User Account Management:** The system shall allow users to sign up for a new account, log in with their credentials, and log out. Email/password authentication is handled via NextAuth Credentials, with optional Google OAuth sign-in available when configured. Users must also be able to recover access without operator assistance via a self-service "Forgot password" workflow that issues reset links and a `/reset-password` experience that validates one-time tokens before accepting a new password.
2.  **FR2: Subscription Management:** Users on the free tier shall be presented with an option to upgrade. This option will direct them to a Stripe Checkout page. Paying users shall be able to manage their subscription via a Stripe Customer Portal.
3.  **FR3: Core Chat Functionality:** The system shall provide a chat interface where users can submit text-based queries and receive streaming text responses from the LLM.
4.  **FR4: Dual Model Selection:** The chat interface shall allow users to select between the default "Instruct" model and the "Thinking" model for their query.
5.  **FR5: Governed Web Access:** When a user's query requires internet access, the LLM's tools (`web.fetch`) must only retrieve information from sources defined in the `/datasources.yml` allow-list. The system must not access any unlisted sources.
6.  **FR6: Freemium Usage Gating:** The system shall enforce a usage limit (e.g., number of daily queries) on users in the free tier and surface a real-time usage meter with upgrade prompts in the product UI so that free users understand how close they are to the threshold.
7.  **FR7: System Scalability:** The system shall be architected to scale and support at least 1,000 monthly active users without degradation in performance, leveraging the serverless capabilities of Vercel and Neon.
8.  **FR8: System Health Monitoring:** The system shall provide a health-check API endpoint that reports key metrics (e.g., database connectivity, response latency) to allow for automated monitoring of system scalability and performance.
9.  **FR9: Error and Exception Reporting:** The system shall automatically report all unhandled errors to Sentry, with appropriate source mapping, to provide a real-time dashboard for assessing system reliability.

## Non-Functional Requirements

1.  **NFR1: Performance:** The system must provide low-latency, streaming responses from the LLM. API response times should be monitored, and caches must be pre-warmed to ensure responsiveness during peak market hours.
2.  **NFR2: Security:** The application must implement a strict Content-Security-Policy (CSP). All OWASP Top-10 controls must be addressed, and sensitive credentials must be stored securely as Vercel Environment Variables.
3.  **NFR3: Reliability:** The application must be highly available. All errors and exceptions must be captured and tracked in Sentry, with system health monitored through Vercel Observability.
4.  **NFR4: Compliance:** All web crawling and data fetching tools must respect the `robots.txt` file and the Terms of Service for every data source in the allow-list.

---
