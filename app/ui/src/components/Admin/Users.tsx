import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Dropdown,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Table,
  notification,
} from "antd";
import { EllipsisHorizontalIcon, UsersIcon } from "@heroicons/react/24/outline";
import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  SectionHeader,
  TableCard,
  errorMessage,
  formatAgo,
  formatCredits,
  formatDate,
  formatNumber,
} from "./shared";
import { Badge, EmptyState } from "../ui";

type AdminUser = {
  user_id: number;
  username: string;
  email: string | null;
  is_admin: boolean;
  is_suspended: boolean;
  createdAt: string;
  bots: number;
  balance: number;
  messages_30d: number;
  credits_used_30d: number;
  credits_used_total: number;
  last_active: string | null;
};

export const AdminUsers = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<string | undefined>();
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);
  const [creditUser, setCreditUser] = React.useState<AdminUser | null>(null);
  const [creditForm] = Form.useForm();

  const { data, isFetching } = useQuery(
    ["adminUsers", search, status, page, pageSize],
    async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
      });
      const response = await api.get(`/admin/oversight/users?${params}`);
      return response.data as { total: number; data: AdminUser[] };
    },
    { keepPreviousData: true }
  );

  const refresh = () => {
    queryClient.invalidateQueries(["adminUsers"]);
    queryClient.invalidateQueries(["adminOverview"]);
  };

  const action = useMutation(
    async ({ url, body, method = "post" }: { url: string; body: any; method?: "post" | "delete" }) => {
      const response =
        method === "delete"
          ? await api.delete(url, { data: body })
          : await api.post(url, body);
      return response.data;
    },
    {
      onSuccess: (data) => {
        notification.success({ message: data?.message || "Done" });
        refresh();
      },
      onError: (e) => notification.error({ message: errorMessage(e) }),
    }
  );

  const confirm = (title: string, run: () => void, danger = false) =>
    Modal.confirm({ title, okButtonProps: { danger }, onOk: run });

  const columns = [
    {
      title: "User",
      key: "user",
      render: (_: any, u: AdminUser) => (
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold uppercase text-indigo-700 ring-1 ring-inset ring-indigo-600/15 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/20">
            {u.username?.charAt(0)}
          </span>
          <div className="min-w-0">
            <div className="font-medium text-fg">{u.username}</div>
            <div className="text-xs text-fg-subtle">{u.email || "no email"}</div>
            {(u.is_admin || u.is_suspended) && (
              <div className="mt-1 flex gap-1">
                {u.is_admin && <Badge tone="brand">Admin</Badge>}
                {u.is_suspended && <Badge tone="danger">Suspended</Badge>}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      render: (v: number) => (
        <span
          className={`tabular-nums ${v < 0 ? "font-medium text-red-600 dark:text-red-400" : "text-fg"}`}
        >
          {formatCredits(v)}
        </span>
      ),
    },
    { title: "Bots", dataIndex: "bots", key: "bots" },
    {
      title: "Messages (30d)",
      dataIndex: "messages_30d",
      key: "messages_30d",
      render: formatNumber,
    },
    {
      title: "Credits used (30d / all)",
      key: "credits",
      render: (_: any, u: AdminUser) =>
        `${formatCredits(u.credits_used_30d)} / ${formatCredits(u.credits_used_total)}`,
    },
    {
      title: "Last active",
      dataIndex: "last_active",
      key: "last_active",
      render: (v: string | null) => (
        <span title={formatDate(v)} className="whitespace-nowrap text-fg-muted">
          {formatAgo(v)}
        </span>
      ),
    },
    { title: "Joined", dataIndex: "createdAt", key: "createdAt", render: formatDate },
    {
      title: "",
      key: "actions",
      render: (_: any, u: AdminUser) => (
        <Dropdown
          trigger={["click"]}
          menu={{
            items: [
              { key: "credits", label: "Adjust credits" },
              { key: "bots", label: "View bots" },
              { key: "transactions", label: "View transactions" },
              { type: "divider" },
              {
                key: "suspend",
                label: u.is_suspended ? "Reactivate" : "Suspend",
                danger: !u.is_suspended,
              },
              { key: "admin", label: u.is_admin ? "Remove admin" : "Make admin" },
              { type: "divider" },
              { key: "delete", label: "Delete user", danger: true, disabled: u.is_admin },
            ],
            onClick: ({ key }) => {
              if (key === "credits") {
                creditForm.resetFields();
                setCreditUser(u);
              } else if (key === "bots") {
                navigate(`/admin/bots?user_id=${u.user_id}&user=${encodeURIComponent(u.username)}`);
              } else if (key === "transactions") {
                navigate(`/admin/transactions?user_id=${u.user_id}&user=${encodeURIComponent(u.username)}`);
              } else if (key === "suspend") {
                confirm(
                  u.is_suspended
                    ? `Reactivate ${u.username}?`
                    : `Suspend ${u.username}? They will be signed out of the API and their bots will stop answering.`,
                  () =>
                    action.mutate({
                      url: "/admin/oversight/users/suspend",
                      body: { user_id: u.user_id, suspended: !u.is_suspended },
                    }),
                  !u.is_suspended
                );
              } else if (key === "admin") {
                confirm(
                  u.is_admin
                    ? `Remove admin access from ${u.username}?`
                    : `Give ${u.username} full admin access?`,
                  () =>
                    action.mutate({
                      url: "/admin/oversight/users/admin",
                      body: { user_id: u.user_id, is_admin: !u.is_admin },
                    })
                );
              } else if (key === "delete") {
                confirm(
                  `Delete ${u.username} and all of their bots? This cannot be undone.`,
                  () =>
                    action.mutate({
                      url: "/admin/user/delete",
                      body: { user_id: u.user_id },
                      method: "delete",
                    }),
                  true
                );
              }
            },
          }}
        >
          <Button size="small" icon={<EllipsisHorizontalIcon className="h-4 w-4" />}>
            Manage
          </Button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="space-y-4 pt-2">
      <SectionHeader
        title="Users"
        description="Balances, activity and access for every account."
      />
      <TableCard
        toolbar={
          <>
            <Input.Search
              allowClear
              placeholder="Search username or email"
              onSearch={(v) => {
                setPage(1);
                setSearch(v.trim());
              }}
              style={{ maxWidth: 320 }}
            />
            <Select
              allowClear
              placeholder="All users"
              value={status}
              onChange={(v) => {
                setPage(1);
                setStatus(v);
              }}
              style={{ width: 160 }}
              options={[
                { label: "Admins", value: "admin" },
                { label: "Suspended", value: "suspended" },
              ]}
            />
            <span className="ml-auto text-xs tabular-nums text-fg-subtle">
              {formatNumber(data?.total || 0)} users
            </span>
          </>
        }
      >
        <Table
          rowKey="user_id"
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
          locale={{
            emptyText: (
              <EmptyState
                icon={<UsersIcon />}
                title="No users found"
                description="Try a different search or filter."
                className="py-10"
              />
            ),
          }}
        />
      </TableCard>

      <Modal
        title={`Adjust credits for ${creditUser?.username}`}
        open={Boolean(creditUser)}
        onCancel={() => setCreditUser(null)}
        onOk={() => creditForm.submit()}
        confirmLoading={action.isLoading}
      >
        <p className="mb-4 mt-2 text-sm leading-relaxed text-fg-muted">
          Current balance: {formatCredits(creditUser?.balance)}. The change is logged as an
          admin adjustment.
        </p>
        <Form
          form={creditForm}
          layout="vertical"
          initialValues={{ type: "add" }}
          onFinish={(values) =>
            action.mutate(
              {
                url: "/admin/user-credits",
                body: { ...values, user_id: creditUser!.user_id },
              },
              { onSuccess: () => setCreditUser(null) }
            )
          }
        >
          <Form.Item name="type" label="Action">
            <Select
              options={[
                { label: "Add credits", value: "add" },
                { label: "Remove credits", value: "remove" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: "Enter an amount" }]}
          >
            <InputNumber min={0.01} step={1} className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
