import { FastifyPluginAsync } from "fastify";
import {
  chatRequestHandler,
  chatRequestStreamHandler,
  getChatStyleByIdHandler,
  chatRequestAPIHandler,
  chatTTSHandler,
  botLoginHandler,
} from "../../handlers/bot";
import {
  chatRequestSchema,
  chatRequestStreamSchema,
  chatStyleSchema,
  chatAPIRequestSchema,
  chatTTSSchema,
  chatLoginSchema,
} from "../../schema/bot";
import { frameAncestorsPolicy } from "../../utils/allowed-domains";

const root: FastifyPluginAsync = async (fastify, _): Promise<void> => {
  fastify.post(
    "/:id",
    {
      schema: chatRequestSchema,
    },
    chatRequestHandler
  );

  fastify.post(
    "/:id/stream",
    {
      schema: chatRequestStreamSchema,
      logLevel: "silent",
    },
    chatRequestStreamHandler
  );

  fastify.get(
    "/:id/style",
    {
      schema: chatStyleSchema,
    },
    getChatStyleByIdHandler
  );
  fastify.post(
    "/:id/tts",
    {
      schema: chatTTSSchema,
    },
    chatTTSHandler
  );
  fastify.post(
    "/:id/api",
    {
      schema: chatAPIRequestSchema,
    },
    chatRequestAPIHandler
  );

  fastify.post(
    "/:id/login",
    {
      schema: chatLoginSchema,
    },
    botLoginHandler
  );

  fastify.get(
    "/:id",
    {
      schema: {
        tags: ["Widget"],
        summary: "Get widget",
        hide: true,
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: {
              type: "string",
            },
          },
        },
      },
    },
    async (request, reply) => {
      // Only the bot's "Allowed sites" may show this page in an iframe.
      const { id } = request.params as { id: string };
      try {
        const bot = await fastify.prisma.bot.findFirst({
          where: { publicId: id },
          select: { allowedDomains: true },
        });
        const policy = frameAncestorsPolicy(bot?.allowedDomains);
        if (policy) {
          reply.header("Content-Security-Policy", policy);
        }
      } catch (err) {
        request.log.error(err, "Failed to load allowed sites for bot page");
      }
      return reply.sendFile("bot.html");
    }
  );
};

export default root;
