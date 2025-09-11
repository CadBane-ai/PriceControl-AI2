# 14. Testing Strategy
## Testing Pyramid
Our strategy is based on the Testing Pyramid, with a large base of unit tests, a smaller layer of integration tests, and a few end-to-end tests for critical flows.
## Test Organization
* **Frontend:** Unit/component tests co-located with components, using Vitest and React Testing Library.
* **Backend:** Unit tests co-located with services; integration tests in a dedicated `__tests__` directory.
* **E2E:** A top-level `e2e/` directory using Playwright.
---