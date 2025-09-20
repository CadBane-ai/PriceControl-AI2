# PriceControl - AI Finance Assistant

A professional AI-driven finance assistant built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Authentication System**: Complete signup, login, forgot password, and reset password flows
- **Protected Dashboard**: Responsive layout with sidebar navigation and top bar
- **AI Chat Interface**: Real-time chat with streaming responses and citations
- **Usage Tracking**: Daily usage limits with visual progress indicators
- **Analytics Dashboard**: Key metrics, charts, and usage patterns
- **Account Management**: Profile settings and subscription management
- **Billing System**: Upgrade flows and pricing plans
- **Mobile Responsive**: Optimized for all device sizes
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Forms**: react-hook-form + zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **Theme**: Dark/light mode support

## Getting Started

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Run the development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

\`\`\`
app/
├── (auth)/                 # Authentication pages
│   ├── login/
│   ├── signup/
│   ├── forgot-password/
│   └── reset-password/
├── (protected)/           # Protected routes
│   ├── dashboard/         # Main dashboard
│   ├── account/          # Account settings
│   └── billing/          # Billing and subscriptions
components/
├── auth-guard.tsx        # Route protection
├── chat/                 # Chat interface components
├── charts/               # Chart components
├── dashboard/            # Dashboard components
└── ui/                   # shadcn/ui components
lib/
├── api.ts               # API client (mock)
├── types.ts             # TypeScript types
├── validators.ts        # Zod schemas
└── utils.ts             # Utility functions
\`\`\`

## Key Components

### Authentication
- Form validation with zod schemas
- Loading states and error handling
- Responsive design with consistent styling

### Dashboard
- Collapsible sidebar with conversation list
- Model picker with grouped models, descriptions, and tooltips
- Usage meter with upgrade prompts
- Analytics overview with charts

### Chat Interface
- Message bubbles with timestamps
- Streaming response support
- Citations panel for sources
- Auto-resizing message composer

### Mobile Responsiveness
- Touch-friendly interface
- Responsive grid layouts
- Mobile-optimized navigation
- Safe area support for iOS devices

## API Integration

The application uses a mock API client (`lib/api.ts`) that simulates real backend calls. To integrate with a real backend:

1. Replace mock functions in `ApiClient` class
2. Update environment variables for API endpoints
3. Implement proper authentication token handling
4. Add error handling for network requests

### Authentication API Routes
- `POST /api/auth/register` accepts `{ "email": string, "password": string }` and returns `201` with `{ user: { id, email } }` when a new account is created.
- Returns `409` when the email already exists and `400` for invalid payloads.
- Passwords are hashed with `bcryptjs` before being stored in the database.

## Environment Variables

Use a local dotenv file. Copy `.env.example` to `.env.local` and fill values. Next.js automatically loads `.env.local` in development.

Required for current features:

```env
# Database (Neon Postgres example – include sslmode=require)
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require

# NextAuth
NEXTAUTH_SECRET=your-strong-secret
NEXTAUTH_URL=http://localhost:3000
```

Optional feature toggles:

```env
# Add your API base URL
NEXT_PUBLIC_API_URL=your-api-url

# LLM via OpenRouter (enable to replace the mock stream)
# Get your key from https://openrouter.ai/keys
OPENROUTER_API_KEY=your-openrouter-key

# Optional OpenRouter overrides
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_APP_NAME=PriceControl

# Google OAuth provider for NextAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Future: direct Cerebras (keep commented until needed)
# CEREBRAS_API_KEY=
# CEREBRAS_BASE_URL=

# Billing (planned)
STRIPE_SECRET_KEY=your-stripe-key
```

> Tip: When `OPENROUTER_API_KEY` is not set the `/api/ai` route returns a mock stream, which keeps local development unblocked. Setting the Google credentials automatically surfaces the Google sign-in button on the login screen.

## Deployment

The application is ready for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

## Accessibility Features

- Keyboard navigation support
- Screen reader compatibility
- High contrast color schemes
- Focus indicators
- ARIA labels and roles
- Semantic HTML structure

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This project is created for demonstration purposes.

## Model Management (Developers)

The chat model picker (similar to ChatGPT) is driven by a simple configuration file so you can add, group, and describe models without touching UI code.

- Edit `apps/web/lib/models.ts`:
  - `OPENROUTER_MODEL_GROUPS`: groups and model options shown in the dropdown. Each option supports:
    - `id`: OpenRouter model ID (e.g., `meta-llama/llama-3.3-70b-instruct`)
    - `label`: display text
    - `description`: small subtitle
    - `tooltip`: hover text for an info icon
    - `mode`: optional (`instruct` | `reasoning`) hint used to infer the UI mode
  - `OPENROUTER_MODELS`: default models for the two top-level modes (used for initial selection/fallbacks)
  - `resolveModelForMode(mode)`: returns a default model ID if `model` is not explicitly provided
  - `findOptionById(id)`: helps infer `mode` from a selected `model`

The default configuration includes the full Cerebras production lineup exposed via OpenRouter:

- Llama 3.3 8B Instruct — fast, low-cost default (`meta-llama/llama-3.3-8b-instruct`)
- Llama 3.1 8B Instruct — compatibility fallback for 3.1-era flows (`meta-llama/llama-3.1-8b-instruct`)
- Llama 3.3 70B Instruct — flagship reasoning model (`meta-llama/llama-3.3-70b-instruct`)
- Llama 3.1 70B Instruct — battle-tested 70B fallback (`meta-llama/llama-3.1-70b-instruct`)
- Llama 3.1 405B Instruct — highest quality option for deep analysis (`meta-llama/llama-3.1-405b-instruct`)

The server route `/api/ai` accepts `model` and `mode` in the request body. If `model` is omitted, it falls back to `resolveModelForMode(mode)`. We use OpenRouter with `provider.only = ["Cerebras"]` by default. You can later replace the OpenRouter call with direct Cerebras SDK calls without changing the client contract.

See also: `docs/architecture/19-model-management.md` for a short overview.
