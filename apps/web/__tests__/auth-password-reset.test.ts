import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  enforceRateLimit: vi.fn(),
  findUserByEmail: vi.fn(),
  createPasswordResetToken: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  consumePasswordResetToken: vi.fn(),
}))

vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: (...args: any[]) => mocks.enforceRateLimit(...args),
}))

vi.mock("@/lib/password-reset", () => ({
  RESET_TOKEN_TTL_MINUTES: 60,
  findUserByEmail: (...args: any[]) => mocks.findUserByEmail(...args),
  createPasswordResetToken: (...args: any[]) => mocks.createPasswordResetToken(...args),
  consumePasswordResetToken: (...args: any[]) => mocks.consumePasswordResetToken(...args),
  hashToken: (token: string) => `hash:${token}`,
}))

vi.mock("@/lib/email", () => ({
  sendPasswordResetEmail: (...args: any[]) => mocks.sendPasswordResetEmail(...args),
}))

vi.mock("@/db/client", () => ({
  db: {
    transaction: (cb: any) => cb({
      update: () => ({
        set: () => ({ where: () => Promise.resolve() }),
      }),
      delete: () => ({ where: () => Promise.resolve() }),
    }),
  },
}))

vi.mock("bcryptjs", () => ({
  default: { hash: async () => "hashed" },
  hash: async () => "hashed",
}))

describe("POST /api/auth/forgot-password", () => {
  beforeEach(() => {
    vi.resetModules()
    mocks.enforceRateLimit.mockReset()
    mocks.enforceRateLimit.mockResolvedValue({ success: true })
    mocks.findUserByEmail.mockReset()
    mocks.createPasswordResetToken.mockReset()
    mocks.sendPasswordResetEmail.mockReset()
  })

  it("returns 400 for invalid payload", async () => {
    const mod = await import("@/app/api/auth/forgot-password/route")
    const req = new Request("http://localhost/api/auth/forgot-password", { method: "POST", body: "not-json" })
    const res = await mod.POST(req)
    expect(res.status).toBe(400)
  })

  it("returns 202 and does not send email when user is absent", async () => {
    mocks.findUserByEmail.mockResolvedValue(undefined)
    const mod = await import("@/app/api/auth/forgot-password/route")
    const req = new Request("http://localhost/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "unknown@example.com" }),
    })
    const res = await mod.POST(req)
    expect(res.status).toBe(202)
    expect(mocks.createPasswordResetToken).not.toHaveBeenCalled()
    expect(mocks.sendPasswordResetEmail).not.toHaveBeenCalled()
  })

  it("issues token and sends email when user exists", async () => {
    mocks.findUserByEmail.mockResolvedValue({ id: "user-1" })
    mocks.createPasswordResetToken.mockResolvedValue({ token: "reset-token", expiresAt: new Date(Date.now() + 60000) })
    const mod = await import("@/app/api/auth/forgot-password/route")
    const req = new Request("http://localhost/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "known@example.com" }),
      headers: { "x-forwarded-for": "1.1.1.1" },
    })
    const res = await mod.POST(req)
    expect(res.status).toBe(202)
    expect(mocks.createPasswordResetToken).toHaveBeenCalled()
    expect(mocks.sendPasswordResetEmail).toHaveBeenCalled()
  })

  it("returns 429 when IP rate limit exceeded", async () => {
    mocks.enforceRateLimit.mockResolvedValueOnce({ success: false })
    const mod = await import("@/app/api/auth/forgot-password/route")
    const req = new Request("http://localhost/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "known@example.com" }),
    })
    const res = await mod.POST(req)
    expect(res.status).toBe(429)
  })
})

describe("POST /api/auth/reset-password", () => {
  beforeEach(() => {
    vi.resetModules()
    mocks.enforceRateLimit.mockReset()
    mocks.enforceRateLimit.mockResolvedValue({ success: true })
    mocks.consumePasswordResetToken.mockReset()
  })

  it("returns 400 for invalid payload", async () => {
    const mod = await import("@/app/api/auth/reset-password/route")
    const req = new Request("http://localhost/api/auth/reset-password", { method: "POST", body: "{}" })
    const res = await mod.POST(req)
    expect(res.status).toBe(400)
  })

  it("returns 410 when token invalid", async () => {
    mocks.consumePasswordResetToken.mockResolvedValue(undefined)
    const mod = await import("@/app/api/auth/reset-password/route")
    const req = new Request("http://localhost/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token: "bad", password: "newpassword123" }),
    })
    const res = await mod.POST(req)
    expect(res.status).toBe(410)
    expect(mocks.enforceRateLimit).toHaveBeenCalledWith(
      expect.objectContaining({ key: "password-reset:invalid-token:hash:bad" }),
    )
  })

  it("returns 204 when password reset succeeds", async () => {
    mocks.consumePasswordResetToken.mockResolvedValue({ id: "token-1", userId: "user-1" })
    const mod = await import("@/app/api/auth/reset-password/route")
    const req = new Request("http://localhost/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token: "good", password: "newpassword123" }),
    })
    const res = await mod.POST(req)
    expect(res.status).toBe(204)
  })

  it("clears auth cookies when resetting password", async () => {
    mocks.consumePasswordResetToken.mockResolvedValue({ id: "token-1", userId: "user-1" })
    const mod = await import("@/app/api/auth/reset-password/route")
    const req = new Request("http://localhost/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token: "good", password: "newpassword123" }),
    })
    const res = await mod.POST(req)
    const clearedCookies = res.cookies.getAll().map((cookie) => ({ name: cookie.name, value: cookie.value }))
    expect(clearedCookies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "next-auth.session-token", value: "" }),
        expect.objectContaining({ name: "__Secure-next-auth.session-token", value: "" }),
        expect.objectContaining({ name: "__Host-next-auth.session-token", value: "" }),
      ]),
    )
  })

  it("returns 429 when limit exceeded", async () => {
    mocks.enforceRateLimit.mockResolvedValueOnce({ success: false })
    const mod = await import("@/app/api/auth/reset-password/route")
    const req = new Request("http://localhost/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token: "throttle", password: "newpassword123" }),
    })
    const res = await mod.POST(req)
    expect(res.status).toBe(429)
  })

  it("prevents reuse of consumed tokens", async () => {
    mocks.consumePasswordResetToken
      .mockResolvedValueOnce({ id: "token-1", userId: "user-1" })
      .mockResolvedValueOnce(undefined)
    const mod = await import("@/app/api/auth/reset-password/route")

    const baseRequestInit = {
      method: "POST",
      body: JSON.stringify({ token: "reused", password: "newpassword123" }),
    }

    const first = await mod.POST(new Request("http://localhost/api/auth/reset-password", baseRequestInit))
    expect(first.status).toBe(204)

    const second = await mod.POST(new Request("http://localhost/api/auth/reset-password", baseRequestInit))
    expect(second.status).toBe(410)
    expect(mocks.enforceRateLimit).toHaveBeenCalledWith(
      expect.objectContaining({ key: "password-reset:invalid-token:hash:reused" }),
    )
  })
})
