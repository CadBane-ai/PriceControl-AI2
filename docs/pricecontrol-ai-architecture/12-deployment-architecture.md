# 12. Deployment Architecture
## Deployment Strategy
* **Frontend & API Layer:** Deployed automatically by Vercel's Git-based workflow. Pushing to a branch creates a Preview URL; merging to `main` deploys to Production.
* **vLLM Service:** Deployed manually for the MVP on a dedicated GPU host.
## CI/CD Pipeline
The primary CI/CD is managed by Vercel, which automatically runs install, lint, test, and build steps on every push.
## Environments
| Environment | URL | Purpose |
| :--- | :--- | :--- |
| **Development** | `http://localhost:3000` | Local development and testing. |
| **Preview** | `pricecontrol-*.vercel.app` | Isolated deployments for each pull request. |
| **Production** | `(To be defined)` | The live application for users. |
---