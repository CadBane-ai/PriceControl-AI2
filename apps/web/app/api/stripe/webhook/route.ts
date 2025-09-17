import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { getStripeClient } from "@/lib/stripe";
import { db } from "@/db/client";
import { users } from "@/db/schema/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const relevantEvents = new Set<Stripe.Event.Type>([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
]);

function buildResponse(status: number) {
  return new NextResponse(null, {
    status,
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" },
  });
}

function getCustomerId(resource: Stripe.Checkout.Session | Stripe.Subscription | Stripe.Invoice): string | null {
  const value = (resource as { customer?: string | Stripe.Customer | null }).customer;
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

async function fetchPeriodEnd(stripe: Stripe, subscriptionId: string | undefined | null) {
  if (!subscriptionId) return null;
  const id = typeof subscriptionId === "string" ? subscriptionId : subscriptionId?.toString();
  if (!id) return null;
  try {
    const subscription = await stripe.subscriptions.retrieve(id);
    return subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null;
  } catch (error) {
    console.error("Failed to retrieve subscription", id, error);
    return null;
  }
}

type UserInsert = typeof users.$inferInsert;

async function updateUserSubscription(params: {
  userId?: string | null;
  customerId?: string | null;
  email?: string | null;
  status: "free" | "pro";
  planExpiresAt?: Date | null;
}) {
  const { userId, customerId, email, status } = params;
  const planExpiresAt = params.planExpiresAt ?? null;
  const now = new Date();

  const set: Partial<UserInsert> = {
    subscriptionStatus: status,
    planExpiresAt,
    updatedAt: now,
  };

  if (customerId) {
    set.stripeCustomerId = customerId;
  }

  let updatedUserId: string | null = null;

  if (userId) {
    const result = await db
      .update(users)
      .set(set)
      .where(eq(users.id, userId))
      .returning({ id: users.id });
    updatedUserId = result[0]?.id ?? null;
  }

  if (!updatedUserId && customerId) {
    const result = await db
      .update(users)
      .set(set)
      .where(eq(users.stripeCustomerId, customerId))
      .returning({ id: users.id });
    updatedUserId = result[0]?.id ?? null;
  }

  if (!updatedUserId && email) {
    const normalized = email.toLowerCase();
    const result = await db
      .update(users)
      .set(set)
      .where(eq(users.email, normalized))
      .returning({ id: users.id });
    updatedUserId = result[0]?.id ?? null;
  }

  if (!updatedUserId) {
    console.warn("Stripe webhook could not match user", { userId, customerId, email, status });
  }
}

function isActiveSubscriptionStatus(status: Stripe.Subscription.Status) {
  return status === "active" || status === "trialing" || status === "past_due";
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    console.warn("Missing stripe-signature header");
    return buildResponse(400);
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return buildResponse(500);
  }

  const body = await req.text();
  const stripe = getStripeClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed", err);
    return buildResponse(400);
  }

  if (!relevantEvents.has(event.type)) {
    return buildResponse(200);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkout = event.data.object as Stripe.Checkout.Session;
        const customerId = getCustomerId(checkout);
        const userId = (checkout.metadata?.userId as string | undefined) ?? checkout.client_reference_id ?? null;
        const planExpiresAt = await fetchPeriodEnd(stripe, checkout.subscription);
        await updateUserSubscription({
          userId,
          customerId,
          email: checkout.customer_details?.email ?? checkout.customer_email ?? null,
          status: "pro",
          planExpiresAt,
        });
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = getCustomerId(subscription);
        const planExpiresAt = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : null;
        const status = isActiveSubscriptionStatus(subscription.status) ? "pro" : "free";
        await updateUserSubscription({
          customerId,
          email: subscription.customer_email ?? null,
          status,
          planExpiresAt,
        });
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = getCustomerId(subscription);
        await updateUserSubscription({ customerId, email: subscription.customer_email ?? null, status: "free", planExpiresAt: null });
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = getCustomerId(invoice);
        const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : undefined;
        const planExpiresAt = await fetchPeriodEnd(stripe, subscriptionId);
        await updateUserSubscription({
          customerId,
          email: invoice.customer_email ?? invoice.customer_address?.email ?? null,
          status: "pro",
          planExpiresAt,
        });
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("Stripe webhook processing error", event.type, err);
    return buildResponse(500);
  }

  return buildResponse(200);
}
