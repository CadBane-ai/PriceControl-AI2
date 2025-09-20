import { describe, expect, it } from "vitest"

describe("/api/auth/login", () => {
  it("returns guidance when payload is valid", async () => {
    const mod = await import("@/app/api/auth/login/route")
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user@example.com", password: "password123" }),
    })

    const res = await mod.POST(req)
    expect(res.status).toBe(200)
    const body: any = await res.json()
    expect(body.message).toContain("signIn('credentials'")
  })

  it("returns 400 when payload is invalid", async () => {
    const mod = await import("@/app/api/auth/login/route")
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "bad-email", password: "" }),
    })

    const res = await mod.POST(req)
    expect(res.status).toBe(400)
    const body: any = await res.json()
    expect(body.error).toBe("Invalid request")
  })
})
