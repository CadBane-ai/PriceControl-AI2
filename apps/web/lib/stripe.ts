import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    const secret = requireEnv("STRIPE_SECRET_KEY");
    stripeClient = new Stripe(secret, {
      apiVersion: "2024-06-20",
    });
  }
  return stripeClient;
}

export type StripeClient = Stripe;
