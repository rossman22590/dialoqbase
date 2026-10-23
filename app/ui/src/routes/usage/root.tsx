
import { useQuery } from "@tanstack/react-query";
import { Skeleton, Table, Button } from "antd";
import {
    ChartBarIcon,
    CreditCardIcon,
    ReceiptPercentIcon,
    WalletIcon,
} from "@heroicons/react/24/outline";
import api from "../../services/api";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useMemo } from "react";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import {
    Card,
    CardBody,
    CardHeader,
    PageHeader,
    Skeleton as UiSkeleton,
    StatTile,
} from "../../components/ui";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function UsageRoot() {
    const { id: botId } = useParams<{ id?: string }>();
    const isBotUsage = Boolean(botId);

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
            const metadata = t?.metadata || {};
            const botMatch =
                metadata.bot_id ||
                metadata.botId ||
                metadata.bot_public_id ||
                metadata.botPublicId;
            return botMatch && String(botMatch) === String(botId);
        });
    }, [normalizedTransactions, isBotUsage, botId]);

    const usageTransactions = useMemo(() => {
        return filteredTransactions.filter((t: any) => t.type === "usage");
    }, [filteredTransactions]);

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
            title: {
                // Shown as the card title instead of inside the canvas.
                display: false,
                text: isBotUsage
                    ? "Daily Bot Usage (Last 7 Days)"
                    : "Daily Usage (Last 7 Days)",
            },
        },
    };

    const chartDays = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) =>
            dayjs().subtract(6 - i, "day")
        );
    }, []);

    const labels = useMemo(() => {
        return chartDays.map((d) => d.format("MMM D"));
    }, [chartDays]);

    const usagePerDay = useMemo(() => {
        return chartDays.map((day) => {
            const total = usageTransactions.reduce((sum: number, t: any) => {
                const createdAt = t.createdAt ? dayjs(t.createdAt) : null;
                if (!createdAt || !createdAt.isSame(day, "day")) {
                    return sum;
                }
                return sum + Math.abs(Number(t.amount || 0));
            }, 0);
            return Number(total.toFixed(4));
        });
    }, [chartDays, usageTransactions]);

    const chartData = {
        labels,
        datasets: [
            {
                label: "Credits Used",
                data: usagePerDay,
                backgroundColor: "rgba(124, 58, 237, 0.75)",
                hoverBackgroundColor: "rgba(124, 58, 237, 0.95)",
                borderRadius: 6,
                maxBarThickness: 40,
            },
        ],
    };

    const columns = [
        {
            title: "Date",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (_: string, record: any) =>
                dayjs(record.createdAt || record.created_at).format(
                    "YYYY-MM-DD HH:mm:ss"
                ),
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            render: (type: string) => (
                <span
                    className={`ui-badge ${
                        type === "usage" ? "ui-badge-brand" : "ui-badge-neutral"
                    }`}
                >
                    {type}
                </span>
            ),
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (amount: number) => (
                <span
                    className={`font-medium tabular-nums ${
                        amount < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-emerald-600 dark:text-emerald-400"
                    }`}
                >
                    {amount > 0 ? "+" : ""}
                    {amount.toFixed(4)}
                </span>
            ),
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
        },
    ];

    // Presentation-only totals derived from the data already loaded above.
    const weekTotal = usagePerDay.reduce((sum, v) => sum + v, 0);

    return (
        <div className="ui-page">
            <PageHeader
                title={isBotUsage ? "Bot Usage" : "Usage & Billing"}
                description={
                    isBotUsage
                        ? "Credits this bot has used, day by day, with every charge it made."
                        : "Your credit balance, recent usage and every transaction on your account."
                }
            />

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
                <StatTile
                    label={isBotUsage ? "Account Balance" : "Balance"}
                    icon={<WalletIcon />}
                    value={
                        isCreditsLoading ? (
                            <UiSkeleton className="mt-1 h-7 w-28" />
                        ) : (
                            `$${Number(credits?.balance || 0).toFixed(4)}`
                        )
                    }
                    hint="1 Credit = $1.00 USD"
                />
                <StatTile
                    label="Credits used (7 days)"
                    icon={<ChartBarIcon />}
                    value={
                        isTransactionsLoading ? (
                            <UiSkeleton className="mt-1 h-7 w-24" />
                        ) : (
                            weekTotal.toFixed(4)
                        )
                    }
                    hint={isBotUsage ? "For this bot" : "Across all bots"}
                />
                <StatTile
                    label="Transactions"
                    icon={<ReceiptPercentIcon />}
                    value={
                        isTransactionsLoading ? (
                            <UiSkeleton className="mt-1 h-7 w-12" />
                        ) : (
                            filteredTransactions.length
                        )
                    }
                    hint={isBotUsage ? "Charges by this bot" : "On your account"}
                />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Battery / Credit Status Card */}
                <Card className="flex flex-col lg:col-span-1">
                    <CardHeader
                        icon={<CreditCardIcon />}
                        title={isBotUsage ? "Account Balance" : "Balance"}
                        description="Top up any time to keep your bots answering."
                    />
                    <CardBody className="flex flex-1 flex-col">
                        {isCreditsLoading ? (
                            <Skeleton active paragraph={{ rows: 2 }} />
                        ) : (
                            <div className="flex w-full flex-1 flex-col">
                                <div className="mb-2">
                                    <span className="text-3xl font-semibold tabular-nums tracking-tight text-fg">
                                        ${Number(credits?.balance || 0).toFixed(4)}
                                    </span>
                                    <p className="mt-1 text-xs text-fg-subtle">
                                        Available credits
                                    </p>
                                </div>

                                <div className="mb-6 flex-1" />

                                <Button
                                    type="primary"
                                    block
                                    size="large"
                                    icon={<CreditCardIcon className="h-5 w-5" />}
                                    className="flex items-center justify-center gap-2 font-semibold"
                                    onClick={() => window.open("https://buy.stripe.com/aFa00cg8kbx9g8G7YUgjC0t", "_blank")}
                                >
                                    <span>Buy Credits</span>
                                </Button>
                                <p className="mt-3 text-center text-[11px] text-fg-subtle">
                                    1 Credit = $1.00 USD • Top up when balance hits 0
                                </p>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Usage Chart */}
                <Card className="min-w-0 lg:col-span-2">
                    <CardHeader
                        icon={<ChartBarIcon />}
                        title={options.plugins.title.text}
                        description="Credits used per day."
                    />
                    <CardBody>
                        <Bar options={options} data={chartData} />
                    </CardBody>
                </Card>
            </div>

            {/* Transactions Table */}
            <Card className="mt-6 overflow-hidden">
                <CardHeader
                    icon={<ReceiptPercentIcon />}
                    title="Transaction History"
                    description="Every charge and top-up on record."
                />
                <div className="[&_.ant-table-pagination]:px-4">
                    <Table
                        dataSource={filteredTransactions}
                        columns={columns}
                        loading={isTransactionsLoading}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: true }}
                    />
                </div>
            </Card>
        </div>
    );
}
