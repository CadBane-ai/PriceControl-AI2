import { describe, it, expect, vi, beforeEach } from "vitest"
import { buildCompletionsUrl } from "@/lib/openrouter"

const getServerSessionMock = vi.fn()

vi.mock("next-auth", () => ({ getServerSession: (...args: any[]) => getServerSessionMock(...args) }))
vi.mock("@/lib/auth", () => ({ authOptions: {} }))

describe("buildCompletionsUrl", () => {
  it("appends chat/completions when base is root endpoint", () => {
    expect(buildCompletionsUrl("https://openrouter.ai/api/v1")).toBe("https://openrouter.ai/api/v1/chat/completions")
  })

  it("does not double-append when path already includes chat/completions", () => {
    expect(buildCompletionsUrl("https://openrouter.ai/api/v1/chat/completions")).toBe(
      "https://openrouter.ai/api/v1/chat/completions",
    )
  })

  it("normalizes trailing slashes", () => {
    expect(buildCompletionsUrl("https://openrouter.ai/api/v1/"))
      .toBe("https://openrouter.ai/api/v1/chat/completions")
  })
})

describe("/api/ai route", () => {
  beforeEach(() => {
    vi.resetModules()
    getServerSessionMock.mockReset()
  })

  it("returns 401 when unauthenticated", async () => {
    getServerSessionMock.mockResolvedValue(null)
    const mod = await import("@/app/api/ai/route")
    const req = new Request("http://localhost/api/ai", { method: "POST", body: JSON.stringify({ messages: [] }) })
    const res = await mod.POST(req)
    expect(res.status).toBe(401)
  })

  it("streams a mock response when authenticated and no key configured", async () => {
    getServerSessionMock.mockResolvedValue({ user: { id: "u1" } })
    const mod = await import("@/app/api/ai/route")
    const req = new Request("http://localhost/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "Hi" }] }),
    })
    const res = await mod.POST(req)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text.toLowerCase()).toContain("mock streaming response")
  })
})
