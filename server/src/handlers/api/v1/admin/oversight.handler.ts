import { FastifyReply, FastifyRequest } from "fastify";
import { Prisma } from "@prisma/client";

// Admin-only oversight endpoints. Every route here is registered with
// fastify.authenticateAdmin, so request.user is always an administrator.

type Query = Record<string, string | undefined>;

const num = (value: any) => Number(value ?? 0);

const pageParams = (query: Query, defaultSize = 25) => {
  const page = Math.max(1, parseInt(query.page || "1", 10) || 1);
  const pageSize = Math.min(
    200,
    Math.max(1, parseInt(query.pageSize || `${defaultSize}`, 10) || defaultSize)
  );
  return { page, pageSize, skip: (page - 1) * pageSize };
};

const sinceDays = (query: Query) => {
  const days = Math.min(365, Math.max(1, parseInt(query.days || "30", 10) || 30));
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));
  return { days, since };
};

export const adminOverviewHandler = async (
  request: FastifyRequest,
  _reply: FastifyReply
) => {
  const prisma = request.server.prisma;
  const { days, since } = sinceDays((request.query as Query));

  const [users, suspendedUsers, admins, bots, creditBalance, usageRows, grantRows, series] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isSuspended: true } }),
      prisma.user.count({ where: { isAdministrator: true } }),
      prisma.bot.count(),
      prisma.userCredit.aggregate({ _sum: { balance: true } }),
      prisma.$queryRaw<any[]>`
        SELECT COUNT(*) AS messages,
               COALESCE(SUM(-amount), 0) AS credits_used,
               COALESCE(SUM((metadata->>'provider_cost_usd')::float), 0) AS provider_cost_usd,
               COUNT(DISTINCT user_id) AS active_users,
               COUNT(DISTINCT metadata->>'bot_id') AS active_bots
        FROM "UserTransaction"
        WHERE type = 'usage' AND "createdAt" >= ${since}`,
      prisma.$queryRaw<any[]>`
        SELECT type, COALESCE(SUM(amount), 0) AS credits
        FROM "UserTransaction"
        WHERE type <> 'usage' AND "createdAt" >= ${since}
        GROUP BY type`,
      prisma.$queryRaw<any[]>`
        SELECT date_trunc('day', "createdAt") AS day,
               COUNT(*) AS messages,
               COALESCE(SUM(-amount), 0) AS credits_used,
               COALESCE(SUM((metadata->>'provider_cost_usd')::float), 0) AS provider_cost_usd
        FROM "UserTransaction"
        WHERE type = 'usage' AND "createdAt" >= ${since}
        GROUP BY day
        ORDER BY day`,
    ]);

  const usage = usageRows[0] || {};
  return {
    days,
    users,
    suspended_users: suspendedUsers,
    admins,
    bots,
    credits_outstanding: num(creditBalance._sum.balance),
    messages: num(usage.messages),
    credits_used: num(usage.credits_used),
    provider_cost_usd: num(usage.provider_cost_usd),
    active_users: num(usage.active_users),
    active_bots: num(usage.active_bots),
    credits_granted: grantRows.map((row) => ({
      type: row.type,
      credits: num(row.credits),
    })),
    series: series.map((row) => ({
      day: row.day,
      messages: num(row.messages),
      credits_used: num(row.credits_used),
      provider_cost_usd: num(row.provider_cost_usd),
    })),
  };
};

export const adminUsageHandler = async (
  request: FastifyRequest,
  _reply: FastifyReply
) => {
  const prisma = request.server.prisma;
  const { days, since } = sinceDays((request.query as Query));

  const usageColumns = Prisma.sql`
    COUNT(*) AS messages,
    COALESCE(SUM(-t.amount), 0) AS credits_used,
    COALESCE(SUM((t.metadata->>'provider_cost_usd')::float), 0) AS provider_cost_usd,
    COALESCE(SUM((t.metadata->>'input_tokens')::bigint), 0) AS input_tokens,
    COALESCE(SUM((t.metadata->>'output_tokens')::bigint), 0) AS output_tokens`;
  const usageWhere = Prisma.sql`t.type = 'usage' AND t."createdAt" >= ${since}`;

  const [byUser, byBot, byModel, bySource] = await Promise.all([
    prisma.$queryRaw<any[]>`
      SELECT t.user_id, u.username, u.email, ${usageColumns}
      FROM "UserTransaction" t
      JOIN "User" u ON u.user_id = t.user_id
      WHERE ${usageWhere}
      GROUP BY t.user_id, u.username, u.email
      ORDER BY credits_used DESC
      LIMIT 100`,
    prisma.$queryRaw<any[]>`
      SELECT t.metadata->>'bot_id' AS bot_id, b.name AS bot_name,
             u.username AS owner, ${usageColumns}
      FROM "UserTransaction" t
      LEFT JOIN "Bot" b ON b.id = t.metadata->>'bot_id'
      LEFT JOIN "User" u ON u.user_id = b.user_id
      WHERE ${usageWhere}
      GROUP BY t.metadata->>'bot_id', b.name, u.username
      ORDER BY credits_used DESC
      LIMIT 100`,
    // Older transactions did not record the model; fall back to the bot's current one
    prisma.$queryRaw<any[]>`
      SELECT COALESCE(t.metadata->>'model', b.model, 'unknown') AS model, ${usageColumns}
      FROM "UserTransaction" t
      LEFT JOIN "Bot" b ON b.id = t.metadata->>'bot_id'
      WHERE ${usageWhere}
      GROUP BY 1
      ORDER BY credits_used DESC`,
    prisma.$queryRaw<any[]>`
      SELECT COALESCE(t.metadata->>'source', 'unknown') AS source, ${usageColumns}
      FROM "UserTransaction" t
      WHERE ${usageWhere}
      GROUP BY 1
      ORDER BY credits_used DESC`,
  ]);

  const clean = (rows: any[]) =>
    rows.map((row) => ({
      ...row,
      user_id: row.user_id === undefined ? undefined : num(row.user_id),
      messages: num(row.messages),
      credits_used: num(row.credits_used),
      provider_cost_usd: num(row.provider_cost_usd),
      input_tokens: num(row.input_tokens),
      output_tokens: num(row.output_tokens),
    }));

  return {
    days,
    by_user: clean(byUser),
    by_bot: clean(byBot),
    by_model: clean(byModel),
    by_source: clean(bySource),
  };
};

export const adminUsersHandler = async (
  request: FastifyRequest,
  _reply: FastifyReply
) => {
  const prisma = request.server.prisma;
  const { page, pageSize, skip } = pageParams((request.query as Query));
  const search = (request.query as Query).search?.trim();
  const status = (request.query as Query).status;

  const where: Prisma.UserWhereInput = {
    ...(search
      ? {
          OR: [
            { username: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status === "suspended" ? { isSuspended: true } : {}),
    ...(status === "admin" ? { isAdministrator: true } : {}),
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: { credit: true, _count: { select: { bots: true } } },
    }),
  ]);

  const ids = users.map((user) => user.user_id);
  const since = sinceDays({ days: "30" }).since;
  const stats = ids.length
    ? await prisma.$queryRaw<any[]>`
        SELECT user_id,
               COUNT(*) FILTER (WHERE type = 'usage' AND "createdAt" >= ${since}) AS messages_30d,
               COALESCE(SUM(-amount) FILTER (WHERE type = 'usage' AND "createdAt" >= ${since}), 0) AS credits_used_30d,
               COALESCE(SUM(-amount) FILTER (WHERE type = 'usage'), 0) AS credits_used_total,
               MAX("createdAt") FILTER (WHERE type = 'usage') AS last_active
        FROM "UserTransaction"
        WHERE user_id IN (${Prisma.join(ids)})
        GROUP BY user_id`
    : [];
  const statsById = new Map(stats.map((row) => [num(row.user_id), row]));

  return {
    total,
    page,
    pageSize,
    data: users.map((user) => {
      const row = statsById.get(user.user_id) || {};
      return {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        is_admin: user.isAdministrator,
        is_suspended: user.isSuspended,
        createdAt: user.createdAt,
        bots: user._count.bots,
        balance: num(user.credit?.balance),
        messages_30d: num(row.messages_30d),
        credits_used_30d: num(row.credits_used_30d),
        credits_used_total: num(row.credits_used_total),
        last_active: row.last_active || null,
      };
    }),
  };
};

export const adminSetUserSuspendedHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const body = request.body as { user_id: number; suspended: boolean };
  const { user_id, suspended } = body;
  if (user_id === request.user.user_id) {
    return reply.status(400).send({ message: "You cannot suspend yourself" });
  }
  await request.server.prisma.user.update({
    where: { user_id },
    data: { isSuspended: suspended },
  });
  return { message: suspended ? "User suspended" : "User reactivated" };
};

export const adminSetUserAdminHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const body = request.body as { user_id: number; is_admin: boolean };
  const { user_id, is_admin } = body;
  if (user_id === request.user.user_id && !is_admin) {
    return reply.status(400).send({ message: "You cannot remove your own admin access" });
  }
  await request.server.prisma.user.update({
    where: { user_id },
    data: { isAdministrator: is_admin },
  });
  return { message: is_admin ? "User is now an admin" : "Admin access removed" };
};

export const adminBotsHandler = async (
  request: FastifyRequest,
  _reply: FastifyReply
) => {
  const prisma = request.server.prisma;
  const { page, pageSize, skip } = pageParams((request.query as Query));
  const search = (request.query as Query).search?.trim();
  const userId = (request.query as Query).user_id ? parseInt((request.query as Query).user_id, 10) : undefined;

  const where: Prisma.BotWhereInput = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { id: search },
            { publicId: search },
            { User: { username: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(userId ? { user_id: userId } : {}),
  };

  const [total, bots] = await Promise.all([
    prisma.bot.count({ where }),
    prisma.bot.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        User: { select: { user_id: true, username: true, email: true, isSuspended: true } },
        _count: { select: { source: true } },
      },
    }),
  ]);

  const ids = bots.map((bot) => bot.id);
  const since = sinceDays({ days: "30" }).since;
  const stats = ids.length
    ? await prisma.$queryRaw<any[]>`
        SELECT metadata->>'bot_id' AS bot_id,
               COUNT(*) FILTER (WHERE "createdAt" >= ${since}) AS messages_30d,
               COALESCE(SUM(-amount) FILTER (WHERE "createdAt" >= ${since}), 0) AS credits_used_30d,
               COUNT(*) AS messages_total,
               COALESCE(SUM(-amount), 0) AS credits_used_total,
               MAX("createdAt") AS last_used
        FROM "UserTransaction"
        WHERE type = 'usage' AND metadata->>'bot_id' IN (${Prisma.join(ids)})
        GROUP BY 1`
    : [];
  const statsById = new Map(stats.map((row) => [row.bot_id, row]));

  return {
    total,
    page,
    pageSize,
    data: bots.map((bot) => {
      const row = statsById.get(bot.id) || {};
      return {
        id: bot.id,
        publicId: bot.publicId,
        name: bot.name,
        model: bot.model,
        embedding: bot.embedding,
        createdAt: bot.createdAt,
        owner: bot.User,
        sources: bot._count.source,
        uses_own_key: Boolean(bot.bot_model_api_key?.trim()),
        messages_30d: num(row.messages_30d),
        credits_used_30d: num(row.credits_used_30d),
        messages_total: num(row.messages_total),
        credits_used_total: num(row.credits_used_total),
        last_used: row.last_used || null,
      };
    }),
  };
};

export const adminTransactionsHandler = async (
  request: FastifyRequest,
  _reply: FastifyReply
) => {
  const prisma = request.server.prisma;
  const { page, pageSize, skip } = pageParams((request.query as Query), 50);
  const { user_id, bot_id, type, search } = (request.query as Query);

  let botTransactionIds: string[] | undefined;
  if (bot_id) {
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "UserTransaction" WHERE metadata->>'bot_id' = ${bot_id}`;
    botTransactionIds = rows.map((row) => row.id);
  }

  const where: Prisma.UserTransactionWhereInput = {
    ...(user_id ? { user_id: parseInt(user_id, 10) } : {}),
    ...(type ? { type } : {}),
    ...(botTransactionIds ? { id: { in: botTransactionIds } } : {}),
    ...(search?.trim()
      ? {
          OR: [
            { description: { contains: search.trim(), mode: "insensitive" } },
            { User: { username: { contains: search.trim(), mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [total, transactions, types] = await Promise.all([
    prisma.userTransaction.count({ where }),
    prisma.userTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: { User: { select: { username: true, email: true } } },
    }),
    prisma.userTransaction.findMany({
      distinct: ["type"],
      select: { type: true },
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    types: types.map((row) => row.type),
    data: transactions.map((t) => ({
      id: t.id,
      user_id: t.user_id,
      username: t.User.username,
      email: t.User.email,
      amount: num(t.amount),
      type: t.type,
      description: t.description,
      metadata: t.metadata,
      createdAt: t.createdAt,
    })),
  };
};

const JOB_STATUSES = [
  "waiting",
  "active",
  "delayed",
  "prioritized",
  "completed",
  "failed",
  "paused",
  "waiting-children",
] as const;

export const adminQueueHandler = async (
  request: FastifyRequest,
  _reply: FastifyReply
) => {
  const queue = request.server.queue;
  const [counts, isPaused] = await Promise.all([
    queue.getJobCounts(...JOB_STATUSES),
    queue.isPaused(),
  ]);
  let workers: number | null = null;
  try {
    workers = (await queue.getWorkers()).length;
  } catch {
    // Redis may not allow CLIENT LIST
  }
  return { name: queue.name, counts, is_paused: isPaused, workers };
};

const summarizeJobData = (data: any) =>
  (Array.isArray(data) ? data : [data]).map((source: any) => ({
    source_id: source?.id,
    type: source?.type,
    bot_id: source?.botId,
    bot_name: source?.bot_name,
    user_id: source?.bot_user_id,
    content:
      typeof source?.content === "string" ? source.content.slice(0, 200) : undefined,
  }));

export const adminQueueJobsHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const queue = request.server.queue;
  const status = ((request.query as Query).status || "failed") as (typeof JOB_STATUSES)[number];
  if (!JOB_STATUSES.includes(status)) {
    return reply.status(400).send({ message: "Unknown job status" });
  }
  const { page, pageSize, skip } = pageParams((request.query as Query));
  const [jobs, counts] = await Promise.all([
    queue.getJobs([status], skip, skip + pageSize - 1, false),
    queue.getJobCounts(status),
  ]);
  return {
    total: counts[status] || 0,
    page,
    pageSize,
    data: jobs.filter(Boolean).map((job) => ({
      id: job.id,
      name: job.name,
      sources: summarizeJobData(job.data),
      attempts: job.attemptsMade,
      progress: job.progress,
      failed_reason: job.failedReason,
      stacktrace: (job.stacktrace || []).slice(0, 1),
      created_at: job.timestamp,
      processed_at: job.processedOn,
      finished_at: job.finishedOn,
    })),
  };
};

export const adminQueueJobActionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const body = request.body as { job_id: string; action: "retry" | "remove" };
  const { job_id, action } = body;
  const job = await request.server.queue.getJob(job_id);
  if (!job) {
    return reply.status(404).send({ message: "Job not found" });
  }
  if (action === "retry") {
    await job.retry();
  } else {
    await job.remove();
  }
  return { message: action === "retry" ? "Job queued for retry" : "Job removed" };
};

export const adminQueueActionHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const body = request.body as { action: "pause" | "resume" | "clean"; status?: "completed" | "failed" };
  const queue = request.server.queue;
  const { action, status } = body;
  if (action === "pause") {
    await queue.pause();
    return { message: "Queue paused" };
  }
  if (action === "resume") {
    await queue.resume();
    return { message: "Queue resumed" };
  }
  if (status !== "completed" && status !== "failed") {
    return reply.status(400).send({ message: "Only completed or failed jobs can be cleaned" });
  }
  const removed = await queue.clean(0, 10000, status);
  return { message: `Removed ${removed.length} ${status} jobs` };
};
