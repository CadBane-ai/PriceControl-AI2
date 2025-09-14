# 7. Epic 2: Core LLM Interaction & Governance

**Expanded Epic Goal:** This epic brings the financial assistant to life. It covers building the chat UI, establishing a live, streaming connection to the self-hosted vLLM service, enabling model selection, and implementing the critical data governance layer. By the end of this epic, a logged-in user will be able to have a meaningful conversation and receive trustworthy, source-governed answers.

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
* **I want** to create a backend API route that streams data from the vLLM service,
* **so that** the frontend can receive and display the LLM's response.

**Acceptance Criteria:**
1.  A new API route is created at `/api/ai/route.ts`.
2.  The route is configured to receive a list of messages from the frontend.
3.  The route successfully connects to the self-hosted vLLM endpoint.
4.  The route streams the response from the vLLM back to the client.
5.  The frontend chat interface from Story 2.2 is connected to this endpoint and successfully displays the streamed response.

## Story 2.4: Implement Dual-Model Selection
* **As a** user,
* **I want** to be able to choose between a fast model and a more powerful reasoning model,
* **so that** I can use the right tool for the job.

**Acceptance Criteria:**
1.  A UI control (e.g., a toggle or dropdown) is added to the chat interface to select "Instruct" or "Thinking" mode.
2.  The user's selection is passed to the `/api/ai/route.ts` endpoint with each request.
3.  The backend API uses the `mode` parameter to call the correct model on the vLLM service.
4.  The chat interface visually indicates which model is currently active.

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
