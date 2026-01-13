import { PrismaClient } from "@prisma/client";
import { QSource } from "./type";
import { countTokens } from "../utils/tokenizer";
import { calculateEmbeddingCost, normalizeEmbeddingModelId } from "../utils/pricing";

const getDocContent = (doc: any) =>
  doc?.pageContent ?? doc?.content ?? "";

export const recordEmbeddingUsage = async (
  prisma: PrismaClient,
  source: QSource,
  embeddingModelId: string,
  documents: any[]
) => {
  if (!source.bot_user_id) {
    return;
  }

  const usesOwnKey = Boolean(source.bot_model_api_key?.trim());
  if (!usesOwnKey) {
    const userCredit = await prisma.userCredit.findUnique({
      where: { user_id: source.bot_user_id },
    });
    if (!userCredit || userCredit.balance.lessThan(0)) {
      throw new Error("Insufficient credits");
    }
  }

  let inputTokens = 0;
  for (const doc of documents) {
    const content = getDocContent(doc);
    if (content) {
      inputTokens += await countTokens(content);
    }
  }

  if (inputTokens <= 0) {
    return;
  }

  const normalizedModelId = normalizeEmbeddingModelId(embeddingModelId);
  const cost = calculateEmbeddingCost(embeddingModelId, inputTokens);

  try {
    if (!usesOwnKey) {
      await prisma.userCredit.update({
        where: { user_id: source.bot_user_id },
        data: {
          balance: {
            decrement: cost,
          },
        },
      });
    }

    await prisma.userTransaction.create({
      data: {
        user_id: source.bot_user_id,
        amount: usesOwnKey ? 0 : -cost,
        type: "usage",
        description: `Embedding usage for bot: ${source.bot_name || source.botId}`,
        metadata: {
          bot_id: source.botId,
          source_id: source.id,
          source_type: source.type,
          embedding_model: normalizedModelId,
          input_tokens: inputTokens,
          estimated_cost: cost,
          used_own_key: usesOwnKey,
          usage_kind: "embedding",
        },
      },
    });
  } catch (err) {
    console.error("Failed to record embedding usage", err);
  }
};
