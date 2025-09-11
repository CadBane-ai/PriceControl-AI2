# 15. Coding Standards
## Critical Fullstack Rules
* **Type Safety:** All code must be strictly typed using TypeScript; avoid `any`.
* **Environment Variables:** Access environment variables only through the type-safe schema.
* **Data Access:** All database queries must go through the Drizzle ORM layer.
## Naming Conventions
| Element | Convention | Example |
| :--- | :--- | :--- |
| **Components (React)** | `PascalCase` | `UserProfile.tsx` |
| **Hooks (React)** | `camelCase` with `use` prefix | `useUserData.ts` |
| **Database Tables** | `snake_case` | `user_profiles` |
---