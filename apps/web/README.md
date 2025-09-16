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
- Model selector (Instruct/Reasoning)
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

Optional future integrations:

```env
# Add your API base URL
NEXT_PUBLIC_API_URL=your-api-url

# LLM / Billing (planned)
OPENAI_API_KEY=your-openai-key
STRIPE_SECRET_KEY=your-stripe-key
```

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
