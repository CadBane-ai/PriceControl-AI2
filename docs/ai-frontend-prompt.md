# AI Frontend Master Prompt (PriceControl)

Use this prompt with an AI UI generator (e.g., Vercel v0, Lovable) to scaffold the initial frontend for PriceControl. Follow the structured format precisely.

---

High-Level Goal
- Build a responsive, accessible Next.js App Router UI for an AI-driven finance assistant named PriceControl.
- Implement auth flows (signup, login, password reset), a protected chat interface with model selector, a conversation sidebar, usage gating indicators, and upgrade entry points.
- Optimize for mobile-first; ensure clean, data-dense visuals with a professional tone.

Tech & Constraints
- Stack: Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, react-hook-form + zod, recharts, lucide-react icons.
- State: Client state light; use hooks/local state; keep API integration points as typed client calls.
- Testing: Vitest + React Testing Library; basic unit tests for forms and critical components (optional for generator).
- Accessibility: WCAG 2.1 AA; keyboard navigable; visible focus rings; color contrast OK.
- Performance: Stream-friendly UI; lazy-load heavy components; skeletons for loading.

Visual System
- Brand: Professional, trustworthy, crisp. Plenty of whitespace; clear hierarchy.
- Colors: Neutral gray scale with a primary blue accent (adjustable via CSS variables). Support dark mode.
- Typography: System UI or Inter. 14–16px base; scale up on desktop.
- Components: Use shadcn/ui primitives; compose for layout; use lucide-react for icons.

Pages & Routes (App Router)
- `/(auth)/signup` — Email + password form; link to login
- `/(auth)/login` — Email + password; link to signup; link to forgot password
- `/(auth)/forgot-password` — Email entry; shows confirmation message
- `/(auth)/reset-password` — New password + confirm, token is in query string
- `/dashboard` — Protected shell with:
  - Left sidebar: conversation list, new conversation button
  - Top bar: model selector (Instruct/Reasoning), account menu, usage meter
  - Main: chat thread with messages, citations area, composer with send button
- `/account` — Profile, email, auth methods, plan status, link to upgrade/manage
- `/billing` — Upgrade CTA, placeholder for Stripe flows (no keys required now)

Data Shapes (TypeScript)
- Conversation: `{ id: string; title: string; createdAt: string; updatedAt: string; }`
- Message: `{ id: string; role: 'user' | 'assistant'; content: string; createdAt: string; }`
- ChatState: `{ conversationId: string | null; messages: Message[]; loading: boolean; model: 'instruct' | 'reasoning'; }`
- Usage: `{ plan: 'free' | 'pro'; usedToday: number; dailyLimit: number; }`

API Contracts (frontend assumptions; mock now)
- Auth:
  - `POST /api/auth/register` body `{ email, password }` → 200
  - `POST /api/auth/login` body `{ email, password }` → 200 (+ cookie)
  - `POST /api/auth/forgot` body `{ email }` → 200
  - `POST /api/auth/reset` body `{ token, password }` → 200
- Chat:
  - `POST /api/ai/chat` body `{ messages: Message[], model: 'instruct'|'reasoning' }` → text/event-stream
- Usage:
  - `GET /api/usage` → `{ plan, usedToday, dailyLimit }`
- Billing:
  - `POST /api/billing/checkout` → `{ url }` (stub)

Detailed, Step-by-Step Instructions
1) Project Setup
   - Create a Next.js 14 App Router project (TypeScript, Tailwind configured).
   - Add shadcn/ui setup and utility classes for dark mode.
   - Install `react-hook-form`, `zod`, `@hookform/resolvers`, `recharts`, `lucide-react`.
2) Global Layout & Theme
   - Implement root layout with font, theme provider (dark/light), and toasts.
   - Add a responsive container; mobile-first styles; use CSS variables for colors.
3) Auth Screens
   - Signup page: email, password, zod validation, submit to `/api/auth/register` (mock).
   - Login page: email, password, zod validation, submit to `/api/auth/login` (mock).
   - Forgot password: email field; submit to `/api/auth/forgot`; show confirmation.
   - Reset password: read `token` from URL; new password + confirm; submit to `/api/auth/reset`.
   - Use shared form components and consistent error handling.
4) Protected Shell (`/dashboard`)
   - Implement an auth guard wrapper (for now, allow bypass flag via prop/env for preview builds).
   - Layout: left sidebar (collapsible on mobile), top bar with model selector, main content.
   - Sidebar: list items with title + timestamp; active state; “New conversation” button.
   - Top bar: model selector (segmented control), usage meter pill, account dropdown.
5) Chat Interface
   - Thread view: message bubbles (user right-aligned; assistant left), copy button, timestamps.
   - Citations panel below assistant messages (placeholder list of sources).
   - Composer: textarea with autosize, “Send” button; Enter to send, Shift+Enter newline.
   - Loading: skeleton for incoming assistant response; show streaming placeholder.
6) Usage Meter
   - Small component showing `{usedToday}/{dailyLimit}` with color thresholds; tooltip explaining free tier limits.
7) Account & Billing
   - Account page: show email, connected provider(s), plan status, link to `/billing`.
   - Billing page: upgrade CTA, explain benefits; button calls `POST /api/billing/checkout` (mock).
8) Charts (recharts)
   - Create a reusable `PriceChart` with mock time-series data; responsive container; dark mode friendly.
9) Forms & Validation
   - Use `react-hook-form` + `zod`. Provide reusable `FormField` wrappers, error display, and submit states.
10) Accessibility & Responsiveness
   - All components keyboard accessible; focus rings; aria labels where needed.
   - Mobile-first: sidebar collapses to drawer; top bar condenses; charts adapt to width.
11) Testing (optional if supported)
   - Add minimal tests for form validation and chat composer behavior with Vitest + RTL.

Code Examples & Constraints
- Chat state example:
  ```ts
  const [state, setState] = useState<ChatState>({ conversationId: null, messages: [], loading: false, model: 'instruct' });
  ```
- Message rendering key:
  ```tsx
  {state.messages.map(m => (<MessageBubble key={m.id} role={m.role} content={m.content} />))}
  ```
- Do not implement real API calls; create typed client functions that simulate the contract and return mock data or use fetch to endpoints that may not exist yet (behind feature flags).

Strict Scope
- Only generate frontend files. Do not create server code or modify backend.
- File structure suggestion (create if missing):
  - `app/(auth)/signup/page.tsx`
  - `app/(auth)/login/page.tsx`
  - `app/(auth)/forgot-password/page.tsx`
  - `app/(auth)/reset-password/page.tsx`
  - `app/dashboard/page.tsx` (or nested layout `app/(protected)/dashboard/page.tsx`)
  - `app/account/page.tsx`
  - `app/billing/page.tsx`
  - `components/chat/*` (Thread, MessageBubble, Composer, ModelSelector, UsageMeter, Sidebar)
  - `components/ui/*` (shadcn wrappers)
  - `components/charts/PriceChart.tsx`
  - `lib/validators.ts`, `lib/api.ts` (mock clients), `lib/types.ts`
  - `styles/globals.css`, Tailwind config
- Do not add CI files, env files, or server handlers.

Mobile-First Adaptation
- Start with a single-column layout; sidebar becomes slide-over drawer.
- Ensure tap targets large enough; sticky composer on mobile.
- Use `sm/md/lg` breakpoints to progressively enhance to desktop two-pane layout.

Review & Handoff
- Present a clean component tree, props, and any TODOs for backend wiring.
- Provide a short README explaining how to run the UI and where to insert API base URLs later.
- Note: All generated code is a starting point and will be reviewed and refined.

---

Notes for the Generator
- The UI must feel professional and data-forward, not playful.
- Prioritize clarity, trust, and legibility. Keep animations subtle.
- Keep forms simple; never store secrets client-side.

*** End of Prompt ***
