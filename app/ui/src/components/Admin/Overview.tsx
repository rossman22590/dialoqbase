import { useQuery } from "@tanstack/react-query";
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
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
  DaysPicker,
  StatCard,
  StatGrid,
  daysLabel,
  formatCredits,
  formatNumber,
  formatUsd,
  formatWhen,
} from "./shared";
import { Skeleton } from "../ui";

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

type QueueInfo = {
  name: string;
  counts: Record<string, number>;
  is_paused: boolean;
  workers: number | null;
};

type NewestUser = { user_id: number; username: string; createdAt: string };

const DOT = {
  red: "bg-red-600 dark:bg-red-400",
  amber: "bg-amber-600 dark:bg-amber-400",
  brand: "bg-indigo-600 dark:bg-indigo-400",
};

const plural = (n: number, one: string, many: string) =>
  `${formatNumber(n)} ${n === 1 ? one : many}`;

export const AdminOverview = () => {
  const [days, setDays] = React.useState(30);
  const { data, status } = useQuery(["adminOverview", days], async () => {
    const response = await api.get(`/admin/oversight/overview?days=${days}`);
    return response.data as Overview;
  });

  // Same queries (and cache keys) the Queue and Users tabs use.
  const { data: queue } = useQuery(
    ["adminQueue"],
    async () => {
      const response = await api.get("/admin/oversight/queue");
      return response.data as QueueInfo;
    },
    { refetchInterval: 5000 }
  );
  const { data: newest } = useQuery(
    ["adminUsers", "", undefined, 1, 5],
    async () => {
      const params = new URLSearchParams({ page: "1", pageSize: "5" });
      const response = await api.get(`/admin/oversight/users?${params}`);
      return response.data as { total: number; data: NewestUser[] };
    },
    { keepPreviousData: true }
  );

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
          label: "Credits used ($)",
          data: dates.map(
            (d) => byDay.get(d.format("YYYY-MM-DD"))?.credits_used || 0
          ),
          backgroundColor: "rgba(79, 70, 229, 0.85)",
          borderRadius: 3,
          yAxisID: "credits",
        },
        {
          type: "bar" as const,
          label: "Answers",
          data: dates.map(
            (d) => byDay.get(d.format("YYYY-MM-DD"))?.messages || 0
          ),
          backgroundColor: "rgba(161, 161, 170, 0.6)",
          borderRadius: 3,
          yAxisID: "messages",
        },
      ],
    };
  }, [data]);

  const failedJobs = queue?.counts?.failed || 0;
  const alerts: {
    text: string;
    action: string;
    to: string;
    dot: keyof typeof DOT;
  }[] = [];
  if (failedJobs > 0) {
    alerts.push({
      text: `${plural(failedJobs, "data source job has", "data source jobs have")} failed.`,
      action: "Open queue",
      to: "/admin/queue",
      dot: "red",
    });
  }
  if (queue?.is_paused) {
    alerts.push({
      text: "The data source queue is paused, so new sources aren't being read.",
      action: "Open queue",
      to: "/admin/queue",
      dot: "amber",
    });
  }
  if (data && data.suspended_users > 0) {
    alerts.push({
      text: `${plural(data.suspended_users, "person is", "people are")} suspended, so their bots aren't answering.`,
      action: "See people",
      to: "/admin/users",
      dot: "amber",
    });
  }
  if (data && data.credits_outstanding < 0) {
    alerts.push({
      text: `Balances add up to ${formatCredits(data.credits_outstanding)}.`,
      action: "See people",
      to: "/admin/users",
      dot: "brand",
    });
  }

  const granted = data
    ? data.credits_granted
        .filter((g) => g.credits > 0)
        .reduce((sum, g) => sum + g.credits, 0)
    : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <h2 className="m-0 flex-1 text-base font-semibold text-fg">
          {daysLabel(days)}
        </h2>
        <DaysPicker value={days} onChange={setDays} />
      </div>

      {status === "loading" && (
        <StatGrid>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[98px] rounded-xl" />
          ))}
        </StatGrid>
      )}
      {status === "error" && (
        <div className="ui-card px-5 py-10 text-center text-sm text-fg-muted">
          Could not load the overview. Try again in a moment.
        </div>
      )}
      {data && (
        <StatGrid>
          <StatCard
            title="People"
            value={formatNumber(data.users)}
            hint={`${formatNumber(data.active_users)} active · ${formatNumber(
              data.admins
            )} admin · ${formatNumber(data.suspended_users)} suspended`}
          />
          <StatCard
            title="Bots answering"
            value={`${formatNumber(data.active_bots)} of ${formatNumber(
              data.bots
            )}`}
            hint={`Answered at least once in ${data.days} days`}
          />
          <StatCard
            title={`Credits billed, ${data.days} days`}
            value={formatCredits(data.credits_used)}
            hint={`Provider cost ${formatUsd(data.provider_cost_usd)} · ${plural(
              data.messages,
              "answer",
              "answers"
            )}`}
          />
          <StatCard
            title="Credits outstanding"
            value={formatCredits(data.credits_outstanding)}
            hint={
              granted > 0
                ? `${formatCredits(granted)} granted in ${data.days} days${
                    data.credits_granted.length
                      ? ` (${data.credits_granted
                          .map((g) => `${g.type} ${formatCredits(g.credits)}`)
                          .join(", ")})`
                      : ""
                  }`
                : "Sum of every balance"
            }
          />
        </StatGrid>
      )}

      <div className="flex flex-wrap items-start gap-5">
        <section
          aria-labelledby="att-h"
          className="ui-card min-w-0 flex-[1_1_380px]"
        >
          <h2
            id="att-h"
            className="m-0 border-b border-line px-5 py-3.5 text-[15px] font-semibold text-fg"
          >
            Needs attention
          </h2>
          {alerts.length === 0 ? (
            <p className="px-5 py-4 text-[13px] text-fg-muted">
              {data ? "Nothing needs attention right now." : "…"}
            </p>
          ) : (
            alerts.map((a, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-5 py-3 text-[13px] ${
                  i > 0 ? "border-t border-line" : ""
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 flex-none rounded-full ${DOT[a.dot]}`}
                />
                <span className="min-w-0 flex-1 text-fg">{a.text}</span>
                <Link
                  to={a.to}
                  className="whitespace-nowrap font-medium text-indigo-700 hover:text-indigo-800 dark:text-indigo-300"
                >
                  {a.action}
                </Link>
              </div>
            ))
          )}
        </section>

        <section
          aria-labelledby="new-h"
          className="ui-card min-w-0 flex-[1_1_320px]"
        >
          <h2
            id="new-h"
            className="m-0 border-b border-line px-5 py-3.5 text-[15px] font-semibold text-fg"
          >
            Newest people
          </h2>
          {!newest && <p className="px-5 py-4 text-[13px] text-fg-muted">…</p>}
          {newest?.data.length === 0 && (
            <p className="px-5 py-4 text-[13px] text-fg-muted">No one yet.</p>
          )}
          {newest?.data.map((u, i) => (
            <div
              key={u.user_id}
              className={`flex items-center gap-3 px-5 py-[11px] text-[13px] ${
                i > 0 ? "border-t border-line" : ""
              }`}
            >
              <span className="flex-1 font-medium text-fg">{u.username}</span>
              <span className="text-fg-subtle">{formatWhen(u.createdAt)}</span>
            </div>
          ))}
        </section>
      </div>

      {chart && (
        <section aria-labelledby="daily-h" className="ui-card">
          <h2
            id="daily-h"
            className="m-0 border-b border-line px-5 py-3.5 text-[15px] font-semibold text-fg"
          >
            Daily usage
          </h2>
          <div className="px-3 py-4 sm:px-5">
            <Bar
              data={chart as any}
              options={{
                responsive: true,
                interaction: { mode: "index", intersect: false },
                plugins: { legend: { position: "bottom", align: "start" } },
                scales: {
                  x: { grid: { display: false } },
                  credits: {
                    type: "linear",
                    position: "left",
                    title: { display: true, text: "Credits ($)" },
                  },
                  messages: {
                    type: "linear",
                    position: "right",
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: "Answers" },
                  },
                },
              }}
            />
          </div>
        </section>
      )}
    </div>
  );
};
