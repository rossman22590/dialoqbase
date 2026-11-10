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

    // "total" is what the balance was right after the last time credits were
    // added (monthly allowance, top-up or admin adjustment), so the UI can show
    // "$X of $Y" and a meter. With no top-up on record it falls back to the
    // current balance plus everything spent.
    const lastTopUp = await prisma.userTransaction.findFirst({
        where: { user_id: user.user_id, amount: { gt: 0 } },
        orderBy: { createdAt: "desc" },
    });

    const spentSince = await prisma.userTransaction.aggregate({
        where: {
            user_id: user.user_id,
            amount: { lt: 0 },
            ...(lastTopUp ? { createdAt: { gte: lastTopUp.createdAt } } : {}),
        },
        _sum: { amount: true },
    });

    const spent = Math.abs(Number(spentSince._sum.amount || 0));
    const total = Math.max(balance + spent, balance, 0);

    return {
        balance: balance,
        total: total,
        last_top_up_at: lastTopUp ? lastTopUp.createdAt : null,
    };
};
