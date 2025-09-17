"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { GoogleSignInButton } from "@/components/auth/google-signin-button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField } from "@/components/ui/form-field"
import { useToast } from "@/hooks/use-toast"
import { loginSchema, type LoginFormData } from "@/lib/validators"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [googleAvailable, setGoogleAvailable] = useState(true)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const callbackUrl = searchParams.get("next") ?? "/dashboard"
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl,
      })
      if (result?.ok) {
        toast({ title: "Welcome back!", description: "Signed in successfully." })
        router.push(result.url ?? callbackUrl)
      } else {
        const description = result?.error ? "Invalid email or password." : "Please try again."
        toast({ title: "Invalid credentials", description, variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Network error. Please try again.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetch("/api/auth/providers", { cache: "no-store" })
      .then((r) => r.json())
      .then((providers) => setGoogleAvailable(!!providers?.google))
      .catch(() => setGoogleAvailable(true))
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your PriceControl account</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Show OAuth error if present */}
        {(() => {
          const err = searchParams.get("error")
          if (!err) return null
          const msg = err === "OAuthSignin" || err === "OAuthCallback" ? "Google sign-in failed. Please try again." : "Sign-in error."
          return (
            <div className="mb-4 text-sm text-destructive">{msg}</div>
          )
        })()}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Email" error={errors.email?.message} required>
            <Input
              type="email"
              placeholder="Enter your email"
              {...register("email")}
              disabled={isLoading}
              autoComplete="email"
            />
          </FormField>

          <FormField label="Password" error={errors.password?.message} required>
            <Input
              type="password"
              placeholder="Enter your password"
              {...register("password")}
              disabled={isLoading}
              autoComplete="current-password"
            />
          </FormField>

          <Button type="button" className="w-full" disabled={isLoading} onClick={handleSubmit(onSubmit)}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in
          </Button>
        </form>

        <div className="mt-6 space-y-4">
          <div className="relative text-center">
            <span className="bg-background px-2 text-xs text-muted-foreground relative z-10">or continue with</span>
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t" />
          </div>
          <GoogleSignInButton
            className="w-full"
            label="Continue with Google"
            callbackUrl={searchParams.get("next") ?? "/dashboard"}
            variant="outline"
          />
          {!googleAvailable && (
            <div className="text-xs text-destructive text-center">
              Google sign-in is not available. Check GOOGLE_CLIENT_ID/SECRET and restart the server.
            </div>
          )}
          <div className="text-center">
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot your password?
            </Link>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
