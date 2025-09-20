import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { OpenAIStream, StreamingTextResponse } from "ai"

import { authOptions } from "@/lib/auth"
import { chatRequestSchema } from "@/lib/validators"
import { findOptionById, inferModeFromModelId, isModelIdAllowed, resolveModelForMode } from "@/lib/models"
import { buildCompletionsUrl } from "@/lib/openrouter"
import { UsageLimitError, getPlanFromSession, recordUsage } from "@/lib/usage"

const CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
}

const OPENROUTER_APP_NAME = process.env.OPENROUTER_APP_NAME ?? "PriceControl"
const OPENROUTER_SITE = process.env.OPENROUTER_SITE_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000"

function jsonResponse(body: unknown, status: number) {
  return NextResponse.json(body, { status, headers: CACHE_HEADERS })
}

function streamingResponse(stream: ReadableStream) {
  return new StreamingTextResponse(stream, { headers: CACHE_HEADERS })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return jsonResponse({ error: "Unauthorized" }, 401)
  }

  let parsedBody
  try {
    const body = await req.json()
    const result = chatRequestSchema.safeParse(body)
    if (!result.success) {
      return jsonResponse({ error: "Invalid request", details: result.error.flatten() }, 400)
    }
    parsedBody = result.data
  } catch (error) {
    return jsonResponse({ error: "Invalid JSON payload" }, 400)
  }

  const { messages, model, mode } = parsedBody
  const sanitizedMessages = messages.map(({ role, content }) => ({ role, content }))

  const openRouterKey = process.env.OPENROUTER_API_KEY
  const hasOpenRouter = Boolean(openRouterKey)

  if (!hasOpenRouter) {
    const stream = new ReadableStream({
      start(controller) {
        const text = "This is a mock response from the AI. The OPENROUTER_API_KEY is not set."
        let pos = 0
        const interval = setInterval(() => {
          if (pos < text.length) {
            controller.enqueue(text.slice(pos, pos + 2))
            pos += 2
          } else {
            clearInterval(interval)
            controller.close()
          }
        }, 50)
      },
    })
    return streamingResponse(stream)
  }

  try {
    const plan = getPlanFromSession(session)
    await recordUsage(session.user.id, plan)
  } catch (error) {
    if (error instanceof UsageLimitError) {
      return jsonResponse({ error: "Daily usage limit reached" }, 429)
    }
    console.error("Usage recording failed", error)
  }

  const trimmedModel = model?.trim()
  const fallbackModel = resolveModelForMode(mode)
  let selectedModel = fallbackModel
  let effectiveMode = mode ?? inferModeFromModelId(fallbackModel)

  if (trimmedModel && isModelIdAllowed(trimmedModel)) {
    selectedModel = trimmedModel
    const option = findOptionById(trimmedModel)
    if (option?.mode) {
      effectiveMode = option.mode
    }
  }

  const baseUrl = buildCompletionsUrl(process.env.OPENROUTER_BASE_URL)
  const payload: Record<string, unknown> = {
    model: selectedModel,
    provider: { only: ["Cerebras"] },
    stream: true,
    messages: sanitizedMessages,
  }

  if (effectiveMode) {
    payload.mode = effectiveMode
  }

  let upstream: Response
  try {
    upstream = await fetch(baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": OPENROUTER_SITE,
        "X-Title": OPENROUTER_APP_NAME,
      },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    console.error("OpenRouter request failed", error)
    return jsonResponse({ error: "LLM provider unavailable" }, 502)
  }

  if (!upstream.ok || !upstream.body) {
    const errorText = await upstream.text().catch(() => upstream.statusText)
    console.error("OpenRouter upstream error", upstream.status, errorText)
    return jsonResponse({ error: "LLM provider error" }, 502)
  }

  const stream = OpenAIStream(upstream)
  return streamingResponse(stream)
}
