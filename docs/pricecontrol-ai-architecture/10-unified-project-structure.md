# 10. Unified Project Structure
```plaintext
pricecontrol/
├── apps/
│   └── web/                    # The main Next.js application
│       ├── src/
│       │   ├── app/            # Next.js App Router layout and pages
│       │   ├── components/     # UI components (shadcn/ui)
│       │   ├── lib/            # Helper functions, utilities
│       │   └── server/         # Server-side logic, API routes, Drizzle schema
│       └── ...
├── packages/
│   └── shared/                 # Shared code between packages
│       └── src/
│           └── types/          # Shared TypeScript types and Zod schemas
├── prompts/                    # Directory for .mdx system prompts
│   └── base-system.mdx
├── .env.example                # Template for environment variables
├── datasources.yml             # The master source registry for the AI
├── package.json                # Root package.json for monorepo workspaces
└── tsconfig.json               # Root TypeScript configuration
```
---