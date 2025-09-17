# 6. Epic 1: Foundation & User Onboarding

**Expanded Epic Goal:** This epic lays the critical groundwork for the entire application. It covers creating the monorepo, setting up the Next.js project, establishing the Vercel deployment pipeline, and implementing a complete, secure user authentication system. By the end of this epic, the project will have a live URL, and users will be able to create an account, log in, and access a protected page.

## Story 1.1: Project Initialization & Vercel Deployment
* **As a** developer,
* **I want** to set up the initial monorepo, Next.js application, and connect it to Vercel,
* **so that** we have a live, deployable foundation for all future work.

**Acceptance Criteria:**
1.  A new monorepo is created and pushed to a Git repository.
2.  A new Next.js application using the App Router is initialized within the monorepo.
3.  The project is successfully connected to a Vercel project.
4.  A basic "Hello World" or default index page is successfully deployed and viewable at a public Vercel URL.
5.  Vercel deployments are automatically triggered on pushes to the main branch.

## Story 1.2: Database Setup & ORM Integration
* **As a** developer,
* **I want** to set up the Neon database and integrate the Drizzle ORM into the Next.js application,
* **so that** we can persist and manage user data.

**Acceptance Criteria:**
1.  A new Neon Postgres project is created.
2.  The Next.js application is configured with the correct environment variables to connect to the Neon database.
3.  Drizzle ORM is installed and configured in the project.
4.  An initial database schema for a `users` table (including fields for id, email, hashed password) is created using Drizzle.
5.  A Drizzle migration can be successfully run against the Neon database, creating the `users` table.

## Story 1.3: Authentication UI Components
* **As a** user,
* **I want** to see and interact with sign-up and login forms,
* **so that** I can begin the process of creating an account or logging in.

**Acceptance Criteria:**
1.  A `/signup` page is created containing a form with fields for email and password.
2.  A `/login` page is created containing a form with fields for email and password.
3.  All form components are built using shadcn/ui and styled with Tailwind CSS.
4.  Basic client-side validation (e.g., required fields, valid email format) is present on the forms.
5.  The forms are not yet connected to any backend APIs; submitting them does nothing.

## Story 1.4: User Registration API Endpoint
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

## Story 1.5: User Login & Session Management
* **As a** developer,
* **I want** to create a secure API endpoint for user login and session creation,
* **so that** existing users can authenticate and establish a session.

**Acceptance Criteria:**
1.  NextAuth is configured with a Credentials provider that validates email/password combinations against the Neon database using bcrypt.
2.  The NextAuth handler is exposed at `/api/auth/[...nextauth]` with the JWT session strategy and a shared secret.
3.  The helper endpoint at `/api/auth/login` accepts a JSON payload, validates it with zod, and responds with guidance to use the NextAuth Credentials callback.
4.  Successful credential sign-in issues a secure session cookie that server routes can rely on for authenticated requests.
5.  Invalid credentials return a generic error without revealing whether the email exists.
6.  When `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set, the Google OAuth provider is registered and surfaced through `GET /api/auth/providers`.

## Story 1.6: Connect UI to Auth & Protect Routes
* **As a** user,
* **I want** to use the sign-up and login forms to create an account and access a protected page,
* **so that** I can confirm the authentication system works end-to-end.

**Acceptance Criteria:**
1.  The sign-up form from Story 1.3 posts to `/api/auth/register`, surfaces success and error toasts, and redirects to login on success.
2.  The login form from Story 1.3 calls `signIn("credentials")` from NextAuth, handles success and failure without a full-page reload, and shows appropriate toasts.
3.  After a successful sign-up or login (including OAuth flows), the user is redirected to `/dashboard` or the `next` query parameter target.
4.  The `/dashboard` page uses NextAuth session checks to enforce authentication, redirecting unauthenticated visitors to `/login`.
5.  The login experience renders a Google sign-in button via NextAuth and surfaces provider-specific error messages when Google OAuth fails.
6.  Logging out triggers NextAuth `signOut`, clears the session cookie, and returns the user to the login page.

---

## Story 1.7: Self-Service Password Recovery
* **As a** user who has forgotten their password,
* **I want** a secure, self-service flow to request a reset link and set a new password,
* **so that** I can regain access without contacting support.

**Acceptance Criteria:**
1.  The login screen links to a `/forgot-password` route that renders a form (email field with validation, submit button) built with the shared auth card layout.
2.  Submitting the form calls the password-reset request endpoint, shows an in-place success state confirming the destination email, and offers a "Try again" action plus navigation back to `/login`.
3.  The success state and primary form both surface a "Continue with Google" button using the shared OAuth component, keeping alternative sign-in options available.
4.  A `/reset-password` route accepts a `token` query parameter; missing or invalid tokens immediately redirect users back to `/forgot-password` with an error toast.
5.  The reset form collects a new password and confirmation, enforces matching values, calls the reset endpoint, and on success routes the user to `/login` with a confirmation toast.
6.  Authentication error handling is centralized in an `(auth)/error` page that interprets common NextAuth error codes (e.g., OAuth failures) and provides quick links back to `/login` or retrying Google sign-in.

---
