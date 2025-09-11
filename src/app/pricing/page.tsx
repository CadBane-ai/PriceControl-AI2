"use client";

import { useRouter } from "next/navigation";

export default function PricingPage() {
  const router = useRouter();

  const handleUpgrade = async () => {
    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
    });
    const { url } = await res.json();
    router.push(url);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-4xl rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-3xl font-bold">Pricing Plans</h1>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-semibold">Free</h2>
            <p className="mb-6 text-4xl font-bold">$0</p>
            <ul className="space-y-2">
              <li>10 requests per day</li>
              <li>Basic support</li>
            </ul>
          </div>
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-semibold">Pro</h2>
            <p className="mb-6 text-4xl font-bold">$20</p>
            <ul className="space-y-2">
              <li>Unlimited requests</li>
              <li>Priority support</li>
            </ul>
            <button
              onClick={handleUpgrade}
              className="mt-6 w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Upgrade
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}