import { FastifyPluginAsync } from "fastify";

// Thumbs up/down on a playground answer. Only the bot's owner can rate it.
const root: FastifyPluginAsync = async (fastify, _): Promise<void> => {
  fastify.put(
    "/:message_id",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Bot", "Playground"],
        summary: "Rate a playground answer",
        params: {
          type: "object",
          required: ["message_id"],
          properties: { message_id: { type: "string" } },
        },
        body: {
          type: "object",
          required: ["feedback"],
          properties: {
            feedback: { type: ["string", "null"], enum: ["up", "down", null] },
          },
        },
      },
    },
    async (request, reply) => {
      const { message_id } = request.params as { message_id: string };
      const { feedback } = request.body as { feedback: "up" | "down" | null };

      const message = await fastify.prisma.botPlaygroundMessage.findFirst({
        where: {
          id: message_id,
          isBot: true,
          botPlayground: { Bot: { user_id: request.user.user_id } },
        },
        select: { id: true },
      });
      if (!message) {
        return reply.status(404).send({ message: "Message not found" });
      }

      const updated = await fastify.prisma.botPlaygroundMessage.update({
        where: { id: message.id },
        data: { feedback },
        select: { id: true, feedback: true },
      });
      return updated;
    }
  );
};

export default root;
