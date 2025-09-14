# 7. External APIs

## vLLM Service API (for Qwen3)
* **Purpose:** To provide the core AI text generation capabilities for the application.
* **Documentation:** This is an OpenAI-compatible API served by our self-hosted vLLM instance. It will adhere to the standard OpenAI Chat Completions API format.
* **Base URL(s):** To be defined in the `VLLM_BASE_URL` environment variable, pointing to our privately hosted GPU server.
* **Authentication:** A static API key, stored in the `VLLM_API_KEY` environment variable, will be used to secure the endpoint from public access.
* **Key Endpoints Used:**
    * `POST /v1/chat/completions` - The standard endpoint for generating streaming chat responses.

## Stripe API
* **Purpose:** To handle all payment processing, including creating subscription checkouts and managing customer billing information.
* **Documentation:** [https://stripe.com/docs/api](https://stripe.com/docs/api)
* **Base URL(s):** `https://api.stripe.com`
* **Authentication:** All requests must be authenticated using a secret API key, stored securely in the `STRIPE_SECRET_KEY` environment variable.
* **Key Endpoints Used:**
    * `POST /v1/checkout/sessions` - To create a new checkout session for a user to subscribe.
    * `POST /v1/billing_portal/sessions` - To create a session for the customer portal.

## Financial Data APIs (Governed by Source Registry)
* **Purpose:** To provide the raw financial, economic, and political data required by the LLM to answer user queries. This is a collection of diverse external sources.
* **Documentation:** Each data source is documented in the `/datasources.yml` file, which includes its base URL and terms of use.
* **Integration Notes:** The core integration pattern is **governed access**. All calls to these external APIs **must** pass through the `LLM Gateway Service` and be validated against the `/datasources.yml` allow-list.

---
