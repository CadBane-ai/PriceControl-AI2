# UI/UX Specification: PriceControl

## 1. Introduction

This document defines the user experience goals, information architecture, user flows, and visual design specifications for PriceControl's user interface. It reflects **PRD v4** (see `docs/prd`) and serves as the foundation for visual design and frontend development, ensuring a cohesive and user-centered experience.

### Overall UX Goals & Principles

* **Target User Personas:**
    * **Primary: The Professional/Prosumer Analyst:** Needs a data-dense, efficient, and transparent interface.
    * **Secondary: The Sophisticated Retail Investor:** Needs a clean, trustworthy, and easy-to-navigate experience.
* **Usability Goals:**
    * **Clarity:** Users must be able to understand data and its sources at a glance.
    * **Efficiency:** The interface should minimize clicks and allow for rapid querying and analysis.
    * **Trust:** The design must feel professional and secure, reinforcing the reliability of the data.
* **Design Principles:**
    * **Clarity over cleverness:** Prioritize clear communication over aesthetic innovation.
    * **Progressive disclosure:** Show only what's needed, when it's needed, to avoid overwhelming the user.
    * **Consistent patterns:** Use familiar UI patterns throughout the application to reduce cognitive load.
    * **Accessible by default:** Design for all users from the start, adhering to WCAG AA standards.

### Key Interaction Paradigms

* **Conversational Interface:** The primary interaction will be a text-based chat with the LLM.
* **Guided Prompting:** Offer users a set of pre-defined starter prompts (as buttons) to guide their discovery and demonstrate the LLM's capabilities, especially for new users.
* **Model Selection:** Users will have a clear and simple way to switch between "Instruct" and "Thinking" LLM variants curated via `OPENROUTER_MODEL_GROUPS`, with tooltips that clarify trade-offs.
* **Data Visualization:** Financial data (e.g., stock prices) will be presented in clear, interactive charts.
* **Source Transparency:** Users should be able to easily see which data source was used for a given response.
* **Usage Awareness & Upgrade Nudges:** Free-tier users see a live usage badge in the header, color-coded as they approach limits, with contextual upgrade CTAs per PRD Story 3.7.
* **Conversation Management:** Users can create, rename, and switch between conversations, with recency indicators that support rapid context switching.

---

## 2. Information Architecture (IA)

### Site Map / Screen Inventory
This diagram shows the primary screens of the application and how they relate to one another.

```mermaid
graph TD
    subgraph Unauthenticated Zone
        A[Landing Page] --> B[Sign Up Page];
        A --> C[Login Page];
        A --> D[Pricing Page];
        C --> H[Forgot Password];
        H --> I[Reset Password];
    end

    subgraph Authenticated Zone
        E[Main Chat / Dashboard] --> F[Account Settings];
        E --> G[Data Sources Directory];
        E --> J[Billing (Stripe Portal Entry)];
        E --> D;
        E --> K[Payment Success & Status Refresh];
    end

    C -- Login Success --> E;
    B -- Sign Up Success --> E;
    D --> L[Checkout Session Redirect];
    L --> K;
```

### Navigation Structure

* **Primary Navigation:** Once a user is logged in, the global header contains:
    * **Chat:** The primary dashboard interface.
    * **Data Sources:** The directory of approved sources.
    * **Pricing:** To view plans and upgrade.
    * **Usage Badge & Upgrade CTA:** Live usage meter (`usedToday/dailyLimit`) with threshold-based styling; an inline "Upgrade" button appears at ≥80% usage for free-tier users.
    * **Account Dropdown:** Links to "Settings", "Billing" (Stripe portal launch), theme toggle, and "Logout". On mobile, the dropdown also mirrors the usage badge to maintain discoverability.
* **Breadcrumb Strategy:** A breadcrumb strategy is likely unnecessary for the MVP's relatively flat architecture but can be considered post-MVP if more deeply nested pages are added.

---

## 3. User Flows

### User Onboarding (Sign Up)

* **User Goal:** A new user wants to create an account to access the application.
* **Entry Points:** From the Landing Page or Pricing Page, clicking a "Sign Up" or "Get Started" button.
* **Success Criteria:** The user successfully creates an account, is logged in, and is redirected to the Main Chat / Dashboard.

#### Flow Diagram
```mermaid
graph TD
    A[User lands on Homepage] --> B{Clicks 'Sign Up'};
    B --> C[Displays Sign Up Page];
    C --> D[User enters Email & Password];
    D --> E{Submits Form};
    E --> F[API validates input];
    F --> G{Is Email unique?};
    G -- Yes --> H[API creates user in DB];
    H --> I[API creates session];
    I --> J[Redirects to /dashboard];
    G -- No --> K[Displays 'Email already exists' error];
    K --> C;
```

#### Edge Cases & Error Handling:
* User provides an email in an invalid format.
* User provides a password that doesn't meet security requirements (e.g., too short).
* User's email already exists in the system.
* A network error occurs during form submission.

---

### User Authentication (Login)

* **User Goal:** An existing user wants to log in to access their account.
* **Entry Points:** From the Landing Page or Pricing Page, clicking a "Login" or "Sign In" button.
* **Success Criteria:** The user successfully authenticates, a session is created, and they are redirected to the Main Chat / Dashboard.

#### Flow Diagram
```mermaid
graph TD
    A[User lands on Homepage] --> B{Clicks 'Login'};
    B --> C[Displays Login Page];
    C --> D[User enters Email & Password];
    D --> E{Submits Form};
    E --> F[API validates input];
    F --> G{Are credentials valid?};
    G -- Yes --> H[API creates session];
    H --> I[Redirects to /dashboard];
    G -- No --> J[Displays 'Invalid email or password' error];
    J --> C;
```

#### Edge Cases & Error Handling:
* User enters the correct email but the wrong password.
* User enters an email address that is not registered.
* The login form should be protected against brute-force attacks (e.g., with rate-limiting).
* A network error occurs during form submission.
* **Note:** The error message should be generic ("Invalid email or password") to avoid confirming whether an email address is registered.

---

### Self-Service Password Recovery

* **User Goal:** A user who has lost access wants to request a reset link and establish a new password without contacting support.
* **Entry Points:** The "Forgot password" link on the Login page.
* **Success Criteria:** The user submits their email, receives confirmation that a reset link was sent, and successfully updates their password via the `/reset-password` flow.

#### Flow Diagram
```mermaid
sequenceDiagram
    participant User
    participant Forgot as Forgot Password Page
    participant API
    participant Email
    participant Reset as Reset Password Page

    User->>Forgot: Opens /forgot-password
    Forgot->>User: Displays email form + Google sign-in option
    User->>Forgot: Submits email
    Forgot->>API: POST /api/auth/password-reset-request
    API-->>Forgot: Success response
    Forgot->>User: Show inline confirmation & "Back to login"
    API->>Email: Send reset link with token
    User->>Reset: Opens link with token
    Reset->>API: Validate token (invalid => redirect w/ toast)
    User->>Reset: Submits new password + confirmation
    Reset->>API: POST /api/auth/reset-password
    API-->>Reset: Success
    Reset->>User: Redirect to /login with success toast
```

#### Edge Cases & Error Handling:
* Token missing or invalid → redirect back to `/forgot-password` with error toast.
* User enters unknown email → display success state (security best practice).
* Password and confirmation mismatch → inline error before submission.
* Backend failure → form shows retry guidance and preserves field input.

---

### Core Product Interaction (Ask a Question)

* **User Goal:** A logged-in user wants to ask the financial assistant a question and receive a trustworthy, sourced answer.
* **Entry Points:** The Main Chat / Dashboard, which is the default page after login.
* **Success Criteria:** The user receives a helpful, accurate, and streaming response to their query, which includes a citation to the approved data source that was used.

#### Flow Diagram
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API (/api/ai)
    participant LLM Service (vLLM)
    participant Governed Tool (e.g., web.fetch)

    User->>Frontend: Types and sends query
    Frontend->>API: POST /api/ai with messages
    API->>LLM Service: streamText(query, tools)
    LLM Service->>API: Decides to use tool
    API->>Governed Tool: execute(tool_parameters)
    Governed Tool-->>Governed Tool: Validate source against allow-list
    alt Source is Allowed
        Governed Tool->>Internet: Fetch data
        Internet-->>Governed Tool: Return data
        Governed Tool-->>API: Return formatted data
        API->>LLM Service: Provide tool output
        LLM Service->>API: Stream synthesized answer + citation
        API-->>Frontend: Stream response chunks
        Frontend-->>User: Display streaming answer & citation
    else Source is Not Allowed
        Governed Tool-->>API: Return error
        API->>LLM Service: Provide error output
        LLM Service->>API: Stream refusal message
        API-->>Frontend: Stream response chunks
        Frontend-->>User: Display message explaining source is not allowed
    end
```

#### Edge Cases & Error Handling:
* The external data source API is down or returns an error.
* The user's query is ambiguous and the LLM cannot determine which tool to use.
* The streaming connection is interrupted mid-response.
* The LLM provides an answer but fails to correctly cite the source.

---

### Subscription Upgrade

* **User Goal:** A free user wants to upgrade to a paid 'Pro' plan to unlock premium features or remove usage limits.
* **Entry Points:** From the `/pricing` page, or from an in-app prompt shown after hitting a usage limit.
* **Success Criteria:** The user successfully completes the payment via Stripe Checkout, their account status is updated to 'Pro' in the database, and they are redirected back to the application with premium access.

#### Flow Diagram
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Stripe

    User->>Frontend: Clicks 'Upgrade' button
    Frontend->>API: POST /api/stripe/create-checkout-session
    API->>Stripe: Create Checkout Session
    Stripe-->>API: Return session URL
    API-->>Frontend: Return session URL
    Frontend->>User: Redirect to Stripe Checkout

    User->>Stripe: Enters payment details & confirms
    Stripe-->>User: Redirects to app's /payment-success page

    Note right of API: Asynchronously
    Stripe->>API: POST /api/stripe/webhook with event
    API-->>API: Verify webhook signature
    API->>Database: Update user status to 'Pro'
    API-->>Stripe: Return 200 OK
```

#### Edge Cases & Error Handling:
* The user's payment is declined.
* The user abandons the checkout process and returns to the app.
* The Stripe webhook is delayed or fails. The system must have a way to reconcile the user's status.
* A network error occurs while creating the checkout session.

---

### Free Tier Usage Limit & Upgrade Prompt

* **User Goal:** A free user wants clarity on their remaining usage and guidance on upgrading when limits are reached.
* **Entry Points:** Global header usage badge (70%+, color-coded), upgrade CTA in header/sidebar, or API response when quota exhausted.
* **Success Criteria:** The user understands their remaining quota, optionally upgrades, or waits until quota resets without confusion.

#### Flow Diagram
```mermaid
sequenceDiagram
    participant User
    participant Header
    participant API
    participant Modal as Upgrade Modal/CTA

    Header->>API: GET /api/usage on mount
    API-->>Header: { usedToday, dailyLimit, plan }
    Header->>User: Render badge (default/secondary/destructive)
    alt Usage ≥ 80% & plan == free
        Header->>User: Display inline Upgrade button
        User->>Modal: Click Upgrade
        Modal->>API: POST /api/stripe/create-checkout-session
        API-->>Modal: Stripe URL
        Modal->>User: Redirect to Checkout
    else Usage < 80%
        Header->>User: Badge only, accessible tooltip explains limits
    end
    alt User exceeds limit during chat
        API-->>Header: 402-style error w/ upgrade hint
        Header->>User: Surface toast + inline message in chat composer
    end
```

#### Edge Cases & Error Handling:
* Usage fetch fails → badge hidden, console diagnostic retained.
* Stripe API issues → inline error toast with retry.
* Desktop vs mobile → upgrade CTA moves into account dropdown on small viewports.

---

### Conversation Management

* **User Goal:** A returning user wants to maintain organized threads, quickly switch contexts, and rename conversations.
* **Entry Points:** Left sidebar in the chat interface.
* **Success Criteria:** Users can see conversation recency badges, start new chats, rename threads, and navigate between them without losing context.

#### Flow Diagram
```mermaid
sequenceDiagram
    participant User
    participant Sidebar
    participant API

    Sidebar->>API: GET /api/conversations (on load)
    API-->>Sidebar: Sorted list w/ metadata
    Sidebar->>User: Render list w/ recency badges & active highlight
    User->>Sidebar: Click "New Conversation"
    Sidebar->>API: POST /api/conversations
    API-->>Sidebar: New conversation object
    Sidebar->>User: Prepend item, navigate to ?conversation={id}, toast success
    User->>Sidebar: Open rename dialog
    Sidebar->>API: PATCH /api/conversations/{id}
    API-->>Sidebar: Updated title
    Sidebar->>User: Update list, show toast
```

#### Edge Cases & Error Handling:
* Unauthorized API access → sign-in prompt reinforced.
* Rename validation failure (blank title) → inline error state.
* Large conversation list → virtualized scroll to maintain performance.

---

### Data Sources Directory

* **User Goal:** A user wants transparency into the approved data sources that inform responses.
* **Entry Points:** Primary navigation link "Data Sources" in authenticated experience.
* **Success Criteria:** Users can scan, filter, and understand each source's status, data freshness, and policy notes.

#### Content Structure
* **Intro Banner:** Reinforces governance model and links to `/datasources.yml` for transparency.
* **Filter Controls:** Search by ticker/keyword, filter by data type (e.g., equities, macro, news), and badge for "Recently Updated" sources.
* **Source Cards/Table Rows:** Display source name, category, description, update cadence, last verified date, governing terms (with external link), and availability status.
* **Compliance Notice:** Reminder that all crawling respects robots.txt and ToS (per NFR4).

#### Edge Cases & Error Handling:
* Registry fetch failure → show inline error state with retry, fall back to cached content when available.
* No sources match filter → friendly empty state with reset option.

---

## 4. Wireframes & Mockups

The primary design tool for creating high-fidelity mockups will be Figma. The initial layout and structure were conceptualized in the following text-based wireframe, which can be used to generate a prototype with an AI UI tool like Vercel's v0.

### Text-Based Wireframe: Main Chat Interface

* **Overall Layout:** A three-panel layout. A fixed left sidebar for chat history, a main content area for the current conversation, and a header.
* **Header:**
    * **Left:** The application name/logo ("PriceControl").
    * **Center:** The **Dual Model Selector**, rendering grouped options from `OPENROUTER_MODEL_GROUPS` with description tooltips.
    * **Right (Desktop):** Usage badge with tooltip (`Zap` icon + `usedToday/dailyLimit`), conditional "Upgrade" button (appears ≥80% usage for free plan), notification/toast area, and user avatar dropdown (Account, Billing, Theme toggle, Logout).
    * **Right (Mobile/Tablet):** Compact avatar button opens sheet containing usage badge, upgrade CTA, account links, and theme toggle.
* **Left Sidebar (Chat History):**
    * A scrollable, virtualized list of previous conversations.
    * Each item shows an auto-generated title plus a recency badge (Today/Yesterday/Date) and active-state highlight.
    * Hover or context menu reveals "Rename" and "Delete" actions (delete soft-deletes to archive view post-MVP).
    * A "New Conversation" button is fixed at the top, calling the POST endpoint and showing inline loading feedback.
* **Main Content (Conversation Area):**
    * **Message Display:** A scrollable area taking up most of the vertical space. User messages are aligned to the right, and AI responses are aligned to the left. AI responses that use a data source **must** include a small, clickable citation link (e.g., "") below the message.
    * **System & Error Messages:** Usage limit errors and tool failures surface as inline message blocks styled with warning/destructive variants, plus a persistent toast.
    * **Input Form:** Fixed at the bottom of the screen. It contains a multi-line text area, a "Send" button, a row of **Starter Prompt Buttons**, and a secondary action for uploading context (reserved for post-MVP but space allocated).
    * **Footer Hint:** Shows remaining free-tier requests when plan is `free` (mirrors usage badge data).

### Wireframe Notes: Pricing & Billing
* **Pricing Page:** Highlight Free vs Pro tiers, include feature comparison table, upgrade CTA that calls checkout session endpoint, testimonials placeholder, and compliance note about Stripe handling payments.
* **Payment Success State:** `/payment-success` page (or modal) thanks the user, confirms upgrade, and provides CTA to return to chat; automatically refreshes usage badge via `/api/usage`.
* **Billing Access:** Account dropdown "Billing" link opens Stripe Customer Portal in new tab; UI displays spinner while portal URL is fetched.

### Wireframe Notes: Authentication Suite
* **Forgot Password:** Shares layout with login (card with brand, short instructions, email field, CTA, Google sign-in button, link back to login).
* **Reset Password:** Dual password fields with strength meter, validation hints, and security notice about token expiry.
* **Auth Error Page:** Friendly error card mapping common NextAuth codes with contextual guidance and primary CTA back to login.

### Wireframe Notes: Data Sources Directory
* **Layout:** Page title, descriptive hero, filter row (search, data type dropdown, toggle for "Show inactive"), responsive grid of source cards on desktop, stacked list on mobile.
* **Card Content:** Source logo/initials avatar, metadata chips (Category, Frequency), description snippet, `Updated <relative time>`, and "View policy" link icon.
* **Empty States:** Illustrations or iconography pointing to governance docs when filters return zero results.

---

## 5. Component Library / Design System

### Design System Approach
We will use **shadcn/ui**, a composable component library built on Tailwind CSS and Radix UI primitives. This allows for rapid development of a consistent, accessible UI.

### Core Components
* **Button:** For all interactive actions (primary, secondary, link variants, destructive for quota alerts).
* **Textarea:** For the main chat input, configured to auto-resize.
* **Avatar & Dropdown Menu:** For user identity, settings, billing, theme toggle.
* **Toggle Group:** To handle model selection with grouped labels/tooltips.
* **Scroll Area:** For chat history and message display.
* **Badge & Tooltip:** To communicate usage thresholds, recency labels, and tooltips for model info.
* **Dialog/Sheet:** For conversation rename, mobile account menu, and potential upgrade modal.
* **Toast & Alert:** For system feedback (usage limit, Stripe errors, password reset confirmations).
* **Progress/Indicator:** For streaming response skeletons and loading states (e.g., fetching usage, creating sessions).

---

## 6. Branding & Style Guide

### Visual Identity
* **Brand Guidelines:** This document serves as the initial style guide. The direction is minimalist, professional, and optimized for data clarity in a dark-theme environment.

### Color Palette

| Color Type | Hex Code    | Usage                                     |
| :---       | :---        | :---                                      |
| Primary    | `#3b82f6`   | Interactive elements: buttons, links, focus rings |
| Secondary  | `#64748b`   | Secondary buttons, subtle borders         |
| Success    | `#22c55e`   | Positive feedback, confirmation messages  |
| Warning    | `#f59e0b`   | Cautions, important notices               |
| Error      | `#ef4444`   | Errors, destructive action confirmations  |
| Neutral    | `#09090b` to `#fafafa` | Text, borders, and tiered background colors (using the `zinc` palette) |

### Typography

* **Font Families:**
    * **Primary:** `Inter` (A clean, highly readable sans-serif font).
    * **Monospace:** `Fira Code` (For numerical data or code snippets).
* **Type Scale:** Standard scale from H1 (`2.25rem`, bold) to Body (`1rem`, regular) and Small (`0.875rem`, regular).

### Iconography
* **Icon Library:** We will use **`lucide-react`** for all icons, as it is the default for `shadcn/ui`.

### Spacing & Layout
* **Grid System:** The layout will be managed using Tailwind CSS's built-in responsive flexbox and grid utilities.
* **Spacing Scale:** All margins, padding, and gaps will use Tailwind's default 4px-based spacing scale for visual consistency.

---

## 7. Accessibility Requirements

### Compliance Target
* **Standard:** The application will target compliance with the **Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA**.

### Key Requirements
* **Visual:** All text must meet a 4.5:1 contrast ratio; all interactive elements must have a visible focus state.
* **Interaction:** All functionality must be operable via keyboard, and the application must be compatible with screen readers.
* **Content:** All images must have alt text, pages must use a logical heading structure, and form inputs must have labels.

### Testing Strategy
* A combination of automated testing with tools like `axe-core` and manual keyboard/screen reader testing for critical user flows.

---

## 8. Responsiveness Strategy

### Breakpoints
| Breakpoint | Min Width | Target Devices        |
| :---       | :---      | :---                  |
| Mobile     | 0px       | Phones                |
| Tablet     | 768px     | Tablets, small laptops|
| Desktop    | 1024px    | Laptops, desktops     |

### Adaptation Patterns
* **Mobile:** The left sidebar is hidden by default and accessible via a hamburger icon; usage badge and upgrade CTA live inside the account sheet.
* **Tablet:** The sidebar may render as an icon-only rail; header retains model selector while usage info collapses into dropdown.
* **Desktop:** The full three-panel layout is visible; badge + upgrade CTA remain in header.

---

## 9. Animation & Micro-interactions

### Motion Principles
* **Purposeful, Not Decorative:** Animations will be used to guide attention and provide feedback.
* **Subtle and Professional:** Motion will be quick and simple (fades/slides).
* **Accessible:** The system will respect the `prefers-reduced-motion` browser setting.

### Key Animations
* Smooth fade/slide transitions for UI elements like dropdowns.
* Subtle feedback on interactive elements for hover and click states.
* Skeleton loaders for content areas to manage perceived performance.
* Fluid fade-in for streaming AI responses.

---

## 10. Performance Considerations

### Performance Goals
* **Page Load:** Target a Largest Contentful Paint (LCP) of under 2.5 seconds.
* **Interaction Response:** Provide feedback in under 100ms.
* **Animation FPS:** Maintain a steady 60 frames per second (fps).

### Design Strategies
* Employ skeleton loaders, code splitting, and lazy loading.
* Optimize all assets and leverage Vercel's Edge Network for caching.
* Pre-warm data caches before peak market hours.

---

## 11. Next Steps

### Immediate Actions
1.  Review and approve this final UI/UX Specification document.
2.  Handoff this document and the PRD to the Architect (Winston) to begin creating the detailed Fullstack Architecture.
3.  Begin creating high-fidelity mockups in a design tool like Figma based on the wireframes and style guide defined in this document.

### Design Handoff Checklist
* [x] All user flows documented
* [x] Component inventory complete
* [x] Accessibility requirements defined
* [x] Responsive strategy clear
* [x] Brand guidelines incorporated
* [x] Performance goals established
