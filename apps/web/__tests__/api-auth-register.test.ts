import { beforeEach, describe, expect, it, vi } from "vitest"

const hashMock = vi.fn<[string, number], Promise<string>>()

type Row = Record<string, unknown>

type DbState = {
  existingRows: Row[]
  returningRows: Row[]
  insertedValues?: Row
  selectCalls: number
  insertCalls: number
  lastLimitArg?: number
}

const dbState: DbState = {
  existingRows: [],
  returningRows: [],
  insertedValues: undefined,
  selectCalls: 0,
  insertCalls: 0,
  lastLimitArg: undefined,
}

vi.mock("bcryptjs", () => ({
  __esModule: true,
  default: { hash: hashMock },
  hash: hashMock,
}))

vi.mock("@/db/schema/users", () => ({
  users: {
    id: Symbol("users.id"),
    email: Symbol("users.email"),
    passwordHash: Symbol("users.passwordHash"),
  },
}))

vi.mock("@/db/client", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: (arg: number) => {
            dbState.lastLimitArg = arg
            dbState.selectCalls += 1
            return Promise.resolve(dbState.existingRows)
          },
        }),
      }),
    }),
    insert: () => ({
      values: (values: Row) => {
        dbState.insertCalls += 1
        dbState.insertedValues = values
        return {
          returning: () => Promise.resolve(dbState.returningRows),
        }
      },
    }),
  },
}))

function makeRequest(payload: unknown) {
  return new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

beforeEach(() => {
  vi.resetModules()
  hashMock.mockReset()
  dbState.existingRows = []
  dbState.returningRows = []
  dbState.insertedValues = undefined
  dbState.selectCalls = 0
  dbState.insertCalls = 0
  dbState.lastLimitArg = undefined
})

describe("/api/auth/register", () => {
  it("creates a new user and returns 201", async () => {
    dbState.returningRows = [{ id: "user-1", email: "test@example.com" }]
    hashMock.mockResolvedValue("hashed-password")

    const mod = await import("@/app/api/auth/register/route")
    const res = await mod.POST(makeRequest({ email: "Test@Example.com", password: "password123" }))

    expect(res.status).toBe(201)
    expect(hashMock).toHaveBeenCalledWith("password123", 10)
    expect(dbState.insertCalls).toBe(1)
    expect(dbState.insertedValues).toEqual({
      email: "test@example.com",
      passwordHash: "hashed-password",
    })
    expect(dbState.lastLimitArg).toBe(1)

    const body: any = await res.json()
    expect(body.user).toEqual({ id: "user-1", email: "test@example.com" })
  })

  it("returns 409 when the user already exists", async () => {
    dbState.existingRows = [{ id: "user-1" }]
    hashMock.mockResolvedValue("hashed-password")

    const mod = await import("@/app/api/auth/register/route")
    const res = await mod.POST(makeRequest({ email: "dup@example.com", password: "password123" }))

    expect(res.status).toBe(409)
    expect(dbState.insertCalls).toBe(0)
    expect(hashMock).not.toHaveBeenCalled()
    const body: any = await res.json()
    expect(body.error).toBe("User already exists")
  })

  it("returns 400 for invalid payload", async () => {
    const mod = await import("@/app/api/auth/register/route")
    const res = await mod.POST(makeRequest({ email: "invalid", password: "short" }))

    expect(res.status).toBe(400)
    expect(dbState.selectCalls).toBe(0)
    expect(dbState.insertCalls).toBe(0)
    const body: any = await res.json()
    expect(body.error).toBe("Invalid request")
    expect(body.details).toBeDefined()
  })

  it("rejects GET requests with 405", async () => {
    const mod = await import("@/app/api/auth/register/route")
    const res = await mod.GET()
    expect(res.status).toBe(405)
    const body: any = await res.json()
    expect(body.error).toBe("Method Not Allowed")
  })
})
