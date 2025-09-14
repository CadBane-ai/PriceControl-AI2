import { NextResponse } from "next/server"
import { z } from "zod"

const ChatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]).transform((r) => (r === "assistant" ? "assistant" : "user")),
        content: z.string(),
      })
    )
    .min(1),
  model: z.enum(["instruct", "reasoning"]).default("instruct"),
})

export const runtime = "edge"

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const { messages, model } = ChatSchema.parse(json)

    const togetherKey = process.env.TOGETHER_API_KEY
    const modelName =
      model === "reasoning"
        ? process.env.TOGETHER_MODEL_REASONING
        : process.env.TOGETHER_MODEL_INSTRUCT

    if (!togetherKey || !modelName) {
      // Fallback: small mock stream if not configured
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          const text = "AI is not configured. Set TOGETHER_API_KEY and model envs."
          controller.enqueue(encoder.encode(text))
          controller.close()
        },
      })
      return new NextResponse(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } })
    }

    const resp = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${togetherKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelName,
        stream: true,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    })

    if (!resp.ok || !resp.body) {
      return NextResponse.json({ error: "AI provider error" }, { status: 502 })
    }

    return new NextResponse(resp.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message ?? "Invalid input" }, { status: 400 })
    }
    return NextResponse.json({ error: "Chat failed" }, { status: 500 })
  }
}

