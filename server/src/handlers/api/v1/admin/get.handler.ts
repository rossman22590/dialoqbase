import { FastifyReply, FastifyRequest } from "fastify";
import { getSettings } from "../../../../utils/common";

export const dialoqbaseSettingsHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const prisma = request.server.prisma;
  const user = request.user;

  if (!user.is_admin) {
    return reply.status(403).send({
      message: "Forbidden",
    });
  }

  const settings = await getSettings(prisma);

  if (!settings) {
    return reply.status(404).send({
      message: "Settings not found",
    });
  }
  return settings;
};

export const getAllUsersHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const prisma = request.server.prisma;
  const user = request.user;

  if (!user.is_admin) {
    return reply.status(403).send({
      message: "Forbidden",
    });
  }

  const users = await prisma.user.findMany({
    include: {
      _count: { select: { bots: true } },
      credit: { select: { balance: true } },
    },
  });

  return users.map(({ _count, credit, ...user }) => ({
    ...user,
    is_admin: user.isAdministrator,
    password: undefined,
    bots: _count.bots,
    // Credit balance in dollars; a user without a credit row has none
    balance: Number(credit?.balance ?? 0),
  }));
};
