# 7. Epic 2: Core LLM Interaction & Governance

**Expanded Epic Goal:** This epic brings the financial assistant to life. It covers building the chat UI, establishing a live, streaming connection to the Cerebras LLM service, enabling model selection, and implementing the critical data governance layer. By the end of this epic, a logged-in user will be able to have a meaningful conversation and receive trustworthy, source-governed answers.

Architecture Link: See `docs/architecture/19-model-management.md` for how available chat models are curated and exposed in the UI.

## Story 2.1: Basic Chat UI Scaffolding
* **As a** user,
* **I want** a clean and intuitive layout for the chat interface,
* **so that** I can easily view my conversation and type new queries.

**Acceptance Criteria:**
1.  The `/dashboard` page is replaced with a dedicated chat layout.
2.  The layout includes a main message display area that can scroll.
3.  The layout includes a text input field at the bottom of the screen for user queries.
4.  A "Send" button is present next to the input field.
5.  The UI is built with shadcn/ui and Tailwind CSS and is statically rendered (no functionality yet).

## Story 2.2: Implement Frontend Chat Logic
* **As a** user,
* **I want** my typed messages to appear in the chat history and see a loading indicator,
* **so that** I get immediate feedback that the system is processing my query.

**Acceptance Criteria:**
1.  The Vercel AI SDK is integrated into the frontend.
2.  When a user types a message and clicks "Send," their message is immediately added to the message display area.
3.  After sending a message, the input field is cleared and a loading indicator appears.
4.  The chat state (list of messages, loading status) is managed on the client side.
5.  This story does not yet make a call to a backend API.

## Story 2.3: Create Backend AI Chat Stream
* **As a** developer,
* **I want** to create a backend API route that streams data from the Cerebras LLM service via OpenRouter,
* **so that** the frontend can receive and display the LLM's response.

**Acceptance Criteria:**
1.  A new API route is created at `/api/ai/route.ts` (exposed as `/api/ai`).
2.  The route accepts a JSON body containing the chat message list plus optional `conversationId`, `mode`, and explicit `model` overrides.
3.  Requests require an authenticated NextAuth session; unauthenticated calls return `401 Unauthorized`.
4.  When `OPENROUTER_API_KEY` is present, the route connects to OpenRouter with the Cerebras provider and streams tokens back to the client; otherwise a mock streaming message is returned for local development.
5.  Streaming responses are surfaced to the client using Vercel's `useChat` hook, and the Story 2.2 chat UI renders the incremental tokens.

## Story 2.4: Implement Dual-Model Selection
* **As a** user,
* **I want** to be able to choose between a fast model and a more powerful reasoning model,
* **so that** I can use the right tool for the job.

**Acceptance Criteria:**
1.  The chat top bar exposes a model picker dropdown populated from the curated `OPENROUTER_MODEL_GROUPS` configuration, grouping models with labels, descriptions, and tooltips.
2.  The picker defaults to the instruct model defined in `OPENROUTER_MODELS` and clearly shows the currently selected option.
3.  Selecting a model updates local state and infers the high-level `mode` when the option specifies one, keeping the UI and request payload in sync.
4.  Every chat submission sends both `mode` and `model` fields to `/api/ai`, ensuring the backend streams from the chosen OpenRouter/Cerebras model.

## Story 2.5: Implement Data Source Registry & Governed `web.fetch` Tool
* **As a** developer,
* **I want** to create the data governance layer and a secure web-fetching tool,
* **so that** all LLM internet access is strictly controlled and transparent.

**Acceptance Criteria:**
1.  A `/datasources.yml` file is created and parsable by the backend.
2.  A server-side guard function (e.g., `isAllowedSource`) is implemented to check if a source ID is in the registry.
3.  An LLM tool named `web.fetch` is created.
4.  The `web.fetch` tool, before accessing any URL, MUST call the guard function to verify the source is on the allow-list.
5.  The tool successfully fetches content from an allowed source.
6.  The tool returns an error and does NOT fetch content from a disallowed source.

## Story 2.6: Integrate Tools with LLM and Provide Source Citations
* **As a** user,
* **I want** to see where the AI got its information from,
* **so that** I can trust and verify its answers.

**Acceptance Criteria:**
1.  The `web.fetch` tool is made available to the LLM in the `/api/ai/route.ts` endpoint.
2.  A system prompt is loaded from a `/prompts/*.mdx` file and used in the LLM call, instructing the AI to use its tools and cite sources.
3.  When asked a question that requires current data, the LLM correctly uses the `web.fetch` tool.
4.  The final response streamed to the user includes a clear citation of the source ID and/or URL that was used to generate the answer.

---

## Story 2.7: Create, Switch, and Rename Conversations
* As a user,
* I want to create new conversations and switch between them,
* so that I can keep different topics separated and return to them later.

Acceptance Criteria:
1. Authenticated routes exist at `GET /api/conversations` and `POST /api/conversations`; both require a valid NextAuth session and return 401 otherwise. Creating without a title defaults to "Untitled conversation".
2. Conversations are persisted with Drizzle using fields `id`, `userId`, `title`, `createdAt`, `updatedAt`, and responses sort by latest `updatedAt` to surface recent threads first.
3. The sidebar "New conversation" button calls the POST endpoint, prepends the returned conversation locally, navigates to `/dashboard?conversation={id}`, and fires a confirmation toast.
4. The sidebar renders the user's conversations with recency badges (Today/Yesterday/date) and highlights the entry matching the `conversation` query parameter.
5. Users can rename conversations via a dialog that calls `PATCH /api/conversations/{id}` with a trimmed title; success updates the local list and shows a toast, while blank titles are rejected with a validation error.
6. Security & errors: unauthorized requests receive 401, invalid rename payloads return 400, and unknown conversation IDs return 404.
7. Tests: unit/integration coverage ensures auth gating, creation/list ordering, rename success/error paths, plus a UI test covering new conversation creation, navigation, and rename feedback.

Notes:
- Message persistence is defined in the architecture and will be handled in subsequent stories (e.g., when hooking up the streaming response in Story 2.3 and beyond).
