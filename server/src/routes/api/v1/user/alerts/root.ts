import { FastifyPluginAsync } from "fastify";

// Low-balance email settings for the signed-in user (Usage page).
const root: FastifyPluginAsync = async (fastify, _): Promise<void> => {
  fastify.get(
    "/",
    {
      onRequest: [fastify.authenticate],
      schema: { tags: ["User"], summary: "Get low-balance email settings" },
    },
    async (request) => {
      const user = await fastify.prisma.user.findUnique({
        where: { user_id: request.user.user_id },
        select: {
          email: true,
          lowBalanceEmailEnabled: true,
          lowBalanceThreshold: true,
        },
      });
      return {
        enabled: user?.lowBalanceEmailEnabled ?? false,
        threshold: Number(user?.lowBalanceThreshold ?? 1),
        has_email: Boolean(user?.email),
      };
    }
  );

  fastify.put(
    "/",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["User"],
        summary: "Update low-balance email settings",
        body: {
          type: "object",
          required: ["enabled", "threshold"],
          properties: {
            enabled: { type: "boolean" },
            threshold: { type: "number", minimum: 0, maximum: 100000 },
          },
        },
      },
    },
    async (request) => {
      const { enabled, threshold } = request.body as {
        enabled: boolean;
        threshold: number;
      };
      const user = await fastify.prisma.user.update({
        where: { user_id: request.user.user_id },
        data: {
          lowBalanceEmailEnabled: enabled,
          lowBalanceThreshold: threshold,
        },
        select: { lowBalanceEmailEnabled: true, lowBalanceThreshold: true },
      });
      return {
        enabled: user.lowBalanceEmailEnabled,
        threshold: Number(user.lowBalanceThreshold),
      };
    }
  );
};

export default root;
