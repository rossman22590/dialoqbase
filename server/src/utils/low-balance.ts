import { sendEmail } from "./mailer";

const money = (value: number) => `$${value.toFixed(2)}`;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Emails a user when a charge takes their balance below their alert threshold,
// and again when it reaches $0 (their bots stop answering then). Only fires on
// the charge that crosses the line, so one email per crossing.
// Never throws: billing must not fail because an email couldn't be sent.
export const notifyIfLowBalance = async (
  prisma: any,
  userId: number,
  newBalance: number,
  charged: number
) => {
  try {
    if (!(charged > 0)) return;
    const before = newBalance + charged;

    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        email: true,
        username: true,
        lowBalanceEmailEnabled: true,
        lowBalanceThreshold: true,
      },
    });
    if (!user?.email || !user.lowBalanceEmailEnabled) return;

    const threshold = Number(user.lowBalanceThreshold);
    const hitZero = before > 0 && newBalance <= 0;
    const crossedThreshold =
      threshold > 0 && before >= threshold && newBalance < threshold;
    if (!hitZero && !crossedThreshold) return;

    await prisma.user.update({
      where: { user_id: userId },
      data: { lowBalanceNotifiedAt: new Date() },
    });

    const subject = hitZero
      ? "Your Botcraft Pro bots have stopped answering"
      : `Your Botcraft Pro credits are below ${money(threshold)}`;
    const body = hitZero
      ? "Your credit balance has reached $0, so your bots have stopped answering. Add credits to turn them back on."
      : `Your credit balance is now ${money(
          Math.max(newBalance, 0)
        )}. Your bots stop answering when it reaches $0.`;

    await sendEmail({
      to: user.email,
      subject,
      text: `Hi ${user.username},\n\n${body}\n\nYou can turn these emails off on the Usage page.`,
      html: `<p>Hi ${escapeHtml(user.username)},</p><p>${body}</p><p style="color:#71717a">You can turn these emails off on the Usage page.</p>`,
    });
  } catch (err) {
    console.error("Failed to send low-balance email", err);
  }
};
