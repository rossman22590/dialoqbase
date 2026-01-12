
import { useQuery } from "@tanstack/react-query";
import { Skeleton, Table, Tag } from "antd";
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

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function UsageRoot() {
    const { data: credits, isLoading: isCreditsLoading } = useQuery(
        ["getCredits"],
        async () => {
            const response = await api.get("/user/credits");
            return response.data;
        }
    );

    const { data: transactions, isLoading: isTransactionsLoading } = useQuery(
        ["getTransactions"],
        async () => {
            const response = await api.get("/user/transactions");
            return response.data;
        }
    );

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
            title: {
                display: true,
                text: "Daily Usage (Last 7 Days)",
            },
        },
    };

    const labels = useMemo(() => {
        // Generate last 7 days labels
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toLocaleDateString();
        }).reverse();
    }, []);

    const chartData = {
        labels,
        datasets: [
            {
                label: "Credits Used",
                data: labels.map(() => Math.random() * 10), // Mock data for valid graph, replace with actual logic if available
                backgroundColor: "rgba(53, 162, 235, 0.5)",
            },
        ],
    };

    const columns = [
        {
            title: "Date",
            dataIndex: "created_at",
            key: "created_at",
            render: (text: string) => dayjs(text).format("YYYY-MM-DD HH:mm:ss"),
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
                Usage & Billing
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Battery / Credit Status Card */}
                <div className="bg-white dark:bg-[#171717] overflow-hidden shadow rounded-lg border dark:border-gray-700 p-6 col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                        Balance
                    </h3>
                    {isCreditsLoading ? (
                        <Skeleton active paragraph={{ rows: 2 }} />
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="relative w-full h-12 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700 mb-2 border border-gray-300 dark:border-gray-600">
                                <div
                                    className="h-full bg-green-500 transition-all duration-500 ease-out flex items-center justify-center text-white font-bold"
                                    style={{
                                        width: `${Math.min(
                                            ((credits?.balance || 0) / 100) * 100,
                                            100
                                        )}%`,
                                        minWidth: "20%",
                                    }}
                                >
                                    ${Number(credits?.balance || 0).toFixed(4)}
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Available Credits
                            </p>
                        </div>
                    )}
                </div>

                {/* Usage Chart (Mocked for now as backend endpoint might need aggregation) */}
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
                        dataSource={transactions || []}
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
