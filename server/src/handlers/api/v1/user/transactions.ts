
import { FastifyReply, FastifyRequest } from "fastify";

export const getUserTransactionsHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const user = request.user;
    const prisma = request.server.prisma;

    const transactions = await prisma.userTransaction.findMany({
        where: {
            user_id: user.user_id,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 50,
    });

    return transactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
    }));
};
