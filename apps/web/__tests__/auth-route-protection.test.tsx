import React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, render, waitFor } from "@testing-library/react"

import { AuthGuard } from "@/components/auth-guard"
import { middleware } from "../middleware"

const replaceMock = vi.fn()

let sessionStatus: "authenticated" | "unauthenticated" | "loading" = "authenticated"

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}))

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    status: sessionStatus,
  }),
}))

const getTokenMock = vi.fn()

vi.mock("next-auth/jwt", () => ({
  getToken: (...args: unknown[]) => getTokenMock(...args),
}))

vi.mock("next/server", () => ({
  NextResponse: {
    next: () => new Response(null, { status: 200 }),
    redirect: (input: URL | string) => {
      const location = input instanceof URL ? input.toString() : input
      const res = new Response(null, { status: 307 })
      res.headers.set("location", location)
      return res
    },
  },
}))

describe("AuthGuard", () => {
  beforeEach(() => {
    replaceMock.mockReset()
    sessionStatus = "authenticated"
  })

  afterEach(() => {
    cleanup()
    window.history.replaceState({}, "", "/")
  })

  it("redirects unauthenticated users to login with encoded next param", async () => {
    sessionStatus = "unauthenticated"
    window.history.pushState({}, "", "/dashboard/reports?tab=alerts")

    render(
      <AuthGuard>
        <div>Secret dashboard</div>
      </AuthGuard>,
    )

    await waitFor(() =>
      expect(replaceMock).toHaveBeenCalledWith("/login?next=%2Fdashboard%2Freports%3Ftab%3Dalerts"),
    )
  })

  it("renders children when session is authenticated", () => {
    sessionStatus = "authenticated"
    window.history.pushState({}, "", "/dashboard")

    const { getByText } = render(
      <AuthGuard>
        <div>Secret dashboard</div>
      </AuthGuard>,
    )

    expect(getByText("Secret dashboard")).toBeInTheDocument()
    expect(replaceMock).not.toHaveBeenCalled()
  })
})

describe("middleware", () => {
  beforeEach(() => {
    getTokenMock.mockReset()
  })

  it("redirects unauthenticated users and preserves original destination", async () => {
    getTokenMock.mockResolvedValue(null)

    const request = createMockRequest("https://example.com/dashboard/reports?tab=alerts")
    const response = await middleware(request)

    expect(response?.status).toBe(307)
    const redirectTarget = response?.headers.get("location")
    expect(redirectTarget).toBeTruthy()
    const nextValue = redirectTarget ? new URL(redirectTarget).searchParams.get("next") : null
    expect(nextValue).toBe("/dashboard/reports?tab=alerts")
  })

  it("continues request when session token is found", async () => {
    getTokenMock.mockResolvedValue({ sub: "123" })

    const request = createMockRequest("https://example.com/dashboard")
    const response = await middleware(request)

    expect(response?.status).toBe(200)
    expect(response?.headers.get("location")).toBeNull()
  })

  it("skips protection for non-protected routes", async () => {
    const request = createMockRequest("https://example.com/public")
    const response = await middleware(request)

    expect(response?.status).toBe(200)
    expect(getTokenMock).not.toHaveBeenCalled()
  })
})

function createMockRequest(url: string) {
  const parsed = new URL(url)
  return {
    nextUrl: {
      pathname: parsed.pathname,
      search: parsed.search,
    },
    url,
  }
}
