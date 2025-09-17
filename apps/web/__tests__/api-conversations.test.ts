import { describe, it, expect, vi, beforeEach } from "vitest"

const getServerSessionMock = vi.fn()

vi.mock("next-auth", () => ({
  getServerSession: (...args: any[]) => getServerSessionMock(...args),
}))

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}))

type Row = { id: string; userId?: string; title?: string; createdAt?: string; updatedAt?: string }

function makeDb(rows: Row[] = [], created?: Row, updated?: Row) {
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          orderBy: () => Promise.resolve(rows),
        }),
      }),
    }),
    insert: () => ({
      values: () => ({
        returning: () => Promise.resolve(created ? [created] : []),
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => ({ returning: () => Promise.resolve(updated ? [updated] : []) }),
      }),
    }),
  }
}

vi.mock("@/db/client", () => ({
  db: makeDb(),
}))

describe("/api/conversations", () => {
  beforeEach(() => {
    vi.resetModules()
    getServerSessionMock.mockReset()
  })

  it("GET returns 401 when unauthenticated", async () => {
    getServerSessionMock.mockResolvedValue(null)
    const mod = await import("@/app/api/conversations/route")
    const res = await mod.GET()
    expect(res.status).toBe(401)
  })

  it("GET returns 200 with conversations for authenticated user", async () => {
    const rows: Row[] = [
      { id: "c1", userId: "u1", title: "Chat 1", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ]
    vi.doMock("@/db/client", () => ({ db: makeDb(rows) }))
    getServerSessionMock.mockResolvedValue({ user: { id: "123e4567-e89b-12d3-a456-426614174000" } })
    const mod = await import("@/app/api/conversations/route")
    const res = await mod.GET()
    expect(res.status).toBe(200)
    const json: any = await res.json()
    expect(Array.isArray(json.conversations)).toBe(true)
    expect(json.conversations[0].id).toBe("c1")
  })

  it("POST returns 401 when unauthenticated", async () => {
    getServerSessionMock.mockResolvedValue(null)
    const mod = await import("@/app/api/conversations/route")
    const req = new Request("http://localhost/api/conversations", { method: "POST", body: JSON.stringify({ title: "New" }) })
    const res = await mod.POST(req)
    expect(res.status).toBe(401)
  })

  it("POST creates a conversation for authenticated user", async () => {
    const created: Row = { id: "c2", userId: "u1", title: "Untitled conversation", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    vi.doMock("@/db/client", () => ({ db: makeDb([], created) }))
    getServerSessionMock.mockResolvedValue({ user: { id: "123e4567-e89b-12d3-a456-426614174000" } })
    const mod = await import("@/app/api/conversations/route")
    const req = new Request("http://localhost/api/conversations", { method: "POST", body: JSON.stringify({}) })
    const res = await mod.POST(req)
    expect(res.status).toBe(201)
    const json: any = await res.json()
    expect(json.conversation.id).toBe("c2")
  })

  it("PATCH renames a conversation for authenticated user", async () => {
    const upd: Row = { id: "c2", userId: "u1", title: "Renamed", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    vi.doMock("@/db/client", () => ({ db: makeDb([], undefined, upd) }))
    getServerSessionMock.mockResolvedValue({ user: { id: "123e4567-e89b-12d3-a456-426614174000" } })
    const mod = await import("@/app/api/conversations/[id]/route")
    const req = new Request("http://localhost/api/conversations/c2", { method: "PATCH", body: JSON.stringify({ title: "Renamed" }) })
    const res = await mod.PATCH(req, { params: { id: "c2" } })
    expect(res.status).toBe(200)
    const json: any = await res.json()
    expect(json.conversation.title).toBe("Renamed")
  })
})
