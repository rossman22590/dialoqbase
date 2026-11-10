import { FastifyReply, FastifyRequest } from "fastify";

import { GetBotRequestById, GetDatasourceByBotId } from "./types";
import { getSettings } from "../../../../../utils/common";
import { getAllOllamaModels } from "../../../../../utils/ollama";

export const getBotByIdEmbeddingsHandler = async (
  request: FastifyRequest<GetBotRequestById>,
  reply: FastifyReply
) => {
  const prisma = request.server.prisma;
  const id = request.params.id;

  const bot = await prisma.bot.findFirst({
    where: {
      id,
      user_id: request.user?.is_admin ? undefined : request.user?.user_id,
    },
  });

  if (!bot) {
    return reply.status(404).send({
      message: "Bot not found",
    });
  }

  const source = await prisma.botSource.count({
    where: {
      botId: id,
      isPending: true,
    },
  });

  return {
    inProgress: source > 0,
    public_id: bot.publicId,
  };
};

export const getDatasourceByBotId = async (
  request: FastifyRequest<GetDatasourceByBotId>,
  reply: FastifyReply
) => {
  const prisma = request.server.prisma;
  const id = request.params.id;
  const { limit, page } = request.query;
  const skip = (page - 1) * limit;
  const search = request.query.search;

  const bot = await prisma.bot.findFirst({
    where: {
      id,
      user_id: request.user?.user_id,
    },
  });

  if (!bot) {
    return reply.status(404).send({
      message: "Bot not found",
    });
  }
  const [sources, totalCount] = await Promise.all([
    prisma.botSource.findMany({
      where: {
        botId: id,
        type: {
          notIn: ["crawl", "sitemap", "zip"],
        },
        OR: search
          ? [
            {
              content: search,
            },
          ]
          : undefined,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
      include: {
        document: true,
      },
    }),
    prisma.botSource.count({
      where: {
        botId: id,
        type: {
          notIn: ["crawl", "sitemap", "zip"],
        },
        OR: search
          ? [
            {
              content: search,
            },
          ]
          : undefined,
      },
    }),
  ]);

  return {
    data: sources,
    total: totalCount,
    next: page * limit < totalCount ? page + 1 : null,
    prev: page > 1 ? page - 1 : null,
  };
};

export const getBotByIdHandler = async (
  request: FastifyRequest<GetBotRequestById>,
  reply: FastifyReply
) => {
  const prisma = request.server.prisma;
  const id = request.params.id;

  const bot = await prisma.bot.findFirst({
    where: {
      id,
      user_id: request.user?.is_admin ? undefined : request.user?.user_id,
    },
  });

  if (!bot) {
    return reply.status(404).send({
      message: "Bot not found",
    });
  }
  return {
    data: bot,
  };
};

export const getAllBotsHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const prisma = request.server.prisma;
  const bots = await prisma.bot.findMany({
    where: {
      user_id: request.user?.user_id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      source: {
        distinct: ["type"],
        select: {
          type: true,
        },
      },
    },
  });

  if (bots.length === 0) {
    return bots;
  }

  // Activity for the dashboard cards: chats in the last 7 days and when the
  // bot last answered, across web, playground, WhatsApp and API.
  // (Telegram and Discord history isn't stored per bot, so it isn't counted.)
  try {
    const ids = bots.map((b) => b.id);
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [webChats, webLast, playChats, playLast, waChats, waLast, apiRecent, apiLast] =
      await Promise.all([
        prisma.botWebHistory.groupBy({
          by: ["bot_id", "chat_id"],
          where: { bot_id: { in: ids }, createdAt: { gte: since } },
        }),
        prisma.botWebHistory.groupBy({
          by: ["bot_id"],
          where: { bot_id: { in: ids } },
          _max: { createdAt: true },
        }),
        prisma.botPlayground.groupBy({
          by: ["botId"],
          where: { botId: { in: ids }, createdAt: { gte: since } },
          _count: { _all: true },
        }),
        prisma.$queryRaw<{ botId: string; last: Date | null }[]>`
          SELECT bp."botId" AS "botId", MAX(m."createdAt") AS "last"
          FROM "BotPlaygroundMessage" m
          JOIN "BotPlayground" bp ON bp."id" = m."botPlaygroundId"
          WHERE bp."botId" = ANY(${ids})
          GROUP BY bp."botId"`,
        prisma.botWhatsappHistory.groupBy({
          by: ["bot_id", "chat_id"],
          where: { bot_id: { in: ids }, createdAt: { gte: since } },
        }),
        prisma.botWhatsappHistory.groupBy({
          by: ["bot_id"],
          where: { bot_id: { in: ids } },
          _max: { createdAt: true },
        }),
        prisma.botApiHistory.groupBy({
          by: ["bot_id"],
          where: { bot_id: { in: ids }, createdAt: { gte: since } },
          _count: { _all: true },
        }),
        prisma.botApiHistory.groupBy({
          by: ["bot_id"],
          where: { bot_id: { in: ids } },
          _max: { createdAt: true },
        }),
      ]);

    const chats = new Map<string, number>();
    const last = new Map<string, Date>();
    const addChats = (id: string | null | undefined, n: number) => {
      if (!id) return;
      chats.set(id, (chats.get(id) || 0) + n);
    };
    const touch = (id: string | null | undefined, at: Date | null | undefined) => {
      if (!id || !at) return;
      const prev = last.get(id);
      if (!prev || at > prev) last.set(id, new Date(at));
    };

    webChats.forEach((r) => addChats(r.bot_id, 1));
    waChats.forEach((r) => addChats(r.bot_id, 1));
    playChats.forEach((r) => addChats(r.botId, r._count._all));
    apiRecent.forEach((r) => addChats(r.bot_id, r._count._all));
    webLast.forEach((r) => touch(r.bot_id, r._max.createdAt));
    waLast.forEach((r) => touch(r.bot_id, r._max.createdAt));
    apiLast.forEach((r) => touch(r.bot_id, r._max.createdAt));
    playLast.forEach((r) => touch(r.botId, r.last));

    return bots.map((bot) => ({
      ...bot,
      chats_7d: chats.get(bot.id) || 0,
      last_active_at: last.get(bot.id) || null,
    }));
  } catch (err) {
    // Activity is a nice-to-have; never fail the bot list over it.
    request.log.error(err, "Failed to load bot activity");
    return bots;
  }
};

export const getCreateBotConfigHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const prisma = request.server.prisma;
  const settings = await getSettings(prisma);

  const not_to_hide_providers = settings?.hideDefaultModels
    ? ["Local", "local", "ollama", "transformer", "Transformer"]
    : undefined;
  const models = await prisma.dialoqbaseModels.findMany({
    where: {
      hide: false,
      deleted: false,
      model_provider: {
        in: not_to_hide_providers,
      },
    },
  });

  const chatModel = models
    .filter((model) => model.model_type !== "embedding")
    .map((model) => {
      return {
        label: model.name || model.model_id,
        value: model.model_id,
        stream: model.stream_available,
      };
    });

  const embeddingModel = models
    .filter((model) => model.model_type === "embedding")
    .map((model) => {
      return {
        label: `${model.name || model.model_id} ${model.model_id === "dialoqbase_eb_dialoqbase-ollama"
          ? "(Deprecated)"
          : ""
          }`,
        value: model.model_id,
        disabled: model.model_id === "dialoqbase_eb_dialoqbase-ollama",
      };
    });
  if (settings?.dynamicallyFetchOllamaModels) {
    const ollamaModels = await getAllOllamaModels(settings.ollamaURL);
    chatModel.push(
      ...ollamaModels?.filter((model) => {
        return (
          !model?.details?.families?.includes("bert") &&
          !model?.details?.families?.includes("nomic-bert")
        );
      })
    );
    embeddingModel.push(
      ...ollamaModels.map((model) => ({ ...model, disabled: false }))
    );
  }

  return {
    chatModel,
    embeddingModel,
    defaultChatModel: settings?.defaultChatModel,
    defaultEmbeddingModel: settings?.defaultEmbeddingModel,
    fileUploadSizeLimit: settings?.fileUploadSizeLimit,
  };
};

export const getBotByIdSettingsHandler = async (
  request: FastifyRequest<GetBotRequestById>,
  reply: FastifyReply
) => {
  const prisma = request.server.prisma;
  const id = request.params.id;

  const bot = await prisma.bot.findFirst({
    where: {
      id,
      user_id: request.user?.is_admin ? undefined : request.user?.user_id,
    },
  });
  if (!bot) {
    return reply.status(404).send({
      message: "Bot not found",
    });
  }
  const settings = await getSettings(prisma);

  const not_to_hide_providers = settings?.hideDefaultModels
    ? ["Local", "local", "ollama", "transformer", "Transformer"]
    : undefined;
  const models = await prisma.dialoqbaseModels.findMany({
    where: {
      hide: false,
      deleted: false,
      model_provider: {
        in: not_to_hide_providers,
      },
    },
  });

  const chatModel = models
    .filter((model) => model.model_type !== "embedding")
    .map((model) => {
      return {
        label: model.name || model.model_id,
        value: model.model_id,
        stream: model.stream_available,
      };
    });

  const embeddingModel = models
    .filter((model) => model.model_type === "embedding")
    .map((model) => {
      return {
        label: `${model.name || model.model_id} ${model.model_id === "dialoqbase_eb_dialoqbase-ollama"
          ? "(Deprecated)"
          : ""
          }`,
        value: model.model_id,
        disabled: model.model_id === "dialoqbase_eb_dialoqbase-ollama",
      };
    });
  if (settings?.dynamicallyFetchOllamaModels) {
    const ollamaModels = await getAllOllamaModels(settings.ollamaURL);
    chatModel.push(
      ...ollamaModels?.filter((model) => {
        return (
          !model?.details?.families?.includes("bert") &&
          !model?.details?.families?.includes("nomic-bert")
        );
      })
    );
    embeddingModel.push(
      ...ollamaModels.map((model) => ({ ...model, disabled: false }))
    );
  }
  return {
    data: bot,
    chatModel,
    embeddingModel,
  };
};

export const isBotReadyHandler = async (
  request: FastifyRequest<GetBotRequestById>,
  reply: FastifyReply
) => {
  const prisma = request.server.prisma;
  const id = request.params.id;

  const bot = await prisma.bot.findFirst({
    where: {
      id,
      user_id: request.user?.is_admin ? undefined : request.user?.user_id,
    },
  });

  if (!bot) {
    return reply.status(404).send({
      message: "Bot not found",
    });
  }

  const source = await prisma.botSource.count({
    where: {
      botId: id,
      isPending: true,
    },
  });

  return {
    is_ready: source === 0,
  };
};
