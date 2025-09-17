import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPlanFromSession, getUsageSummary } from "@/lib/usage";

const CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
};

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CACHE_HEADERS });
  }

  try {
    const plan = getPlanFromSession(session);
    const summary = await getUsageSummary(session.user.id, plan);
    return NextResponse.json(summary, { status: 200, headers: CACHE_HEADERS });
  } catch (error) {
    console.error("Failed to load usage summary", error);
    return NextResponse.json({ error: "Usage data unavailable" }, { status: 503, headers: CACHE_HEADERS });
  }
}
