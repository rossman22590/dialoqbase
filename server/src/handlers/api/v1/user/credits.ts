import { FastifyReply, FastifyRequest } from "fastify";

export const getUserCreditsHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const user = request.user;
    const prisma = request.server.prisma;

    const userCredit = await prisma.userCredit.findUnique({
        where: {
            user_id: user.user_id,
        },
    });

    const balance = userCredit ? Number(userCredit.balance) : 0;

    return {
        balance: balance,
        total: balance, // Set budget to whatever they currently have
    };
};
