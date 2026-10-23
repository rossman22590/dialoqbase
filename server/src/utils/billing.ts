import { ChatUsage } from "./usage-tracker";

export const INSUFFICIENT_CREDITS_MESSAGE = "Insufficient credits. Please top up.";
export const SUSPENDED_MESSAGE = "This bot is currently unavailable.";

export const usesOwnKey = (bot: any) => Boolean(bot.bot_model_api_key?.trim());

// Returns why the bot may not answer right now, or null when it may.
// A suspended owner's bots never answer; bots on their owner's own API key
// are not charged, so they are never blocked for credits.
export const checkCanAnswer = async (
  prisma: any,
  bot: any
): Promise<string | null> => {
  if (!bot.user_id) {
    return null;
  }
  const owner = await prisma.user.findUnique({
    where: { user_id: bot.user_id },
    include: { credit: true },
  });
  if (owner?.isSuspended) {
    return SUSPENDED_MESSAGE;
  }
  if (usesOwnKey(bot)) {
    return null;
  }
  if (!owner?.credit || owner.credit.balance.lessThan(0)) {
    return INSUFFICIENT_CREDITS_MESSAGE;
  }
  return null;
};

// Charges the bot's owner for one answered message and logs the transaction.
// Never throws: a billing failure must not lose the answer.
export const chargeChatUsage = async (
  prisma: any,
  bot: any,
  usage: ChatUsage,
  description: string,
  source: string
) => {
  if (!bot.user_id) {
    return;
  }
  try {
    const ownKey = usesOwnKey(bot);
    const { inputTokens, outputTokens, llmCalls, providerCostUsd, cost } =
      await usage.totals(bot.model);

    if (!ownKey) {
      await prisma.userCredit.update({
        where: { user_id: bot.user_id },
        data: {
          balance: {
            decrement: cost,
          },
        },
      });
    }

    await prisma.userTransaction.create({
      data: {
        user_id: bot.user_id,
        amount: ownKey ? 0 : -cost,
        type: "usage",
        description,
        metadata: {
          bot_id: bot.id,
          model: bot.model,
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          llm_calls: llmCalls,
          provider_cost_usd: ownKey ? 0 : providerCostUsd,
          estimated_cost: cost,
          used_own_key: ownKey,
          source,
        },
      },
    });
  } catch (err) {
    console.error(`Failed to deduct credits for ${source}`, err);
  }
};
