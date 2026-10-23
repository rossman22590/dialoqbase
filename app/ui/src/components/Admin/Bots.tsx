import { useQuery } from "@tanstack/react-query";
import { Button, Input, Space, Table, Tag } from "antd";
import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { formatAgo, formatCredits, formatDate, formatNumber } from "./shared";

type AdminBot = {
  id: string;
  publicId: string;
  name: string;
  model: string;
  embedding: string;
  createdAt: string;
  owner: { user_id: number; username: string; email: string | null; isSuspended: boolean } | null;
  sources: number;
  uses_own_key: boolean;
  messages_30d: number;
  credits_used_30d: number;
  messages_total: number;
  credits_used_total: number;
  last_used: string | null;
};

export const AdminBots = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const userId = params.get("user_id") || undefined;
  const userName = params.get("user") || userId;
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);

  const { data, isFetching } = useQuery(
    ["adminBots", search, userId, page, pageSize],
    async () => {
      const query = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(search ? { search } : {}),
        ...(userId ? { user_id: userId } : {}),
      });
      const response = await api.get(`/admin/oversight/bots?${query}`);
      return response.data as { total: number; data: AdminBot[] };
    },
    { keepPreviousData: true }
  );

  const columns = [
    {
      title: "Bot",
      key: "name",
      render: (_: any, b: AdminBot) => (
        <div>
          <Link to={`/bot/${b.id}`} className="font-medium text-indigo-600">
            {b.name}
          </Link>
          <div className="text-xs text-gray-500">{b.id}</div>
        </div>
      ),
    },
    {
      title: "Owner",
      key: "owner",
      render: (_: any, b: AdminBot) =>
        b.owner ? (
          <span>
            {b.owner.username}{" "}
            {b.owner.isSuspended && <Tag color="red">Suspended</Tag>}
          </span>
        ) : (
          <span className="text-gray-400">none</span>
        ),
    },
    {
      title: "Model",
      key: "model",
      render: (_: any, b: AdminBot) => (
        <div>
          <div className="text-xs">{b.model}</div>
          {b.uses_own_key && <Tag color="blue">Own API key</Tag>}
        </div>
      ),
    },
    { title: "Sources", dataIndex: "sources", key: "sources" },
    {
      title: "Messages (30d / all)",
      key: "messages",
      render: (_: any, b: AdminBot) =>
        `${formatNumber(b.messages_30d)} / ${formatNumber(b.messages_total)}`,
    },
    {
      title: "Credits (30d / all)",
      key: "credits",
      render: (_: any, b: AdminBot) =>
        `${formatCredits(b.credits_used_30d)} / ${formatCredits(b.credits_used_total)}`,
    },
    {
      title: "Last used",
      dataIndex: "last_used",
      key: "last_used",
      render: (v: string | null) => <span title={formatDate(v)}>{formatAgo(v)}</span>,
    },
    { title: "Created", dataIndex: "createdAt", key: "createdAt", render: formatDate },
    {
      title: "",
      key: "actions",
      render: (_: any, b: AdminBot) => (
        <Space>
          <Button size="small" onClick={() => navigate(`/bot/${b.id}`)}>
            Open
          </Button>
          <Button
            size="small"
            onClick={() =>
              navigate(`/admin/transactions?bot_id=${b.id}&bot=${encodeURIComponent(b.name)}`)
            }
          >
            Transactions
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input.Search
          allowClear
          placeholder="Search bot name, id, or owner"
          onSearch={(v) => {
            setPage(1);
            setSearch(v.trim());
          }}
          style={{ maxWidth: 320 }}
        />
        {userId && (
          <Tag
            closable
            onClose={() => {
              setPage(1);
              setParams({});
            }}
          >
            Owner: {userName}
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
