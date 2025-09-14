"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField } from "@/components/ui/form-field"
import { useToast } from "@/hooks/use-toast"
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validators"
import { apiClient } from "@/lib/api"
import { Loader2, ArrowLeft } from "lucide-react"

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (!tokenParam) {
      toast({
        title: "Invalid reset link",
        description: "This password reset link is invalid or has expired.",
        variant: "destructive",
      })
      router.push("/forgot-password")
    } else {
      setToken(tokenParam)
    }
  }, [searchParams, router, toast])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return

    setIsLoading(true)
    try {
      await apiClient.resetPassword(token, data.password)
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      })
      router.push("/login")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return null // Will redirect in useEffect
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set new password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="New password" error={errors.password?.message} required>
            <Input
              type="password"
              placeholder="Enter new password"
              {...register("password")}
              disabled={isLoading}
              autoComplete="new-password"
            />
          </FormField>

          <FormField label="Confirm password" error={errors.confirmPassword?.message} required>
            <Input
              type="password"
              placeholder="Confirm new password"
              {...register("confirmPassword")}
              disabled={isLoading}
              autoComplete="new-password"
            />
          </FormField>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update password
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="inline-flex items-center text-sm text-primary hover:underline">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
