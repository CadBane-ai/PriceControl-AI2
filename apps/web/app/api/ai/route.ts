import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { resolveModelForMode } from "@/lib/models";
import { buildCompletionsUrl } from "@/lib/openrouter";
import { getPlanFromSession, recordUsage, UsageLimitError } from "@/lib/usage";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1),
    })
  ),
  conversationId: z.string().optional(),
  mode: z.enum(["instruct", "reasoning"]).optional(),
  model: z.string().optional(),
});

function noStore(status = 200, headers: Record<string, string> = {}) {
  return {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      ...headers,
    },
  } as const;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, noStore(401));
  }

  let parsed:
    | { success: true; data: z.infer<typeof BodySchema> }
    | { success: false; error: unknown };
  try {
    const json = await req.json();
    const result = BodySchema.safeParse(json);
    parsed = result.success ? { success: true, data: result.data } : { success: false, error: result.error };
  } catch (e) {
    parsed = { success: false, error: e };
  }

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, noStore(400));
  }

  // Prefer OpenRouter if configured; future: direct Cerebras when scaling up
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const hasOpenRouter = !!openRouterKey;

  if (hasOpenRouter) {
    try {
      const plan = getPlanFromSession(session);
      await recordUsage(session.user.id, plan);
    } catch (error) {
      if (error instanceof UsageLimitError) {
        return NextResponse.json({ error: "Daily usage limit reached" }, noStore(429));
      }
      console.error("Usage recording failed", error);
    }
  }

  if (!hasOpenRouter) {
    const responseText =
      "This is a mock streaming response from the AI assistant. Configure OPENROUTER_API_KEY to enable live calls.";
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const words = responseText.split(" ");
        let i = 0;
        const interval = setInterval(() => {
          if (i < words.length) {
            controller.enqueue(encoder.encode(words[i] + " "));
            i++;
          } else {
            clearInterval(interval);
            controller.close();
          }
        }, 30);
      },
    });
    return new StreamingTextResponse(stream, noStore(200, { "Content-Type": "text/plain; charset=utf-8" }));
  }

  // OpenRouter streaming call
  const baseUrl = buildCompletionsUrl(process.env.OPENROUTER_BASE_URL);
  const site = process.env.OPENROUTER_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const appName = process.env.OPENROUTER_APP_NAME || "PriceControl";
  const model = parsed.data.model ?? resolveModelForMode(parsed.data.mode);

  const upstream = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openRouterKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": site,
      "X-Title": appName,
    },
    body: JSON.stringify({
      model,
      provider: { only: ["Cerebras"] },
      stream: true,
      messages: parsed.data.messages,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Upstream error" }, noStore(502));
  }
  const stream = OpenAIStream(upstream);
  return new StreamingTextResponse(stream);
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, noStore(405));
}
