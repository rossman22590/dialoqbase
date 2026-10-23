import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";
import React from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
  DaysPicker,
  SectionHeader,
  TableCard,
  formatCredits,
  formatNumber,
  formatUsd,
} from "./shared";
import { Skeleton } from "../ui";

type UsageRow = {
  messages: number;
  credits_used: number;
  provider_cost_usd: number;
  input_tokens: number;
  output_tokens: number;
  [key: string]: any;
};

type Usage = {
  days: number;
  by_user: UsageRow[];
  by_bot: UsageRow[];
  by_model: UsageRow[];
  by_source: UsageRow[];
};

const metricColumns = [
  { title: "Messages", dataIndex: "messages", key: "messages", render: formatNumber },
  {
    title: "Credits used",
    dataIndex: "credits_used",
    key: "credits_used",
    render: formatCredits,
    defaultSortOrder: "descend" as const,
    sorter: (a: UsageRow, b: UsageRow) => a.credits_used - b.credits_used,
  },
  {
    title: "OpenRouter cost",
    dataIndex: "provider_cost_usd",
    key: "provider_cost_usd",
    render: formatUsd,
    sorter: (a: UsageRow, b: UsageRow) => a.provider_cost_usd - b.provider_cost_usd,
  },
  {
    title: "Tokens in / out",
    key: "tokens",
    render: (_: any, r: UsageRow) =>
      `${formatNumber(r.input_tokens)} / ${formatNumber(r.output_tokens)}`,
  },
];

const UsageTable = ({
  title,
  rows,
  rowKey,
  first,
}: {
  title: string;
  rows: UsageRow[];
  rowKey: string;
  first: any;
}) => (
  <TableCard title={title}>
    <Table
      rowKey={rowKey}
      size="small"
      dataSource={rows}
      columns={[first, ...metricColumns] as any}
      pagination={{ pageSize: 10, hideOnSinglePage: true }}
      scroll={{ x: true }}
    />
  </TableCard>
);

export const AdminUsage = () => {
  const [days, setDays] = React.useState(30);
  const { data, status } = useQuery(["adminUsage", days], async () => {
    const response = await api.get(`/admin/oversight/usage?days=${days}`);
    return response.data as Usage;
  });

  return (
    <div className="space-y-6 pt-2">
      <SectionHeader
        title="Usage breakdown"
        description="OpenRouter cost is only recorded for messages billed after this update."
        actions={<DaysPicker value={days} onChange={setDays} />}
      />
      {status === "loading" && (
        <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      )}
      {data && (
        <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-2">
          <UsageTable
            title="By user"
            rows={data.by_user}
            rowKey="user_id"
            first={{
              title: "User",
              key: "user",
              render: (_: any, r: UsageRow) => (
                <Link
                  to={`/admin/transactions?user_id=${r.user_id}&user=${encodeURIComponent(r.username)}`}
                  className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  {r.username}
                </Link>
              ),
            }}
          />
          <UsageTable
            title="By bot"
            rows={data.by_bot}
            rowKey="bot_id"
            first={{
              title: "Bot",
              key: "bot",
              render: (_: any, r: UsageRow) =>
                r.bot_name ? (
                  <div>
                    <Link
                      to={`/bot/${r.bot_id}`}
                      className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {r.bot_name}
                    </Link>
                    <div className="text-xs text-fg-subtle">{r.owner}</div>
                  </div>
                ) : (
                  <span className="text-fg-subtle">{r.bot_id || "unknown"} (deleted)</span>
                ),
            }}
          />
          <UsageTable
            title="By model"
            rows={data.by_model}
            rowKey="model"
            first={{ title: "Model", dataIndex: "model", key: "model" }}
          />
          <UsageTable
            title="By channel"
            rows={data.by_source}
            rowKey="source"
            first={{ title: "Channel", dataIndex: "source", key: "source" }}
          />
        </div>
      )}
    </div>
  );
};
