"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField } from "@/components/ui/form-field"
import { useToast } from "@/hooks/use-toast"
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validators"
import { apiClient } from "@/lib/api"
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react"
import { GoogleSignInButton } from "@/components/auth/google-signin-button"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [googleAvailable, setGoogleAvailable] = useState<boolean | null>(null)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    try {
      await apiClient.forgotPassword(data.email)
      setIsSubmitted(true)
    } catch {
      toast({
        title: "Error",
        description: "Failed to send reset email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetch("/api/auth/providers", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((providers) => {
        if (!isMounted) return
        setGoogleAvailable(Boolean(providers?.google))
      })
      .catch(() => {
        if (!isMounted) return
        setGoogleAvailable(null)
      })
    return () => {
      isMounted = false
    }
  }, [])

  if (isSubmitted) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We've sent a password reset link to <strong>{getValues("email")}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <Button variant="outline" className="w-full bg-transparent" onClick={() => setIsSubmitted(false)}>
              Try again
            </Button>
            <div className="text-center">
              <Link href="/login" className="inline-flex items-center text-sm text-primary hover:underline">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to sign in
              </Link>
            </div>
            {googleAvailable && <GoogleSignInButton className="w-full" />}
            {googleAvailable === false && (
              <div className="text-xs text-destructive text-center">
                Google sign-in is not available. Check GOOGLE_CLIENT_ID/SECRET and restart the server.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>Enter your email address and we'll send you a link to reset your password</CardDescription>
      </CardHeader>
      <CardContent>
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

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send reset link
          </Button>
        </form>

        <div className="mt-6 text-center space-y-4">
          <Link href="/login" className="inline-flex items-center text-sm text-primary hover:underline">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to sign in
          </Link>
          <div>
            {googleAvailable && <GoogleSignInButton className="w-full" />}
            {googleAvailable === false && (
              <div className="text-xs text-destructive">
                Google sign-in is not available. Check GOOGLE_CLIENT_ID/SECRET and restart the server.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
