import type React from "react"
import { AuthGuard } from "@/components/auth-guard"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthGuard allowBypass={true}>{children}</AuthGuard>
}
