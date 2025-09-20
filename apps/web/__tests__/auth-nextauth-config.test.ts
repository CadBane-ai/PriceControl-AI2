import { describe, expect, it, vi, afterEach } from "vitest"

const ORIGINAL_ENV = { ...process.env }

vi.mock("next-auth", () => ({
  __esModule: true,
  default: vi.fn(() => ({})),
}))

vi.mock("next-auth/providers/credentials", () => ({
  __esModule: true,
  default: (config: any) => ({ id: "credentials", type: "credentials", ...config }),
}))

vi.mock("next-auth/providers/google", () => ({
  __esModule: true,
  default: (config: any) => ({ id: "google", type: "oauth", ...config }),
}))

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
  vi.resetModules()
  vi.clearAllMocks()
})

function mockDb(rows: Array<{ id: string; email: string; passwordHash: string; sessionVersion?: number }> = []) {
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve(rows),
        }),
      }),
    }),
    insert: () => ({
      values: () => ({
        returning: () => Promise.resolve([{ id: "generated-id", sessionVersion: 1 }]),
      }),
    }),
  }
}

async function loadAuthModule(options?: {
  rows?: Array<{ id: string; email: string; passwordHash: string }>
  compareResult?: boolean
  googleEnabled?: boolean
}) {
  const { rows = [], compareResult = true, googleEnabled = false } = options ?? {}

  if (googleEnabled) {
    process.env.GOOGLE_CLIENT_ID = "client"
    process.env.GOOGLE_CLIENT_SECRET = "secret"
  } else {
    delete process.env.GOOGLE_CLIENT_ID
    delete process.env.GOOGLE_CLIENT_SECRET
  }

  vi.resetModules()

  const compareMock = vi.fn().mockResolvedValue(compareResult)

  vi.doMock("bcryptjs", () => ({
    __esModule: true,
    default: { compare: compareMock },
    compare: compareMock,
  }))

  vi.doMock("@/db/client", () => ({
    db: mockDb(rows),
  }))

  vi.doMock("@/db/schema/users", () => ({
    users: {
      id: Symbol("users.id"),
      email: Symbol("users.email"),
      passwordHash: Symbol("users.passwordHash"),
      sessionVersion: Symbol("users.sessionVersion"),
    },
  }))

  const module = await import("@/lib/auth")
  return { module, compareMock }
}

describe("authOptions", () => {
  it("authorizes credentials when email and password match", async () => {
    const { module, compareMock } = await loadAuthModule({
      rows: [{ id: "user-1", email: "test@example.com", passwordHash: "hashed", sessionVersion: 1 }],
      compareResult: true,
    })

    const credentials = module.authOptions.providers?.find((provider: any) => provider.id === "credentials")
    expect(credentials).toBeDefined()

    const user = await credentials!.authorize?.({ email: "Test@Example.com", password: "secret" }, undefined)
    expect(compareMock).toHaveBeenCalledWith("secret", "hashed")
    expect(user).toEqual({ id: "user-1", email: "test@example.com", sessionVersion: 1 })
  })

  it("returns null when password comparison fails", async () => {
    const { module } = await loadAuthModule({
      rows: [{ id: "user-1", email: "test@example.com", passwordHash: "hashed" }],
      compareResult: false,
    })

    const credentials = module.authOptions.providers?.find((provider: any) => provider.id === "credentials")
    expect(credentials).toBeDefined()

    const result = await credentials!.authorize?.({ email: "test@example.com", password: "secret" }, undefined)
    expect(result).toBeNull()
  })

  it("includes Google provider only when env credentials are set", async () => {
    const first = await loadAuthModule({ googleEnabled: false })
    const providerIdsWithoutGoogle = first.module.authOptions.providers?.map((provider: any) => provider.id) ?? []
    expect(providerIdsWithoutGoogle).not.toContain("google")

    const second = await loadAuthModule({ googleEnabled: true })
    const providerIdsWithGoogle = second.module.authOptions.providers?.map((provider: any) => provider.id) ?? []
    expect(providerIdsWithGoogle).toContain("google")
  })

  it("adds user id and email to the session payload", async () => {
    const { module } = await loadAuthModule()
    const session = await module.authOptions.callbacks?.session?.({
      session: { user: {} },
      token: { sub: "user-1", email: "test@example.com" } as any,
      user: undefined,
    } as any)

    expect(session?.user?.id).toBe("user-1")
    expect(session?.user?.email).toBe("test@example.com")
  })

  it("returns null session when token marked invalid", async () => {
    const { module } = await loadAuthModule()
    const session = await module.authOptions.callbacks?.session?.({
      session: { user: {} },
      token: { sessionInvalid: true } as any,
      user: undefined,
    } as any)

    expect(session).toBeNull()
  })

  it("marks JWT as invalid when session version increases", async () => {
    const { module } = await loadAuthModule({
      rows: [{ id: "user-1", email: "test@example.com", passwordHash: "hashed", sessionVersion: 2 }],
    })

    const token = await module.authOptions.callbacks?.jwt?.({
      token: { sub: "user-1", sessionVersion: 1 } as any,
      user: undefined,
      account: undefined,
    } as any)

    expect(token?.sessionInvalid).toBe(true)
    expect(token?.sessionVersion).toBe(2)
  })
})
