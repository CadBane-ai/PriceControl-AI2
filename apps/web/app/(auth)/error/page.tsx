import Link from "next/link"
import { Button } from "@/components/ui/button"

function errorMessage(code?: string | null) {
  switch (code) {
    case "OAuthSignin":
    case "OAuthCallback":
    case "OAuthAccountNotLinked":
      return "Google sign-in failed. Please try again or use a different method."
    case "AccessDenied":
      return "Access denied. Please check your permissions."
    case "Configuration":
      return "Authentication is not configured correctly. Please contact support."
    default:
      return "An authentication error occurred. Please try again."
  }
}

export default function AuthErrorPage({ searchParams }: { searchParams: { error?: string } }) {
  const msg = errorMessage(searchParams?.error)
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-xl font-semibold">Sign-in Error</h1>
        <p className="text-sm text-muted-foreground">{msg}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login">
            <Button>Back to Sign in</Button>
          </Link>
          <Link href="/api/auth/signin/google">
            <Button variant="outline" aria-label="Continue with Google" title="Continue with Google">
              Try Google again
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

