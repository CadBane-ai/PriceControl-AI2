import { NextResponse } from "next/server";
import { getServerAuthSession } from "~/server/auth";
import { stripe } from "~/lib/stripe";
import { env } from "~/env";

export async function POST() {
  const session = await getServerAuthSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: env.STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${env.NEXTAUTH_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.NEXTAUTH_URL}/pricing`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}