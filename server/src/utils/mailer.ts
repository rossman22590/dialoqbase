import axios from "axios";

/**
 * Minimal email sender built on the Resend REST API.
 *
 * Uses the existing axios dependency so we don't pull in a new package. The API
 * key and sender are read from the environment (set on the live services), so no
 * secret is ever committed to the repo.
 *
 *   RESEND_API_KEY   - Resend API key (required for mail to actually send)
 *   RESEND_FROM_EMAIL - sender, e.g. "Botcraft Pro <noreply@myapps.ai>"
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

const getFromAddress = (): string =>
  process.env.RESEND_FROM_EMAIL || "Botcraft Pro <noreply@myapps.ai>";

export const isMailerConfigured = (): boolean => !!process.env.RESEND_API_KEY;

interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: SendEmailArgs): Promise<void> => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // No key configured (e.g. local dev). Don't crash the flow; just log it.
    console.warn(
      "[mailer] RESEND_API_KEY is not set; skipping email to",
      to,
    );
    return;
  }

  await axios.post(
    RESEND_ENDPOINT,
    {
      from: getFromAddress(),
      to: [to],
      subject,
      html,
      ...(text ? { text } : {}),
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    },
  );
};

export const sendPasswordResetEmail = async (
  to: string,
  resetUrl: string,
): Promise<void> => {
  const subject = "Reset your Botcraft Pro password";

  const html = `
  <div style="font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1f2937;">
    <h2 style="margin: 0 0 12px; font-size: 20px; color: #111827;">Reset your password</h2>
    <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #374151;">
      We received a request to reset the password for your account. Click the button
      below to choose a new password. This link expires in 1 hour.
    </p>
    <p style="margin: 0 0 24px;">
      <a href="${resetUrl}"
        style="display: inline-block; background: #7c3aed; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 10px 20px; border-radius: 8px;">
        Reset password
      </a>
    </p>
    <p style="margin: 0 0 8px; font-size: 13px; line-height: 1.6; color: #6b7280;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="margin: 0 0 24px; font-size: 13px; word-break: break-all;">
      <a href="${resetUrl}" style="color: #7c3aed;">${resetUrl}</a>
    </p>
    <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #9ca3af;">
      If you didn't request a password reset, you can safely ignore this email.
    </p>
  </div>`;

  const text = `Reset your password\n\nWe received a request to reset the password for your account. Open the link below to choose a new password. This link expires in 1 hour.\n\n${resetUrl}\n\nIf you didn't request a password reset, you can safely ignore this email.`;

  await sendEmail({ to, subject, html, text });
};
