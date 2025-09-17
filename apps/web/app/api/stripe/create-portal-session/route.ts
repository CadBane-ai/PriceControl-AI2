import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/db/client";
import { users } from "@/db/schema/users";
import { getStripeClient } from "@/lib/stripe";

export const dynamic = "force-dynamic";

function noStore(status: number) {
  return { status, headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } as Record<string, string> };
}

function resolveAppUrl() {
  return (
    process.env.STRIPE_PORTAL_RETURN_URL_BASE ??
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

async function resolveUserId(session: Awaited<ReturnType<typeof getServerSession>>) {
  const rawId = session?.user?.id as string | undefined;
  if (rawId && /^[0-9a-f-]{36}$/i.test(rawId)) {
    return rawId;
  }
  const email = session?.user?.email?.toLowerCase();
  if (!email) return null;
  const row = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  return row[0]?.id ?? null;
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const userId = await resolveUserId(session);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, noStore(401));
    }

    const [user] = await db
      .select({ stripeCustomerId: users.stripeCustomerId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: "No Stripe customer" }, noStore(400));
    }

    const stripe = getStripeClient();
    const returnUrl = process.env.STRIPE_PORTAL_RETURN_URL ?? `${resolveAppUrl()}/billing`;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: portalSession.url }, noStore(200));
  } catch (error) {
    console.error("/api/stripe/create-portal-session error", error);
    return NextResponse.json({ error: "Internal server error" }, noStore(500));
  }
}
