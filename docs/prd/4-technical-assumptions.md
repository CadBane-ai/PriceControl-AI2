# 4. Technical Assumptions

## Repository Structure: Monorepo
* A monorepo is assumed, containing the Next.js frontend, API routes, shared libraries, and prompt configurations in a single Git repository. This approach is ideal for full-stack TypeScript projects as it simplifies type sharing and dependency management.

## Service Architecture: Serverless
* The architecture will be serverless, utilizing Next.js Route Handlers (running on Vercel Functions) for the API and backend logic. This backend will communicate with the Cerebras LLM service, Neon database, and other cloud services.

## Testing Requirements: Full Testing Pyramid
* A comprehensive testing strategy is assumed, including unit tests for individual components, integration tests for services, and end-to-end tests for critical user flows. This ensures a high-quality, reliable product.

## Additional Technical Assumptions and Requests
* **Frontend Framework:** Next.js with App Router will be used.
* **Styling:** Tailwind CSS with shadcn/ui components is the chosen styling solution.
* **Database & ORM:** The primary database will be Neon Serverless Postgres, with Drizzle used as the ORM.
* **LLM Runtime:** The Qwen3-30B-A3B model will be served via Cerebras API.
* **Deployment Platform:** The application will be deployed and hosted on Vercel.
* **Caching & Rate Limiting:** Upstash Redis will be used for caching and to enforce rate limits on the API.

---
