# PriceControl Product Requirements Document (PRD)

## 1. Goals and Background Context

### Goals

* **Launch and Grow:** Launch the MVP within 6 months and acquire an initial user base of 1,000 monthly active users.
* **Validate Business Model:** Achieve a 5% free-to-paid user conversion rate within the first 6 months post-launch to validate the subscription model.
* **Deliver User Value:** Provide a highly engaging and trustworthy user experience, measured by high session query counts and strong weekly user retention.
* **Ensure Trust:** Guarantee data integrity and build user trust by exclusively using a transparent, allow-listed registry of reputable financial sources.

### Background Context

The current market for financial analysis is divided between prohibitively expensive institutional platforms and unreliable general-purpose AI tools. PriceControl addresses this gap by providing a trustworthy, AI-driven financial assistant at an accessible price point.

The core of the solution is an open-source LLM whose data access is strictly governed by a transparent registry of reputable sources. This unique approach combines the analytical power of modern AI with the data integrity required for high-stakes financial decisions, empowering a broader audience of investors and analysts with tools previously reserved for the financial elite.

### Change Log

| Date | Version | Description | Author |
| :--- | :--- | :--- | :--- |
| 2025-09-05 | 1.0 | Initial PRD draft created from Project Brief. | John (PM) |

---

## 2. Requirements

### Functional Requirements

1.  **FR1: User Account Management:** The system shall allow users to sign up for a new account, log in with their credentials, and log out.
2.  **FR2: Subscription Management:** Users on the free tier shall be presented with an option to upgrade. This option will direct them to a Stripe Checkout page. Paying users shall be able to manage their subscription via a Stripe Customer Portal.
3.  **FR3: Core Chat Functionality:** The system shall provide a chat interface where users can submit text-based queries and receive streaming text responses from the LLM.
4.  **FR4: Dual Model Selection:** The chat interface shall allow users to select between the default "Instruct" model and the "Thinking" model for their query.
5.  **FR5: Governed Web Access:** When a user's query requires internet access, the platform must enable OpenRouter's built-in `web` search plugin via the request `plugins` parameter and only surface results whose domains appear in the `/datasources.yml` allow-list. Any result referencing an unlisted source must be rejected and logged.
6.  **FR6: Freemium Usage Gating:** The system shall enforce a usage limit (e.g., number of daily queries) on users in the free tier.
7.  **FR7: System Scalability:** The system shall be architected to scale and support at least 1,000 monthly active users without degradation in performance, leveraging the serverless capabilities of Vercel and Neon.
8.  **FR8: System Health Monitoring:** The system shall provide a health-check API endpoint that reports key metrics (e.g., database connectivity, response latency) to allow for automated monitoring of system scalability and performance.
9.  **FR9: Error and Exception Reporting:** The system shall automatically report all unhandled errors to Sentry, with appropriate source mapping, to provide a real-time dashboard for assessing system reliability.

### Non-Functional Requirements

1.  **NFR1: Performance:** The system must provide low-latency, streaming responses from the LLM. API response times should be monitored, and caches must be pre-warmed to ensure responsiveness during peak market hours.
2.  **NFR2: Security:** The application must implement a strict Content-Security-Policy (CSP). All OWASP Top-10 controls must be addressed, and sensitive credentials must be stored securely as Vercel Environment Variables.
3.  **NFR3: Reliability:** The application must be highly available. All errors and exceptions must be captured and tracked in Sentry, with system health monitored through Vercel Observability.
4.  **NFR4: Compliance:** All web crawling and data fetching tools must respect the `robots.txt` file and the Terms of Service for every data source in the allow-list.

---

## 3. User Interface Design Goals

### Overall UX Vision
The UX vision is to create a clean, data-dense, and highly efficient interface that prioritizes clarity and instills trust. It should feel like a professional-grade analytical tool, not a generic consumer chat app. All data presented must be clearly sourced and verifiable to the user.

### Key Interaction Paradigms
* **Conversational Interface:** The primary interaction will be a text-based chat with the LLM.
* **Model Selection:** Users will have a clear and simple way to switch between "Instruct" and "Thinking" LLM variants.
* **Data Visualization:** Financial data (e.g., stock prices) will be presented in clear, interactive charts.
* **Source Transparency:** Users should be able to easily see which data source was used for a given response.

### Core Screens and Views
* **Authentication:** Screens for user sign-up, login, and password management.
* **Main Chat Interface:** The primary workspace where users interact with the LLM, view responses, and see visualizations.
* **Subscription & Billing:** A pricing page and a redirect to the Stripe Customer Portal for managing subscriptions.
* **Data Sources Directory:** A reference page listing all approved data sources from the `datasources.yml` file to enhance transparency.

### Accessibility: WCAG AA
* The application will be designed to meet Web Content Accessibility Guidelines (WCAG) 2.1 Level AA, ensuring it is usable by people with a wide range of disabilities.

### Branding
* **Initial Recommendation:** As no brand guide has been provided, the branding should be professional, minimalist, and data-forward. The design should use a color palette that inspires confidence and clarity (e.g., dark blues, greys, and clean whites), with a focus on typography that ensures readability of dense financial information.

### Target Device and Platforms: Web Responsive
* The application will be a responsive web app, providing a seamless experience on desktop, tablet, and mobile devices.

---

## 4. Technical Assumptions

### Repository Structure: Monorepo
* A monorepo is assumed, containing the Next.js frontend, API routes, shared libraries, and prompt configurations in a single Git repository. This approach is ideal for full-stack TypeScript projects as it simplifies type sharing and dependency management.

### Service Architecture: Serverless
* The architecture will be serverless, utilizing Next.js Route Handlers (running on Vercel Functions) for the API and backend logic. This backend will communicate with the Together.ai inference API, Neon database, and other cloud services.

### Testing Requirements: Full Testing Pyramid
* A comprehensive testing strategy is assumed, including unit tests for individual components, integration tests for services, and end-to-end tests for critical user flows. This ensures a high-quality, reliable product.

### Additional Technical Assumptions and Requests
* **Frontend Framework:** Next.js with App Router will be used.
* **Styling:** Tailwind CSS with shadcn/ui components is the chosen styling solution.
* **Database & ORM:** The primary database will be Neon Serverless Postgres, with Drizzle used as the ORM.
* **LLM Runtime:** LLM inference will be provided via Together.ai’s OpenAI-compatible API; specific models are environment-configured (e.g., `TOGETHER_MODEL_INSTRUCT`, `TOGETHER_MODEL_REASONING`).
* **Deployment Platform:** The application will be deployed and hosted on Vercel.
* **Caching & Rate Limiting:** Upstash Redis will be used for caching and to enforce rate limits on the API.

---

## 5. Epic List

1.  **Epic 1: Foundation & User Onboarding:** Establish the core application infrastructure, deployment pipeline, and a complete user authentication system, allowing users to sign up and log in.
2.  **Epic 2: Core LLM Interaction & Governance:** Implement the main chat interface, integrate the dual-model LLM, and enforce the transparent data governance via the allow-listed source registry.
3.  **Epic 3: Monetization & Production Readiness:** Integrate the Stripe billing system, implement freemium usage limits, and set up production-grade monitoring and error reporting.

---

## 6. Epic 1: Foundation & User Onboarding

**Expanded Epic Goal:** This epic lays the critical groundwork for the entire application. It covers creating the monorepo, setting up the Next.js project, establishing the Vercel deployment pipeline, and implementing a complete, secure user authentication system. By the end of this epic, the project will have a live URL, and users will be able to create an account, log in, and access a protected page.

### Story 1.1: Project Initialization & Vercel Deployment
* **As a** developer,
* **I want** to set up the initial monorepo, Next.js application, and connect it to Vercel,
* **so that** we have a live, deployable foundation for all future work.

**Acceptance Criteria:**
1.  A new monorepo is created and pushed to a Git repository.
2.  A new Next.js application using the App Router is initialized within the monorepo.
3.  The project is successfully connected to a Vercel project.
4.  A basic "Hello World" or default index page is successfully deployed and viewable at a public Vercel URL.
5.  Vercel deployments are automatically triggered on pushes to the main branch.

### Story 1.2: Database Setup & ORM Integration
* **As a** developer,
* **I want** to set up the Neon database and integrate the Drizzle ORM into the Next.js application,
* **so that** we can persist and manage user data.

**Acceptance Criteria:**
1.  A new Neon Postgres project is created.
2.  The Next.js application is configured with the correct environment variables to connect to the Neon database.
3.  Drizzle ORM is installed and configured in the project.
4.  An initial database schema for a `users` table (including fields for id, email, hashed password) is created using Drizzle.
5.  A Drizzle migration can be successfully run against the Neon database, creating the `users` table.

### Story 1.3: Authentication UI Components
* **As a** user,
* **I want** to see and interact with sign-up and login forms,
* **so that** I can begin the process of creating an account or logging in.

**Acceptance Criteria:**
1.  A `/signup` page is created containing a form with fields for email and password.
2.  A `/login` page is created containing a form with fields for email and password.
3.  All form components are built using shadcn/ui and styled with Tailwind CSS.
4.  Basic client-side validation (e.g., required fields, valid email format) is present on the forms.
5.  The forms are not yet connected to any backend APIs; submitting them does nothing.

### Story 1.4: User Registration API Endpoint
* **As a** developer,
* **I want** to create a secure API endpoint for user registration,
* **so that** new users can be created and stored in the database.

**Acceptance Criteria:**
1.  A new API route is created at `/api/auth/register`.
2.  The endpoint accepts a POST request with an email and password.
3.  The endpoint validates the incoming data.
4.  The password is securely hashed before being stored.
5.  A new user record is successfully created in the `users` table in the Neon database.
6.  A success response is returned upon user creation.
7.  An appropriate error response is returned if the user already exists or if there is an error.

### Story 1.5: User Login & Session Management
* **As a** developer,
* **I want** to create a secure API endpoint for user login and session creation,
* **so that** existing users can authenticate and establish a session.

**Acceptance Criteria:**
1.  A new API route is created at `/api/auth/login`.
2.  The endpoint accepts a POST request with an email and password.
3.  The endpoint verifies the user's credentials against the stored hashed password.
4.  Upon successful authentication, a session (e.g., using Auth.js/NextAuth) is created and a session cookie is returned to the client.
5.  An appropriate error response is returned for invalid credentials.

### Story 1.6: Connect UI to Auth & Protect Routes
* **As a** user,
* **I want** to use the sign-up and login forms to create an account and access a protected page,
* **so that** I can confirm the authentication system works end-to-end.

**Acceptance Criteria:**
1.  The sign-up form from Story 1.3 is connected to the registration API from Story 1.4.
2.  The login form from Story 1.3 is connected to the login API from Story 1.5.
3.  After a successful sign-up or login, the user is redirected to a new `/dashboard` page.
4.  The `/dashboard` page is a protected route; unauthenticated users trying to access it are redirected to the login page.
5.  A logged-in user can see a simple "Welcome" message and a logout button on the dashboard.
6.  Clicking the logout button ends the user's session and redirects them to the login page.

---

## 7. Epic 2: Core LLM Interaction & Governance

**Expanded Epic Goal:** This epic brings the financial assistant to life. It covers building the chat UI, establishing a live, streaming connection to the Together.ai inference API, enabling model selection, and implementing the critical data governance layer. By the end of this epic, a logged-in user will be able to have a meaningful conversation and receive trustworthy, source-governed answers.

### Story 2.1: Basic Chat UI Scaffolding
* **As a** user,
* **I want** a clean and intuitive layout for the chat interface,
* **so that** I can easily view my conversation and type new queries.

**Acceptance Criteria:**
1.  The `/dashboard` page is replaced with a dedicated chat layout.
2.  The layout includes a main message display area that can scroll.
3.  The layout includes a text input field at the bottom of the screen for user queries.
4.  A "Send" button is present next to the input field.
5.  The UI is built with shadcn/ui and Tailwind CSS and is statically rendered (no functionality yet).

### Story 2.2: Implement Frontend Chat Logic
* **As a** user,
* **I want** my typed messages to appear in the chat history and see a loading indicator,
* **so that** I get immediate feedback that the system is processing my query.

**Acceptance Criteria:**
1.  The Vercel AI SDK is integrated into the frontend.
2.  When a user types a message and clicks "Send," their message is immediately added to the message display area.
3.  After sending a message, the input field is cleared and a loading indicator appears.
4.  The chat state (list of messages, loading status) is managed on the client side.
5.  This story does not yet make a call to a backend API.

### Story 2.3: Create Backend AI Chat Stream
* **As a** developer,
* **I want** to create a backend API route that streams data from the Together.ai API,
* **so that** the frontend can receive and display the LLM's response.

**Acceptance Criteria:**
1.  A new API route is created at `/api/ai/route.ts`.
2.  The route is configured to receive a list of messages from the frontend.
3.  The route successfully connects to the Together.ai endpoint using the provider API key.
4.  The route streams the response from Together.ai back to the client.
5.  The frontend chat interface from Story 2.2 is connected to this endpoint and successfully displays the streamed response.

### Story 2.4: Implement Dual-Model Selection
* **As a** user,
* **I want** to be able to choose between a fast model and a more powerful reasoning model,
* **so that** I can use the right tool for the job.

**Acceptance Criteria:**
1.  A UI control (e.g., a toggle or dropdown) is added to the chat interface to select "Instruct" or "Thinking" mode.
2.  The user's selection is passed to the `/api/ai/route.ts` endpoint with each request.
3.  The backend API uses the `mode` parameter to call the correct model configured for Together.ai.
4.  The chat interface visually indicates which model is currently active.

### Story 2.5: Implement Data Source Registry & Governed OpenRouter Web Search
* **As a** developer,
* **I want** to create the data governance layer and configure OpenRouter's native web search plugin,
* **so that** all LLM internet access is strictly controlled, auditable, and aligned with our approved sources.

**Acceptance Criteria:**
1.  A `/datasources.yml` file is created, parsable by the backend, and captures the allow-listed domains with human-readable metadata.
2.  A server-side guard function (e.g., `isAllowedSource`) validates a requested source or domain against the registry and exposes helpers for mapping OpenRouter search results back to registry entries.
3.  The `/api/ai/route.ts` pipeline configures OpenRouter requests to include the built-in `web` plugin (via the `plugins` array) and honours documented options such as `engine`, `max_results`, `search_prompt`, and `web_search_options.search_context_size`.
4.  When OpenRouter returns web search results, the service filters out responses whose domains are not present in `/datasources.yml`, emits a structured error, and prevents those snippets from being passed to the LLM.
5.  When at least one allowed source is returned, the service provides normalized result metadata (title, URL, snippet, source ID) that downstream stories can cite.

### Story 2.6: Integrate Tools with LLM and Provide Source Citations
* **As a** user,
* **I want** to see where the AI got its information from,
* **so that** I can trust and verify its answers.

**Acceptance Criteria:**
1.  The `/api/ai/route.ts` endpoint conditionally includes the OpenRouter `web` plugin in the request payload when governed web access is required.
2.  A system prompt is loaded from a `/prompts/*.mdx` file and used in the LLM call, instructing the AI to invoke the web search plugin and cite the vetted sources it returns.
3.  When asked a question that requires current data, the LLM triggers the `web` plugin and receives only the allow-listed results produced in Story 2.5.
4.  The final response streamed to the user includes a clear citation of the source ID and/or URL that was used to generate the answer.

---

## 8. Epic 3: Monetization & Production Readiness

**Expanded Epic Goal:** This final epic transitions the application from a functional product to a viable business. It focuses on implementing the complete monetization loop with Stripe, enforcing the freemium model's usage restrictions, and adding the observability tools necessary to ensure the application is stable and ready for a public launch. By the end of this epic, we will be able to accept payments and confidently manage the application in a production environment.

### Story 3.1: Stripe Product & Pricing Setup
* **As a** Product Manager,
* **I want** to configure the product and pricing plans in the Stripe Dashboard,
* **so that** the application has a defined subscription to sell.

**Acceptance Criteria:**
1.  A new Product named "PriceControl Pro" is created in the Stripe Dashboard.
2.  A recurring monthly Price is created and attached to the "PriceControl Pro" product.
3.  The Price ID and Product ID are securely stored as environment variables for the application to use.
4.  This story is considered an administrative task and does not involve writing code.

### Story 3.2: Create Stripe Checkout Session API
* **As a** developer,
* **I want** to create an API endpoint that initiates a Stripe Checkout session,
* **so that** users can be redirected to a secure payment page.

**Acceptance Criteria:**
1.  A new API route is created (e.g., `/api/stripe/create-checkout-session`).
2.  The endpoint is protected and can only be accessed by authenticated users.
3.  When called, the endpoint uses the Stripe Node.js library to create a new Checkout session for the "Pro" plan Price ID.
4.  The endpoint returns a session URL in the response.
5.  An appropriate error is returned if the session cannot be created.

### Story 3.3: Implement Pricing Page & Upgrade Flow
* **As a** free user,
* **I want** to see the available subscription plans and be able to start the upgrade process,
* **so that** I can unlock premium features.

**Acceptance Criteria:**
1.  A new `/pricing` page is created.
2.  The page displays the Free and "Pro" plans with their respective features and limits.
3.  An "Upgrade" button on the "Pro" plan, when clicked, calls the API from Story 3.2.
4.  Upon receiving a successful response, the user is automatically redirected to the Stripe Checkout URL.

### Story 3.4: Implement Stripe Webhooks for Subscription Status
* **As a** developer,
* **I want** to create a webhook handler to listen for successful payments from Stripe,
* **so that** I can update a user's status in our database automatically.

**Acceptance Criteria:**
1.  A new API route is created to act as a webhook endpoint for Stripe (e.g., `/api/stripe/webhook`).
2.  The handler securely verifies the signature of incoming webhooks from Stripe.
3.  The handler correctly processes the `checkout.session.completed` event.
4.  Upon receiving this event, the user's record in the Neon database is updated to reflect their "Pro" subscription status.

### Story 3.5: Implement Freemium Usage Gating
* **As a** free user,
* **I want** to be notified when I've reached my usage limit and prompted to upgrade,
* **so that** I understand the boundaries of the free plan.

**Acceptance Criteria:**
1.  A mechanism is implemented in the `/api/ai/route.ts` to track the number of queries per user within a specific timeframe (e.g., daily).
2.  When a user with a "Free" status exceeds the limit, the API returns an error message instead of processing the query.
3.  The error message clearly states that the limit has been reached and suggests upgrading.
4.  Users with a "Pro" status are not affected by this usage limit.

### Story 3.6: Implement Production-Grade Monitoring
* **As a** developer,
* **I want** to set up health checks and error reporting,
* **so that** we can monitor the application's stability in production.

**Acceptance Criteria:**
1.  A health-check API endpoint (e.g., `/api/health`) is created that verifies database connectivity and returns a 200 OK status.
2.  Sentry is configured for the production environment to automatically capture and report all unhandled exceptions from both the frontend and backend.
3.  A test exception thrown from the API is successfully captured and displayed in the Sentry dashboard.

---

## 9. Checklist Results Report

As the Product Manager, I have run my internal validation checklist (`pm-checklist.md`) against this PRD. The process we followed, building from the Project Brief and detailing each section interactively, has resulted in a comprehensive and well-structured document.

* **Overall PRD Completeness:** 100%
* **MVP Scope Appropriateness:** Just Right
* **Readiness for Architecture Phase:** Ready

**Final Decision:** **READY FOR ARCHITECT**. The PRD and its epics are comprehensive, properly structured, and ready for the next phases of design and architectural planning.

---

## 10. Next Steps

This PRD now serves as the source of truth for the development of the MVP. The next steps will be handled by our specialist agents, who will use this document as their primary input.

### UX Expert Prompt
> "Sally, please review this completed PRD. Based on the requirements in Section 3 (User Interface Design Goals) and the defined epics and stories, create a comprehensive UI/UX Specification (`front-end-spec.md`). Focus on user flows, wireframes, and component design."

### Architect Prompt
> "Winston, please use this PRD and the forthcoming UI/UX Specification from Sally to create the definitive Fullstack Architecture Document (`fullstack-architecture.md`). Ensure your architecture directly supports all functional and non-functional requirements and provides a clear implementation plan for the development team."
