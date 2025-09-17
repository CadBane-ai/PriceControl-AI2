interface SendPasswordResetParams {
  to: string;
  resetUrl: string;
  expiresMinutes: number;
}

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function sendPasswordResetEmail({ to, resetUrl, expiresMinutes }: SendPasswordResetParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || "noreply@pricecontrol.ai";

  if (!apiKey) {
    console.warn("RESEND_API_KEY not set; skipping password reset email send.");
    return;
  }

  const subject = "Reset your PriceControl password";
  const html = `
    <p>You requested a password reset for your PriceControl account.</p>
    <p><a href="${resetUrl}">Click here</a> to reset your password. This link expires in ${expiresMinutes} minutes.</p>
    <p>If you did not request this change, you can safely ignore this email.</p>
  `;

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    console.error("Failed to send password reset email", res.status, text);
  }
}
