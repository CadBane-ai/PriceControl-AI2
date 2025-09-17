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
    process.env.STRIPE_SUCCESS_URL_BASE ??
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

    const priceId = process.env.STRIPE_PRICE_ID_PRO;
    if (!priceId) {
      console.error("STRIPE_PRICE_ID_PRO is not set");
      return NextResponse.json({ error: "Stripe not configured" }, noStore(500));
    }

    const successUrl = process.env.STRIPE_SUCCESS_URL ?? `${resolveAppUrl()}/payment-success`;
    const cancelUrl = process.env.STRIPE_CANCEL_URL ?? `${resolveAppUrl()}/pricing`;

    const stripe = getStripeClient();
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, noStore(404));
    }

    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      client_reference_id: userId,
      subscription_data: {
        metadata: { userId },
      },
      metadata: { userId },
    };

    const customerId = user.stripeCustomerId;
    if (customerId) {
      sessionParams.customer = customerId;
    } else {
      sessionParams.customer_email = user.email;
    }

    const checkoutSession = await stripe.checkout.sessions.create(sessionParams);

    if (!checkoutSession.url) {
      console.error("Stripe returned session without URL", checkoutSession.id);
      return NextResponse.json({ error: "Unable to start checkout" }, noStore(500));
    }

    return NextResponse.json({ url: checkoutSession.url }, noStore(200));
  } catch (error) {
    console.error("/api/stripe/create-checkout-session error", error);
    return NextResponse.json({ error: "Internal server error" }, noStore(500));
  }
}
