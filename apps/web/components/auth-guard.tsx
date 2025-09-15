"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"

interface AuthGuardProps {
  children: React.ReactNode
  allowBypass?: boolean // For preview builds
}

export function AuthGuard({ children, allowBypass = false }: AuthGuardProps) {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated" && !allowBypass) {
      router.push("/login")
    }
  }, [status, allowBypass, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  if (status === "unauthenticated" && !allowBypass) return null
  return <>{children}</>
}
