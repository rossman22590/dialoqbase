import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notification } from "antd";
import api from "../../services/api";
import { ReactNode, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Link, useParams } from "react-router-dom";
import { PageHeader, Skeleton } from "../../components/ui";
import { balanceState, formatBalance } from "../../Layout/AppHeader";

const BUY_CREDITS_URL = "https://buy.stripe.com/aFa00cg8kbx9g8G7YUgjC0t";
// /user/transactions returns at most this many rows, newest first.
const TRANSACTION_LIMIT = 50;

const CHANNEL_LABELS: Record<string, string> = {
    playground: "Playground",
    web: "Website widget",
    api: "API",
    "v1-api": "API",
    "openai-api": "OpenAI API",
    telegram: "Telegram",
    discord: "Discord",
    whatsapp: "WhatsApp",
};

const TYPE_LABELS: Record<string, string> = {
    monthly_allowance: "Monthly credits",
    admin_adjustment: "Admin adjustment",
    topup: "Top-up",
    top_up: "Top-up",
    purchase: "Top-up",
};

const channelOf = (t: any) => {
    const metadata = t.metadata || {};
    if (t.type !== "usage") {
        return (
            TYPE_LABELS[t.type] ||
            String(t.type || "Other").replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase())
        );
    }
    if (metadata.usage_kind === "embedding") return "Training";
    return CHANNEL_LABELS[metadata.source] || metadata.source || "Other";
};

const cleanModel = (model?: string) =>
    (model || "")
        .replace("-dbase", "")
        .replace(/^dialoqbase_eb_/, "")
        .replace(/_dialoqbase_[0-9]+$/, "")
        .replace(/^[^/]+\//, "");

const botIdOf = (t: any) => {
    const metadata = t?.metadata || {};
    return (
        metadata.bot_id ||
        metadata.botId ||
        metadata.bot_public_id ||
        metadata.botPublicId
    );
};

// Descriptions end in "for bot: <name>", optionally followed by " (failed)".
const botNameFromDescription = (description?: string) => {
    const match = /for bot: (.+?)(?: \(failed\))?$/.exec(description || "");
    return match ? match[1] : undefined;
};

const isFailed = (t: any) => /\(failed\)\s*$/.test(t.description || "");

const formatMoney = (value: number) => {
    const abs = Math.abs(value);
    return `$${abs.toFixed(abs > 0 && abs < 1 ? 4 : 2)}`;
};

const formatAmount = (value: number) =>
    `${value < 0 ? "−" : value > 0 ? "+" : ""}${formatMoney(value)}`;

const formatWhen = (date: dayjs.Dayjs) => {
    if (date.isSame(dayjs(), "day")) return `Today ${date.format("HH:mm")}`;
    if (date.isSame(dayjs().subtract(1, "day"), "day"))
        return `Yesterday ${date.format("HH:mm")}`;
    return date.format("MMM D");
};

const sumUsage = (list: any[]) =>
    list.reduce((sum: number, t: any) => sum + Math.abs(Number(t.amount || 0)), 0);

const inLastDays = (t: any, days: number, offset = 0) => {
    if (!t.createdAt) return false;
    const created = dayjs(t.createdAt);
    const end = dayjs().endOf("day").subtract(offset, "day");
    const start = end.subtract(days, "day");
    return created.isAfter(start) && !created.isAfter(end);
};

const selectClass =
    "ui-input h-[34px] w-auto border-line py-0 pl-2.5 pr-8 text-[13px]";

const Tile = ({
    label,
    value,
    note,
    loading,
    large = false,
}: {
    label: ReactNode;
    value: ReactNode;
    note?: ReactNode;
    loading?: boolean;
    large?: boolean;
}) => (
    <section
        className={`ui-card flex flex-col ${
            large ? "gap-2.5 px-5 py-4" : "gap-1.5 px-4 py-3.5"
        }`}
    >
        <h2 className="text-[13px] font-medium text-fg-muted">{label}</h2>
        {loading ? (
            <Skeleton className={large ? "h-8 w-32" : "h-7 w-24"} />
        ) : (
            <p
                className={`font-semibold tabular-nums text-fg ${
                    large ? "text-[28px] leading-9" : "text-2xl"
                }`}
            >
                {value}
            </p>
        )}
        {note && !loading && <p className="text-xs text-fg-subtle">{note}</p>}
    </section>
);

// "Email me below $X" setting, saved to /user/alerts.
const LowBalanceEmailCard = () => {
    const client = useQueryClient();
    const { data, isLoading } = useQuery(["getLowBalanceAlert"], async () => {
        const response = await api.get("/user/alerts");
        return response.data as {
            enabled: boolean;
            threshold: number;
            has_email: boolean;
        };
    });
    const [enabled, setEnabled] = useState<boolean | null>(null);
    const [threshold, setThreshold] = useState<string | null>(null);

    const currentEnabled = enabled ?? data?.enabled ?? false;
    const currentThreshold = threshold ?? String(data?.threshold ?? 1);
    const dirty =
        !!data &&
        (currentEnabled !== data.enabled ||
            Number(currentThreshold) !== data.threshold);

    const { mutate, isLoading: isSaving } = useMutation(
        async () => {
            const response = await api.put("/user/alerts", {
                enabled: currentEnabled,
                threshold: Number(currentThreshold),
            });
            return response.data;
        },
        {
            onSuccess: () => {
                client.invalidateQueries(["getLowBalanceAlert"]);
                setEnabled(null);
                setThreshold(null);
                notification.success({ message: "Saved" });
            },
            onError: () => {
                notification.error({ message: "Couldn't save that setting" });
            },
        }
    );

    const thresholdValid =
        currentThreshold !== "" &&
        Number.isFinite(Number(currentThreshold)) &&
        Number(currentThreshold) >= 0;

    return (
        <section className="ui-card flex flex-col gap-2.5 px-5 py-4">
            <h2 className="text-[13px] font-medium text-fg-muted">
                Low-balance email
            </h2>
            {isLoading ? (
                <Skeleton className="h-16 w-full" />
            ) : (
                <>
                    <label className="flex items-center gap-2.5 text-sm text-fg">
                        <input
                            type="checkbox"
                            checked={currentEnabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                            className="h-[18px] w-[18px] accent-indigo-600"
                        />
                        Email me when I drop below
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-fg-muted">$</span>
                        <input
                            type="number"
                            min={0}
                            step="0.5"
                            aria-label="Threshold in dollars"
                            value={currentThreshold}
                            disabled={!currentEnabled}
                            onChange={(e) => setThreshold(e.target.value)}
                            className="ui-input h-9 w-24"
                        />
                        {dirty && (
                            <button
                                type="button"
                                className="ui-btn-primary h-9"
                                disabled={!thresholdValid || isSaving}
                                onClick={() => mutate()}
                            >
                                {isSaving ? "Saving…" : "Save"}
                            </button>
                        )}
                    </div>
                    <p className="text-xs text-fg-subtle">
                        {data?.has_email
                            ? "You'll also get one when you hit $0 and your bots stop."
                            : "Add an email in Settings to get these."}
                    </p>
                </>
            )}
        </section>
    );
};

const UsageBars = ({
    days,
    values,
    loading,
}: {
    days: dayjs.Dayjs[];
    values: number[];
    loading: boolean;
}) => {
    const max = Math.max(...values, 0);
    const total = values.reduce((s, v) => s + v, 0);
    if (loading) return <Skeleton className="h-[180px] w-full" />;
    return (
        <>
            <div
                role="img"
                aria-label={`Credits used per day, last ${days.length} days, ${formatMoney(
                    total
                )} in total.`}
                className="flex h-[180px] items-end gap-1 border-b border-line sm:gap-1.5"
            >
                {values.map((v, i) => (
                    <div
                        key={i}
                        title={`${days[i].format("MMM D")}: ${formatMoney(v)}`}
                        className={`flex-1 rounded-t ${
                            i === values.length - 1
                                ? "bg-indigo-600 dark:bg-indigo-400"
                                : "bg-indigo-200 dark:bg-indigo-500/40"
                        }`}
                        style={{
                            height:
                                max > 0 && v > 0
                                    ? `max(2px, ${Math.round((v / max) * 100)}%)`
                                    : 0,
                        }}
                    />
                ))}
            </div>
            <div className="flex justify-between text-xs text-fg-subtle">
                <span>{days[0].format("MMM D")}</span>
                <span>{days[days.length - 1].format("MMM D")}</span>
            </div>
        </>
    );
};

export default function UsageRoot() {
    const { id: botId } = useParams<{ id?: string }>();
    const isBotUsage = Boolean(botId);
    const [range, setRange] = useState(isBotUsage ? 7 : 14);
    const [botFilter, setBotFilter] = useState("all");
    const [showAll, setShowAll] = useState(false);

    const { data: credits, isLoading: isCreditsLoading } = useQuery(
        ["getCredits"],
        async () => {
            const response = await api.get("/user/credits");
            return response.data;
        }
    );

    const { data: transactions, isLoading: isTransactionsLoading } = useQuery(
        ["getTransactions", botId],
        async () => {
            const response = await api.get("/user/transactions");
            return response.data;
        }
    );

    // Same cached list the layout already loads; used only for bot names.
    const { data: bots } = useQuery(["getAllBots"], async () => {
        const response = await api.get("/bot");
        return response.data;
    });

    const botNames = useMemo(() => {
        const names: Record<string, string> = {};
        (bots || []).forEach((b: any) => {
            names[String(b.id)] = b.name;
        });
        return names;
    }, [bots]);

    const normalizedTransactions = useMemo(() => {
        if (!transactions) {
            return [];
        }
        return transactions.map((t: any) => {
            let metadata = t.metadata;
            if (typeof metadata === "string") {
                try {
                    metadata = JSON.parse(metadata);
                } catch {
                    metadata = undefined;
                }
            }
            return {
                ...t,
                metadata,
                amount: Number(t.amount),
                createdAt: t.createdAt || t.created_at,
            };
        });
    }, [transactions]);

    const filteredTransactions = useMemo(() => {
        if (!isBotUsage) {
            return normalizedTransactions;
        }
        return normalizedTransactions.filter((t: any) => {
            const botMatch = botIdOf(t);
            return botMatch && String(botMatch) === String(botId);
        });
    }, [normalizedTransactions, isBotUsage, botId]);

    const usageTransactions = useMemo(() => {
        return filteredTransactions.filter((t: any) => t.type === "usage");
    }, [filteredTransactions]);

    const botNameFor = (t: any) => {
        const id = botIdOf(t);
        if (!id) return undefined;
        return (
            botNames[String(id)] ||
            botNameFromDescription(t.description) ||
            "Deleted bot"
        );
    };

    const chartDays = useMemo(() => {
        return Array.from({ length: range }, (_, i) =>
            dayjs().subtract(range - 1 - i, "day")
        );
    }, [range]);

    const usagePerDay = useMemo(() => {
        return chartDays.map((day) =>
            sumUsage(
                usageTransactions.filter(
                    (t: any) => t.createdAt && dayjs(t.createdAt).isSame(day, "day")
                )
            )
        );
    }, [chartDays, usageTransactions]);

    const isCapped = (transactions?.length || 0) >= TRANSACTION_LIMIT;
    const capNote = isCapped
        ? `Only the latest ${TRANSACTION_LIMIT} transactions are loaded, so older days may be incomplete.`
        : null;

    if (isBotUsage) {
        const inRange = usageTransactions.filter((t: any) => inLastDays(t, range));
        const previous = usageTransactions.filter((t: any) =>
            inLastDays(t, range, range)
        );
        const used = sumUsage(inRange);
        const usedBefore = sumUsage(previous);
        const answers = inRange.filter(
            (t: any) => t.metadata?.usage_kind !== "embedding"
        );
        const answersCost = sumUsage(answers);
        const failed = answers.filter(isFailed);

        let usedNote: string;
        if (usedBefore === 0) {
            usedNote = `Nothing the ${range} days before`;
        } else {
            const change = Math.round(((used - usedBefore) / usedBefore) * 100);
            usedNote =
                change === 0
                    ? `Same as the ${range} days before`
                    : `${change > 0 ? "Up" : "Down"} ${Math.abs(change)}% on the ${range} days before`;
        }

        const byChannel: Record<string, number> = {};
        inRange.forEach((t: any) => {
            const key = channelOf(t);
            byChannel[key] = (byChannel[key] || 0) + Math.abs(Number(t.amount || 0));
        });
        const channels = Object.entries(byChannel).sort((a, b) => b[1] - a[1]);
        const channelMax = channels.length ? channels[0][1] : 0;

        const botName =
            botNames[String(botId)] ||
            (filteredTransactions[0] &&
                botNameFromDescription(filteredTransactions[0].description));

        return (
            <div className="px-4 pb-10 pt-8 sm:px-8">
                <div className="flex max-w-[1000px] flex-col gap-6">
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-2xl font-semibold tracking-[-0.01em] text-fg">
                                Usage
                            </h1>
                            <p className="mt-1.5 text-sm text-fg-muted">
                                What {botName || "this bot"} has cost. Your full
                                balance is on{" "}
                                <Link
                                    to="/usage"
                                    className="font-medium text-indigo-700 no-underline hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
                                >
                                    Usage &amp; billing
                                </Link>
                                .
                            </p>
                        </div>
                        <select
                            aria-label="Range"
                            value={range}
                            onChange={(e) => setRange(Number(e.target.value))}
                            className={`${selectClass} h-9`}
                        >
                            <option value={7}>Last 7 days</option>
                            <option value={30}>Last 30 days</option>
                        </select>
                    </div>

                    <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(180px,100%),1fr))]">
                        <Tile
                            label="Credits used"
                            value={formatMoney(used)}
                            note={usedNote}
                            loading={isTransactionsLoading}
                        />
                        <Tile
                            label="Answers"
                            value={answers.length.toLocaleString()}
                            note="Charged replies on all channels"
                            loading={isTransactionsLoading}
                        />
                        <Tile
                            label="Average per answer"
                            value={
                                answers.length
                                    ? formatMoney(answersCost / answers.length)
                                    : "—"
                            }
                            note="Training costs not included"
                            loading={isTransactionsLoading}
                        />
                    </div>

                    <section
                        aria-labelledby="channel-h"
                        className="ui-card flex flex-col gap-3.5 px-5 pb-5 pt-4"
                    >
                        <h2 id="channel-h" className="text-[15px] font-semibold text-fg">
                            Credits by channel
                        </h2>
                        {isTransactionsLoading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-4/5" />
                                <Skeleton className="h-3 w-3/5" />
                            </div>
                        ) : channels.length === 0 ? (
                            <p className="text-[13px] text-fg-muted">
                                No usage in the last {range} days.
                            </p>
                        ) : (
                            channels.map(([name, value]) => (
                                <div
                                    key={name}
                                    className="grid grid-cols-[minmax(0,100px)_minmax(0,1fr)_72px] items-center gap-3 text-[13px] sm:grid-cols-[120px_minmax(0,1fr)_80px]"
                                >
                                    <span className="truncate text-fg-muted">{name}</span>
                                    <span className="block h-2.5 overflow-hidden rounded-full bg-surface-2">
                                        <span
                                            className="block h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400"
                                            style={{
                                                width: `${
                                                    channelMax > 0
                                                        ? Math.max(
                                                              2,
                                                              Math.round((value / channelMax) * 100)
                                                          )
                                                        : 0
                                                }%`,
                                            }}
                                        />
                                    </span>
                                    <span className="text-right tabular-nums text-fg">
                                        {formatMoney(value)}
                                    </span>
                                </div>
                            ))
                        )}
                        {capNote && <p className="text-xs text-fg-subtle">{capNote}</p>}
                    </section>

                    {failed.length > 0 && (
                        <section className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-line bg-app px-4 py-3.5 text-[13px]">
                            <span className="flex-[1_1_280px] text-fg-muted">
                                {failed.length}{" "}
                                {failed.length === 1 ? "answer" : "answers"} failed
                                after the model ran, so{" "}
                                {failed.length === 1 ? "it was" : "they were"} still
                                charged ({formatMoney(sumUsage(failed))}).
                            </span>
                            <Link
                                to={`/bot/${botId}/conversations`}
                                className="font-medium text-indigo-700 no-underline hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
                            >
                                See conversations →
                            </Link>
                        </section>
                    )}
                </div>
            </div>
        );
    }

    // ---- App-level usage & billing ----
    const balance = Number(credits?.balance || 0);
    const state = balanceState(credits?.balance);
    const allowancePct =
        Number(credits?.total) > 0
            ? Math.max(
                  0,
                  Math.min(
                      100,
                      Math.round(
                          (Number(credits?.balance) / Number(credits?.total)) * 100
                      )
                  )
              )
            : 0;
    const used7 = sumUsage(usageTransactions.filter((t: any) => inLastDays(t, 7)));
    const usedPrev7 = sumUsage(
        usageTransactions.filter((t: any) => inLastDays(t, 7, 7))
    );

    let balanceNote: string;
    if (state === "empty") {
        balanceNote = "Your bots have stopped answering. Add credits to restart them.";
    } else if (used7 > 0) {
        const days = Math.floor(balance / (used7 / 7));
        balanceNote =
            days < 1
                ? "Less than a day left at this week's pace"
                : `About ${days.toLocaleString()} ${days === 1 ? "day" : "days"} left at this week's pace`;
    } else {
        balanceNote = "Your bots stop answering at $0.00.";
    }

    let usedNote: string;
    if (usedPrev7 === 0) usedNote = "Nothing used the week before";
    else if (used7 > usedPrev7) usedNote = `Up from ${formatMoney(usedPrev7)} the week before`;
    else if (used7 < usedPrev7)
        usedNote = `Down from ${formatMoney(usedPrev7)} the week before`;
    else usedNote = "Same as the week before";

    const botOptionMap = new Map<string, string>();
    filteredTransactions.forEach((t: any) => {
        const id = botIdOf(t);
        if (id) botOptionMap.set(String(id), botNameFor(t) || String(id));
    });
    const botOptions = Array.from(botOptionMap.entries()).sort((a, b) =>
        a[1].localeCompare(b[1])
    );

    const tableRows =
        botFilter === "all"
            ? filteredTransactions
            : filteredTransactions.filter(
                  (t: any) => String(botIdOf(t)) === botFilter
              );
    const visibleRows = showAll ? tableRows : tableRows.slice(0, 10);

    return (
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 pb-12 pt-8 sm:px-6">
            <PageHeader
                title="Usage & billing"
                description="Every bot answer costs credits, on every channel."
                actions={
                    <button
                        type="button"
                        className="ui-btn-primary h-10 px-4"
                        onClick={() => window.open(BUY_CREDITS_URL, "_blank")}
                    >
                        Add credits
                    </button>
                }
            />

            <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr))]">
                <Tile
                    large
                    label="Balance"
                    value={
                        <>
                            {formatBalance(credits?.balance)}{" "}
                            {Number(credits?.total) > 0 && (
                                <span className="text-sm font-normal text-fg-subtle">
                                    of {formatBalance(credits?.total)}
                                </span>
                            )}
                        </>
                    }
                    loading={isCreditsLoading || isTransactionsLoading}
                    note={
                        <>
                            {Number(credits?.total) > 0 && (
                                <span
                                    role="img"
                                    aria-label={`${allowancePct}% of your last top-up left`}
                                    className="mb-2 block h-1.5 overflow-hidden rounded-full bg-surface-2"
                                >
                                    <span
                                        className={`block h-1.5 rounded-full ${
                                            state === "empty"
                                                ? "bg-red-600"
                                                : state === "low"
                                                ? "bg-amber-600"
                                                : "bg-indigo-600"
                                        }`}
                                        style={{ width: `${allowancePct}%` }}
                                    />
                                </span>
                            )}
                            <span
                                className={
                                    state === "empty"
                                        ? "text-red-700 dark:text-red-300"
                                        : state === "low"
                                        ? "text-amber-700 dark:text-amber-300"
                                        : undefined
                                }
                            >
                                {balanceNote}
                            </span>
                        </>
                    }
                />
                <Tile
                    large
                    label="Used in the last 7 days"
                    value={formatMoney(used7)}
                    note={usedNote}
                    loading={isTransactionsLoading}
                />
                <LowBalanceEmailCard />
            </div>

            <section
                aria-labelledby="chart-h"
                className="ui-card flex flex-col gap-4 px-5 pb-5 pt-4"
            >
                <div className="flex flex-wrap items-center gap-3">
                    <h2 id="chart-h" className="flex-1 text-[15px] font-semibold text-fg">
                        Credits used per day
                    </h2>
                    <select
                        aria-label="Range"
                        value={range}
                        onChange={(e) => setRange(Number(e.target.value))}
                        className={selectClass}
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={14}>Last 14 days</option>
                        <option value={30}>Last 30 days</option>
                    </select>
                </div>
                <UsageBars
                    days={chartDays}
                    values={usagePerDay}
                    loading={isTransactionsLoading}
                />
                {capNote && <p className="text-xs text-fg-subtle">{capNote}</p>}
            </section>

            <section aria-labelledby="tx-h" className="ui-card overflow-hidden">
                <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5">
                    <h2 id="tx-h" className="flex-1 text-[15px] font-semibold text-fg">
                        Transactions
                    </h2>
                    <select
                        aria-label="Filter by bot"
                        value={botFilter}
                        onChange={(e) => {
                            setBotFilter(e.target.value);
                            setShowAll(false);
                        }}
                        className={`${selectClass} max-w-full`}
                    >
                        <option value="all">All bots</option>
                        {botOptions.map(([id, name]) => (
                            <option key={id} value={id}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>
                {isTransactionsLoading ? (
                    <div className="space-y-3 px-5 py-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-4 w-full" />
                        ))}
                    </div>
                ) : tableRows.length === 0 ? (
                    <p className="px-5 py-10 text-center text-sm text-fg-muted">
                        No transactions yet. Charges show up here as your bots
                        answer.
                    </p>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="ui-table min-w-[720px] [&_td]:py-[11px] [&_th]:font-medium">
                                <thead>
                                    <tr>
                                        <th scope="col">When</th>
                                        <th scope="col">Bot</th>
                                        <th scope="col">Channel</th>
                                        <th scope="col">Model</th>
                                        <th scope="col" className="!text-right">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleRows.map((t: any) => {
                                        const created = dayjs(t.createdAt);
                                        const model = cleanModel(
                                            t.metadata?.model || t.metadata?.embedding_model
                                        );
                                        return (
                                            <tr key={t.id}>
                                                <td
                                                    className="whitespace-nowrap text-fg-muted"
                                                    title={created.format("YYYY-MM-DD HH:mm:ss")}
                                                >
                                                    {formatWhen(created)}
                                                </td>
                                                <td className="font-medium text-fg">
                                                    {botNameFor(t) || "—"}
                                                </td>
                                                <td className="text-fg-muted">{channelOf(t)}</td>
                                                <td className="text-fg-muted">{model || "—"}</td>
                                                <td
                                                    className={`whitespace-nowrap text-right tabular-nums ${
                                                        t.amount > 0
                                                            ? "font-medium text-green-700 dark:text-green-400"
                                                            : "text-fg"
                                                    }`}
                                                >
                                                    {formatAmount(t.amount)}
                                                    {isFailed(t) ? " (failed)" : ""}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {tableRows.length > 10 && (
                            <div className="flex justify-center border-t border-line px-5 py-2.5">
                                <button
                                    type="button"
                                    onClick={() => setShowAll((v) => !v)}
                                    className="ui-btn-ghost h-8 text-[13px]"
                                >
                                    {showAll ? "Show fewer" : `Show all ${tableRows.length}`}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}
