import { DialoqbaseVectorStore } from "../../../../../utils/store";
import { chatModelProvider } from "../../../../../utils/models";
import { DialoqbaseHybridRetrival } from "../../../../../utils/hybrid";
import { PrismaClient } from "@prisma/client";
import { Document } from "langchain/document";

export const handleErrorResponse = (
  history: {
    type: string;
    text: string;
  }[],
  message: string,
  errorMessage: string
) => ({
  bot: {
    text: errorMessage,
    sourceDocuments: [],
  },
  history: [
    ...history,
    { type: "human", text: message },
    { type: "ai", text: errorMessage },
  ],
});

// onDocuments receives the documents the chain retrieves, so callers can show
// them as sources without running the search a second time.
export const createRetriever = async (
  bot: any,
  embeddingModel: any,
  onDocuments?: (documents: Document[]) => void
) => {
  const callbacks = onDocuments
    ? [{ handleRetrieverEnd: (documents: Document[]) => onDocuments(documents) }]
    : [];

  if (bot.use_hybrid_search) {
    return new DialoqbaseHybridRetrival(embeddingModel, {
      botId: bot.id,
      sourceId: null,
      callbacks,
    });
  } else {
    const vectorstore = await DialoqbaseVectorStore.fromExistingIndex(
      embeddingModel,
      {
        botId: bot.id,
        sourceId: null,
      }
    );
    return vectorstore.asRetriever({ callbacks });
  }
};

export const getBotConfig = (bot: any, modelinfo: any) => {
  let botConfig: any = {};

  // Parse bot.botConfig if it's a string
  if (typeof bot.botConfig === 'string') {
    try {
      botConfig = JSON.parse(bot.botConfig);
    } catch (error) {
      console.error('Error parsing bot.botConfig:', error);
    }
  } else if (typeof bot.botConfig === 'object') {
    botConfig = bot.botConfig;
  }

  // Merge with modelinfo.config
  botConfig = { ...modelinfo.config, ...botConfig };

  // Add API key for OpenAI if provided
  if (bot.bot_model_api_key?.trim()) {
    botConfig.configuration = {
      ...botConfig.configuration,
      apiKey: bot.bot_model_api_key.trim()
    };
  }

  return botConfig;
};

export const createChatModel = (
  bot: any,
  temperature: number,
  botConfig: any,
  streaming = false
) =>
  chatModelProvider(bot.provider, bot.model, temperature, {
    streaming,
    ...botConfig,
  });

export const saveChatHistory = async (
  prisma: PrismaClient,
  botId: string,
  message: string,
  response: string,
  historyId: string | undefined,
  documents: any[]
) => {
  if (!historyId) {
    const newHistory = await prisma.botPlayground.create({
      data: { botId, title: message },
    });
    historyId = newHistory.id;
  }

  await prisma.botPlaygroundMessage.create({
    data: { type: "human", message, botPlaygroundId: historyId },
  });

  const botMessage = await prisma.botPlaygroundMessage.create({
    data: {
      type: "ai",
      message: response,
      botPlaygroundId: historyId,
      isBot: true,
      sources: documents.map((doc) => ({ ...doc })),
    },
  });

  // messageId lets the playground rate this answer (thumbs up/down).
  return { historyId, messageId: botMessage.id };
};
