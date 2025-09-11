import { StreamingTextResponse, LangChainStream, Message } from "ai";
import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { webFetch } from "~/lib/tools";
import fs from "fs";
import path from "path";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

const userUsage = new Map<string, { count: number; date: Date }>();

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages, model } = await req.json();
  const session = await getServerAuthSession();

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (user?.stripeSubscriptionId) {
    const usage = userUsage.get(session.user.id);
    const today = new Date();

    if (usage && usage.date.getDate() === today.getDate()) {
      if (usage.count >= 10) {
        return new Response("Usage limit exceeded", { status: 429 });
      }
      userUsage.set(session.user.id, { count: usage.count + 1, date: today });
    } else {
      userUsage.set(session.user.id, { count: 1, date: today });
    }
  }

  const { stream, handlers } = LangChainStream();

  const llm = new ChatOpenAI({
    streaming: true,
    modelName: model === "thinking" ? "gpt-4" : "gpt-3.5-turbo",
  }).bind({
    tools: [webFetch],
  });

  const systemPrompt = fs.readFileSync(
    path.join(process.cwd(), "prompts/base-system.mdx"),
    "utf8",
  );

  const processedMessages = [
    new SystemMessage(systemPrompt),
    ...(messages as Message[]).map((m) =>
      m.role == "user"
        ? new HumanMessage(m.content)
        : new AIMessage(m.content),
    ),
  ];

  llm
    .call(
      processedMessages,
      {},
      [handlers],
    )
    .catch(console.error);

  return new StreamingTextResponse(stream);
}