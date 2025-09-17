import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { GoogleSignInButton } from "@/components/auth/google-signin-button"

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  if (session) {
    redirect("/dashboard")
  }
  return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 text-center">
        <h1 className="text-2xl font-semibold">Welcome to PriceControl</h1>
        <p className="text-muted-foreground max-w-md">
          Your AI-powered finance assistant. Sign in to start analyzing markets and your portfolio.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/login">
            <Button>Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline">Create account</Button>
          </Link>
          <GoogleSignInButton />
        </div>
      </main>
  )
}
