## 19. Model Management (OpenRouter / Cerebras)

This document explains how chat models are exposed to users and how to update them.

### Where to edit

- Frontend model configuration lives in `apps/web/lib/models.ts`.
- Server uses the selected `model` (OpenRouter ID) in `apps/web/app/api/ai/route.ts`.

### Concepts

- ModelOption: `{ id, label, description?, tooltip?, mode? }`
  - `id`: OpenRouter model string (e.g., `meta-llama/llama-3.3-70b-instruct`).
  - `label`: Shown in the UI picker.
  - `description`: Smaller text beneath the label.
  - `tooltip`: Hover info icon text.
  - `mode`: Optional hint (`instruct` | `reasoning`) used to infer UI mode.
- ModelGroup: `{ key, label, options: ModelOption[] }`
  - Groups shown in the dropdown (e.g., “Cerebras (OpenRouter)”).

### How the picker works

- `OPENROUTER_MODEL_GROUPS`: array of ModelGroup objects that power the dropdown.
- `OPENROUTER_MODELS`: defaults for the two high-level modes.
- `resolveModelForMode(mode)`: returns a default `id` for the chosen mode.
- `findOptionById(id)`: locates a model option and its `mode` from an ID.

### Changing models

1. Add or edit entries inside `OPENROUTER_MODEL_GROUPS` in `apps/web/lib/models.ts`.
2. Optionally update `OPENROUTER_MODELS` if you change which model is the default for a mode (defaults currently point to Llama 3.3 8B for `instruct` and Llama 3.3 70B for `reasoning`).
3. No UI changes are required—the dropdown and backend will reflect new options.

### Backend behavior

- `/api/ai` accepts `model` (string) and `mode` (optional) in the request body.
- If `model` is omitted, the server uses `resolveModelForMode(mode)`.
- The server calls OpenRouter with `provider: { only: ["Cerebras"] }` to keep Cerebras as the execution provider.

### Environment

- `OPENROUTER_API_KEY` is required for live calls. Without it, the API streams a mock response for local dev.
- `OPENROUTER_BASE_URL` defaults to `https://openrouter.ai/api/v1`; we normalize trailing slashes and append `/chat/completions` if the path is omitted so both root and full-endpoint URLs work.
- Optional attribution headers:
  - `OPENROUTER_SITE_URL` → set to your app/site URL
  - `OPENROUTER_APP_NAME` → displayed by OpenRouter

### Current Cerebras lineup (OpenRouter production)

- `meta-llama/llama-3.3-8b-instruct`
- `meta-llama/llama-3.1-8b-instruct`
- `meta-llama/llama-3.3-70b-instruct`
- `meta-llama/llama-3.1-70b-instruct`
- `meta-llama/llama-3.1-405b-instruct`

### Future: Direct Cerebras

- The server route is structured so you can later replace the OpenRouter call with direct Cerebras SDK usage without changing the client.
