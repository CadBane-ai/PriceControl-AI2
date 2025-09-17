"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { GoogleIcon } from "@/components/icons/google"

interface GoogleSignInButtonProps {
  label?: string
  callbackUrl?: string
  variant?: "default" | "outline" | "ghost" | "secondary"
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
}

export function GoogleSignInButton({
  label = "Continue with Google",
  callbackUrl = "/dashboard",
  variant = "outline",
  className,
  size,
}: GoogleSignInButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      size={size}
      onClick={() => {
        const abs = callbackUrl.startsWith("http")
          ? callbackUrl
          : `${window.location.origin}${callbackUrl.startsWith("/") ? "" : "/"}${callbackUrl}`
        signIn("google", { callbackUrl: abs })
      }}
      aria-label={label}
      title={label}
    >
      <GoogleIcon className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
}
