import { FastifyReply, FastifyRequest } from "fastify";
import { ChatRequestBody } from "./types";
import { DialoqbaseVectorStore } from "../../utils/store";
import { embeddings } from "../../utils/embeddings";
import { chatModelProvider } from "../../utils/models";
import { BaseRetriever } from "@langchain/core/retrievers";
import { DialoqbaseHybridRetrival } from "../../utils/hybrid";
import { Document } from "langchain/document";
import { createChain, groupMessagesByConversation } from "../../chain";
import { getModelInfo } from "../../utils/get-model-info";
import { nextTick } from "../../utils/nextTick";
import { jwtBotVerify } from "../../utils/jwt";
import { MODEL_PRICING } from "../../utils/pricing";
import { countTokens } from "../../utils/tokenizer";

export const chatRequestHandler = async (
  request: FastifyRequest<ChatRequestBody>,
  reply: FastifyReply
) => {
  const { message, history, history_id } = request.body;
  try {
    const public_id = request.params.id;

    const prisma = request.server.prisma;

    const bot = await prisma.bot.findFirst({
      where: {
        publicId: public_id,
      },
    });

    if (!bot) {
      return {
        bot: {
          text: "You are in the wrong place, buddy.",
          sourceDocuments: [],
        },
        history: [
          ...history,
          {
            type: "human",
            text: message,
          },
          {
            type: "ai",
            text: "You are in the wrong place, buddy.",
          },
        ],
      };
    }

    if (bot.bot_protect) {
      if (!request.session.get("is_bot_allowed")) {
        return {
          bot: {
            text: "You are not allowed to chat with this bot.",
            sourceDocuments: [],
          },
          history: [
            ...history,
            {
              type: "human",
              text: message,
            },
            {
              type: "ai",
              text: "You are not allowed to chat with this bot.",
            },
          ],
        };
      }
    }

    if (bot.publicBotPwdProtected) {
      const authorizationHeader = request.headers.authorization;
      if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
        return {
          bot: {
            text: "Invalid authorization header.",
            sourceDocuments: [],
          },
          history: [
            ...history,
            {
              type: "human",
              text: message,
            },
            {
              type: "ai",
              text: "Invalid authorization header.",
            },
          ],
        };
      }
      const token = authorizationHeader.split(" ")[1];

      const verify = await jwtBotVerify(token);

      if (!verify) {
        return {
          bot: {
            text: "Invalid authorization token.",
            sourceDocuments: [],
          },
          history: [
            ...history,
            {
              type: "human",
              text: message,
            },
            {
              type: "ai",
              text: "Invalid authorization token.",
            },
          ],
        };
      }

      if (verify.botId !== bot.publicId) {
        return {
          bot: {
            text: "Invalid authorization token.",
            sourceDocuments: [],
          },
          history: [
            ...history,
            {
              type: "human",
              text: message,
            },
            {
              type: "ai",
              text: "Invalid authorization token.",
            },
          ],
        };
      }
    }

    // Credit Check
    const userCredit = await prisma.userCredit.findUnique({
      where: { user_id: bot.user_id },
    });

    if (!userCredit || userCredit.balance.lessThan(0)) {
      return {
        bot: {
          text: "Insufficient credits. Please contact the administrator.",
          sourceDocuments: [],
        },
        history: [
          ...history,
          {
            type: "human",
            text: message,
          },
          {
            type: "ai",
            text: "Insufficient credits. Please contact the administrator.",
          },
        ],
      };
    }

    const temperature = bot.temperature;

    const sanitizedQuestion = message.trim().replaceAll("\n", " ");
    const embeddingInfo = await getModelInfo({
      model: bot.embedding,
      prisma,
      type: "embedding",
    });

    if (!embeddingInfo) {
      return {
        bot: {
          text: "There was an error processing your request.",
          sourceDocuments: [],
        },
        history: [
          ...history,
          {
            type: "human",
            text: message,
          },
          {
            type: "ai",
            text: "There was an error processing your request.",
          },
        ],
      };
    }

    const embeddingModel = embeddings(
      embeddingInfo.model_provider!.toLowerCase(),
      embeddingInfo.model_id,
      embeddingInfo?.config
    );
    let retriever: BaseRetriever;
    let resolveWithDocuments: (value: Document[]) => void;
    const documentPromise = new Promise<Document[]>((resolve) => {
      resolveWithDocuments = resolve;
    });
    if (bot.use_hybrid_search) {
      retriever = new DialoqbaseHybridRetrival(embeddingModel, {
        botId: bot.id,
        sourceId: null,
        callbacks: [
          {
            handleRetrieverEnd(documents) {
              resolveWithDocuments(documents);
            },
          },
        ],
      });
    } else {
      const vectorstore = await DialoqbaseVectorStore.fromExistingIndex(
        embeddingModel,
        {
          botId: bot.id,
          sourceId: null,
        }
      );

      retriever = vectorstore.asRetriever({
        callbacks: [
          {
            handleRetrieverEnd(documents) {
              resolveWithDocuments(documents);
            },
          },
        ],
      });
    }

    const modelinfo = await getModelInfo({
      model: bot.model,
      prisma,
      type: "chat",
    });

    if (!modelinfo) {
      return {
        bot: {
          text: "There was an error processing your request.",
          sourceDocuments: [],
        },
        history: [
          ...history,
          {
            type: "human",
            text: message,
          },
          {
            type: "ai",
            text: "There was an error processing your request.",
          },
        ],
      };
    }

    const botConfig: any = (modelinfo.config as {}) || {};
    if (bot.provider.toLowerCase() === "openai") {
      if (bot.bot_model_api_key && bot.bot_model_api_key.trim() !== "") {
        botConfig.configuration = {
          apiKey: bot.bot_model_api_key,
        };
      }
    }

    const model = chatModelProvider(bot.provider, bot.model, temperature, {
      ...botConfig,
    });

    const chain = createChain({
      llm: model,
      question_llm: model,
      question_template: bot.questionGeneratorPrompt,
      response_template: bot.qaPrompt,
      retriever,
    });

    const botResponse = await chain.invoke({
      question: sanitizedQuestion,
      chat_history: groupMessagesByConversation(
        history.map((message) => ({
          type: message.type,
          content: message.text,
        }))
      ),
    });

    const documents = await documentPromise;

    const chatId = await prisma.botWebHistory.create({
      data: {
        chat_id: history_id,
        bot_id: bot.id,
        bot: botResponse,
        human: message,
        metadata: {
          ip: request?.ip,
          user_agent: request?.headers["user-agent"],
        },
        sources: documents.map((doc) => {
          return {
            ...doc,
          };
        }),
      },
    });

    // Calculate and Deduct Credits
    try {
      const inputTextField = history.map((h: any) => h.text).join(" ") + " " + message;
      const inputTokens = countTokens(inputTextField);
      const outputTokens = countTokens(botResponse);

      const pricing = MODEL_PRICING[bot.model] || MODEL_PRICING["default"];
      const cost =
        (pricing.input * inputTokens) / 1000000 +
        (pricing.output * outputTokens) / 1000000 +
        (pricing.request || 0);

      await request.server.prisma.userCredit.update({
        where: { user_id: bot.user_id },
        data: {
          balance: {
            decrement: cost
          }
        }
      });
    } catch (err) {
      console.error("Failed to deduct credits in public chat", err);
    }

    return {
      bot: {
        chat_id: chatId.id,
        text: botResponse,
        sourceDocuments: documents,
      },
      history: [
        ...history,
        {
          type: "human",
          text: message,
        },
        {
          type: "ai",
          text: botResponse,
        },
      ],
    };
  } catch (e) {
    return {
      bot: {
        text: "There was an error processing your request.",
        sourceDocuments: [],
      },
      history: [
        ...history,
        {
          type: "human",
          text: message,
        },
        {
          type: "ai",
          text: "There was an error processing your request.",
        },
      ],
    };
  }
};

export const chatRequestStreamHandler = async (
  request: FastifyRequest<ChatRequestBody>,
  reply: FastifyReply
) => {
  const { message, history, history_id } = request.body;

  try {
    const public_id = request.params.id;
    // get user meta info from request
    // const meta = request.headers["user-agent"];
    // ip address

    // const history = JSON.parse(chatHistory) as {
    //   type: string;
    //   text: string;
    // }[];

    const prisma = request.server.prisma;

    const bot = await prisma.bot.findFirst({
      where: {
        publicId: public_id,
      },
    });

    if (!bot) {
      return {
        bot: {
          text: "You are in the wrong place, buddy.",
          sourceDocuments: [],
        },
        history: [
          ...history,
          {
            type: "human",
            text: message,
          },
          {
            type: "ai",
            text: "You are in the wrong place, buddy.",
          },
        ],
      };
    }

    // Credit Check
    const userCredit = await prisma.userCredit.findUnique({
      where: { user_id: bot.user_id },
    });

    if (!userCredit || userCredit.balance.lessThan(0)) {
      reply.raw.setHeader("Content-Type", "text/event-stream");

      reply.sse({
        event: "result",
        id: "",
        data: JSON.stringify({
          bot: {
            text: "Insufficient credits. Please contact the administrator.",
            sourceDocuments: [],
          },
          history: [
            ...history,
            {
              type: "human",
              text: message,
            },
            {
              type: "ai",
              text: "Insufficient credits. Please contact the administrator.",
            },
          ],
        }),
      });
      await nextTick();

      return reply.raw.end();
    }

    if (bot.bot_protect) {
      if (!request.session.get("is_bot_allowed")) {
        reply.raw.setHeader("Content-Type", "text/event-stream");

        reply.sse({
          event: "result",
          id: "",
          data: JSON.stringify({
            bot: {
              text: "You are not allowed to chat with this bot.",
              sourceDocuments: [],
            },
            history: [
              ...history,
              {
                type: "human",
                text: message,
              },
              {
                type: "ai",
                text: "You are not allowed to chat with this bot.",
              },
            ],
          }),
        });

        await nextTick();

        return reply.raw.end();
      }
    }

    if (bot.publicBotPwdProtected) {
      const authorizationHeader = request.headers.authorization;
      if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
        reply.raw.setHeader("Content-Type", "text/event-stream");

        reply.sse({
          event: "result",
          id: "",
          data: JSON.stringify({
            bot: {
              text: "Invalid authorization header.",
              sourceDocuments: [],
            },
            history: [
              ...history,
              {
                type: "human",
                text: message,
              },
              {
                type: "ai",
                text: "Invalid authorization header.",
              },
            ],
          }),
        });
        await nextTick();

        return reply.raw.end();
      }
      const token = authorizationHeader.split(" ")[1];

      const verify = await jwtBotVerify(token);

      if (!verify) {
        reply.raw.setHeader("Content-Type", "text/event-stream");

        reply.sse({
          event: "result",
          id: "",
          data: JSON.stringify({
            bot: {
              text: "Invalid authorization token.",
              sourceDocuments: [],
            },
            history: [
              ...history,
              {
                type: "human",
                text: message,
              },
              {
                type: "ai",
                text: "Invalid authorization token.",
              },
            ],
          }),
        });
        await nextTick();

        return reply.raw.end();
      }

      if (verify.botId !== bot.publicId) {
        reply.raw.setHeader("Content-Type", "text/event-stream");

        reply.sse({
          event: "result",
          id: "",
          data: JSON.stringify({
            bot: {
              text: "Invalid authorization token.",
              sourceDocuments: [],
            },
            history: [
              ...history,
              {
                type: "human",
                text: message,
              },
              {
                type: "ai",
                text: "Invalid authorization token.",
              },
            ],
          }),
        });
        await nextTick();

        return reply.raw.end();
      }
    }

    const temperature = bot.temperature;

    const sanitizedQuestion = message.trim().replaceAll("\n", " ");
    const embeddingInfo = await getModelInfo({
      model: bot.embedding,
      prisma,
      type: "embedding",
    });

    if (!embeddingInfo) {
      return {
        bot: {
          text: "There was an error processing your request.",
          sourceDocuments: [],
        },
        history: [
          ...history,
          {
            type: "human",
            text: message,
          },
          {
            type: "ai",
            text: "There was an error processing your request.",
          },
        ],
      };
    }

    const embeddingModel = embeddings(
      embeddingInfo.model_provider!.toLowerCase(),
      embeddingInfo.model_id,
      embeddingInfo?.config
    );

    let retriever: BaseRetriever;
    let resolveWithDocuments: (value: Document[]) => void;
    const documentPromise = new Promise<Document[]>((resolve) => {
      resolveWithDocuments = resolve;
    });
    if (bot.use_hybrid_search) {
      retriever = new DialoqbaseHybridRetrival(embeddingModel, {
        botId: bot.id,
        sourceId: null,
        callbacks: [
          {
            handleRetrieverEnd(documents) {
              resolveWithDocuments(documents);
            },
          },
        ],
      });
    } else {
      const vectorstore = await DialoqbaseVectorStore.fromExistingIndex(
        embeddingModel,
        {
          botId: bot.id,
          sourceId: null,
        }
      );

      retriever = vectorstore.asRetriever({
        callbacks: [
          {
            handleRetrieverEnd(documents) {
              resolveWithDocuments(documents);
            },
          },
        ],
      });
    }

    reply.raw.on("close", () => {
      console.log("closed");
    });

    const modelinfo = await getModelInfo({
      model: bot.model,
      prisma,
      type: "chat",
    });

    if (!modelinfo) {
      reply.raw.setHeader("Content-Type", "text/event-stream");

      reply.sse({
        event: "result",
        id: "",
        data: JSON.stringify({
          bot: {
            text: "There was an error processing your request.",
            sourceDocuments: [],
          },
          history: [
            ...history,
            {
              type: "human",
              text: message,
            },
            {
              type: "ai",
              text: "There was an error processing your request.",
            },
          ],
        }),
      });
      await nextTick();

      return reply.raw.end();
    }

    const botConfig: any = (modelinfo.config as {}) || {};
    if (bot.provider.toLowerCase() === "openai") {
      if (bot.bot_model_api_key && bot.bot_model_api_key.trim() !== "") {
        botConfig.configuration = {
          apiKey: bot.bot_model_api_key,
        };
      }
    }

    const streamedModel = chatModelProvider(
      bot.provider,
      bot.model,
      temperature,
      {
        streaming: true,
        callbacks: [
          {
            handleLLMNewToken(token: string) {
              // if (token !== '[DONE]') {
              // console.log(token);
              return reply.sse({
                id: "",
                event: "chunk",
                data: JSON.stringify({
                  message: token || "",
                }),
              });
              // } else {
              // console.log("done");
              // }
            },
          },
        ],
        ...botConfig,
      }
    );

    const nonStreamingModel = chatModelProvider(
      bot.provider,
      bot.model,
      temperature,
      {
        streaming: false,
        ...botConfig,
      }
    );

    const chain = createChain({
      llm: streamedModel,
      question_llm: nonStreamingModel,
      question_template: bot.questionGeneratorPrompt,
      response_template: bot.qaPrompt,
      retriever,
    });

    let response = await chain.invoke({
      question: sanitizedQuestion,
      chat_history: groupMessagesByConversation(
        history.map((message) => ({
          type: message.type,
          content: message.text,
        }))
      ),
    });

    const documents = await documentPromise;

    const chatId = await prisma.botWebHistory.create({
      data: {
        chat_id: history_id,
        bot_id: bot.id,
        bot: response,
        human: message,
        metadata: {
          ip: request?.ip,
          user_agent: request?.headers["user-agent"],
        },
        sources: documents.map((doc) => {
          return {
            ...doc,
          };
        }),
      },
    });

    // Calculate and Deduct Credits
    try {
      const inputTextField = history.map((h: any) => h.text).join(" ") + " " + message;
      const inputTokens = await countTokens(inputTextField);
      const outputTokens = await countTokens(response);

      const pricing = MODEL_PRICING[bot.model] || MODEL_PRICING["default"];
      const cost =
        (pricing.input * inputTokens) / 1000000 +
        (pricing.output * outputTokens) / 1000000 +
        (pricing.request || 0);

      await request.server.prisma.userCredit.update({
        where: { user_id: bot.user_id },
        data: {
          balance: {
            decrement: cost
          }
        }
      });
    } catch (err) {
      console.error("Failed to deduct credits in public stream", err);
    }

    reply.sse({
      event: "result",
      id: "",
      data: JSON.stringify({
        bot: {
          chat_id: chatId.id,
          text: response,
          sourceDocuments: documents,
        },
        history: [
          ...history,
          {
            type: "human",
            text: message,
          },
          {
            type: "ai",
            text: response,
          },
        ],
      }),
    });
    await nextTick();
    return reply.raw.end();
  } catch (e) {
    console.log(e);
    reply.raw.setHeader("Content-Type", "text/event-stream");

    reply.sse({
      event: "result",
      id: "",
      data: JSON.stringify({
        bot: {
          text: "There was an error processing your request.",
          sourceDocuments: [],
        },
        history: [
          ...history,
          {
            type: "human",
            text: message,
          },
          {
            type: "ai",
            text: "There was an error processing your request.",
          },
        ],
      }),
    });
    await nextTick();

    return reply.raw.end();
  }
};
