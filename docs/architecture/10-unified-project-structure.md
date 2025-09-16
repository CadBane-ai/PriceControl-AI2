# 10. Unified Project Structure
```plaintext
pricecontrol/
├── apps/
│   └── web/                    # The main Next.js application
│       ├── app/                # Next.js App Router layout and pages
│       ├── components/         # UI components (shadcn/ui)
│       ├── lib/                # Helper functions, utilities
│       ├── db/                 # Drizzle schema and DB client
│       ├── drizzle/            # Drizzle migration artifacts
│       ├── hooks/              # Reusable React hooks
│       ├── public/             # Static assets
│       ├── styles/             # Global styles
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
