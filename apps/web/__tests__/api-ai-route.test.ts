import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { ReadableStream as NodeReadableStream } from "node:stream/web"

import { POST } from "@/app/api/ai/route"
import { buildCompletionsUrl } from "@/lib/openrouter"
import { UsageLimitError } from "@/lib/usage"

const {
  openAIStreamMock,
  streamingTextResponseMock,
  recordUsageMock,
  getPlanFromSessionMock,
  resolveModelForModeMock,
  findOptionByIdMock,
  inferModeFromModelIdMock,
  isModelIdAllowedMock,
} = vi.hoisted(() => {
  const openAIStreamMock = vi.fn()
  const streamingTextResponseMock = vi.fn(function (this: any, stream: unknown) {
    this.stream = stream
    this.status = 200
  })
  const recordUsageMock = vi.fn()
  const getPlanFromSessionMock = vi.fn(() => "free")
  const resolveModelForModeMock = vi.fn(() => "resolved-model")
  const findOptionByIdMock = vi.fn(() => ({ id: "resolved-model", mode: "reasoning" }))
  const inferModeFromModelIdMock = vi.fn(() => "instruct")
  const isModelIdAllowedMock = vi.fn(() => true)

  return {
    openAIStreamMock,
    streamingTextResponseMock,
    recordUsageMock,
    getPlanFromSessionMock,
    resolveModelForModeMock,
    findOptionByIdMock,
    inferModeFromModelIdMock,
    isModelIdAllowedMock,
  }
})

const fetchMock = vi.fn()

vi.stubGlobal("fetch", fetchMock)

if (typeof globalThis.ReadableStream === "undefined") {
  // Provide ReadableStream polyfill for jsdom-based tests
  ;(globalThis as typeof globalThis & { ReadableStream: typeof NodeReadableStream }).ReadableStream =
    NodeReadableStream as unknown as typeof globalThis.ReadableStream
}

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}))
vi.mock("@/lib/auth", () => ({
  authOptions: {},
}))
vi.mock("@/lib/usage", () => ({
  UsageLimitError: class extends Error {
    constructor(message: string) {
      super(message)
      this.name = "UsageLimitError"
    }
  },
  getPlanFromSession: (...args: unknown[]) => getPlanFromSessionMock(...args),
  recordUsage: (...args: unknown[]) => recordUsageMock(...args),
}))
vi.mock("@/lib/models", () => ({
  resolveModelForMode: (...args: unknown[]) => resolveModelForModeMock(...args),
  findOptionById: (...args: unknown[]) => findOptionByIdMock(...args),
  inferModeFromModelId: (...args: unknown[]) => inferModeFromModelIdMock(...args),
  isModelIdAllowed: (...args: unknown[]) => isModelIdAllowedMock(...args),
}))
vi.mock("ai", () => ({
  OpenAIStream: (...args: unknown[]) => openAIStreamMock(...args),
  StreamingTextResponse: function (this: any, stream: unknown, init?: Record<string, unknown>) {
    streamingTextResponseMock.call(this, stream, init)
  },
}))

const originalEnv = { ...process.env }

beforeEach(() => {
  vi.clearAllMocks()
  process.env = { ...originalEnv }
  findOptionByIdMock.mockReturnValue({ id: "resolved-model", mode: "reasoning" })
  isModelIdAllowedMock.mockReturnValue(true)
  inferModeFromModelIdMock.mockReturnValue("instruct")
})

afterEach(() => {
  vi.clearAllMocks()
  process.env = { ...originalEnv }
})

afterAll(() => {
  vi.unstubAllGlobals()
})

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
    expect(buildCompletionsUrl("https://openrouter.ai/api/v1/")).toBe("https://openrouter.ai/api/v1/chat/completions")
  })
})

describe("/api/ai", () => {
  it("registers POST handler", () => {
    expect(typeof POST).toBe("function")
  })

  it("should return 401 if user is not authenticated", async () => {
    (getServerSession as vi.Mock).mockResolvedValue(null)
    const req = new NextRequest("http://localhost/api/ai", { method: "POST" })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it("should return 400 if request body is invalid", async () => {
    (getServerSession as vi.Mock).mockResolvedValue({ user: { id: "user-1" } })
    const req = new NextRequest("http://localhost/api/ai", {
      method: "POST",
      body: JSON.stringify({ foo: "bar" }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it("returns 400 when model id is not allow-listed", async () => {
    (getServerSession as vi.Mock).mockResolvedValue({ user: { id: "user-1" } })
    isModelIdAllowedMock.mockReturnValueOnce(false)

    const req = new NextRequest("http://localhost/api/ai", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
        model: "unauthorized-model",
      }),
      headers: { "Content-Type": "application/json" },
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("returns mock stream when api key is missing", async () => {
    (getServerSession as vi.Mock).mockResolvedValue({ user: { id: "user-1" } })
    delete process.env.OPENROUTER_API_KEY

    const messages = [{ role: "user", content: "Hello" }]
    const req = new NextRequest("http://localhost/api/ai", {
      method: "POST",
      body: JSON.stringify({ messages }),
      headers: { "Content-Type": "application/json" },
    })

    const res = await POST(req)

    expect(fetchMock).not.toHaveBeenCalled()
    expect(openAIStreamMock).not.toHaveBeenCalled()
    expect(streamingTextResponseMock).toHaveBeenCalled()

    const responseInstance = res as unknown as { stream?: unknown }
    expect(responseInstance.stream).toBeInstanceOf(ReadableStream)
  })

  it("enforces usage limits and forwards mode and provider when OpenRouter is configured", async () => {
    (getServerSession as vi.Mock).mockResolvedValue({ user: { id: "user-1" } })
    process.env.OPENROUTER_API_KEY = "test-key"
    resolveModelForModeMock.mockReturnValueOnce("resolved-model")
    const mockStream = { foo: "bar" }
    openAIStreamMock.mockReturnValueOnce(mockStream)
    fetchMock.mockResolvedValueOnce(new Response("ok", { status: 200 }))

    const req = new NextRequest("http://localhost/api/ai", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
        mode: "reasoning",
      }),
      headers: { "Content-Type": "application/json" },
    })

    await POST(req)

    expect(getPlanFromSessionMock).toHaveBeenCalledWith({ user: { id: "user-1" } })
    expect(recordUsageMock).toHaveBeenCalledWith("user-1", "free")
    expect(resolveModelForModeMock).toHaveBeenCalledWith("reasoning")
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe("https://openrouter.ai/api/v1/chat/completions")
    expect(init?.method).toBe("POST")
    expect(init?.headers).toMatchObject({
      Authorization: "Bearer test-key",
      "Content-Type": "application/json",
    })
    const body = init?.body ? JSON.parse(init.body as string) : null
    expect(body).toMatchObject({
      model: "resolved-model",
      provider: { only: ["Cerebras"] },
      mode: "reasoning",
    })
    expect(openAIStreamMock).toHaveBeenCalled()
    expect(streamingTextResponseMock).toHaveBeenCalledWith(mockStream, expect.any(Object))
  })

  it("uses explicit model selection and infers mode from configuration", async () => {
    (getServerSession as vi.Mock).mockResolvedValue({ user: { id: "user-1" } })
    process.env.OPENROUTER_API_KEY = "test-key"
    resolveModelForModeMock.mockReturnValueOnce("default-model")
    findOptionByIdMock.mockReturnValueOnce({ id: "meta-llama/llama-3.3-70b-instruct", mode: "reasoning" })

    const mockStream = { foo: "bar" }
    openAIStreamMock.mockReturnValueOnce(mockStream)
    fetchMock.mockResolvedValueOnce(new Response("ok", { status: 200 }))

    const req = new NextRequest("http://localhost/api/ai", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
        model: "meta-llama/llama-3.3-70b-instruct",
      }),
      headers: { "Content-Type": "application/json" },
    })

    await POST(req)

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    const body = init?.body ? JSON.parse(init.body as string) : null
    expect(body).toMatchObject({
      model: "meta-llama/llama-3.3-70b-instruct",
      mode: "reasoning",
    })
    expect(resolveModelForModeMock).toHaveBeenCalledWith(undefined)
    expect(findOptionByIdMock).toHaveBeenCalledWith("meta-llama/llama-3.3-70b-instruct")
  })

  it("returns 429 when usage limit is exceeded", async () => {
    (getServerSession as vi.Mock).mockResolvedValue({ user: { id: "user-1" } })
    process.env.OPENROUTER_API_KEY = "test-key"
    recordUsageMock.mockImplementationOnce(() => {
      throw new UsageLimitError("Daily usage limit reached")
    })

    const req = new NextRequest("http://localhost/api/ai", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
      }),
      headers: { "Content-Type": "application/json" },
    })

    const res = await POST(req)

    expect(res.status).toBe(429)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
