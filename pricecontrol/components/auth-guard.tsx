"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  allowBypass?: boolean // For preview builds
}

export function AuthGuard({ children, allowBypass = false }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Minimal client guard that relies on NextAuth middleware for redirects
    const check = async () => {
      try {
        // Ping a lightweight endpoint that requires auth; fall back to trusting middleware
        const res = await fetch("/api/usage", { method: "GET" })
        if (res.ok) setIsAuthenticated(true)
        else router.push("/login")
      } catch {
        if (!allowBypass) router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }
    check()
  }, [router, allowBypass])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  return <>{children}</>
}
