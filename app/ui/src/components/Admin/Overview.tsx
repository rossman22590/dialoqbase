import { useQuery } from "@tanstack/react-query";
import { Card, Empty, Skeleton, Tag } from "antd";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import dayjs from "dayjs";
import React from "react";
import api from "../../services/api";
import {
  DaysPicker,
  StatCard,
  formatCredits,
  formatNumber,
  formatUsd,
} from "./shared";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

type Overview = {
  days: number;
  users: number;
  suspended_users: number;
  admins: number;
  bots: number;
  credits_outstanding: number;
  messages: number;
  credits_used: number;
  provider_cost_usd: number;
  active_users: number;
  active_bots: number;
  credits_granted: { type: string; credits: number }[];
  series: {
    day: string;
    messages: number;
    credits_used: number;
    provider_cost_usd: number;
  }[];
};

export const AdminOverview = () => {
  const [days, setDays] = React.useState(30);
  const { data, status } = useQuery(["adminOverview", days], async () => {
    const response = await api.get(`/admin/oversight/overview?days=${days}`);
    return response.data as Overview;
  });

  const chart = React.useMemo(() => {
    if (!data) return null;
    const byDay = new Map(
      data.series.map((row) => [dayjs(row.day).format("YYYY-MM-DD"), row])
    );
    const dates = Array.from({ length: data.days }, (_, i) =>
      dayjs().subtract(data.days - 1 - i, "day")
    );
    return {
      labels: dates.map((d) => d.format("MMM D")),
      datasets: [
        {
          type: "bar" as const,
          label: "Credits used",
          data: dates.map((d) => byDay.get(d.format("YYYY-MM-DD"))?.credits_used || 0),
          backgroundColor: "rgba(124, 58, 237, 0.6)",
          yAxisID: "credits",
        },
        {
          type: "bar" as const,
          label: "Messages",
          data: dates.map((d) => byDay.get(d.format("YYYY-MM-DD"))?.messages || 0),
          backgroundColor: "rgba(53, 162, 235, 0.5)",
          yAxisID: "messages",
        },
      ],
    };
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold dark:text-white">Platform overview</h2>
        <DaysPicker value={days} onChange={setDays} />
      </div>

      {status === "loading" && <Skeleton active />}
      {status === "error" && <Empty description="Could not load the overview" />}
      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard
              title="Users"
              value={formatNumber(data.users)}
              hint={`${data.admins} admin · ${data.suspended_users} suspended`}
            />
            <StatCard
              title="Bots"
              value={formatNumber(data.bots)}
              hint={`${data.active_bots} answered in the last ${data.days} days`}
            />
            <StatCard
              title={`Active users (${data.days}d)`}
              value={formatNumber(data.active_users)}
            />
            <StatCard
              title={`Messages (${data.days}d)`}
              value={formatNumber(data.messages)}
            />
            <StatCard
              title={`Credits used (${data.days}d)`}
              value={formatCredits(data.credits_used)}
            />
            <StatCard
              title={`OpenRouter cost (${data.days}d)`}
              value={formatUsd(data.provider_cost_usd)}
              hint="Recorded for messages billed after this update"
            />
            <StatCard
              title="Credits outstanding"
              value={formatCredits(data.credits_outstanding)}
              hint="Sum of every user's balance"
            />
            <StatCard
              title={`Credits granted (${data.days}d)`}
              value={formatCredits(
                data.credits_granted
                  .filter((g) => g.credits > 0)
                  .reduce((sum, g) => sum + g.credits, 0)
              )}
              hint={
                <span className="flex flex-wrap gap-1">
                  {data.credits_granted.map((g) => (
                    <Tag key={g.type}>
                      {g.type}: {formatCredits(g.credits)}
                    </Tag>
                  ))}
                </span>
              }
            />
          </div>

          <Card size="small" title="Daily usage">
            {chart && (
              <Bar
                data={chart as any}
                options={{
                  responsive: true,
                  interaction: { mode: "index", intersect: false },
                  scales: {
                    credits: { type: "linear", position: "left", title: { display: true, text: "Credits" } },
                    messages: {
                      type: "linear",
                      position: "right",
                      grid: { drawOnChartArea: false },
                      title: { display: true, text: "Messages" },
                    },
                  },
                }}
              />
            )}
          </Card>
        </>
      )}
    </div>
  );
};
