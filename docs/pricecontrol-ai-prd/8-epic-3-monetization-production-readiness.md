# 8. Epic 3: Monetization & Production Readiness

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
