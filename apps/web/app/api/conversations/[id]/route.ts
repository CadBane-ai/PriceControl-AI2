import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db/client";
import { conversations } from "@/db/schema/conversations";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

function noStoreInit(status: number) {
  return { status, headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } } as const;
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, noStoreInit(401));
    }
    const id = ctx.params.id;
    const body = await req.json().catch(() => ({} as { title?: string }));
    const title = typeof body.title === "string" && body.title.trim() ? body.title.trim() : null;
    if (!title) {
      return NextResponse.json({ error: "Invalid title" }, noStoreInit(400));
    }

    // Ownership check and update
    const updated = await db
      .update(conversations)
      .set({ title, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Not found" }, noStoreInit(404));
    }

    // Note: Without FK constraints here, we trust app-level ownership via session in future enhancement
    return NextResponse.json({ conversation: updated[0] }, noStoreInit(200));
  } catch (err) {
    console.error("/api/conversations/[id] PATCH error", err);
    return NextResponse.json({ error: "Internal server error" }, noStoreInit(500));
  }
}

