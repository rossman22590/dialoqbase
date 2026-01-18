import { PrismaClient } from "@prisma/client";
import { getSettings } from "../utils/common";
import { queue } from "../queue/q";
const prisma = new PrismaClient();

async function processDatasourceCron() {
    try {
        await prisma.$connect();
        const setting = await getSettings(prisma);

        if (!setting.refetchDatasource) {
            return;
        }

        console.log("[CRON] Processing datasource cron");


        const dataSources = await prisma.botSource.findMany({
            where: {
                bot: {
                    autoSyncDataSources: true
                },
                type: {
                    in: [
                        "website",
                        "crawl",
                        "sitemap",
                    ]
                }
            },
            include: {
                bot: true
            }
        })

        for (const dataSource of dataSources) {

            await prisma.botDocument.deleteMany({
                where: {
                    botId: dataSource.botId,
                    sourceId: dataSource.id,
                },
            });
            await queue.add(
                "process",
                [
                    {
                        ...dataSource,
                        embedding: dataSource.bot.embedding,
                    },
                ],
                {
                    jobId: dataSource.id,
                    removeOnComplete: true,
                    removeOnFail: true,
                }
            );
        }


        console.log("[CRON] Finished processing datasource cron");

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

async function autoAddMonthlyCredits() {
    try {
        await prisma.$connect();
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        console.log("[CRON] Checking for monthly credits");

        const users = await prisma.user.findMany({
            where: {
                isSuspended: false,
            }
        });

        for (const user of users) {
            const existing = await prisma.userTransaction.findFirst({
                where: {
                    user_id: user.user_id,
                    type: "monthly_allowance",
                    createdAt: {
                        gte: startOfMonth
                    }
                }
            });

            if (!existing) {
                await prisma.$transaction([
                    prisma.userCredit.upsert({
                        where: {
                            user_id: user.user_id,
                        },
                        update: {
                            balance: {
                                increment: 20,
                            },
                        },
                        create: {
                            user_id: user.user_id,
                            balance: 20,
                        },
                    }),
                    prisma.userTransaction.create({
                        data: {
                            user_id: user.user_id,
                            amount: 20.00,
                            type: "monthly_allowance",
                            description: "Monthly Credit Allowance"
                        }
                    })
                ]);
                console.log(`[CRON] Added 20 credits to user ${user.user_id}`);
            }
        }

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}


export { processDatasourceCron, autoAddMonthlyCredits }; 