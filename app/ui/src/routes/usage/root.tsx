
import { useQuery } from "@tanstack/react-query";
import { Skeleton, Table, Tag, Button } from "antd";
import { CreditCardIcon } from "@heroicons/react/24/outline";
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
                display: true,
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
                backgroundColor: "rgba(53, 162, 235, 0.5)",
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
            render: (type: string) => <Tag color="blue">{type}</Tag>,
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (amount: number) => (
                <span className={amount < 0 ? "text-red-500" : "text-green-500"}>
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

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                {isBotUsage ? "Bot Usage" : "Usage & Billing"}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Battery / Credit Status Card */}
                <div className="bg-white dark:bg-[#171717] overflow-hidden shadow rounded-lg border dark:border-gray-700 p-6 col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                        {isBotUsage ? "Account Balance" : "Balance"}
                    </h3>
                    {isCreditsLoading ? (
                        <Skeleton active paragraph={{ rows: 2 }} />
                    ) : (
                        <div className="flex flex-col w-full">
                            <div className="mb-2">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    ${Number(credits?.balance || 0).toFixed(4)}
                                </span>
                            </div>



                            <div className="mb-6" />


                            <Button
                                type="primary"
                                block
                                size="large"
                                icon={<CreditCardIcon className="w-5 h-5" />}
                                className="flex items-center justify-center gap-2 h-12 rounded-xl border-none font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300"
                                style={{
                                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                }}
                                onClick={() => window.open("https://buy.stripe.com/aFa00cg8kbx9g8G7YUgjC0t", "_blank")}
                            >
                                Buy Credits
                            </Button>
                            <p className="text-center text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 mt-3 font-bold">
                                1 Credit = $1.00 USD • Top up when balance hits 0
                            </p>
                        </div>



                    )}
                </div>

                {/* Usage Chart */}
                <div className="bg-white dark:bg-[#171717] overflow-hidden shadow rounded-lg border dark:border-gray-700 p-6 col-span-2">
                    <Bar options={options} data={chartData} />
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white dark:bg-[#171717] overflow-hidden shadow rounded-lg border dark:border-gray-700">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        Transaction History
                    </h3>
                </div>
                <div className="p-4">
                    <Table
                        dataSource={filteredTransactions}
                        columns={columns}
                        loading={isTransactionsLoading}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: true }}
                    />
                </div>
            </div>
        </div>
    );
}
