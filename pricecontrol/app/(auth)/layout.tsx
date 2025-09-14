import type React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">PriceControl</h1>
          <p className="text-sm text-muted-foreground mt-2">AI Finance Assistant</p>
        </div>
        {children}
      </div>
    </div>
  )
}
