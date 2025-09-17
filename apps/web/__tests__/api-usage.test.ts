import { describe, it, expect, vi, beforeEach } from "vitest"

const getServerSessionMock = vi.fn()
const getUsageSummaryMock = vi.fn()

vi.mock("next-auth", () => ({
  getServerSession: (...args: any[]) => getServerSessionMock(...args),
}))

vi.mock("@/lib/auth", () => ({ authOptions: {} }))

vi.mock("@/lib/usage", () => ({
  getPlanFromSession: (session: any) => (session?.user?.plan ?? "free"),
  getUsageSummary: (...args: any[]) => getUsageSummaryMock(...args),
}))

describe("GET /api/usage", () => {
  beforeEach(() => {
    vi.resetModules()
    getServerSessionMock.mockReset()
    getUsageSummaryMock.mockReset()
  })

  it("returns 401 when unauthenticated", async () => {
    getServerSessionMock.mockResolvedValue(null)
    const mod = await import("@/app/api/usage/route")
    const res = await mod.GET()
    expect(res.status).toBe(401)
  })

  it("returns usage summary for authenticated user", async () => {
    getServerSessionMock.mockResolvedValue({ user: { id: "user-1", plan: "free" } })
    getUsageSummaryMock.mockResolvedValue({ plan: "free", usedToday: 3, dailyLimit: 50 })
    const mod = await import("@/app/api/usage/route")
    const res = await mod.GET()
    expect(res.status).toBe(200)
    const payload: any = await res.json()
    expect(payload.usedToday).toBe(3)
    expect(payload.dailyLimit).toBe(50)
  })

  it("returns 503 when usage lookup fails", async () => {
    getServerSessionMock.mockResolvedValue({ user: { id: "user-1" } })
    getUsageSummaryMock.mockRejectedValue(new Error("redis down"))
    const mod = await import("@/app/api/usage/route")
    const res = await mod.GET()
    expect(res.status).toBe(503)
  })
})
