import { useQuery } from "@tanstack/react-query";
import { Input, Select, Table, Tag } from "antd";
import React from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { formatCredits, formatDate, formatNumber, formatUsd } from "./shared";

type AdminTransaction = {
  id: string;
  user_id: number;
  username: string;
  email: string | null;
  amount: number;
  type: string;
  description: string | null;
  metadata: any;
  createdAt: string;
};

const TYPE_COLORS: Record<string, string> = {
  usage: "blue",
  admin_adjustment: "purple",
  monthly_allowance: "green",
};

const parseMetadata = (metadata: any) => {
  if (typeof metadata === "string") {
    try {
      return JSON.parse(metadata);
    } catch {
      return {};
    }
  }
  return metadata || {};
};

export const AdminTransactions = () => {
  const [params, setParams] = useSearchParams();
  const userId = params.get("user_id") || undefined;
  const botId = params.get("bot_id") || undefined;
  const [type, setType] = React.useState<string | undefined>();
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(50);

  const { data, isFetching } = useQuery(
    ["adminTransactions", userId, botId, type, search, page, pageSize],
    async () => {
      const query = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(userId ? { user_id: userId } : {}),
        ...(botId ? { bot_id: botId } : {}),
        ...(type ? { type } : {}),
        ...(search ? { search } : {}),
      });
      const response = await api.get(`/admin/oversight/transactions?${query}`);
      return response.data as { total: number; types: string[]; data: AdminTransaction[] };
    },
    { keepPreviousData: true }
  );

  const clearFilter = (key: string) => {
    const next = new URLSearchParams(params);
    next.delete(key);
    next.delete(key === "user_id" ? "user" : "bot");
    setPage(1);
    setParams(next);
  };

  const columns = [
    { title: "Date", dataIndex: "createdAt", key: "createdAt", render: formatDate },
    {
      title: "User",
      key: "user",
      render: (_: any, t: AdminTransaction) => (
        <div>
          <div>{t.username}</div>
          <div className="text-xs text-gray-500">{t.email}</div>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (v: string) => <Tag color={TYPE_COLORS[v]}>{v}</Tag>,
    },
    {
      title: "Credits",
      dataIndex: "amount",
      key: "amount",
      render: (v: number) => (
        <span className={v < 0 ? "text-red-600" : v > 0 ? "text-green-600" : ""}>
          {v > 0 ? "+" : ""}
          {formatCredits(v)}
        </span>
      ),
    },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Model / source",
      key: "model",
      render: (_: any, t: AdminTransaction) => {
        const m = parseMetadata(t.metadata);
        return (
          <div className="text-xs">
            <div>{m.model || "—"}</div>
            {m.source && <Tag>{m.source}</Tag>}
            {m.used_own_key && <Tag color="blue">own key</Tag>}
          </div>
        );
      },
    },
    {
      title: "Tokens in / out",
      key: "tokens",
      render: (_: any, t: AdminTransaction) => {
        const m = parseMetadata(t.metadata);
        return m.input_tokens !== undefined
          ? `${formatNumber(m.input_tokens)} / ${formatNumber(m.output_tokens)}`
          : "—";
      },
    },
    {
      title: "OpenRouter cost",
      key: "provider",
      render: (_: any, t: AdminTransaction) => {
        const m = parseMetadata(t.metadata);
        return m.provider_cost_usd !== undefined ? formatUsd(m.provider_cost_usd) : "—";
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input.Search
          allowClear
          placeholder="Search description or username"
          onSearch={(v) => {
            setPage(1);
            setSearch(v.trim());
          }}
          style={{ maxWidth: 320 }}
        />
        <Select
          allowClear
          placeholder="All types"
          value={type}
          onChange={(v) => {
            setPage(1);
            setType(v);
          }}
          style={{ width: 200 }}
          options={(data?.types || []).map((t) => ({ label: t, value: t }))}
        />
        {userId && (
          <Tag closable onClose={() => clearFilter("user_id")}>
            User: {params.get("user") || userId}
          </Tag>
        )}
        {botId && (
          <Tag closable onClose={() => clearFilter("bot_id")}>
            Bot: {params.get("bot") || botId}
          </Tag>
        )}
      </div>
      <Table
        rowKey="id"
        size="small"
        loading={isFetching}
        dataSource={data?.data || []}
        columns={columns as any}
        scroll={{ x: true }}
        expandable={{
          expandedRowRender: (t: AdminTransaction) => (
            <pre className="m-0 whitespace-pre-wrap text-xs">
              {JSON.stringify(parseMetadata(t.metadata), null, 2)}
            </pre>
          ),
        }}
        pagination={{
          current: page,
          pageSize,
          total: data?.total || 0,
          showSizeChanger: true,
          onChange: (p, s) => {
            setPage(p);
            setPageSize(s);
          },
        }}
      />
    </div>
  );
};
