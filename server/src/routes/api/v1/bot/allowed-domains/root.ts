import { FastifyPluginAsync } from "fastify";
import {
  MAX_ALLOWED_DOMAINS,
  normalizeDomain,
} from "../../../../../utils/allowed-domains";

// "Allowed sites" for a bot's embed. Empty list = any site may embed it.
const root: FastifyPluginAsync = async (fastify, _): Promise<void> => {
  const params = {
    type: "object",
    required: ["bot_id"],
    properties: { bot_id: { type: "string" } },
  };

  fastify.get(
    "/:bot_id",
    {
      onRequest: [fastify.authenticate],
      schema: { tags: ["Bot"], summary: "Get sites allowed to embed a bot", params },
    },
    async (request, reply) => {
      const { bot_id } = request.params as { bot_id: string };
      const bot = await fastify.prisma.bot.findFirst({
        where: { id: bot_id, user_id: request.user.user_id },
        select: { allowedDomains: true },
      });
      if (!bot) {
        return reply.status(404).send({ message: "Bot not found" });
      }
      return { domains: bot.allowedDomains };
    }
  );

  fastify.put(
    "/:bot_id",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Bot"],
        summary: "Set sites allowed to embed a bot",
        params,
        body: {
          type: "object",
          required: ["domains"],
          properties: {
            domains: {
              type: "array",
              maxItems: MAX_ALLOWED_DOMAINS,
              items: { type: "string", maxLength: 300 },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { bot_id } = request.params as { bot_id: string };
      const { domains } = request.body as { domains: string[] };

      const bot = await fastify.prisma.bot.findFirst({
        where: { id: bot_id, user_id: request.user.user_id },
        select: { id: true },
      });
      if (!bot) {
        return reply.status(404).send({ message: "Bot not found" });
      }

      const cleaned: string[] = [];
      for (const raw of domains) {
        const domain = normalizeDomain(raw);
        if (!domain) {
          return reply
            .status(400)
            .send({ message: `"${raw}" isn't a valid domain` });
        }
        if (!cleaned.includes(domain)) cleaned.push(domain);
      }

      const updated = await fastify.prisma.bot.update({
        where: { id: bot.id },
        data: { allowedDomains: cleaned },
        select: { allowedDomains: true },
      });
      return { domains: updated.allowedDomains };
    }
  );
};

export default root;
