import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db/client";
import { conversations } from "@/db/schema/conversations";
import { users } from "@/db/schema/users";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

function noStoreInit(status: number) {
  return { status, headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } } as const;
}

function isUuid(value: string | undefined | null) {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

async function resolveUserId(session: Awaited<ReturnType<typeof getServerSession>>) {
  const rawId = session?.user?.id as string | undefined;
  if (isUuid(rawId)) {
    return rawId;
  }
  const email = session?.user?.email as string | undefined;
  if (!email) {
    return null;
  }
  const rows = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  return rows.length ? rows[0].id : null;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = await resolveUserId(session);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, noStoreInit(401));
    }
    const rows = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
    return NextResponse.json({ conversations: rows }, noStoreInit(200));
  } catch (err) {
    console.error("/api/conversations GET error", err);
    return NextResponse.json({ error: "Internal server error" }, noStoreInit(500));
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = await resolveUserId(session);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, noStoreInit(401));
    }
    const body = await req.json().catch(() => ({} as { title?: string }));
    const title = typeof body.title === "string" && body.title.trim() ? body.title.trim() : "Untitled conversation";
    const inserted = await db
      .insert(conversations)
      .values({ userId, title })
      .returning();
    return NextResponse.json({ conversation: inserted[0] }, noStoreInit(201));
  } catch (err) {
    console.error("/api/conversations POST error", err);
    return NextResponse.json({ error: "Internal server error" }, noStoreInit(500));
  }
}
